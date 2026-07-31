<?php

namespace App\Http\Controllers\Api\V1;

use App\Services\Health\IntegrationHealthService;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Throwable;

class HealthController extends ApiController
{
    public function __invoke(IntegrationHealthService $integrationHealth): JsonResponse
    {
        $checks = [
            'database' => $this->databaseCheck(),
            'storage' => ['status' => is_writable(storage_path()) ? 'ok' : 'failed'],
            'scheduler' => $this->schedulerCheck(),
        ];
        $coreHealthy = collect($checks)->except('scheduler')->every(
            fn (array $check): bool => $check['status'] === 'ok',
        );
        $integrations = $integrationHealth->check();
        $ready = $coreHealthy
            && $checks['scheduler']['status'] === 'ok'
            && $integrations['healthy'];
        $status = ! $coreHealthy ? 'failed' : ($ready ? 'ok' : 'degraded');

        return response()->json([
            'status' => $status,
            'timestamp' => now()->toISOString(),
            'checks' => $checks,
            'integrations' => $integrations['checks'],
        ], $ready ? 200 : 503);
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
}
