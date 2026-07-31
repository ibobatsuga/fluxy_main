<?php

namespace App\Services\Health;

use App\Models\PlatformCredential;
use App\Services\Meta\MetaCredentials;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Throwable;

class IntegrationHealthService
{
    private const CACHE_KEY = 'health:integrations:v1';

    public function __construct(private readonly MetaCredentials $metaCredentials) {}

    /**
     * @return array{healthy: bool, checks: array<string, array<string, mixed>>}
     */
    public function check(): array
    {
        $ttl = max(30, (int) config('services.health.integration_probe_ttl', 300));

        try {
            return Cache::remember(self::CACHE_KEY, now()->addSeconds($ttl), fn (): array => $this->probe());
        } catch (Throwable) {
            return $this->probe();
        }
    }

    /**
     * @return array{healthy: bool, checks: array<string, array<string, mixed>>}
     */
    private function probe(): array
    {
        $checks = [
            'pixel' => $this->pixelCheck(),
            'meta' => $this->metaCheck(),
            'google_oauth' => [
                'status' => config('services.google.client_id') && config('services.google.client_secret')
                    ? 'configured'
                    : 'not_configured',
            ],
            'kai_qr_gateway' => [
                'status' => config('services.kai.qr_gateway_enabled') ? 'configured' : 'disabled',
            ],
        ];

        return [
            'healthy' => $checks['pixel']['status'] === 'ok' && $checks['meta']['status'] === 'ok',
            'checks' => $checks,
        ];
    }

    /** @return array<string, mixed> */
    private function pixelCheck(): array
    {
        $provider = (string) config('services.pixel.provider');

        try {
            return match ($provider) {
                'gemini' => $this->geminiCheck(),
                'cloudflare' => $this->cloudflareCheck(),
                'fake' => [
                    'provider' => 'fake',
                    'status' => app()->environment('production') ? 'failed' : 'ok',
                ],
                default => ['provider' => $provider, 'status' => 'failed'],
            };
        } catch (Throwable) {
            return ['provider' => $provider, 'status' => 'failed'];
        }
    }

    /** @return array<string, mixed> */
    private function geminiCheck(): array
    {
        $storedKey = PlatformCredential::query()->where('key', 'ai_image_api_key')->first()?->value;
        $apiKey = (string) ($storedKey ?: config('services.pixel.gemini.api_key'));
        if ($apiKey === '') {
            return ['provider' => 'gemini', 'status' => 'not_configured'];
        }

        $response = $this->request()
            ->withHeaders(['X-goog-api-key' => $apiKey])
            ->get('https://generativelanguage.googleapis.com/v1beta/models');

        return $this->providerResult('gemini', $response);
    }

    /** @return array<string, mixed> */
    private function cloudflareCheck(): array
    {
        $accountId = (string) config('services.pixel.cloudflare.account_id');
        $token = (string) config('services.pixel.cloudflare.token');
        if ($accountId === '' || $token === '') {
            return ['provider' => 'cloudflare', 'status' => 'not_configured'];
        }

        $response = $this->request()
            ->withToken($token)
            ->get('https://api.cloudflare.com/client/v4/accounts/'.rawurlencode($accountId));

        return $this->providerResult('cloudflare', $response);
    }

    /** @return array<string, mixed> */
    private function metaCheck(): array
    {
        try {
            $businessId = $this->metaCredentials->businessId();
            $token = $this->metaCredentials->systemUserToken();
            if ($businessId === '' || $token === '') {
                return ['status' => 'not_configured'];
            }

            $url = rtrim((string) config('services.meta.graph_url'), '/')
                .'/'.trim((string) config('services.meta.graph_version'), '/')
                .'/'.rawurlencode($businessId);
            $response = $this->request()->withToken($token)->get($url, ['fields' => 'id']);

            return [
                'status' => $response->successful()
                    && hash_equals($businessId, (string) $response->json('id')) ? 'ok' : 'failed',
                'http_status' => $response->status(),
            ];
        } catch (Throwable) {
            return ['status' => 'failed'];
        }
    }

    private function request(): PendingRequest
    {
        return Http::acceptJson()
            ->connectTimeout(2)
            ->timeout(5);
    }

    /** @return array<string, mixed> */
    private function providerResult(string $provider, Response $response): array
    {
        return [
            'provider' => $provider,
            'status' => $response->successful() ? 'ok' : 'failed',
            'http_status' => $response->status(),
        ];
    }
}
