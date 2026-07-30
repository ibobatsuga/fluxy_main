<?php

namespace App\Support;

use App\Models\KaiDevice;
use App\Models\MediaAsset;
use App\Models\Post;
use App\Models\SocialAccount;

class ModulePresenter
{
    public static function account(SocialAccount $account): array
    {
        return [
            'id' => (string) $account->id,
            'user_id' => (string) $account->user_id,
            'provider' => $account->provider,
            'provider_account_id' => $account->provider_account_id,
            'zernio_account_id' => $account->provider_account_id,
            'platform_username' => $account->platform_username,
            'platform_avatar' => $account->platform_avatar,
            'provider_metadata' => $account->provider_metadata,
            'is_active' => $account->is_active,
            'connected_at' => $account->connected_at?->toISOString(),
            'created_at' => $account->created_at->toISOString(),
            'updated_at' => $account->updated_at->toISOString(),
        ];
    }

    public static function media(MediaAsset $asset): array
    {
        return [
            'id' => (string) $asset->id,
            'user_id' => (string) $asset->user_id,
            'type' => $asset->type,
            'path' => $asset->path,
            'url' => $asset->url,
            'created_at' => $asset->created_at->toISOString(),
            'updated_at' => $asset->updated_at->toISOString(),
        ];
    }

    public static function post(Post $post): array
    {
        $post->loadMissing('content');
        $accounts = SocialAccount::whereIn('id', $post->platform_account_ids)->get()->keyBy('id');

        return [
            'id' => (string) $post->id,
            'user_id' => (string) $post->user_id,
            'content_id' => (string) $post->content_id,
            'content' => $post->content,
            'scheduled_at' => $post->scheduled_at?->toISOString(),
            'actual_published_at' => $post->actual_published_at?->toISOString(),
            'status' => $post->status,
            'provider_publication_id' => $post->provider_publication_id,
            'zernio_post_id' => $post->provider_publication_id,
            'platforms' => collect($post->platform_account_ids)->map(function ($accountId) use ($post, $accounts) {
                $account = $accounts[$accountId] ?? null;

                return [
                    'id' => $post->id.'-'.$accountId,
                    'schedule_id' => (string) $post->id,
                    'social_account_id' => (string) $accountId,
                    'social_account' => $account ? self::account($account) : null,
                    'status' => $post->status === 'completed' ? 'published' : ($post->status === 'failed' ? 'failed' : 'pending'),
                    'published_at' => $post->actual_published_at?->toISOString(),
                    'error_message' => $post->error_message,
                ];
            })->values(),
            'created_at' => $post->created_at->toISOString(),
            'updated_at' => $post->updated_at->toISOString(),
        ];
    }

    public static function kaiDevice(?KaiDevice $device): ?array
    {
        if (! $device) {
            return null;
        }

        return [
            'id' => (string) $device->id,
            'user_id' => (string) $device->user_id,
            'connection_type' => $device->connection_type ?? 'cloud_api',
            'session_id' => $device->session_id,
            'qr_code' => $device->qr_code,
            'qr_expires_at' => $device->qr_expires_at?->toISOString(),
            'provider_phone_number_id' => $device->provider_phone_number_id,
            'waba_id' => $device->waba_id,
            'ping_device_id' => $device->provider_phone_number_id,
            'wa_number' => $device->wa_number,
            'business_name' => $device->business_name,
            'status' => $device->status,
            'connected_at' => $device->connected_at?->toISOString(),
            'created_at' => $device->created_at->toISOString(),
            'updated_at' => $device->updated_at->toISOString(),
        ];
    }
}
