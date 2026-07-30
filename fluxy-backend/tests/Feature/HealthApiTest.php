<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class HealthApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_health_endpoint_reports_core_dependencies_without_exposing_secrets(): void
    {
        Cache::put('health:scheduler:last_run', now()->toISOString());

        $response = $this->getJson('/api/v1/health')
            ->assertOk()
            ->assertHeader('X-Content-Type-Options', 'nosniff')
            ->assertHeader('X-Frame-Options', 'SAMEORIGIN')
            ->assertJsonPath('status', 'ok')
            ->assertJsonPath('checks.database.status', 'ok')
            ->assertJsonPath('checks.scheduler.status', 'ok');

        $payload = $response->getContent();
        $this->assertStringNotContainsString('api_key', $payload);
        $this->assertStringNotContainsString('access_token', $payload);
    }
}
