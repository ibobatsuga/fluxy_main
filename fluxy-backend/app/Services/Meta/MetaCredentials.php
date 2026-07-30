<?php

namespace App\Services\Meta;

use App\Models\PlatformCredential;

class MetaCredentials
{
    public function appId(): string
    {
        return $this->value('meta_app_id', 'app_id');
    }

    public function appSecret(): string
    {
        return $this->value('meta_app_secret', 'app_secret');
    }

    public function businessId(): string
    {
        return $this->value('meta_business_id', 'business_id');
    }

    public function systemUserToken(): string
    {
        return $this->value('meta_system_user_token', 'system_user_token');
    }

    public function webhookVerifyToken(): string
    {
        return $this->value('meta_webhook_verify_token', 'webhook_verify_token');
    }

    private function value(string $databaseKey, string $configKey): string
    {
        $stored = PlatformCredential::query()->where('key', $databaseKey)->first();

        return trim((string) ($stored?->value ?: config('services.meta.'.$configKey, '')));
    }
}
