<?php

return [

    'meta' => [
        'graph_url' => env('META_GRAPH_URL', 'https://graph.facebook.com'),
        'graph_version' => env('META_GRAPH_VERSION', 'v24.0'),
        'app_id' => env('META_APP_ID', ''),
        'app_secret' => env('META_APP_SECRET', ''),
        'business_id' => env('META_BUSINESS_ID', ''),
        'system_user_token' => env('META_SYSTEM_USER_TOKEN', ''),
        'webhook_verify_token' => env('META_WEBHOOK_VERIFY_TOKEN', ''),
        'timeout' => (int) env('META_HTTP_TIMEOUT', 30),
        'publish_status_attempts' => (int) env('META_PUBLISH_STATUS_ATTEMPTS', 10),
        'publish_status_delay_ms' => (int) env('META_PUBLISH_STATUS_DELAY_MS', 1000),
    ],

    'pixel' => [
        'provider' => env('PIXEL_IMAGE_PROVIDER', 'gemini'),
        'gemini' => [
            'api_key' => env('GEMINI_API_KEY', ''),
            'model' => env('GEMINI_MODEL', 'gemini-3.1-flash-image'),
            'text_model' => env('GEMINI_TEXT_MODEL', 'gemini-2.5-flash'),
        ],
        'cloudflare' => [
            'account_id' => env('CLOUDFLARE_ACCOUNT_ID', ''),
            'token' => env('CLOUDFLARE_AI_TOKEN', ''),
            'model' => env('CLOUDFLARE_IMAGE_MODEL', '@cf/black-forest-labs/flux-1-schnell'),
            'steps' => (int) env('CLOUDFLARE_IMAGE_STEPS', 4),
            'timeout' => (int) env('CLOUDFLARE_AI_TIMEOUT', 90),
        ],
    ],

    'kai' => [
        'qr_gateway_enabled' => filter_var(env('KAI_QR_GATEWAY_ENABLED', false), FILTER_VALIDATE_BOOL),
        'gateway_webhook_secret' => env('KAI_GATEWAY_WEBHOOK_SECRET', ''),
    ],

    'google' => [
        'client_id' => env('GOOGLE_CLIENT_ID'),
        'client_secret' => env('GOOGLE_CLIENT_SECRET'),
        'redirect' => env('GOOGLE_REDIRECT_URI', env('APP_URL').'/api/v1/auth/google/callback'),
    ],

    'health' => [
        'integration_probe_ttl' => (int) env('INTEGRATION_HEALTH_TTL', 300),
    ],

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

];
