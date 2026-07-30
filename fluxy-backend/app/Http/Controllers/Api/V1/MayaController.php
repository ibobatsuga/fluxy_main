<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\Content;
use App\Models\Post;
use App\Models\SocialAccount;
use App\Services\Meta\MetaPublisher;
use App\Services\UsageService;
use App\Support\ModulePresenter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class MayaController extends ApiController
{
    public function accounts(Request $request): JsonResponse
    {
        $accounts = SocialAccount::where('tenant_id', $this->tenantId($request))
            ->latest()->get()->map(fn ($account) => ModulePresenter::account($account));

        return $this->data($accounts);
    }

    public function health(Request $request): JsonResponse
    {
        $items = SocialAccount::where('tenant_id', $this->tenantId($request))->get()->map(fn ($account) => [
            'account_id' => (string) $account->id,
            'provider' => $account->provider,
            'status' => $account->is_active ? 'healthy' : 'disconnected',
            'token_expires_at' => $account->token_expires_at?->toISOString(),
        ]);

        return $this->data($items);
    }

    public function redirect(Request $request, string $provider): JsonResponse
    {
        abort_unless(in_array($provider, ['facebook', 'instagram', 'tiktok'], true), 404);
        abort_unless(app()->environment(['local', 'testing']), 503, 'Koneksi akun mandiri belum dikonfigurasi. Hubungi Admin Fluxy untuk sinkronisasi akun Meta.');
        $frontend = rtrim(config('app.frontend_url'), '/');

        return $this->data(['url' => $frontend.'/maya/connect?mock_connect='.$provider]);
    }

    public function confirm(Request $request): JsonResponse
    {
        abort_unless(app()->environment(['local', 'testing']), 404);
        $validated = $request->validate(['provider' => ['required', 'in:facebook,instagram,tiktok']]);
        $provider = $validated['provider'];
        $account = SocialAccount::firstOrCreate(
            [
                'tenant_id' => $this->tenantId($request),
                'provider' => $provider,
                'provider_account_id' => 'dev-'.$provider.'-'.$this->tenantId($request),
            ],
            [
                'user_id' => $request->user()->id,
                'platform_username' => Str::slug($request->user()->currentTenant->business_name, '_').'_'.$provider,
                'is_active' => true,
                'connected_at' => now(),
            ],
        );

        return $this->data(ModulePresenter::account($account), 201);
    }

    public function disconnect(Request $request, SocialAccount $account): JsonResponse
    {
        abort_unless($account->tenant_id === $this->tenantId($request), 404);
        $account->delete();

        return $this->message('Account disconnected.');
    }

    public function posts(Request $request): JsonResponse
    {
        $query = Post::where('tenant_id', $this->tenantId($request))->with('content')->latest();
        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }
        $limit = min(max($request->integer('per_page', 100), 1), 200);

        return $this->data($query->limit($limit)->get()->map(fn ($post) => ModulePresenter::post($post)));
    }

    public function createPost(Request $request, UsageService $usage, MetaPublisher $publisher): JsonResponse
    {
        $validated = $request->validate([
            'caption' => ['nullable', 'string', 'max:10000'],
            'hashtags' => ['nullable', 'string', 'max:3000'],
            'media_urls' => ['required', 'array', 'min:1', 'max:20'],
            'media_urls.*' => ['required', 'url'],
            'platforms' => ['required', 'array', 'min:1', 'max:10'],
            'platforms.*' => ['required', 'string'],
            'content_type' => ['nullable', 'in:story,feed,carousel,reel'],
            'schedule_type' => ['required', 'in:now,schedule'],
            'scheduled_at' => ['required_if:schedule_type,schedule', 'nullable', 'date'],
        ]);
        $this->validateAccounts($request, $validated['platforms']);
        $tenant = $request->user()->currentTenant;
        $idempotency = $request->header('Idempotency-Key') ?: (string) Str::ulid();
        $usage->record($tenant, 'maya', 'publish', 1, 'maya:'.$idempotency);

        $content = Content::create([
            'tenant_id' => $tenant->id, 'user_id' => $request->user()->id,
            'caption' => $validated['caption'] ?? null, 'hashtags' => $validated['hashtags'] ?? null,
            'media_urls' => $validated['media_urls'], 'content_type' => $validated['content_type'] ?? 'feed',
        ]);
        $isNow = $validated['schedule_type'] === 'now';
        $post = Post::create([
            'tenant_id' => $tenant->id, 'user_id' => $request->user()->id,
            'content_id' => $content->id, 'platform_account_ids' => $validated['platforms'],
            'scheduled_at' => $isNow ? now() : $validated['scheduled_at'],
            'actual_published_at' => null,
            'status' => $isNow ? 'processing' : 'scheduled',
            'provider_publication_id' => null,
        ]);
        if ($isNow) {
            $this->publish($post, $publisher);
        }

        return $this->data(ModulePresenter::post($post->fresh()), 201);
    }

    public function updatePost(Request $request, Post $post): JsonResponse
    {
        $this->authorizePost($request, $post);
        abort_if($post->status === 'completed', 409, 'Published posts cannot be edited.');
        $validated = $request->validate([
            'caption' => ['sometimes', 'nullable', 'string', 'max:10000'],
            'hashtags' => ['sometimes', 'nullable', 'string', 'max:3000'],
            'media_urls' => ['sometimes', 'array', 'min:1', 'max:20'], 'media_urls.*' => ['url'],
            'platforms' => ['sometimes', 'array', 'min:1', 'max:10'], 'platforms.*' => ['string'],
            'scheduled_at' => ['sometimes', 'date'],
        ]);
        if (isset($validated['platforms'])) {
            $this->validateAccounts($request, $validated['platforms']);
            $post->update(['platform_account_ids' => $validated['platforms']]);
        }
        $post->content->update(collect($validated)->only(['caption', 'hashtags', 'media_urls'])->all());
        if (isset($validated['scheduled_at'])) {
            $post->update(['scheduled_at' => $validated['scheduled_at']]);
        }

        return $this->data(ModulePresenter::post($post->fresh()));
    }

    public function deletePost(Request $request, Post $post): JsonResponse
    {
        $this->authorizePost($request, $post);
        abort_if($post->status === 'completed', 409, 'Published posts cannot be cancelled.');
        $post->delete();

        return $this->message('Post cancelled.');
    }

    public function retryPost(Request $request, Post $post, MetaPublisher $publisher): JsonResponse
    {
        $this->authorizePost($request, $post);
        abort_unless($post->status === 'failed', 409, 'Only failed posts can be retried.');
        $post->update(['status' => 'processing', 'error_message' => null]);
        $this->publish($post, $publisher);

        return $this->data(ModulePresenter::post($post->fresh()));
    }

    public function bulkStories(Request $request, UsageService $usage): JsonResponse
    {
        $validated = $request->validate([
            'content_items' => ['required', 'array', 'min:1', 'max:50'],
            'content_items.*.link' => ['required', 'url'],
            'content_items.*.time' => ['required', 'date_format:H:i'],
            'start_date' => ['required', 'date'], 'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'platforms' => ['required', 'array', 'min:1'], 'platforms.*' => ['string'],
            'is_carousel' => ['nullable', 'boolean'],
        ]);
        $this->validateAccounts($request, $validated['platforms']);
        $start = Carbon::parse($validated['start_date']);
        $end = Carbon::parse($validated['end_date']);
        abort_if($start->diffInDays($end) > 31, 422, 'Date range may not exceed 31 days.');
        $count = ((int) $start->diffInDays($end) + 1) * count($validated['content_items']);
        $usage->record($request->user()->currentTenant, 'maya', 'bulk_schedule', $count, 'maya-bulk:'.($request->header('Idempotency-Key') ?: Str::ulid()));

        for ($day = $start->copy(); $day->lte($end); $day->addDay()) {
            foreach ($validated['content_items'] as $item) {
                [$hour, $minute] = array_map('intval', explode(':', $item['time']));
                $content = Content::create([
                    'tenant_id' => $this->tenantId($request), 'user_id' => $request->user()->id,
                    'caption' => 'Story bulk', 'media_urls' => [$item['link']],
                    'content_type' => ($validated['is_carousel'] ?? false) ? 'carousel' : 'story',
                ]);
                Post::create([
                    'tenant_id' => $this->tenantId($request), 'user_id' => $request->user()->id,
                    'content_id' => $content->id, 'platform_account_ids' => $validated['platforms'],
                    'scheduled_at' => $day->copy()->setTime($hour, $minute), 'status' => 'scheduled',
                ]);
            }
        }

        return $this->data(['message' => 'Story berhasil dijadwalkan', 'count' => $count]);
    }

    public function slots(Request $request): JsonResponse
    {
        $taken = Post::where('tenant_id', $this->tenantId($request))->where('status', 'scheduled')
            ->whereNotNull('scheduled_at')->pluck('scheduled_at')->map->toISOString()->flip();
        $slots = collect(range(0, 6))->flatMap(fn ($day) => collect([9, 12, 15, 18, 21])->map(function ($hour) use ($day, $taken) {
            $slot = now()->addDays($day)->setTime($hour, 0)->toISOString();

            return ['slot' => $slot, 'taken' => $taken->has($slot)];
        }));

        return $this->data($slots->values());
    }

    public function nextSlot(): JsonResponse
    {
        return $this->data(['slot' => now()->addHours(2)->startOfHour()->toISOString()]);
    }

    private function validateAccounts(Request $request, array $ids): void
    {
        $count = SocialAccount::where('tenant_id', $this->tenantId($request))->whereIn('id', $ids)->count();
        abort_unless($count === count(array_unique($ids)), 422, 'One or more social accounts are invalid.');
    }

    private function authorizePost(Request $request, Post $post): void
    {
        abort_unless($post->tenant_id === $this->tenantId($request), 404);
    }

    private function publish(Post $post, MetaPublisher $publisher): void
    {
        try {
            $publicationIds = $publisher->publish($post);
            $post->update([
                'status' => 'completed',
                'actual_published_at' => now(),
                'provider_publication_id' => json_encode($publicationIds, JSON_THROW_ON_ERROR),
                'error_message' => null,
            ]);
        } catch (\Throwable $exception) {
            report($exception);
            $post->update([
                'status' => 'failed',
                'actual_published_at' => null,
                'error_message' => Str::limit($exception->getMessage(), 2000),
            ]);
        }
    }

    private function tenantId(Request $request): string
    {
        return (string) $request->user()->current_tenant_id;
    }
}
