<?php

use App\Http\Controllers\Api\V1\AdminController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\EchoController;
use App\Http\Controllers\Api\V1\HealthController;
use App\Http\Controllers\Api\V1\KaiAdminController;
use App\Http\Controllers\Api\V1\KaiController;
use App\Http\Controllers\Api\V1\MayaController;
use App\Http\Controllers\Api\V1\MetaAdminController;
use App\Http\Controllers\Api\V1\MetaWebhookController;
use App\Http\Controllers\Api\V1\MotionController;
use App\Http\Controllers\Api\V1\NotificationController;
use App\Http\Controllers\Api\V1\PixelController;
use App\Http\Controllers\Api\V1\SettingsController;
use App\Http\Controllers\Api\V1\UsageController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::get('health', HealthController::class)->middleware('throttle:60,1');
    Route::get('meta/webhook', [MetaWebhookController::class, 'verify'])->middleware('throttle:60,1');
    Route::post('meta/webhook', [MetaWebhookController::class, 'receive'])->middleware('throttle:300,1');
    Route::post('kai/gateway/webhook', [KaiController::class, 'gatewayWebhook'])->middleware('throttle:300,1');

    Route::prefix('auth')->group(function () {
        Route::post('register', [AuthController::class, 'register'])->middleware('throttle:10,1');
        Route::post('login', [AuthController::class, 'login'])->middleware('throttle:10,1')->name('login');
        Route::get('google/redirect', [AuthController::class, 'googleRedirect']);
        Route::get('google/callback', [AuthController::class, 'googleCallback']);

        Route::middleware('auth:sanctum')->group(function () {
            Route::get('me', [AuthController::class, 'me']);
            Route::post('logout', [AuthController::class, 'logout']);
            Route::post('password', [AuthController::class, 'setPassword']);
        });
    });

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('settings', [SettingsController::class, 'show']);
        Route::put('settings', [SettingsController::class, 'update']);

        Route::get('notifications', [NotificationController::class, 'index']);
        Route::post('notifications/read-all', [NotificationController::class, 'readAll']);
        Route::post('notifications/{notification}/read', [NotificationController::class, 'read']);

        Route::middleware('approved')->group(function () {
            Route::get('usage/summary', UsageController::class);

            Route::get('ai/features', [PixelController::class, 'features']);
            Route::post('ai/generate-image', [PixelController::class, 'generate'])->middleware(['subscribed', 'throttle:10,1']);
            Route::post('ai/generate-caption', [PixelController::class, 'caption'])->middleware(['subscribed', 'throttle:30,1']);
            Route::get('media', [PixelController::class, 'media']);
            Route::post('media/upload', [PixelController::class, 'upload'])->middleware('subscribed');
            Route::delete('media/{media}', [PixelController::class, 'deleteMedia'])->middleware('subscribed');
            Route::get('contents', [PixelController::class, 'contents']);
            Route::post('contents', [PixelController::class, 'createContent'])->middleware('subscribed');
            Route::delete('contents/{content}', [PixelController::class, 'deleteContent'])->middleware('subscribed');

            Route::post('motion/generate-prompt', [MotionController::class, 'generate'])->middleware(['subscribed', 'throttle:10,1']);

            Route::get('accounts', [MayaController::class, 'accounts']);
            Route::get('accounts/health', [MayaController::class, 'health']);
            Route::get('accounts/connect/{provider}/redirect', [MayaController::class, 'redirect'])->middleware('subscribed');
            Route::post('accounts/connect/confirm', [MayaController::class, 'confirm'])->middleware('subscribed');
            Route::delete('accounts/{account}', [MayaController::class, 'disconnect'])->middleware('subscribed');
            Route::get('posts', [MayaController::class, 'posts']);
            Route::post('posts', [MayaController::class, 'createPost'])->middleware('subscribed');
            Route::put('posts/{post}', [MayaController::class, 'updatePost'])->middleware('subscribed');
            Route::delete('posts/{post}', [MayaController::class, 'deletePost'])->middleware('subscribed');
            Route::post('posts/{post}/retry', [MayaController::class, 'retryPost'])->middleware('subscribed');
            Route::post('story-bulk-schedule', [MayaController::class, 'bulkStories'])->middleware('subscribed');
            Route::get('queue/slots', [MayaController::class, 'slots']);
            Route::get('queue/next-slot', [MayaController::class, 'nextSlot']);

            Route::get('analytics', [EchoController::class, 'overview']);
            Route::get('analytics/contents', [EchoController::class, 'contents']);
            Route::post('analytics/export', [EchoController::class, 'export'])->middleware('subscribed');

            Route::get('kai/device/status', [KaiController::class, 'device']);
            Route::post('kai/device/request', [KaiController::class, 'requestDevice'])->middleware('subscribed');
            Route::post('kai/device/qr/generate', [KaiController::class, 'generateQr'])->middleware('subscribed');
            Route::get('kai/device/qr/status', [KaiController::class, 'qrStatus']);
            Route::post('kai/device/qr/simulate-scan', [KaiController::class, 'simulateScan'])->middleware('subscribed');
            Route::post('kai/device/disconnect', [KaiController::class, 'disconnectDevice'])->middleware('subscribed');
            Route::get('kai/groups', [KaiController::class, 'groups']);
            Route::post('kai/groups', [KaiController::class, 'createGroup'])->middleware('subscribed');
            Route::delete('kai/groups/{group}', [KaiController::class, 'deleteGroup'])->middleware('subscribed');
            Route::get('kai/broadcast', [KaiController::class, 'broadcasts']);
            Route::post('kai/broadcast', [KaiController::class, 'createBroadcast'])->middleware('subscribed');
            Route::delete('kai/broadcast/{broadcast}', [KaiController::class, 'cancelBroadcast'])->middleware('subscribed');
            Route::post('kai/broadcast/{broadcast}/retry', [KaiController::class, 'retryBroadcast'])->middleware('subscribed');
            Route::get('kai/chatbot/settings', [KaiController::class, 'settings']);
            Route::put('kai/chatbot/settings', [KaiController::class, 'updateSettings'])->middleware('subscribed');
            Route::post('kai/chatbot/csv-sync', [KaiController::class, 'syncCsv'])->middleware('subscribed');
            Route::get('kai/chatbot/conversations', [KaiController::class, 'conversations']);
            Route::post('kai/chatbot/conversations/{conversation}/resume', [KaiController::class, 'resume'])->middleware('subscribed');
            Route::post('kai/chatbot/conversations/{conversation}/messages', [KaiController::class, 'sendMessage'])->middleware('subscribed');
            Route::get('kai/logs', [KaiController::class, 'logs']);
        });

        Route::prefix('admin')->middleware('admin')->group(function () {
            Route::get('users/pending', [AdminController::class, 'pendingUsers']);
            Route::get('users', [AdminController::class, 'tenants']);
            Route::get('users/{user}/usage', [AdminController::class, 'tenantUsage']);
            Route::get('users/{user}', [AdminController::class, 'tenant']);
            Route::post('users/{user}/approve', [AdminController::class, 'approve']);
            Route::post('users/{user}/reject', [AdminController::class, 'reject']);
            Route::post('users/{user}/suspend', [AdminController::class, 'suspend']);
            Route::post('users/{user}/reactivate', [AdminController::class, 'reactivate']);
            Route::get('usage/aggregate', [AdminController::class, 'aggregateUsage']);
            Route::get('activity-logs', [AdminController::class, 'activityLogs']);
            Route::get('kai/requests', [KaiAdminController::class, 'pending']);
            Route::post('kai/{device}/activate', [KaiAdminController::class, 'activate']);
            Route::post('kai/{device}/reject', [KaiAdminController::class, 'reject']);
            Route::get('config/limits', [AdminController::class, 'limits']);
            Route::put('config/limits', [AdminController::class, 'updateLimits']);
            Route::get('config/credentials', [AdminController::class, 'credentials']);
            Route::put('config/credentials', [AdminController::class, 'updateCredentials']);
            Route::post('meta/sync', [MetaAdminController::class, 'sync'])->middleware('throttle:10,1');
        });
    });
});
