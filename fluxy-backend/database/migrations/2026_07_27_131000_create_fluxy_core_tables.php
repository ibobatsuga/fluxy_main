<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tenants', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('business_name');
            $table->string('industry_category');
            $table->string('timezone')->default('Asia/Jakarta');
            $table->string('status')->default('pending')->index();
            $table->text('rejection_reason')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('suspended_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::table('users', function (Blueprint $table) {
            $table->foreign('current_tenant_id')->references('id')->on('tenants')->nullOnDelete();
        });

        Schema::create('tenant_members', function (Blueprint $table) {
            $table->foreignUlid('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignUlid('user_id')->constrained()->cascadeOnDelete();
            $table->string('role')->default('owner');
            $table->timestamps();
            $table->unique(['tenant_id', 'user_id']);
        });

        Schema::create('plans', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('code')->unique();
            $table->string('name');
            $table->boolean('is_active')->default(true);
            $table->json('limits');
            $table->timestamps();
        });

        Schema::create('subscriptions', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignUlid('plan_id')->nullable()->constrained()->nullOnDelete();
            $table->string('status')->default('active')->index();
            $table->dateTimeTz('starts_at');
            $table->dateTimeTz('ends_at');
            $table->foreignUlid('activated_by')->nullable()->references('id')->on('users')->nullOnDelete();
            $table->timestamps();
            $table->index(['tenant_id', 'starts_at', 'ends_at']);
        });

        Schema::create('usage_events', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('tenant_id')->constrained()->cascadeOnDelete();
            $table->string('employee')->index();
            $table->string('action');
            $table->unsignedInteger('quantity')->default(1);
            $table->string('idempotency_key')->nullable();
            $table->json('metadata')->nullable();
            $table->timestampTz('occurred_at')->useCurrent();
            $table->timestamps();
            $table->unique(['tenant_id', 'idempotency_key']);
            $table->index(['tenant_id', 'employee', 'occurred_at']);
        });

        Schema::create('usage_counters', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('tenant_id')->constrained()->cascadeOnDelete();
            $table->string('employee');
            $table->date('period_start');
            $table->date('period_end');
            $table->unsignedInteger('used')->default(0);
            $table->unsignedInteger('limit')->nullable();
            $table->timestamps();
            $table->unique(['tenant_id', 'employee', 'period_start']);
        });

        Schema::create('notifications', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('tenant_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignUlid('user_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('type');
            $table->string('title');
            $table->text('message');
            $table->json('data')->nullable();
            $table->timestampTz('read_at')->nullable();
            $table->timestamps();
            $table->index(['user_id', 'read_at']);
        });

        Schema::create('audit_logs', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('tenant_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUlid('actor_id')->nullable()->references('id')->on('users')->nullOnDelete();
            $table->string('type')->index();
            $table->string('message');
            $table->json('context')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->timestamps();
            $table->index(['tenant_id', 'created_at']);
        });

        Schema::create('platform_credentials', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('key')->unique();
            $table->text('value');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('platform_credentials');
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('usage_counters');
        Schema::dropIfExists('usage_events');
        Schema::dropIfExists('subscriptions');
        Schema::dropIfExists('plans');
        Schema::dropIfExists('tenant_members');

        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['current_tenant_id']);
        });

        Schema::dropIfExists('tenants');
    }
};
