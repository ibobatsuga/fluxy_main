<?php

namespace App\Http\Controllers\Api\V1;

use App\Contracts\ImageProvider;
use App\Exceptions\ImageGenerationException;
use App\Models\Content;
use App\Models\ImageGeneration;
use App\Models\MediaAsset;
use App\Services\Images\GeminiCaptionService;
use App\Services\Images\GoogleDriveImageFetcher;
use App\Services\UsageService;
use App\Support\ModulePresenter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

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

    public function generate(
        Request $request,
        UsageService $usage,
        ImageProvider $provider,
        GoogleDriveImageFetcher $driveFetcher,
    ): JsonResponse {
        $validated = $request->validate([
            'content_type' => ['required', 'in:feed,story'],
            'input_type' => ['required', 'in:upload,gdrive'],
            'image_file' => ['required_if:input_type,upload', 'nullable', 'image', 'max:20480'],
            'gdrive_link' => ['required_if:input_type,gdrive', 'nullable', 'url', 'max:2048'],
            'lighting' => ['nullable', 'string', 'max:120'],
            'background' => ['nullable', 'string', 'max:120'],
            'style' => ['nullable', 'string', 'max:2000'],
        ]);
        $tenant = $request->user()->currentTenant;
        $idempotencyKey = $request->header('Idempotency-Key') ?: (string) Str::ulid();
        $existing = ImageGeneration::where('tenant_id', $tenant->id)
            ->where('idempotency_key', $idempotencyKey)
            ->first();

        if ($existing) {
            return response()->json([
                'message' => 'Image generation request was already received.',
                'status' => $existing->status,
            ], 202);
        }

        // Avoid spending provider quota when the tenant has no Pixel credits left.
        $usage->assertAvailable($tenant, 'pixel');

        $input = null;
        $inputBytes = null;
        $inputMimeType = null;
        if ($request->hasFile('image_file')) {
            $file = $request->file('image_file');
            $inputBytes = file_get_contents($file->getRealPath());
            $inputMimeType = (string) $file->getMimeType();
            if ($inputBytes === false) {
                throw new ImageGenerationException('Uploaded image could not be read.');
            }
            $path = $file->store('tenants/'.$tenant->id.'/pixel/input', 'public');
            $input = MediaAsset::create([
                'tenant_id' => $tenant->id, 'user_id' => $request->user()->id,
                'type' => 'image', 'disk' => 'public', 'path' => $path,
                'mime_type' => $file->getMimeType(), 'size' => $file->getSize(),
            ]);
        } elseif (! empty($validated['gdrive_link'])) {
            try {
                $downloaded = $driveFetcher->fetch($validated['gdrive_link']);
            } catch (ImageGenerationException $exception) {
                return response()->json([
                    'message' => $exception->getMessage(),
                    'error' => 'reference_image_unavailable',
                ], 422);
            }
            $inputBytes = $downloaded['bytes'];
            $inputMimeType = $downloaded['mimeType'];
            $path = 'tenants/'.$tenant->id.'/pixel/input/'.Str::ulid().'.'.$downloaded['extension'];
            Storage::disk('public')->put($path, $inputBytes);
            $input = MediaAsset::create([
                'tenant_id' => $tenant->id, 'user_id' => $request->user()->id,
                'type' => 'image', 'disk' => 'public', 'path' => $path,
                'mime_type' => $inputMimeType, 'size' => strlen($inputBytes),
                'metadata' => ['source' => 'google_drive'],
            ]);
        }

        $prompt = $this->imagePrompt($validated);
        $generation = ImageGeneration::create([
            'tenant_id' => $tenant->id, 'user_id' => $request->user()->id,
            'input_media_id' => $input?->id, 'provider' => $provider->name(),
            'content_type' => $validated['content_type'],
            'prompt' => $prompt,
            'status' => 'processing', 'idempotency_key' => $idempotencyKey,
        ]);

        try {
            $image = $provider->generate($prompt, $validated['content_type'], $inputBytes, $inputMimeType);
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
                    ...$image->metadata,
                ], fn ($value) => $value !== null),
            ]);
            $generation->update(['status' => 'completed', 'output_media_id' => $output->id]);
            $usage->record($tenant, 'pixel', 'generate', 1, 'pixel:'.$idempotencyKey);
        } catch (ImageGenerationException $exception) {
            $generation->update(['status' => 'failed', 'error_message' => $exception->getMessage()]);
            Log::warning('Pixel image generation failed.', [
                'generation_id' => $generation->id,
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

    private function imagePrompt(array $input): string
    {
        $composition = $input['content_type'] === 'story'
            ? 'vertical 9:16 social media story composition'
            : 'square 1:1 social media feed composition';
        $parts = [
            'Create a professional commercial product photograph.',
            'Use a '.$composition.'.',
            isset($input['lighting']) ? 'Lighting: '.$input['lighting'].'.' : null,
            isset($input['background']) ? 'Background: '.$input['background'].'.' : null,
            isset($input['style']) ? 'Creative direction: '.$input['style'].'.' : null,
            'Clean, polished, high-detail result without watermarks or added text.',
        ];

        return Str::limit(collect($parts)->filter()->implode(' '), 2048, '');
    }
}
