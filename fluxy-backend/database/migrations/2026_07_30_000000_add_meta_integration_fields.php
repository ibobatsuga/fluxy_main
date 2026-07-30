<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('social_accounts', function (Blueprint $table) {
            $table->json('provider_metadata')->nullable()->after('token_expires_at');
        });

        Schema::table('kai_devices', function (Blueprint $table) {
            $table->string('waba_id')->nullable()->after('provider_phone_number_id')->index();
        });

        Schema::table('kai_conversation_messages', function (Blueprint $table) {
            $table->string('provider_message_id')->nullable()->after('conversation_id')->unique();
        });

        Schema::table('kai_conversations', function (Blueprint $table) {
            $table->string('channel')->default('whatsapp')->after('user_id')->index();
            $table->string('provider_account_id')->nullable()->after('channel')->index();
        });
    }

    public function down(): void
    {
        Schema::table('kai_conversations', function (Blueprint $table) {
            $table->dropIndex(['channel']);
            $table->dropIndex(['provider_account_id']);
            $table->dropColumn(['channel', 'provider_account_id']);
        });

        Schema::table('kai_conversation_messages', function (Blueprint $table) {
            $table->dropUnique(['provider_message_id']);
            $table->dropColumn('provider_message_id');
        });

        Schema::table('kai_devices', function (Blueprint $table) {
            $table->dropIndex(['waba_id']);
            $table->dropColumn('waba_id');
        });

        Schema::table('social_accounts', function (Blueprint $table) {
            $table->dropColumn('provider_metadata');
        });
    }
};
