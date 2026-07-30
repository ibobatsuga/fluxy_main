<?php

namespace Tests\Feature;

use App\Models\KaiConversation;
use App\Models\KaiConversationMessage;
use App\Models\KaiDevice;
use App\Models\Plan;
use App\Models\PlatformCredential;
use App\Models\SocialAccount;
use App\Models\Subscription;
use App\Models\Tenant;
use App\Models\User;
use App\Services\UsageService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class MetaIntegrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_sync_assigned_meta_business_assets_into_a_tenant(): void
    {
        [$tenantUser, $tenant] = $this->activeUser();
        $admin = User::factory()->create(['is_admin' => true]);
        Sanctum::actingAs($admin);
        PlatformCredential::create(['key' => 'meta_business_id', 'value' => 'business-123']);
        PlatformCredential::create(['key' => 'meta_system_user_token', 'value' => 'system-user-token']);

        Http::fake([
            'graph.facebook.com/*/business-123/owned_pages*' => Http::response([
                'data' => [[
                    'id' => 'page-123',
                    'name' => 'Belajar Marketing',
                    'username' => 'belajarmarketing.id',
                    'picture' => ['data' => ['url' => 'https://example.com/page.jpg']],
                    'instagram_business_account' => [
                        'id' => 'ig-123',
                        'username' => 'ibobatsuga',
                        'profile_picture_url' => 'https://example.com/ig.jpg',
                    ],
                ]],
            ]),
            'graph.facebook.com/*/business-123/owned_whatsapp_business_accounts*' => Http::response([
                'data' => [['id' => 'waba-123', 'name' => 'Fluxy WABA']],
            ]),
            'graph.facebook.com/*/waba-123/phone_numbers*' => Http::response([
                'data' => [[
                    'id' => 'phone-123',
                    'display_phone_number' => '+62 812-3456-7890',
                    'verified_name' => 'Fluxy',
                ]],
            ]),
        ]);

        $this->postJson('/api/v1/admin/meta/sync', ['user_id' => $tenantUser->id])
            ->assertOk()
            ->assertJsonPath('data.facebook_accounts', 1)
            ->assertJsonPath('data.instagram_accounts', 1)
            ->assertJsonPath('data.whatsapp_numbers', 1);

        $this->assertDatabaseHas('social_accounts', [
            'tenant_id' => $tenant->id,
            'provider' => 'facebook',
            'provider_account_id' => 'page-123',
        ]);
        $this->assertDatabaseHas('social_accounts', [
            'tenant_id' => $tenant->id,
            'provider' => 'instagram',
            'provider_account_id' => 'ig-123',
        ]);
        $device = KaiDevice::where('provider_phone_number_id', 'phone-123')->firstOrFail();
        $this->assertSame('waba-123', $device->waba_id);
        $this->assertNotSame('system-user-token', $device->getRawOriginal('access_token'));
        $this->assertNotSame(
            'system-user-token',
            SocialAccount::where('provider_account_id', 'ig-123')->firstOrFail()->getRawOriginal('access_token'),
        );
    }

    public function test_whatsapp_webhook_requires_signature_and_is_idempotent(): void
    {
        [$user, $tenant] = $this->activeUser();
        PlatformCredential::create(['key' => 'meta_app_secret', 'value' => 'webhook-secret']);
        PlatformCredential::create(['key' => 'meta_webhook_verify_token', 'value' => 'verify-token-at-least-16']);
        KaiDevice::create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'provider_phone_number_id' => 'phone-123',
            'wa_number' => '628123456789',
            'status' => 'connected',
            'access_token' => 'system-user-token',
            'connected_at' => now(),
        ]);

        $this->get('/api/v1/meta/webhook?hub_mode=subscribe&hub_verify_token=verify-token-at-least-16&hub_challenge=12345')
            ->assertOk()
            ->assertSeeText('12345');

        $payload = [
            'object' => 'whatsapp_business_account',
            'entry' => [[
                'changes' => [[
                    'field' => 'messages',
                    'value' => [
                        'metadata' => ['phone_number_id' => 'phone-123'],
                        'contacts' => [['wa_id' => '628111222333', 'profile' => ['name' => 'Budi']]],
                        'messages' => [[
                            'id' => 'wamid.abc123',
                            'from' => '628111222333',
                            'timestamp' => '1785372000',
                            'type' => 'text',
                            'text' => ['body' => 'Saya tertarik produknya'],
                        ]],
                    ],
                ]],
            ]],
        ];
        $json = json_encode($payload, JSON_THROW_ON_ERROR);
        $server = ['HTTP_X_HUB_SIGNATURE_256' => 'sha256='.hash_hmac('sha256', $json, 'webhook-secret')];

        $this->call('POST', '/api/v1/meta/webhook', [], [], [], $server, $json)->assertOk();
        $this->call('POST', '/api/v1/meta/webhook', [], [], [], $server, $json)->assertOk();

        $this->assertDatabaseHas('kai_conversations', [
            'tenant_id' => $tenant->id,
            'wa_contact' => '628111222333',
            'contact_name' => 'Budi',
        ]);
        $this->assertSame(1, KaiConversationMessage::where('provider_message_id', 'wamid.abc123')->count());

        $this->call('POST', '/api/v1/meta/webhook', [], [], [], [
            'HTTP_X_HUB_SIGNATURE_256' => 'sha256=invalid',
        ], $json)->assertForbidden();
    }

    public function test_user_can_reply_to_a_whatsapp_lead_through_cloud_api(): void
    {
        [$user, $tenant] = $this->activeUser();
        Sanctum::actingAs($user);
        KaiDevice::create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'provider_phone_number_id' => 'phone-123',
            'wa_number' => '628123456789',
            'status' => 'connected',
            'access_token' => 'system-user-token',
            'connected_at' => now(),
        ]);
        $conversation = KaiConversation::create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'wa_contact' => '628111222333',
            'contact_name' => 'Budi',
        ]);
        Http::fake([
            'graph.facebook.com/*/phone-123/messages*' => Http::response([
                'messages' => [['id' => 'wamid.outbound123']],
            ]),
        ]);

        $this->postJson("/api/v1/kai/chatbot/conversations/{$conversation->id}/messages", [
            'message' => 'Halo Budi, ada yang bisa kami bantu?',
        ])->assertCreated()->assertJsonPath('data.provider_message_id', 'wamid.outbound123');

        Http::assertSent(fn ($request) => $request['to'] === '628111222333'
            && $request['type'] === 'text'
            && $request['text']['body'] === 'Halo Budi, ada yang bisa kami bantu?');
    }

    public function test_instagram_dm_webhook_can_be_replied_to_from_kai(): void
    {
        [$user, $tenant] = $this->activeUser();
        PlatformCredential::create(['key' => 'meta_app_secret', 'value' => 'webhook-secret']);
        SocialAccount::create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'provider' => 'instagram',
            'provider_account_id' => 'ig-123',
            'platform_username' => 'ibobatsuga',
            'access_token' => 'system-user-token',
            'is_active' => true,
            'connected_at' => now(),
        ]);
        $payload = [
            'object' => 'instagram',
            'entry' => [[
                'id' => 'ig-123',
                'messaging' => [[
                    'sender' => ['id' => 'igsid-lead-1'],
                    'recipient' => ['id' => 'ig-123'],
                    'timestamp' => 1785372000000,
                    'message' => ['mid' => 'ig-mid-1', 'text' => 'Berapa harganya?'],
                ]],
            ]],
        ];
        $json = json_encode($payload, JSON_THROW_ON_ERROR);
        $server = ['HTTP_X_HUB_SIGNATURE_256' => 'sha256='.hash_hmac('sha256', $json, 'webhook-secret')];
        $this->call('POST', '/api/v1/meta/webhook', [], [], [], $server, $json)->assertOk();

        $conversation = KaiConversation::where('channel', 'instagram')->firstOrFail();
        $this->assertSame('igsid-lead-1', $conversation->wa_contact);
        Http::fake([
            'graph.facebook.com/*/ig-123/messages*' => Http::response([
                'recipient_id' => 'igsid-lead-1',
                'message_id' => 'ig-mid-outbound-1',
            ]),
        ]);
        Sanctum::actingAs($user);

        $this->postJson("/api/v1/kai/chatbot/conversations/{$conversation->id}/messages", [
            'message' => 'Harganya Rp199.000.',
        ])->assertCreated()->assertJsonPath('data.provider_message_id', 'ig-mid-outbound-1');
    }

    public function test_maya_publishes_an_instagram_image_through_meta_graph_api(): void
    {
        [$user, $tenant] = $this->activeUser();
        Sanctum::actingAs($user);
        $account = SocialAccount::create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'provider' => 'instagram',
            'provider_account_id' => 'ig-123',
            'platform_username' => 'ibobatsuga',
            'access_token' => 'system-user-token',
            'is_active' => true,
            'connected_at' => now(),
        ]);
        Http::fake([
            'graph.facebook.com/*/ig-123/media_publish*' => Http::response(['id' => 'ig-media-123']),
            'graph.facebook.com/*/ig-123/media*' => Http::response(['id' => 'ig-container-123']),
        ]);

        $this->postJson('/api/v1/posts', [
            'caption' => 'Produk terbaru',
            'hashtags' => '#fluxy',
            'media_urls' => ['https://example.com/product.jpg'],
            'platforms' => [$account->id],
            'content_type' => 'feed',
            'schedule_type' => 'now',
        ])->assertCreated()
            ->assertJsonPath('data.status', 'completed');

        Http::assertSentCount(2);
    }

    private function activeUser(): array
    {
        $plan = Plan::create([
            'code' => 'default',
            'name' => 'Default',
            'limits' => UsageService::DEFAULT_LIMITS,
            'is_active' => true,
        ]);
        $tenant = Tenant::create([
            'name' => 'Fluxy Tenant',
            'slug' => 'fluxy-tenant',
            'business_name' => 'Fluxy Tenant',
            'industry_category' => 'Technology',
            'timezone' => 'Asia/Jakarta',
            'status' => 'active',
            'approved_at' => now(),
        ]);
        $user = User::factory()->create(['current_tenant_id' => $tenant->id]);
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
