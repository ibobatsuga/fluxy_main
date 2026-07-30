<?php

namespace App\Services\Meta;

use App\Exceptions\MetaApiException;
use App\Models\Post;
use App\Models\SocialAccount;
use Illuminate\Support\Str;

class MetaPublisher
{
    public function __construct(private readonly MetaGraphClient $graph) {}

    public function publish(Post $post): array
    {
        $post->loadMissing('content');
        $accounts = SocialAccount::query()
            ->where('tenant_id', $post->tenant_id)
            ->whereIn('id', $post->platform_account_ids)
            ->get()
            ->keyBy(fn (SocialAccount $account) => (string) $account->id);
        $results = [];

        foreach ($post->platform_account_ids as $accountId) {
            /** @var SocialAccount|null $account */
            $account = $accounts->get((string) $accountId);
            if (! $account || ! $account->is_active) {
                throw new MetaApiException('Akun tujuan publikasi tidak aktif atau tidak ditemukan.');
            }

            if (! in_array($account->provider, ['facebook', 'instagram'], true) || ! $account->access_token) {
                $results[$account->provider] = 'dev-'.Str::ulid();

                continue;
            }

            $results[$account->provider] = match ($account->provider) {
                'instagram' => $this->publishInstagram($account, $post),
                'facebook' => $this->publishFacebook($account, $post),
            };
        }

        return $results;
    }

    private function publishInstagram(SocialAccount $account, Post $post): string
    {
        $media = array_values($post->content->media_urls ?? []);
        $type = $post->content->content_type ?: 'feed';
        $caption = $this->caption($post);

        if ($type === 'carousel' || count($media) > 1) {
            $children = [];
            foreach ($media as $url) {
                $children[] = $this->graph->post($account->provider_account_id.'/media', $account->access_token, [
                    'image_url' => $url,
                    'is_carousel_item' => 'true',
                ])['id'] ?? throw new MetaApiException('Meta tidak mengembalikan ID media carousel Instagram.');
            }
            $container = $this->graph->post($account->provider_account_id.'/media', $account->access_token, [
                'media_type' => 'CAROUSEL',
                'children' => implode(',', $children),
                'caption' => $caption,
            ]);
        } elseif ($type === 'story') {
            $this->requireOneMedia($media, 'Instagram Story');
            $container = $this->graph->post($account->provider_account_id.'/media', $account->access_token, [
                'image_url' => $media[0],
                'media_type' => 'STORIES',
            ]);
        } elseif ($type === 'reel') {
            $this->requireOneMedia($media, 'Instagram Reel');
            $container = $this->graph->post($account->provider_account_id.'/media', $account->access_token, [
                'video_url' => $media[0],
                'media_type' => 'REELS',
                'caption' => $caption,
            ]);
        } else {
            $this->requireOneMedia($media, 'Instagram Feed');
            $container = $this->graph->post($account->provider_account_id.'/media', $account->access_token, [
                'image_url' => $media[0],
                'caption' => $caption,
            ]);
        }

        $containerId = $container['id'] ?? null;
        if (! is_string($containerId) || $containerId === '') {
            throw new MetaApiException('Meta tidak mengembalikan ID container Instagram.');
        }
        if ($type === 'reel') {
            $this->waitForContainer($containerId, $account->access_token);
        }

        $published = $this->graph->post($account->provider_account_id.'/media_publish', $account->access_token, [
            'creation_id' => $containerId,
        ]);

        return (string) ($published['id'] ?? throw new MetaApiException('Meta tidak mengembalikan ID publikasi Instagram.'));
    }

    private function publishFacebook(SocialAccount $account, Post $post): string
    {
        $media = array_values($post->content->media_urls ?? []);
        $type = $post->content->content_type ?: 'feed';
        if (in_array($type, ['story', 'reel'], true)) {
            throw new MetaApiException('Fluxy saat ini mendukung publikasi Facebook Page untuk feed dan carousel gambar.');
        }

        if (count($media) === 1) {
            $published = $this->graph->post($account->provider_account_id.'/photos', $account->access_token, [
                'url' => $media[0],
                'caption' => $this->caption($post),
                'published' => 'true',
            ]);

            return (string) ($published['post_id'] ?? $published['id'] ?? throw new MetaApiException('Meta tidak mengembalikan ID post Facebook.'));
        }

        $attached = [];
        foreach ($media as $url) {
            $photo = $this->graph->post($account->provider_account_id.'/photos', $account->access_token, [
                'url' => $url,
                'published' => 'false',
            ]);
            $photoId = $photo['id'] ?? null;
            if (! is_string($photoId) || $photoId === '') {
                throw new MetaApiException('Meta tidak mengembalikan ID foto Facebook.');
            }
            $attached[] = ['media_fbid' => $photoId];
        }
        $published = $this->graph->post($account->provider_account_id.'/feed', $account->access_token, [
            'message' => $this->caption($post),
            'attached_media' => json_encode($attached, JSON_THROW_ON_ERROR),
        ]);

        return (string) ($published['id'] ?? throw new MetaApiException('Meta tidak mengembalikan ID post Facebook.'));
    }

    private function caption(Post $post): string
    {
        return trim(implode("\n\n", array_filter([
            $post->content->caption,
            $post->content->hashtags,
        ])));
    }

    private function requireOneMedia(array $media, string $label): void
    {
        if (count($media) !== 1) {
            throw new MetaApiException("{$label} membutuhkan tepat satu media.");
        }
    }

    private function waitForContainer(string $containerId, string $accessToken): void
    {
        $attempts = max(1, (int) config('services.meta.publish_status_attempts', 10));
        $delayMicroseconds = max(0, (int) config('services.meta.publish_status_delay_ms', 1000)) * 1000;

        for ($attempt = 0; $attempt < $attempts; $attempt++) {
            $status = $this->graph->get($containerId, $accessToken, ['fields' => 'status_code,status']);
            $statusCode = strtoupper((string) ($status['status_code'] ?? ''));
            if ($statusCode === 'FINISHED') {
                return;
            }
            if (in_array($statusCode, ['ERROR', 'EXPIRED'], true)) {
                throw new MetaApiException((string) ($status['status'] ?? 'Pemrosesan media Instagram gagal.'));
            }
            if ($attempt + 1 < $attempts && $delayMicroseconds > 0) {
                usleep($delayMicroseconds);
            }
        }

        throw new MetaApiException('Media Instagram belum selesai diproses. Coba publikasi ulang beberapa saat lagi.');
    }
}
