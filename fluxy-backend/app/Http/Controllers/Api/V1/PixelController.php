<?php

namespace App\Http\Controllers\Api\V1;

use App\Contracts\ImageProvider;
use App\Exceptions\ImageGenerationException;
use App\Models\Content;
use App\Models\ImageGeneration;
use App\Models\MediaAsset;
use App\Models\Tenant;
use App\Services\Images\GeminiCaptionService;
use App\Services\Images\GoogleDriveImageFetcher;
use App\Services\UsageService;
use App\Support\ModulePresenter;
use App\Support\PixelFeatureCatalog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class PixelController extends ApiController
{
    public function media(Request $request): JsonResponse
    {
        $items = MediaAsset::where('tenant_id', $this->tenantId($request))
            ->latest()->get()->map(fn ($asset) => ModulePresenter::media($asset));

        return $this->data($items);
    }

    public function upload(Request $request): JsonResponse
    {
        $request->validate(['file' => ['required', 'file', 'mimes:jpg,jpeg,png,webp,gif,mp4,mov', 'max:20480']]);
        $file = $request->file('file');
        $path = $file->store('tenants/'.$this->tenantId($request).'/media', 'public');
        $asset = MediaAsset::create([
            'tenant_id' => $this->tenantId($request),
            'user_id' => $request->user()->id,
            'type' => str_starts_with((string) $file->getMimeType(), 'video/') ? 'video' : 'image',
            'disk' => 'public', 'path' => $path, 'mime_type' => $file->getMimeType(), 'size' => $file->getSize(),
        ]);

        return $this->data(ModulePresenter::media($asset), 201);
    }

    public function deleteMedia(Request $request, MediaAsset $media): JsonResponse
    {
        abort_unless($media->tenant_id === $this->tenantId($request), 404);
        Storage::disk($media->disk)->delete($media->path);
        $media->delete();

        return $this->message('Media deleted.');
    }

    public function features(): JsonResponse
    {
        $features = collect(PixelFeatureCatalog::features())
            ->map(fn (array $feature, string $id) => [
                'id' => $id,
                'name' => $feature['name'],
                'category' => $feature['category'],
                'description' => $feature['description'],
                'multi_image' => $feature['multi_image'],
                'requires_image' => $feature['requires_image'],
                'requires_prompt' => $feature['requires_prompt'],
                'text_output' => $feature['text_output'],
            ])
            ->values();

        return $this->data($features);
    }

    public function generate(
        Request $request,
        UsageService $usage,
        ImageProvider $provider,
        GoogleDriveImageFetcher $driveFetcher,
        GeminiCaptionService $captionService,
    ): JsonResponse {
        $validated = $request->validate([
            'feature' => ['required', 'string', Rule::in(PixelFeatureCatalog::ids())],
            'content_type' => ['required', 'in:feed,story'],
            'instruction' => ['nullable', 'string', 'max:2000'],
            'image_files' => ['nullable', 'array', 'max:5'],
            'image_files.*' => ['image', 'max:20480'],
            'gdrive_link' => ['nullable', 'url', 'max:2048'],
        ]);

        $feature = PixelFeatureCatalog::get($validated['feature']);
        $instruction = trim((string) ($validated['instruction'] ?? ''));
        $hasFiles = $request->hasFile('image_files');
        $hasGdrive = ! empty($validated['gdrive_link']);

        if ($feature['requires_prompt'] && $instruction === '') {
            return response()->json(['message' => 'Instruksi wajib diisi untuk tool ini.'], 422);
        }
        if ($feature['requires_image'] && ! $hasFiles && ! $hasGdrive) {
            return response()->json(['message' => 'Mohon upload minimal satu gambar referensi.'], 422);
        }
        if (! $feature['multi_image'] && $hasFiles && count($request->file('image_files')) > 1) {
            return response()->json(['message' => 'Tool ini hanya mendukung satu gambar referensi.'], 422);
        }

        $tenant = $request->user()->currentTenant;
        $idempotencyKey = $request->header('Idempotency-Key') ?: (string) Str::ulid();
        $prompt = PixelFeatureCatalog::buildPrompt($validated['feature'], $instruction);

        [$generation, $created] = DB::transaction(function () use (
            $tenant,
            $request,
            $provider,
            $feature,
            $validated,
            $idempotencyKey,
            $prompt,
            $usage,
        ): array {
            Tenant::query()->whereKey($tenant->id)->lockForUpdate()->firstOrFail();
            $existing = ImageGeneration::where('tenant_id', $tenant->id)
                ->where('idempotency_key', $idempotencyKey)
                ->first();
            if ($existing) {
                return [$existing, false];
            }

            $usage->assertAvailable($tenant, 'pixel');

            return [ImageGeneration::create([
                'tenant_id' => $tenant->id,
                'user_id' => $request->user()->id,
                'provider' => $feature['text_output'] ? 'google-gemini' : $provider->name(),
                'feature' => $validated['feature'],
                'content_type' => $validated['content_type'],
                'prompt' => $prompt,
                'status' => 'processing',
                'idempotency_key' => $idempotencyKey,
            ]), true];
        });

        if (! $created) {
            return response()->json([
                'message' => 'Image generation request was already received.',
                'status' => $generation->status,
                'generation_id' => $generation->id,
            ], 202);
        }

        $inputAssets = [];
        $referenceImages = [];

        if ($hasFiles) {
            foreach ($request->file('image_files') as $file) {
                $bytes = file_get_contents($file->getRealPath());
                if ($bytes === false) {
                    $generation->update(['status' => 'failed', 'error_message' => 'Uploaded image could not be read.']);

                    return response()->json(['message' => 'Uploaded image could not be read.'], 422);
                }
                $mimeType = (string) $file->getMimeType();
                $path = $file->store('tenants/'.$tenant->id.'/pixel/input', 'public');
                if (! is_string($path) || $path === '') {
                    $generation->update(['status' => 'failed', 'error_message' => 'Uploaded image could not be stored.']);

                    return response()->json(['message' => 'Uploaded image could not be stored.'], 500);
                }
                $inputAssets[] = MediaAsset::create([
                    'tenant_id' => $tenant->id, 'user_id' => $request->user()->id,
                    'type' => 'image', 'disk' => 'public', 'path' => $path,
                    'mime_type' => $mimeType, 'size' => $file->getSize(),
                ]);
                $referenceImages[] = ['bytes' => $bytes, 'mimeType' => $mimeType];
            }
        } elseif ($hasGdrive) {
            try {
                $downloaded = $driveFetcher->fetch($validated['gdrive_link']);
            } catch (ImageGenerationException $exception) {
                $generation->update(['status' => 'failed', 'error_message' => $exception->getMessage()]);

                return response()->json([
                    'message' => $exception->getMessage(),
                    'error' => 'reference_image_unavailable',
                ], 422);
            }
            $path = 'tenants/'.$tenant->id.'/pixel/input/'.Str::ulid().'.'.$downloaded['extension'];
            if (! Storage::disk('public')->put($path, $downloaded['bytes'])) {
                $generation->update(['status' => 'failed', 'error_message' => 'Reference image could not be stored.']);

                return response()->json(['message' => 'Reference image could not be stored.'], 500);
            }
            $inputAssets[] = MediaAsset::create([
                'tenant_id' => $tenant->id, 'user_id' => $request->user()->id,
                'type' => 'image', 'disk' => 'public', 'path' => $path,
                'mime_type' => $downloaded['mimeType'], 'size' => strlen($downloaded['bytes']),
                'metadata' => ['source' => 'google_drive'],
            ]);
            $referenceImages[] = ['bytes' => $downloaded['bytes'], 'mimeType' => $downloaded['mimeType']];
        }

        $generation->update(['input_media_id' => $inputAssets[0]->id ?? null]);

        try {
            if ($feature['text_output']) {
                if ($referenceImages === []) {
                    throw new ImageGenerationException('Gambar referensi diperlukan.');
                }
                $description = $captionService->describeImage(
                    $referenceImages[0]['bytes'],
                    $referenceImages[0]['mimeType'],
                    $prompt,
                );
                $generation->update(['status' => 'completed']);
                $usage->record($tenant, 'pixel', 'generate', 1, 'pixel:'.$idempotencyKey);

                return response()->json([
                    'message' => 'Deskripsi berhasil dibuat.',
                    'data' => ['type' => 'text', 'text' => $description, 'generation_id' => $generation->id],
                ], 202);
            }

            $image = $provider->generate($prompt, $validated['content_type'], $referenceImages);
            $outputPath = 'tenants/'.$tenant->id.'/pixel/generated/'.$generation->id.'.'.$image->extension;

            if (! Storage::disk('public')->put($outputPath, $image->bytes)) {
                throw new ImageGenerationException('Generated image could not be stored.');
            }

            $output = MediaAsset::create([
                'tenant_id' => $tenant->id, 'user_id' => $request->user()->id,
                'type' => 'generated_image', 'disk' => 'public', 'path' => $outputPath,
                'mime_type' => $image->mimeType, 'size' => strlen($image->bytes),
                'metadata' => array_filter([
                    'provider' => $provider->name(),
                    'generation_id' => $generation->id,
                    'feature' => $validated['feature'],
                    ...$image->metadata,
                ], fn ($value) => $value !== null),
            ]);
            $generation->update(['status' => 'completed', 'output_media_id' => $output->id]);
            $usage->record($tenant, 'pixel', 'generate', 1, 'pixel:'.$idempotencyKey);
        } catch (ImageGenerationException $exception) {
            $generation->update(['status' => 'failed', 'error_message' => $exception->getMessage()]);
            Log::warning('Pixel image generation failed.', [
                'generation_id' => $generation->id,
                'feature' => $validated['feature'],
                'provider' => $provider->name(),
                'exception' => $exception::class,
            ]);

            return response()->json([
                'message' => 'Pixel belum berhasil membuat gambar. Silakan coba kembali.',
                'error' => 'image_generation_failed',
            ], 502);
        }

        return response()->json([
            'message' => 'Image generation completed.',
            'data' => ModulePresenter::media($output),
        ], 202);
    }

    public function caption(Request $request, GeminiCaptionService $captionService): JsonResponse
    {
        $validated = $request->validate(['prompt' => ['required', 'string', 'max:4000']]);

        try {
            return $this->data(['text' => $captionService->generate($validated['prompt'])]);
        } catch (ImageGenerationException $exception) {
            Log::warning('Pixel caption generation failed.', ['exception' => $exception::class]);

            return response()->json([
                'message' => 'Caption AI belum berhasil dibuat. Silakan coba kembali.',
                'error' => 'caption_generation_failed',
            ], 502);
        }
    }

    public function contents(Request $request): JsonResponse
    {
        return $this->data(Content::where('tenant_id', $this->tenantId($request))->latest()->get());
    }

    public function createContent(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'caption' => ['nullable', 'string', 'max:10000'], 'hashtags' => ['nullable', 'string', 'max:3000'],
            'media_urls' => ['nullable', 'array', 'max:20'], 'media_urls.*' => ['url'],
            'content_type' => ['nullable', 'in:story,feed,carousel,reel'],
        ]);
        $content = Content::create($validated + [
            'tenant_id' => $this->tenantId($request), 'user_id' => $request->user()->id,
        ]);

        return $this->data($content, 201);
    }

    public function deleteContent(Request $request, Content $content): JsonResponse
    {
        abort_unless($content->tenant_id === $this->tenantId($request), 404);
        $content->delete();

        return $this->message('Content deleted.');
    }

    private function tenantId(Request $request): string
    {
        return (string) $request->user()->current_tenant_id;
    }
}
