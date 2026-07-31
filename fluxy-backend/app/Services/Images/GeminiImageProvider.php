<?php

namespace App\Services\Images;

use App\Contracts\ImageProvider;
use App\Data\GeneratedImage;
use App\Exceptions\ImageGenerationException;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;
use Throwable;

class GeminiImageProvider implements ImageProvider
{
    public function __construct(
        private readonly string $apiKey,
        private readonly string $model = 'gemini-3.1-flash-image',
        private readonly int $timeout = 90,
    ) {}

    public function name(): string
    {
        return 'gemini';
    }

    public function generate(
        string $prompt,
        string $contentType,
        array $referenceImages = [],
    ): GeneratedImage {
        if ($this->apiKey === '') {
            throw new ImageGenerationException('Gemini API Key is not configured.');
        }

        $hasReferenceImages = $referenceImages !== [];

        $imageParts = array_map(fn (array $image): array => [
            'inlineData' => [
                'mimeType' => $image['mimeType'],
                'data' => base64_encode($image['bytes']),
            ],
        ], $referenceImages);

        $textPart = [
            'text' => implode(' ', [
                'You are Pixel, an expert commercial product photographer and visual designer.',
                'Create only the final image requested below.',
                $hasReferenceImages
                    ? 'Use the supplied reference image(s) as the visual identity; preserve recognizable shapes, branding, and key details unless the instruction says otherwise.'
                    : 'Create the scene from the description.',
                'Do not add watermarks or unrequested text.',
                'Creative brief: '.$prompt,
            ]),
        ];

        $parts = [...$imageParts, $textPart];

        $endpoint = sprintf(
            'https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent',
            rawurlencode($this->model),
        );

        try {
            $response = Http::asJson()
                ->acceptJson()
                ->withHeaders(['X-goog-api-key' => $this->apiKey])
                ->connectTimeout(10)
                ->timeout($this->timeout)
                ->retry([0, 500, 1500], when: function (Throwable $exception): bool {
                    if ($exception instanceof ConnectionException) {
                        return true;
                    }

                    return $exception instanceof RequestException
                        && ($exception->response->status() === 429 || $exception->response->serverError());
                }, throw: false)
                ->post($endpoint, [
                    'contents' => [['parts' => $parts]],
                    'generationConfig' => [
                        'responseModalities' => ['IMAGE'],
                        'imageConfig' => [
                            'aspectRatio' => $contentType === 'story' ? '9:16' : '1:1',
                        ],
                    ],
                ]);
        } catch (Throwable $exception) {
            throw new ImageGenerationException('Gemini API could not be reached.', previous: $exception);
        }

        if ($response->failed()) {
            $providerMessage = (string) $response->json('error.message', '');
            $message = 'Gemini API request failed with HTTP '.$response->status().'.';
            if ($providerMessage !== '') {
                $message .= ' '.mb_strimwidth($providerMessage, 0, 300, '…');
            }

            throw new ImageGenerationException($message);
        }

        foreach ($response->json('candidates.0.content.parts', []) as $part) {
            $inline = $part['inlineData'] ?? $part['inline_data'] ?? null;
            if (! is_array($inline) || empty($inline['data'])) {
                continue;
            }

            $bytes = base64_decode((string) $inline['data'], true);
            if ($bytes === false || $bytes === '') {
                continue;
            }

            [$mimeType, $extension] = $this->detectFormat(
                $bytes,
                (string) ($inline['mimeType'] ?? $inline['mime_type'] ?? ''),
            );

            return new GeneratedImage($bytes, $mimeType, $extension, [
                'model' => $this->model,
                'provider' => 'gemini',
                'used_reference_image' => $hasReferenceImages,
                'reference_image_count' => count($referenceImages),
            ]);
        }

        throw new ImageGenerationException('Gemini returned no generated image.');
    }

    private function detectFormat(string $bytes, string $reportedMimeType): array
    {
        $detectedMimeType = (new \finfo(FILEINFO_MIME_TYPE))->buffer($bytes);
        $mimeType = in_array($detectedMimeType, ['image/jpeg', 'image/png', 'image/webp'], true)
            ? $detectedMimeType
            : $reportedMimeType;

        return match ($mimeType) {
            'image/jpeg' => ['image/jpeg', 'jpg'],
            'image/png' => ['image/png', 'png'],
            'image/webp' => ['image/webp', 'webp'],
            default => throw new ImageGenerationException('Gemini returned an unsupported image format.'),
        };
    }
}
