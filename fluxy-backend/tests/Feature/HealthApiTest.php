<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class HealthApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_health_endpoint_reports_core_dependencies_without_exposing_secrets(): void
    {
        Cache::put('health:scheduler:last_run', now()->toISOString());
        Cache::forget('health:integrations:v1');
        config([
            'services.pixel.provider' => 'gemini',
            'services.pixel.gemini.api_key' => 'gemini-test-key',
            'services.meta.business_id' => 'business-123',
            'services.meta.system_user_token' => 'meta-test-token',
        ]);
        Http::fake([
            'generativelanguage.googleapis.com/*' => Http::response(['models' => []]),
            'graph.facebook.com/*' => Http::response(['id' => 'business-123']),
        ]);

        $response = $this->getJson('/api/v1/health')
            ->assertOk()
            ->assertHeader('X-Content-Type-Options', 'nosniff')
            ->assertHeader('X-Frame-Options', 'SAMEORIGIN')
            ->assertHeader('Content-Security-Policy')
            ->assertJsonPath('status', 'ok')
            ->assertJsonPath('checks.database.status', 'ok')
            ->assertJsonPath('checks.scheduler.status', 'ok')
            ->assertJsonPath('integrations.pixel.status', 'ok')
            ->assertJsonPath('integrations.meta.status', 'ok');

        $payload = $response->getContent();
        $this->assertStringNotContainsString('api_key', $payload);
        $this->assertStringNotContainsString('access_token', $payload);

        $this->getJson('/api/v1/health')->assertOk();
        Http::assertSentCount(2);
    }

    public function test_health_endpoint_fails_readiness_when_required_integrations_are_rejected(): void
    {
        Cache::put('health:scheduler:last_run', now()->toISOString());
        Cache::forget('health:integrations:v1');
        config([
            'services.pixel.provider' => 'gemini',
            'services.pixel.gemini.api_key' => 'rejected-gemini-key',
            'services.meta.business_id' => 'business-123',
            'services.meta.system_user_token' => 'rejected-meta-token',
        ]);
        Http::fake([
            'generativelanguage.googleapis.com/*' => Http::response(['error' => []], 401),
            'graph.facebook.com/*' => Http::response(['error' => []], 401),
        ]);

        $this->getJson('/api/v1/health')
            ->assertServiceUnavailable()
            ->assertJsonPath('status', 'degraded')
            ->assertJsonPath('integrations.pixel.status', 'failed')
            ->assertJsonPath('integrations.meta.status', 'failed');
    }

    public function test_cors_does_not_authorize_an_untrusted_origin(): void
    {
        config([
            'cors.allowed_origins' => ['https://app.fluxy.id'],
            'cors.supports_credentials' => true,
        ]);

        $this->call('OPTIONS', '/api/v1/auth/login', [], [], [], [
            'HTTP_ORIGIN' => 'https://evil.example',
            'HTTP_ACCESS_CONTROL_REQUEST_METHOD' => 'POST',
        ])->assertHeaderMissing('Access-Control-Allow-Origin');

        $this->call('OPTIONS', '/api/v1/auth/login', [], [], [], [
            'HTTP_ORIGIN' => 'https://app.fluxy.id',
            'HTTP_ACCESS_CONTROL_REQUEST_METHOD' => 'POST',
        ])->assertHeader('Access-Control-Allow-Origin', 'https://app.fluxy.id');
    }
}
