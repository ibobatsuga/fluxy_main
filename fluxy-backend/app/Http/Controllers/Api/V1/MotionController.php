<?php

namespace App\Http\Controllers\Api\V1;

use App\Exceptions\ImageGenerationException;
use App\Services\Images\GeminiCaptionService;
use App\Services\UsageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class MotionController extends ApiController
{
    public function generate(Request $request, UsageService $usage, GeminiCaptionService $captionService): JsonResponse
    {
        $validated = $request->validate([
            'product_name' => ['required', 'string', 'max:200'],
            'product_description' => ['required', 'string', 'max:2000'],
            'target_market' => ['required', 'string', 'max:300'],
            'content_type' => ['required', 'string', 'max:100'],
            'platform' => ['required', 'string', 'max:100'],
            'ad_goal' => ['required', 'string', 'max:100'],
            'language' => ['required', 'string', 'max:60'],
            'tone' => ['required', 'string', 'max:60'],
            'aspect_ratio' => ['required', 'string', 'max:30'],
            'color_grading' => ['required', 'string', 'max:60'],
            'character' => ['required', 'string', 'max:60'],
            'duration' => ['required', 'string', 'max:30'],
            'hook_style' => ['required', 'string', 'max:60'],
            'pace_editing' => ['required', 'string', 'max:60'],
            'setting_location' => ['nullable', 'string', 'max:200'],
            'character_gender' => ['nullable', 'string', 'max:60'],
            'music_mood' => ['nullable', 'string', 'max:100'],
            'transition' => ['nullable', 'string', 'max:100'],
            'text_overlay_animation' => ['nullable', 'boolean'],
            'cinematic_camera' => ['nullable', 'boolean'],
            'explicit_cta' => ['nullable', 'string', 'max:200'],
            'negative_prompt' => ['nullable', 'string', 'max:1000'],
        ]);

        $tenant = $request->user()->currentTenant;
        $usage->assertAvailable($tenant, 'motion');

        try {
            $prompt = $captionService->generateMotionPrompt($validated);
        } catch (ImageGenerationException $exception) {
            Log::warning('Motion prompt generation failed.', ['exception' => $exception::class]);

            return response()->json([
                'message' => 'Motion belum berhasil membuat prompt. Silakan coba kembali.',
                'error' => 'motion_generation_failed',
            ], 502);
        }

        $usage->record($tenant, 'motion', 'generate_prompt', 1, $request->header('Idempotency-Key'));

        return $this->data(['text' => $prompt]);
    }
}
