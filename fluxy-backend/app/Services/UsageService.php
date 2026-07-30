<?php

namespace App\Services;

use App\Models\Plan;
use App\Models\Tenant;
use App\Models\UsageEvent;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class UsageService
{
    public const DEFAULT_LIMITS = [
        'pixel' => 50,
        'maya' => 60,
        'echo' => -1,
        'kai' => 1000,
    ];

    public function summary(Tenant $tenant): array
    {
        $tenant->loadMissing('currentSubscription.plan');
        $subscription = $tenant->currentSubscription;
        $start = $subscription?->starts_at ?? now()->startOfMonth();
        $end = $subscription?->ends_at ?? now()->endOfMonth();
        $limits = array_merge(self::DEFAULT_LIMITS, $subscription?->plan?->limits ?? []);

        $used = UsageEvent::query()
            ->where('tenant_id', $tenant->id)
            ->whereBetween('occurred_at', [$start, $end])
            ->selectRaw('employee, SUM(quantity) as total')
            ->groupBy('employee')
            ->pluck('total', 'employee');

        return collect(self::DEFAULT_LIMITS)
            ->mapWithKeys(fn ($default, $employee) => [
                $employee => [
                    'used' => (int) ($used[$employee] ?? 0),
                    'limit' => (int) ($limits[$employee] ?? $default),
                ],
            ])->all();
    }

    public function record(
        Tenant $tenant,
        string $employee,
        string $action,
        int $quantity = 1,
        ?string $idempotencyKey = null,
        array $metadata = [],
    ): UsageEvent {
        return DB::transaction(function () use ($tenant, $employee, $action, $quantity, $idempotencyKey, $metadata) {
            if ($idempotencyKey) {
                $existing = UsageEvent::where('tenant_id', $tenant->id)
                    ->where('idempotency_key', $idempotencyKey)
                    ->first();

                if ($existing) {
                    return $existing;
                }
            }

            $this->assertAvailable($tenant, $employee, $quantity);

            return UsageEvent::create([
                'tenant_id' => $tenant->id,
                'employee' => $employee,
                'action' => $action,
                'quantity' => $quantity,
                'idempotency_key' => $idempotencyKey,
                'metadata' => $metadata,
                'occurred_at' => Carbon::now(),
            ]);
        });
    }

    public function assertAvailable(Tenant $tenant, string $employee, int $quantity = 1): void
    {
        $summary = $this->summary($tenant);
        $limit = $summary[$employee]['limit'] ?? null;
        $used = $summary[$employee]['used'] ?? 0;

        if ($limit !== null && $limit >= 0 && ($used + $quantity) > $limit) {
            throw ValidationException::withMessages([
                'usage' => ["Kuota {$employee} untuk periode ini sudah habis."],
            ]);
        }
    }

    public function updateDefaultLimits(array $limits): Plan
    {
        $plan = Plan::firstOrCreate(
            ['code' => 'default'],
            ['name' => 'Fluxy Default', 'limits' => self::DEFAULT_LIMITS, 'is_active' => true],
        );
        $plan->update(['limits' => array_merge(self::DEFAULT_LIMITS, $limits)]);

        return $plan;
    }
}
