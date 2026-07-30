<?php

namespace App\Services\Images;

use App\Contracts\ImageProvider;
use App\Data\GeneratedImage;
use App\Exceptions\ImageGenerationException;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;
use Throwable;

class CloudflareImageProvider implements ImageProvider
{
    public function __construct(
        private readonly string $accountId,
        private readonly string $token,
        private readonly string $model,
        private readonly int $steps = 4,
        private readonly int $timeout = 90,
    ) {}

    public function name(): string
    {
        return 'cloudflare';
    }

    public function generate(
        string $prompt,
        string $contentType,
        ?string $inputBytes = null,
        ?string $inputMimeType = null,
    ): GeneratedImage {
        if ($this->accountId === '' || $this->token === '') {
            throw new ImageGenerationException('Cloudflare Workers AI is not configured.');
        }

        $endpoint = sprintf(
            'https://api.cloudflare.com/client/v4/accounts/%s/ai/run/%s',
            rawurlencode($this->accountId),
            ltrim($this->model, '/'),
        );
        $seed = random_int(1, 2_147_483_647);

        try {
            $response = Http::asJson()
                ->acceptJson()
                ->withToken($this->token)
                ->connectTimeout(10)
                ->timeout($this->timeout)
                ->retry([0, 400, 1000], when: function (Throwable $exception): bool {
                    if ($exception instanceof ConnectionException) {
                        return true;
                    }

                    return $exception instanceof RequestException
                        && ($exception->response->status() === 429 || $exception->response->serverError());
                }, throw: false)
                ->post($endpoint, [
                    'prompt' => $prompt,
                    'steps' => max(1, min(8, $this->steps)),
                    'seed' => $seed,
                ]);
        } catch (Throwable $exception) {
            throw new ImageGenerationException('Cloudflare Workers AI could not be reached.', previous: $exception);
        }

        if ($response->failed()) {
            throw new ImageGenerationException('Cloudflare Workers AI request failed with HTTP '.$response->status().'.');
        }

        $encoded = $response->json('result.image');

        if (! is_string($encoded) || $encoded === '') {
            throw new ImageGenerationException('Cloudflare Workers AI returned no image.');
        }

        $encoded = preg_replace('/^data:image\/[a-z0-9.+-]+(?:;charset=[^;]+)?;base64,/i', '', $encoded) ?? $encoded;
        $bytes = base64_decode($encoded, true);

        if ($bytes === false || $bytes === '') {
            throw new ImageGenerationException('Cloudflare Workers AI returned invalid image data.');
        }

        [$mimeType, $extension] = $this->detectFormat($bytes);

        return new GeneratedImage($bytes, $mimeType, $extension, [
            'model' => $this->model,
            'seed' => $seed,
            'steps' => max(1, min(8, $this->steps)),
            'cf_ray' => $response->header('cf-ray'),
        ]);
    }

    private function detectFormat(string $bytes): array
    {
        $mimeType = (new \finfo(FILEINFO_MIME_TYPE))->buffer($bytes);

        return match ($mimeType) {
            'image/jpeg' => ['image/jpeg', 'jpg'],
            'image/png' => ['image/png', 'png'],
            'image/webp' => ['image/webp', 'webp'],
            default => throw new ImageGenerationException('Cloudflare Workers AI returned an unsupported image format.'),
        };
    }
}
