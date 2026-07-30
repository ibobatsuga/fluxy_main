<?php

use App\Models\KaiBroadcast;
use App\Models\Post;
use App\Services\Meta\MetaPublisher;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use Illuminate\Support\Str;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::call(function () {
    Post::where('status', 'scheduled')
        ->where('scheduled_at', '<=', now())
        ->chunkById(100, function ($posts) {
            foreach ($posts as $post) {
                $post->update(['status' => 'processing', 'error_message' => null]);
                try {
                    $ids = app(MetaPublisher::class)->publish($post);
                    $post->update([
                        'status' => 'completed',
                        'actual_published_at' => now(),
                        'provider_publication_id' => json_encode($ids, JSON_THROW_ON_ERROR),
                    ]);
                } catch (Throwable $exception) {
                    report($exception);
                    $post->update([
                        'status' => 'failed',
                        'error_message' => Str::limit($exception->getMessage(), 2000),
                    ]);
                }
            }
        });

    KaiBroadcast::where('status', 'scheduled')
        ->where('scheduled_at', '<=', now())
        ->chunkById(100, fn ($items) => $items->each->update(['status' => 'sent', 'sent_at' => now()]));
})->name('publish-due-content')->everyMinute()->withoutOverlapping();
