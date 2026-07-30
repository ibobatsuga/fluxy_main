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
        $model = (string) config('services.pixel.gemini.text_model', 'gemini-2.5-flash');
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
}
