<?php

namespace App\Providers;

use App\Contracts\ImageProvider;
use App\Models\PlatformCredential;
use App\Services\Images\CloudflareImageProvider;
use App\Services\Images\FakeImageProvider;
use App\Services\Images\GeminiImageProvider;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Support\ServiceProvider;
use InvalidArgumentException;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(ImageProvider::class, function (Application $app): ImageProvider {
            $storedImageKey = PlatformCredential::query()->where('key', 'ai_image_api_key')->first()?->value;

            return match (config('services.pixel.provider')) {
                'fake' => new FakeImageProvider,
                'gemini' => new GeminiImageProvider(
                    apiKey: (string) ($storedImageKey ?: config('services.pixel.gemini.api_key')),
                    model: (string) config('services.pixel.gemini.model', 'gemini-3.1-flash-image'),
                ),
                'cloudflare' => new CloudflareImageProvider(
                    accountId: (string) config('services.pixel.cloudflare.account_id'),
                    token: (string) config('services.pixel.cloudflare.token'),
                    model: (string) config('services.pixel.cloudflare.model'),
                    steps: (int) config('services.pixel.cloudflare.steps'),
                    timeout: (int) config('services.pixel.cloudflare.timeout'),
                ),
                default => throw new InvalidArgumentException('Unsupported Pixel image provider.'),
            };
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
