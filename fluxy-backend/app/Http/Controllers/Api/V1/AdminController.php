<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\AuditLog;
use App\Models\FluxyNotification;
use App\Models\Plan;
use App\Models\PlatformCredential;
use App\Models\Subscription;
use App\Models\Tenant;
use App\Models\User;
use App\Services\AuditService;
use App\Services\UsageService;
use App\Support\TenantPresenter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminController extends ApiController
{
    public function __construct(
        private readonly UsageService $usage,
        private readonly AuditService $audit,
    ) {}

    public function tenants(): JsonResponse
    {
        $users = User::query()
            ->where('is_admin', false)
            ->whereHas('currentTenant', fn ($query) => $query->where('status', '!=', 'rejected'))
            ->with('currentTenant.currentSubscription')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (User $user) => TenantPresenter::user($user));

        return $this->data($users);
    }

    public function pendingUsers(): JsonResponse
    {
        $users = User::query()
            ->where('is_admin', false)
            ->whereHas('currentTenant', fn ($query) => $query->where('status', 'pending'))
            ->with('currentTenant.currentSubscription')
            ->latest()
            ->get()
            ->map(fn (User $user) => TenantPresenter::user($user));

        return $this->data($users);
    }

    public function tenant(User $user): JsonResponse
    {
        abort_if($user->is_admin, 404, 'Tenant not found.');

        return $this->data(TenantPresenter::user($user));
    }

    public function tenantUsage(User $user): JsonResponse
    {
        abort_if(! $user->currentTenant, 404, 'Tenant not found.');

        return $this->data($this->usage->summary($user->currentTenant));
    }

    public function approve(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'subscription_start_date' => ['required', 'date'],
            'subscription_end_date' => ['required', 'date', 'after:subscription_start_date'],
        ]);
        $tenant = $this->tenantOf($user);

        DB::transaction(function () use ($request, $tenant, $validated) {
            $plan = Plan::firstOrCreate(
                ['code' => 'default'],
                ['name' => 'Fluxy Default', 'limits' => UsageService::DEFAULT_LIMITS, 'is_active' => true],
            );

            Subscription::create([
                'tenant_id' => $tenant->id,
                'plan_id' => $plan->id,
                'status' => 'active',
                'starts_at' => $validated['subscription_start_date'],
                'ends_at' => $validated['subscription_end_date'],
                'activated_by' => $request->user()->id,
            ]);
            $tenant->update([
                'status' => 'active',
                'approved_at' => $tenant->approved_at ?? now(),
                'suspended_at' => null,
                'rejection_reason' => null,
            ]);
            $this->audit->write('approval', 'Tenant diaktifkan.', $tenant, $request->user(), $validated, $request);
            $this->notifyTenant($tenant, 'tenant_approved', 'Akun disetujui', 'Subscription Fluxy Anda sudah aktif.');
        });

        return $this->data(TenantPresenter::user($user->fresh()));
    }

    public function reject(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate(['reason' => ['nullable', 'string', 'max:1000']]);
        $tenant = $this->tenantOf($user);
        $reason = $validated['reason'] ?? 'Pendaftaran ditolak';

        $tenant->update(['status' => 'rejected', 'rejection_reason' => $reason]);
        $this->audit->write('reject', $reason, $tenant, $request->user(), [], $request);
        $this->notifyTenant($tenant, 'tenant_rejected', 'Pendaftaran ditolak', $reason);

        return $this->message('Tenant rejected.');
    }

    public function suspend(Request $request, User $user): JsonResponse
    {
        $tenant = $this->tenantOf($user);
        $tenant->update(['status' => 'suspended', 'suspended_at' => now()]);
        $this->audit->write('suspend', 'Tenant ditangguhkan.', $tenant, $request->user(), [], $request);
        $this->notifyTenant($tenant, 'tenant_suspended', 'Akun ditangguhkan', 'Hubungi Admin Fluxy untuk informasi lebih lanjut.');

        return $this->data(TenantPresenter::user($user->fresh()));
    }

    public function reactivate(Request $request, User $user): JsonResponse
    {
        $tenant = $this->tenantOf($user);
        $tenant->update(['status' => 'active', 'suspended_at' => null]);
        $this->audit->write('reactivate', 'Tenant diaktifkan kembali.', $tenant, $request->user(), [], $request);
        $this->notifyTenant($tenant, 'tenant_reactivated', 'Akun aktif kembali', 'Akses AI Employees sudah dipulihkan.');

        return $this->data(TenantPresenter::user($user->fresh()));
    }

    public function aggregateUsage(): JsonResponse
    {
        $totals = collect(UsageService::DEFAULT_LIMITS)
            ->map(fn ($limit) => ['used' => 0, 'limit' => $limit < 0 ? -1 : 0])
            ->all();

        Tenant::whereIn('status', ['active', 'suspended'])->each(function (Tenant $tenant) use (&$totals) {
            foreach ($this->usage->summary($tenant) as $employee => $value) {
                $totals[$employee]['used'] += $value['used'];
                if ($totals[$employee]['limit'] >= 0 && $value['limit'] >= 0) {
                    $totals[$employee]['limit'] += $value['limit'];
                }
            }
        });

        return $this->data($totals);
    }

    public function activityLogs(Request $request): JsonResponse
    {
        $logs = AuditLog::query()
            ->when($request->string('tenant_id')->isNotEmpty(), fn ($q) => $q->where('tenant_id', $request->string('tenant_id')))
            ->when($request->string('type')->isNotEmpty(), fn ($q) => $q->where('type', $request->string('type')))
            ->latest()
            ->limit(200)
            ->get();
        $tenantNames = Tenant::withTrashed()->whereIn('id', $logs->pluck('tenant_id')->filter())->pluck('business_name', 'id');

        return $this->data($logs->map(fn (AuditLog $log) => [
            'id' => (string) $log->id,
            'tenant_id' => $log->tenant_id,
            'tenant_name' => $tenantNames[$log->tenant_id] ?? 'Platform',
            'type' => $log->type,
            'message' => $log->message,
            'created_at' => $log->created_at->toISOString(),
        ]));
    }

    public function limits(): JsonResponse
    {
        $plan = Plan::where('code', 'default')->first();
        $limits = array_merge(UsageService::DEFAULT_LIMITS, $plan?->limits ?? []);

        return $this->data([
            'pixel' => $limits['pixel'],
            'maya' => $limits['maya'],
            'kai' => $limits['kai'],
            'motion' => $limits['motion'],
        ]);
    }

    public function updateLimits(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'pixel' => ['required', 'integer', 'min:1', 'max:1000000'],
            'maya' => ['required', 'integer', 'min:1', 'max:1000000'],
            'kai' => ['required', 'integer', 'min:1', 'max:10000000'],
            'motion' => ['required', 'integer', 'min:1', 'max:1000000'],
        ]);
        $plan = $this->usage->updateDefaultLimits($validated);
        $this->audit->write('limit_change', 'Default usage limits diperbarui.', null, $request->user(), $validated, $request);

        return $this->data([
            'pixel' => $plan->limits['pixel'],
            'maya' => $plan->limits['maya'],
            'kai' => $plan->limits['kai'],
            'motion' => $plan->limits['motion'],
        ]);
    }

    public function credentials(): JsonResponse
    {
        return $this->data($this->credentialPayload());
    }

    public function updateCredentials(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'meta_app_id' => ['sometimes', 'string', 'max:500'],
            'meta_app_secret' => ['sometimes', 'string', 'max:2000'],
            'meta_business_id' => ['sometimes', 'string', 'max:500'],
            'meta_system_user_token' => ['sometimes', 'string', 'max:10000'],
            'meta_webhook_verify_token' => ['sometimes', 'string', 'min:16', 'max:500'],
            'tiktok_app_id' => ['sometimes', 'string', 'max:500'],
            'tiktok_app_secret' => ['sometimes', 'string', 'max:2000'],
            'ai_image_api_key' => ['sometimes', 'string', 'max:2000'],
        ]);

        foreach ($validated as $key => $value) {
            if ($value !== '') {
                PlatformCredential::updateOrCreate(['key' => $key], ['value' => $value]);
            }
        }

        $this->audit->write('credential_change', 'Kredensial platform diperbarui.', null, $request->user(), ['keys' => array_keys($validated)], $request);

        return $this->data($this->credentialPayload());
    }

    private function tenantOf(User $user): Tenant
    {
        abort_if($user->is_admin || ! $user->currentTenant, 404, 'Tenant not found.');

        return $user->currentTenant;
    }

    private function credentialPayload(): array
    {
        $values = PlatformCredential::all()->keyBy('key');
        $secret = fn (string $key) => isset($values[$key]) ? '••••'.mb_substr($values[$key]->value, -4) : null;

        $latest = PlatformCredential::latest('updated_at')->first();

        return [
            'meta_app_id' => $values['meta_app_id']->value ?? null,
            'meta_app_secret_masked' => $secret('meta_app_secret'),
            'meta_business_id' => $values['meta_business_id']->value ?? null,
            'meta_system_user_token_masked' => $secret('meta_system_user_token'),
            'meta_webhook_verify_token_masked' => $secret('meta_webhook_verify_token'),
            'tiktok_app_id' => $values['tiktok_app_id']->value ?? null,
            'tiktok_app_secret_masked' => $secret('tiktok_app_secret'),
            'ai_image_api_key_masked' => $secret('ai_image_api_key'),
            'updated_at' => $latest?->updated_at?->toISOString(),
        ];
    }

    private function notifyTenant(Tenant $tenant, string $type, string $title, string $message): void
    {
        $tenant->users()->each(function (User $user) use ($tenant, $type, $title, $message) {
            FluxyNotification::create([
                'tenant_id' => $tenant->id, 'user_id' => $user->id,
                'type' => $type, 'title' => $title, 'message' => $message,
            ]);
        });
    }
}
