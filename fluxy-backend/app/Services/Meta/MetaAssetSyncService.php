<?php

namespace App\Services\Meta;

use App\Exceptions\MetaApiException;
use App\Models\KaiDevice;
use App\Models\SocialAccount;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class MetaAssetSyncService
{
    public function __construct(
        private readonly MetaCredentials $credentials,
        private readonly MetaGraphClient $graph,
    ) {}

    public function sync(Tenant $tenant, ?User $user = null): array
    {
        $user ??= $tenant->users()->orderBy('tenant_members.created_at')->first();
        if (! $user) {
            throw new MetaApiException('Tenant tidak memiliki user untuk menjadi pemilik koneksi Meta.');
        }

        $businessId = $this->credentials->businessId();
        $token = $this->credentials->systemUserToken();
        if ($businessId === '' || $token === '') {
            throw new MetaApiException('Meta Business ID dan System User Token wajib dikonfigurasi.');
        }

        $pages = $this->graph->getAll($businessId.'/owned_pages', $token, [
            'fields' => 'id,name,username,picture{url},instagram_business_account{id,username,profile_picture_url}',
            'limit' => 100,
        ]);
        $wabas = $this->graph->getAll($businessId.'/owned_whatsapp_business_accounts', $token, [
            'fields' => 'id,name,currency,timezone_id',
            'limit' => 100,
        ]);

        $phones = [];
        foreach ($wabas as $waba) {
            foreach ($this->graph->getAll($waba['id'].'/phone_numbers', $token, [
                'fields' => 'id,display_phone_number,verified_name,quality_rating',
                'limit' => 100,
            ]) as $phone) {
                $phones[] = $phone + ['waba_id' => $waba['id'], 'waba_name' => $waba['name'] ?? null];
            }
        }

        return DB::transaction(function () use ($tenant, $user, $token, $pages, $phones) {
            $facebook = 0;
            $instagram = 0;

            foreach ($pages as $page) {
                SocialAccount::updateOrCreate(
                    [
                        'tenant_id' => $tenant->id,
                        'provider' => 'facebook',
                        'provider_account_id' => (string) $page['id'],
                    ],
                    [
                        'user_id' => $user->id,
                        'platform_username' => $page['username'] ?? $page['name'] ?? null,
                        'platform_avatar' => data_get($page, 'picture.data.url'),
                        'access_token' => $token,
                        'provider_metadata' => ['page_name' => $page['name'] ?? null],
                        'is_active' => true,
                        'connected_at' => now(),
                    ],
                );
                $facebook++;

                $ig = $page['instagram_business_account'] ?? null;
                if (! empty($ig['id'])) {
                    SocialAccount::updateOrCreate(
                        [
                            'tenant_id' => $tenant->id,
                            'provider' => 'instagram',
                            'provider_account_id' => (string) $ig['id'],
                        ],
                        [
                            'user_id' => $user->id,
                            'platform_username' => $ig['username'] ?? null,
                            'platform_avatar' => $ig['profile_picture_url'] ?? null,
                            'access_token' => $token,
                            'provider_metadata' => [
                                'facebook_page_id' => (string) $page['id'],
                                'facebook_page_name' => $page['name'] ?? null,
                            ],
                            'is_active' => true,
                            'connected_at' => now(),
                        ],
                    );
                    $instagram++;
                }
            }

            foreach ($phones as $phone) {
                KaiDevice::updateOrCreate(
                    [
                        'tenant_id' => $tenant->id,
                        'provider_phone_number_id' => (string) $phone['id'],
                    ],
                    [
                        'user_id' => $user->id,
                        'waba_id' => (string) $phone['waba_id'],
                        'wa_number' => preg_replace('/\D+/', '', (string) ($phone['display_phone_number'] ?? '')),
                        'business_name' => $phone['verified_name'] ?? $phone['waba_name'] ?? $tenant->business_name,
                        'status' => 'connected',
                        'access_token' => $token,
                        'connected_at' => now(),
                    ],
                );
            }

            return [
                'tenant_id' => (string) $tenant->id,
                'facebook_accounts' => $facebook,
                'instagram_accounts' => $instagram,
                'whatsapp_numbers' => count($phones),
            ];
        });
    }
}
