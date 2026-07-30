<?php

namespace Tests\Feature;

use App\Contracts\ImageProvider;
use App\Models\Content;
use App\Models\ContentMetric;
use App\Models\KaiDevice;
use App\Models\MediaAsset;
use App\Models\Plan;
use App\Models\Post;
use App\Models\Subscription;
use App\Models\Tenant;
use App\Models\User;
use App\Services\UsageService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ModuleApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_pixel_generation_creates_tenant_media_and_usage(): void
    {
        [$user] = $this->activeUser();
        Sanctum::actingAs($user);

        $this->postJson('/api/v1/ai/generate-image', [
            'content_type' => 'feed',
            'input_type' => 'gdrive',
            'gdrive_link' => 'https://drive.google.com/file/d/example',
            'style' => 'Clean studio lighting',
        ])->assertStatus(202);

        $this->getJson('/api/v1/media')->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.type', 'generated_image');
        $this->getJson('/api/v1/usage/summary')->assertJsonPath('data.pixel.used', 1);
    }

    public function test_pixel_generation_uses_cloudflare_provider_when_configured(): void
    {
        Storage::fake('public');
        Http::fake([
            'api.cloudflare.com/*' => Http::response([
                'result' => [
                    'image' => 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Zr1sAAAAASUVORK5CYII=',
                ],
                'success' => true,
            ]),
        ]);
        config([
            'services.pixel.provider' => 'cloudflare',
            'services.pixel.cloudflare.account_id' => 'test-account',
            'services.pixel.cloudflare.token' => 'test-token',
            'services.pixel.cloudflare.model' => '@cf/black-forest-labs/flux-1-schnell',
        ]);
        $this->app->forgetInstance(ImageProvider::class);

        [$user] = $this->activeUser('cloudflare');
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/v1/ai/generate-image', [
            'content_type' => 'feed',
            'input_type' => 'gdrive',
            'gdrive_link' => 'https://drive.google.com/file/d/example',
            'style' => 'Clean studio lighting',
        ])->assertStatus(202)
            ->assertJsonPath('data.type', 'generated_image');

        $asset = MediaAsset::findOrFail($response->json('data.id'));
        $this->assertSame('cloudflare', $asset->metadata['provider']);
        $this->assertSame('image/png', $asset->mime_type);
        Storage::disk('public')->assertExists($asset->path);
    }

    public function test_maya_can_connect_and_publish_with_frontend_contract(): void
    {
        [$user] = $this->activeUser();
        Sanctum::actingAs($user);

        $account = $this->postJson('/api/v1/accounts/connect/confirm', ['provider' => 'instagram'])
            ->assertCreated()->json('data');

        $response = $this->postJson('/api/v1/posts', [
            'caption' => 'Produk terbaru',
            'hashtags' => '#fluxy',
            'media_urls' => ['https://example.com/product.jpg'],
            'platforms' => [$account['id']],
            'content_type' => 'feed',
            'schedule_type' => 'now',
        ])->assertCreated();

        $response->assertJsonPath('data.status', 'completed')
            ->assertJsonPath('data.platforms.0.status', 'published')
            ->assertJsonPath('data.content.caption', 'Produk terbaru');
        $this->getJson('/api/v1/usage/summary')->assertJsonPath('data.maya.used', 1);
    }

    public function test_tenant_cannot_delete_another_tenants_social_account(): void
    {
        [$first] = $this->activeUser('first');
        Sanctum::actingAs($first);
        $accountId = $this->postJson('/api/v1/accounts/connect/confirm', ['provider' => 'instagram'])->json('data.id');

        [$second] = $this->activeUser('second');
        Sanctum::actingAs($second);

        $this->deleteJson("/api/v1/accounts/{$accountId}")->assertNotFound();
    }

    public function test_kai_device_approval_group_broadcast_and_settings_flow(): void
    {
        [$user] = $this->activeUser();
        Sanctum::actingAs($user);

        $deviceId = $this->postJson('/api/v1/kai/device/request', [
            'wa_number' => '628123456789', 'business_name' => 'Toko Test',
        ])->assertCreated()->json('data.id');
        $groupId = $this->postJson('/api/v1/kai/groups', [
            'alias' => 'Pelanggan VIP', 'wa_group_id' => 'group-dev-001',
        ])->assertCreated()->json('data.id');
        $this->postJson('/api/v1/kai/broadcast', [
            'group_ids' => [$groupId], 'message' => 'Promo hari ini',
        ])->assertCreated()->assertJsonPath('data.status', 'sent');
        $this->putJson('/api/v1/kai/chatbot/settings', [
            'is_active' => true, 'csv_url' => 'https://example.com/products.csv',
        ])->assertOk()->assertJsonPath('data.is_active', true);
        $this->postJson('/api/v1/kai/chatbot/csv-sync')->assertOk()->assertJsonPath('data.csv_sync_status', 'success');

        $admin = User::factory()->create(['is_admin' => true]);
        Sanctum::actingAs($admin);
        $this->postJson("/api/v1/admin/kai/{$deviceId}/activate", [
            'device_key' => 'phone-number-id', 'api_key' => 'secret-meta-token',
        ])->assertOk()->assertJsonPath('data.status', 'connected');
        $this->assertNotSame('secret-meta-token', KaiDevice::find($deviceId)->getRawOriginal('access_token'));
    }

    public function test_echo_aggregates_persisted_metrics(): void
    {
        [$user, $tenant] = $this->activeUser();
        Sanctum::actingAs($user);
        $content = Content::create([
            'tenant_id' => $tenant->id, 'user_id' => $user->id,
            'caption' => 'Konten performa', 'media_urls' => ['https://example.com/a.jpg'],
        ]);
        $post = Post::create([
            'tenant_id' => $tenant->id, 'user_id' => $user->id, 'content_id' => $content->id,
            'platform_account_ids' => [], 'status' => 'completed', 'actual_published_at' => now(),
        ]);
        ContentMetric::create([
            'tenant_id' => $tenant->id, 'post_id' => $post->id, 'platform' => 'instagram',
            'metric_date' => now()->toDateString(), 'reach' => 1000, 'likes' => 100,
            'comments' => 10, 'shares' => 5, 'views' => 1200, 'followers_count' => 500,
        ]);

        $this->getJson('/api/v1/analytics?platform=instagram')
            ->assertOk()->assertJsonPath('data.overview.total_reach', 1000)
            ->assertJsonPath('data.overview.total_engagement', 115);
        $this->getJson('/api/v1/analytics/contents?platform=instagram')
            ->assertOk()->assertJsonPath('data.0.caption', 'Konten performa');
    }

    private function activeUser(string $suffix = 'default'): array
    {
        $plan = Plan::firstOrCreate([
            'code' => 'default',
        ], [
            'name' => 'Default', 'limits' => UsageService::DEFAULT_LIMITS, 'is_active' => true,
        ]);
        $tenant = Tenant::create([
            'name' => 'Toko '.$suffix, 'slug' => 'toko-'.$suffix, 'business_name' => 'Toko '.$suffix,
            'industry_category' => 'Retail', 'timezone' => 'Asia/Jakarta',
            'status' => 'active', 'approved_at' => now(),
        ]);
        $user = User::factory()->create([
            'email' => $suffix.'@example.com', 'password' => 'Secret123!',
            'current_tenant_id' => $tenant->id,
        ]);
        $tenant->users()->attach($user->id, ['role' => 'owner']);
        Subscription::create([
            'tenant_id' => $tenant->id, 'plan_id' => $plan->id, 'status' => 'active',
            'starts_at' => now()->startOfMonth(), 'ends_at' => now()->addMonth(),
        ]);

        return [$user, $tenant];
    }
}
