<?php

namespace App\Services\Images;

use App\Exceptions\ImageGenerationException;
use App\Models\PlatformCredential;
use Illuminate\Support\Facades\Http;
use Throwable;

class GeminiCaptionService
{
    public function generate(string $prompt): string
    {
        $storedKey = PlatformCredential::query()->where('key', 'ai_image_api_key')->first()?->value;
        $apiKey = (string) ($storedKey ?: config('services.pixel.gemini.api_key'));
        $model = (string) config('services.pixel.gemini.text_model', 'gemini-flash-latest');
        if ($apiKey === '') {
            throw new ImageGenerationException('Gemini API Key is not configured.');
        }

        try {
            $response = Http::asJson()
                ->acceptJson()
                ->withHeaders(['X-goog-api-key' => $apiKey])
                ->connectTimeout(10)
                ->timeout(45)
                ->post(sprintf(
                    'https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent',
                    rawurlencode($model),
                ), [
                    'contents' => [['parts' => [['text' => implode(' ', [
                        'Tulis satu caption media sosial berbahasa Indonesia yang menarik, jelas, dan siap dipublikasikan.',
                        'Sertakan call-to-action yang relevan dan 3-6 hashtag spesifik. Jangan beri penjelasan atau markdown.',
                        'Brief:',
                        $prompt,
                    ])]]]],
                    'generationConfig' => [
                        'temperature' => 0.8,
                        'maxOutputTokens' => 600,
                    ],
                ]);
        } catch (Throwable $exception) {
            throw new ImageGenerationException('Gemini caption service could not be reached.', previous: $exception);
        }

        if ($response->failed()) {
            throw new ImageGenerationException('Gemini caption request failed with HTTP '.$response->status().'.');
        }

        $text = trim((string) $response->json('candidates.0.content.parts.0.text', ''));
        if ($text === '') {
            throw new ImageGenerationException('Gemini returned no caption.');
        }

        return $text;
    }

    public function describeImage(string $bytes, string $mimeType, string $instruction): string
    {
        $storedKey = PlatformCredential::query()->where('key', 'ai_image_api_key')->first()?->value;
        $apiKey = (string) ($storedKey ?: config('services.pixel.gemini.api_key'));
        $model = (string) config('services.pixel.gemini.text_model', 'gemini-flash-latest');
        if ($apiKey === '') {
            throw new ImageGenerationException('Gemini API Key is not configured.');
        }

        try {
            $response = Http::asJson()
                ->acceptJson()
                ->withHeaders(['X-goog-api-key' => $apiKey])
                ->connectTimeout(10)
                ->timeout(45)
                ->post(sprintf(
                    'https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent',
                    rawurlencode($model),
                ), [
                    'contents' => [['parts' => [
                        ['inlineData' => ['mimeType' => $mimeType, 'data' => base64_encode($bytes)]],
                        ['text' => $instruction],
                    ]]],
                    'generationConfig' => [
                        'temperature' => 0.4,
                        'maxOutputTokens' => 700,
                    ],
                ]);
        } catch (Throwable $exception) {
            throw new ImageGenerationException('Gemini vision request could not be reached.', previous: $exception);
        }

        if ($response->failed()) {
            throw new ImageGenerationException('Gemini vision request failed with HTTP '.$response->status().'.');
        }

        $text = trim((string) $response->json('candidates.0.content.parts.0.text', ''));
        if ($text === '') {
            throw new ImageGenerationException('Gemini returned no description.');
        }

        return $text;
    }

    /**
     * @param  array<string, mixed>  $brief
     */
    public function generateMotionPrompt(array $brief): string
    {
        $storedKey = PlatformCredential::query()->where('key', 'ai_image_api_key')->first()?->value;
        $apiKey = (string) ($storedKey ?: config('services.pixel.gemini.api_key'));
        $model = (string) config('services.pixel.gemini.text_model', 'gemini-flash-latest');
        if ($apiKey === '') {
            throw new ImageGenerationException('Gemini API Key is not configured.');
        }

        $systemPrompt = $this->buildMotionSystemPrompt($brief);

        try {
            $response = Http::asJson()
                ->acceptJson()
                ->withHeaders(['X-goog-api-key' => $apiKey])
                ->connectTimeout(10)
                ->timeout(60)
                ->post(sprintf(
                    'https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent',
                    rawurlencode($model),
                ), [
                    'contents' => [['parts' => [['text' => $systemPrompt]]]],
                    'generationConfig' => [
                        'temperature' => 0.9,
                        'maxOutputTokens' => 2048,
                    ],
                ]);
        } catch (Throwable $exception) {
            throw new ImageGenerationException('Gemini could not be reached.', previous: $exception);
        }

        if ($response->failed()) {
            throw new ImageGenerationException('Gemini request failed with HTTP '.$response->status().'.');
        }

        $text = trim((string) $response->json('candidates.0.content.parts.0.text', ''));
        if ($text === '') {
            throw new ImageGenerationException('Gemini returned no prompt.');
        }

        return $text;
    }

    /**
     * @param  array<string, mixed>  $brief
     */
    private function buildMotionSystemPrompt(array $brief): string
    {
        $bool = fn (string $key): bool => filter_var($brief[$key] ?? false, FILTER_VALIDATE_BOOL);
        $get = fn (string $key): string => trim((string) ($brief[$key] ?? ''));

        $lines = [
            'You are Motion, an expert video advertising creative director and AI video-prompt engineer.',
            'Write a complete, production-ready creative brief for an AI video generation tool, based on the parameters below.',
            'Structure the output with clear labeled sections: Concept, Hook (write the literal opening line/visual), Scene-by-scene breakdown, Visual Style, Audio, and Call To Action.',
            'Do not use markdown headers (#) — use plain labeled section titles and short paragraphs or bullet points.',
            'Write the entire output in '.$get('language').'.',
            'Overall tone / voice: '.$get('tone').'.',
            'Product name: '.$get('product_name').'.',
            'Product description: '.$get('product_description').'.',
            'Target market: '.$get('target_market').'.',
            'Content type: '.$get('content_type').'.',
            'Distribution platform: '.$get('platform').'.',
            'Advertising goal: '.$get('ad_goal').'.',
            'Aspect ratio: '.$get('aspect_ratio').'.',
            'Color grading style: '.$get('color_grading').'.',
            'Characters: '.$get('character').($get('character_gender') !== '' ? ' ('.$get('character_gender').')' : '').'.',
            'Video duration: '.$get('duration').'.',
            'Hook style: '.$get('hook_style').'.',
            'Editing pace: '.$get('pace_editing').'.',
            $get('setting_location') !== '' ? 'Setting / location: '.$get('setting_location').'.' : null,
            $get('music_mood') !== '' ? 'Music mood: '.$get('music_mood').'.' : null,
            $get('transition') !== '' ? 'Transitions: '.$get('transition').'.' : null,
            $bool('text_overlay_animation') ? 'Include animated text overlays for key phrases.' : 'Do not include animated text overlays.',
            $bool('cinematic_camera') ? 'Use cinematic camera movement and lighting effects.' : 'Keep camera work simple and mostly static.',
            $get('explicit_cta') !== '' ? 'Explicit call-to-action to include: '.$get('explicit_cta').'.' : null,
            $get('negative_prompt') !== '' ? 'Strictly avoid the following: '.$get('negative_prompt').'.' : null,
        ];

        return implode(' ', array_filter($lines, fn ($line) => $line !== null));
    }
}
