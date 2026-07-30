<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('social_accounts', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignUlid('user_id')->constrained()->cascadeOnDelete();
            $table->string('provider')->index();
            $table->string('provider_account_id');
            $table->string('platform_username')->nullable();
            $table->string('platform_avatar')->nullable();
            $table->text('access_token')->nullable();
            $table->text('refresh_token')->nullable();
            $table->timestampTz('token_expires_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestampTz('connected_at')->nullable();
            $table->timestamps();
            $table->unique(['tenant_id', 'provider', 'provider_account_id']);
        });

        Schema::create('media_assets', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignUlid('user_id')->constrained()->cascadeOnDelete();
            $table->string('type');
            $table->string('disk')->default('public');
            $table->string('path');
            $table->string('mime_type')->nullable();
            $table->unsignedBigInteger('size')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->index(['tenant_id', 'created_at']);
        });

        Schema::create('image_generations', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignUlid('user_id')->constrained()->cascadeOnDelete();
            $table->foreignUlid('input_media_id')->nullable()->references('id')->on('media_assets')->nullOnDelete();
            $table->foreignUlid('output_media_id')->nullable()->references('id')->on('media_assets')->nullOnDelete();
            $table->string('provider')->default('fake');
            $table->string('content_type');
            $table->text('prompt')->nullable();
            $table->string('status')->default('queued')->index();
            $table->text('error_message')->nullable();
            $table->string('idempotency_key')->nullable();
            $table->timestamps();
            $table->unique(['tenant_id', 'idempotency_key']);
        });

        Schema::create('contents', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignUlid('user_id')->constrained()->cascadeOnDelete();
            $table->text('caption')->nullable();
            $table->text('hashtags')->nullable();
            $table->json('media_urls')->nullable();
            $table->string('content_type')->nullable();
            $table->timestamps();
        });

        Schema::create('posts', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignUlid('user_id')->constrained()->cascadeOnDelete();
            $table->foreignUlid('content_id')->constrained('contents')->cascadeOnDelete();
            $table->json('platform_account_ids');
            $table->timestampTz('scheduled_at')->nullable();
            $table->timestampTz('actual_published_at')->nullable();
            $table->string('status')->default('draft')->index();
            $table->string('provider_publication_id')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamps();
            $table->index(['tenant_id', 'scheduled_at']);
        });

        Schema::create('content_metrics', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignUlid('post_id')->nullable()->constrained()->nullOnDelete();
            $table->string('platform');
            $table->date('metric_date')->index();
            $table->unsignedBigInteger('reach')->default(0);
            $table->unsignedBigInteger('likes')->default(0);
            $table->unsignedBigInteger('comments')->default(0);
            $table->unsignedBigInteger('shares')->default(0);
            $table->unsignedBigInteger('views')->default(0);
            $table->unsignedBigInteger('followers_count')->default(0);
            $table->timestamps();
            $table->unique(['tenant_id', 'post_id', 'platform', 'metric_date']);
        });

        Schema::create('kai_devices', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignUlid('user_id')->constrained()->cascadeOnDelete();
            $table->string('provider_phone_number_id')->nullable();
            $table->string('wa_number')->nullable();
            $table->string('business_name')->nullable();
            $table->string('status')->default('pending')->index();
            $table->text('access_token')->nullable();
            $table->timestampTz('connected_at')->nullable();
            $table->timestamps();
        });

        Schema::create('kai_groups', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignUlid('user_id')->constrained()->cascadeOnDelete();
            $table->string('alias');
            $table->string('wa_group_id');
            $table->timestamps();
            $table->unique(['tenant_id', 'wa_group_id']);
        });

        Schema::create('kai_broadcasts', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignUlid('user_id')->constrained()->cascadeOnDelete();
            $table->json('group_ids');
            $table->text('message');
            $table->string('image_url')->nullable();
            $table->string('template_id')->nullable();
            $table->timestampTz('scheduled_at')->nullable();
            $table->timestampTz('sent_at')->nullable();
            $table->string('status')->default('draft')->index();
            $table->text('error_message')->nullable();
            $table->timestamps();
        });

        Schema::create('kai_chatbot_settings', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('tenant_id')->unique()->constrained()->cascadeOnDelete();
            $table->foreignUlid('user_id')->constrained()->cascadeOnDelete();
            $table->boolean('is_active')->default(false);
            $table->text('greeting_msg')->nullable();
            $table->json('payment_keywords')->nullable();
            $table->string('admin_wa_number')->nullable();
            $table->text('handoff_notify_msg')->nullable();
            $table->json('resume_keywords')->nullable();
            $table->text('resume_msg')->nullable();
            $table->unsignedInteger('auto_sync_interval')->nullable();
            $table->string('csv_url')->nullable();
            $table->timestampTz('csv_last_synced')->nullable();
            $table->string('csv_sync_status')->default('idle');
            $table->timestamps();
        });

        Schema::create('kai_conversations', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignUlid('user_id')->constrained()->cascadeOnDelete();
            $table->string('wa_contact');
            $table->string('contact_name')->nullable();
            $table->string('state')->default('bot_active')->index();
            $table->text('last_message')->nullable();
            $table->timestampTz('last_message_at')->nullable();
            $table->timestampTz('handoff_at')->nullable();
            $table->timestampTz('resumed_at')->nullable();
            $table->timestamps();
        });

        Schema::create('kai_conversation_messages', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('conversation_id')->constrained('kai_conversations')->cascadeOnDelete();
            $table->string('sender');
            $table->text('message');
            $table->timestamps();
        });

        Schema::create('kai_logs', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignUlid('user_id')->constrained()->cascadeOnDelete();
            $table->string('type')->index();
            $table->string('target')->nullable();
            $table->string('status')->index();
            $table->json('detail')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kai_logs');
        Schema::dropIfExists('kai_conversation_messages');
        Schema::dropIfExists('kai_conversations');
        Schema::dropIfExists('kai_chatbot_settings');
        Schema::dropIfExists('kai_broadcasts');
        Schema::dropIfExists('kai_groups');
        Schema::dropIfExists('kai_devices');
        Schema::dropIfExists('content_metrics');
        Schema::dropIfExists('posts');
        Schema::dropIfExists('contents');
        Schema::dropIfExists('image_generations');
        Schema::dropIfExists('media_assets');
        Schema::dropIfExists('social_accounts');
    }
};
