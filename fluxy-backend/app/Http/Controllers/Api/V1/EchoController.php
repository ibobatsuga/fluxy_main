<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\ContentMetric;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class EchoController extends ApiController
{
    public function overview(Request $request): JsonResponse
    {
        $range = $this->validateRange($request);
        $query = ContentMetric::where('tenant_id', $request->user()->current_tenant_id)
            ->whereBetween('metric_date', [Carbon::parse($range['from'])->startOfDay(), Carbon::parse($range['to'])->endOfDay()]);
        if ($range['platform'] !== 'all') {
            $query->where('platform', $range['platform']);
        }
        $daily = $query->select([
            'metric_date',
            DB::raw('SUM(reach) as reach'), DB::raw('SUM(likes + comments + shares) as engagement'),
            DB::raw('SUM(likes) as likes'), DB::raw('SUM(comments) as comments'),
            DB::raw('SUM(shares) as shares'), DB::raw('SUM(views) as views'),
            DB::raw('MAX(followers_count) as followers_count'),
        ])->groupBy('metric_date')->orderBy('metric_date')->get();

        $reach = (int) $daily->sum('reach');
        $engagement = (int) $daily->sum('engagement');

        return $this->data([
            'overview' => [
                'total_reach' => $reach,
                'total_engagement' => $engagement,
                'followers_count' => (int) ($daily->last()?->followers_count ?? 0),
                'followers_growth' => 0,
                'engagement_rate' => $reach > 0 ? round(($engagement / $reach) * 100, 1) : 0,
            ],
            'daily' => $daily->map(fn ($item) => [
                'date' => $item->metric_date->toDateString(),
                'reach' => (int) $item->reach, 'engagement' => (int) $item->engagement,
                'likes' => (int) $item->likes, 'comments' => (int) $item->comments,
                'shares' => (int) $item->shares, 'views' => (int) $item->views,
            ]),
        ]);
    }

    public function contents(Request $request): JsonResponse
    {
        $range = $this->validateRange($request);
        $query = ContentMetric::query()
            ->where('content_metrics.tenant_id', $request->user()->current_tenant_id)
            ->whereBetween('metric_date', [Carbon::parse($range['from'])->startOfDay(), Carbon::parse($range['to'])->endOfDay()])
            ->join('posts', 'posts.id', '=', 'content_metrics.post_id')
            ->join('contents', 'contents.id', '=', 'posts.content_id');
        if ($range['platform'] !== 'all') {
            $query->where('content_metrics.platform', $range['platform']);
        }
        $items = $query->select([
            'posts.id', 'contents.caption', 'content_metrics.platform', 'posts.actual_published_at',
            DB::raw('SUM(content_metrics.reach) as reach'), DB::raw('SUM(content_metrics.likes) as likes'),
            DB::raw('SUM(content_metrics.comments) as comments'), DB::raw('SUM(content_metrics.shares) as shares'),
            DB::raw('SUM(content_metrics.views) as views'),
        ])->groupBy('posts.id', 'contents.caption', 'content_metrics.platform', 'posts.actual_published_at')
            ->orderByDesc('reach')->get();

        return $this->data($items->map(fn ($item) => [
            'id' => (string) $item->id, 'caption' => $item->caption, 'platform' => $item->platform,
            'thumbnail_url' => null, 'published_at' => $item->actual_published_at,
            'reach' => (int) $item->reach, 'likes' => (int) $item->likes,
            'comments' => (int) $item->comments, 'shares' => (int) $item->shares, 'views' => (int) $item->views,
        ]));
    }

    public function export(Request $request): JsonResponse
    {
        $validated = $request->validate(['format' => ['required', 'in:pdf,xlsx']]);

        return $this->data([
            'file_name' => 'echo-report-'.now()->format('Ymd-His').'.'.$validated['format'],
            'url' => null,
        ]);
    }

    private function validateRange(Request $request): array
    {
        return $request->validate([
            'platform' => ['nullable', 'in:instagram,tiktok,all'],
            'from' => ['nullable', 'date'], 'to' => ['nullable', 'date', 'after_or_equal:from'],
        ]) + [
            'platform' => 'all', 'from' => now()->subDays(29)->toDateString(), 'to' => now()->toDateString(),
        ];
    }
}
