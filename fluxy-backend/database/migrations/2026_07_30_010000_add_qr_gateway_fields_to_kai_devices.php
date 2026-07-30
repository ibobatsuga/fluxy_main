<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('kai_devices', function (Blueprint $table) {
            $table->string('connection_type')->default('cloud_api')->after('user_id')->index();
            $table->string('session_id')->nullable()->after('connection_type')->index();
            $table->text('qr_code')->nullable()->after('session_id');
            $table->timestampTz('qr_expires_at')->nullable()->after('qr_code');
        });
    }

    public function down(): void
    {
        Schema::table('kai_devices', function (Blueprint $table) {
            $table->dropIndex(['connection_type']);
            $table->dropIndex(['session_id']);
            $table->dropColumn(['connection_type', 'session_id', 'qr_code', 'qr_expires_at']);
        });
    }
};
