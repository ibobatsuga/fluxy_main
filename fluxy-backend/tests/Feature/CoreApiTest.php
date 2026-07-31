<?php

namespace Tests\Feature;

use App\Models\Plan;
use App\Models\Subscription;
use App\Models\Tenant;
use App\Models\User;
use App\Services\UsageService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Validation\ValidationException;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CoreApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_tenant_can_register_and_is_pending(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Rina Kusuma',
            'email' => 'rina@example.com',
            'password' => 'Secret123!',
            'password_confirmation' => 'Secret123!',
            'business_name' => 'Kopi Senja',
            'industry_category' => 'Food & Beverage',
            'timezone' => 'Asia/Jakarta',
        ]);

        $response->assertCreated()->assertJsonPath('data.message', 'Registrasi berhasil! Akun Anda menunggu persetujuan admin.');
        $this->assertDatabaseHas('tenants', ['business_name' => 'Kopi Senja', 'status' => 'pending']);
        $this->assertDatabaseHas('tenant_members', ['role' => 'owner']);
    }

    public function test_login_returns_frontend_compatible_user_and_token(): void
    {
        [$user] = $this->activeTenantUser();

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'Secret123!',
        ]);

        $response->assertOk()
            ->assertJsonPath('data.user.business_name', 'Toko Test')
            ->assertJsonPath('data.user.subscription_status', 'active')
            ->assertJsonStructure(['data' => ['token', 'user' => ['id', 'is_approved', 'is_admin']]]);
    }

    public function test_pending_tenant_cannot_use_employee_endpoints(): void
    {
        $tenant = Tenant::create([
            'name' => 'Pending', 'slug' => 'pending', 'business_name' => 'Pending',
            'industry_category' => 'Other', 'status' => 'pending',
        ]);
        $user = User::factory()->create(['current_tenant_id' => $tenant->id]);
        $tenant->users()->attach($user->id, ['role' => 'owner']);
        Sanctum::actingAs($user);

        $this->getJson('/api/v1/accounts')->assertForbidden();
    }

    public function test_admin_can_approve_pending_tenant(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $tenant = Tenant::create([
            'name' => 'Pending', 'slug' => 'pending', 'business_name' => 'Pending',
            'industry_category' => 'Other', 'status' => 'pending',
        ]);
        $user = User::factory()->create(['current_tenant_id' => $tenant->id]);
        $tenant->users()->attach($user->id, ['role' => 'owner']);
        Sanctum::actingAs($admin);

        $this->postJson("/api/v1/admin/users/{$user->id}/approve", [
            'subscription_start_date' => now()->toDateString(),
            'subscription_end_date' => now()->addMonth()->toDateString(),
        ])->assertOk()->assertJsonPath('data.subscription_status', 'active');

        $this->assertDatabaseHas('tenants', ['id' => $tenant->id, 'status' => 'active']);
        $this->assertDatabaseHas('subscriptions', ['tenant_id' => $tenant->id, 'status' => 'active']);
        $this->assertDatabaseHas('audit_logs', ['tenant_id' => $tenant->id, 'type' => 'approval']);
    }

    public function test_non_admin_cannot_access_admin_api(): void
    {
        [$user] = $this->activeTenantUser();
        Sanctum::actingAs($user);

        $this->getJson('/api/v1/admin/users')->assertForbidden();
    }

    public function test_usage_is_idempotent_and_enforced(): void
    {
        [, $tenant] = $this->activeTenantUser(['pixel' => 1, 'maya' => 60, 'echo' => -1, 'kai' => 1000]);
        $usage = app(UsageService::class);

        $first = $usage->record($tenant, 'pixel', 'generate', 1, 'same-operation');
        $second = $usage->record($tenant, 'pixel', 'generate', 1, 'same-operation');

        $this->assertSame($first->id, $second->id);
        $this->assertSame(1, $usage->summary($tenant)['pixel']['used']);

        $this->expectException(ValidationException::class);
        $usage->record($tenant, 'pixel', 'generate', 1, 'different-operation');
    }

    public function test_admin_can_update_default_usage_limits_including_motion(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        Sanctum::actingAs($admin);

        $this->putJson('/api/v1/admin/config/limits', [
            'pixel' => 40, 'maya' => 55, 'kai' => 900, 'motion' => 25, 'luna' => 80,
        ])->assertOk()
            ->assertJsonPath('data.motion', 25)
            ->assertJsonPath('data.luna', 80);

        $this->getJson('/api/v1/admin/config/limits')->assertOk()
            ->assertJsonPath('data.motion', 25)
            ->assertJsonPath('data.luna', 80);
    }

    public function test_credentials_are_encrypted_and_masked(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        Sanctum::actingAs($admin);

        $this->putJson('/api/v1/admin/config/credentials', [
            'meta_app_id' => 'meta-public-id',
            'meta_app_secret' => 'super-secret-value',
        ])->assertOk()
            ->assertJsonPath('data.meta_app_id', 'meta-public-id')
            ->assertJsonPath('data.meta_app_secret_masked', '••••alue')
            ->assertJsonMissing(['meta_app_secret' => 'super-secret-value']);

        $raw = \DB::table('platform_credentials')->where('key', 'meta_app_secret')->value('value');
        $this->assertNotSame('super-secret-value', $raw);
    }

    public function test_frontend_dashboard_contract_returns_empty_real_state(): void
    {
        [$user] = $this->activeTenantUser();
        Sanctum::actingAs($user);

        $this->getJson('/api/v1/accounts')->assertOk()->assertExactJson(['data' => []]);
        $this->getJson('/api/v1/posts')->assertOk()->assertExactJson(['data' => []]);
        $this->getJson('/api/v1/analytics')->assertOk()->assertJsonStructure(['data' => ['overview', 'daily']]);
        $this->getJson('/api/v1/usage/summary')->assertOk()->assertJsonStructure(['data' => ['pixel', 'maya', 'echo', 'kai']]);
    }

    public function test_suspended_tenant_can_read_history_but_cannot_run_paid_actions(): void
    {
        [$user, $tenant] = $this->activeTenantUser();
        $tenant->update(['status' => 'suspended', 'suspended_at' => now()]);
        Sanctum::actingAs($user);

        $this->getJson('/api/v1/media')->assertOk();
        $this->postJson('/api/v1/ai/generate-caption', ['prompt' => 'Promo'])
            ->assertForbidden()
            ->assertJsonPath('message', 'Subscription is not active. Contact Fluxy Admin to continue.');
    }

    private function activeTenantUser(?array $limits = null): array
    {
        $plan = Plan::create([
            'code' => 'default',
            'name' => 'Default',
            'limits' => $limits ?? UsageService::DEFAULT_LIMITS,
            'is_active' => true,
        ]);
        $tenant = Tenant::create([
            'name' => 'Toko Test', 'slug' => 'toko-test', 'business_name' => 'Toko Test',
            'industry_category' => 'Retail', 'timezone' => 'Asia/Jakarta',
            'status' => 'active', 'approved_at' => now(),
        ]);
        $user = User::factory()->create([
            'email' => 'tenant@example.com',
            'password' => 'Secret123!',
            'provider' => 'email',
            'current_tenant_id' => $tenant->id,
        ]);
        $tenant->users()->attach($user->id, ['role' => 'owner']);
        Subscription::create([
            'tenant_id' => $tenant->id,
            'plan_id' => $plan->id,
            'status' => 'active',
            'starts_at' => now()->startOfMonth(),
            'ends_at' => now()->addMonth(),
        ]);

        return [$user, $tenant];
    }
}
