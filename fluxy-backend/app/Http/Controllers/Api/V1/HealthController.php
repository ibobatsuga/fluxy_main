<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\PlatformCredential;
use App\Services\Meta\MetaCredentials;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Throwable;

class HealthController extends ApiController
{
    public function __invoke(MetaCredentials $metaCredentials): JsonResponse
    {
        $checks = [
            'database' => $this->databaseCheck(),
            'storage' => ['status' => is_writable(storage_path()) ? 'ok' : 'failed'],
            'scheduler' => $this->schedulerCheck(),
        ];
        $healthy = collect($checks)->except('scheduler')->every(
            fn (array $check): bool => $check['status'] === 'ok',
        );
        $status = ! $healthy
            ? 'failed'
            : ($checks['scheduler']['status'] === 'ok' ? 'ok' : 'degraded');
        try {
            $pixelConfigured = $this->pixelConfigured();
        } catch (Throwable) {
            $pixelConfigured = false;
        }
        try {
            $metaConfigured = $metaCredentials->businessId() !== ''
                && $metaCredentials->systemUserToken() !== '';
        } catch (Throwable) {
            $metaConfigured = false;
        }

        return response()->json([
            'status' => $status,
            'timestamp' => now()->toISOString(),
            'checks' => $checks,
            'integrations' => [
                'pixel_provider' => (string) config('services.pixel.provider'),
                'pixel_configured' => $pixelConfigured,
                'meta_configured' => $metaConfigured,
                'kai_qr_gateway_enabled' => (bool) config('services.kai.qr_gateway_enabled'),
            ],
        ], $healthy ? 200 : 503);
    }

    private function databaseCheck(): array
    {
        try {
            DB::select('select 1');

            return ['status' => 'ok'];
        } catch (Throwable) {
            return ['status' => 'failed'];
        }
    }

    private function schedulerCheck(): array
    {
        try {
            $lastRun = Cache::get('health:scheduler:last_run');
        } catch (Throwable) {
            return ['status' => 'failed', 'last_run_at' => null];
        }
        if (! is_string($lastRun)) {
            return ['status' => 'unknown', 'last_run_at' => null];
        }

        $lastRunAt = CarbonImmutable::parse($lastRun);

        return [
            'status' => $lastRunAt->lt(now()->subMinutes(3)) ? 'stale' : 'ok',
            'last_run_at' => $lastRunAt->toISOString(),
        ];
    }

    private function pixelConfigured(): bool
    {
        return match (config('services.pixel.provider')) {
            'gemini' => PlatformCredential::query()->where('key', 'ai_image_api_key')->exists()
                || config('services.pixel.gemini.api_key') !== '',
            'cloudflare' => config('services.pixel.cloudflare.account_id') !== ''
                && config('services.pixel.cloudflare.token') !== '',
            'fake' => ! app()->environment('production'),
            default => false,
        };
    }
}
