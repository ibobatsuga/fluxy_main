<?php

namespace Database\Seeders;

use App\Models\Plan;
use App\Models\Subscription;
use App\Models\Tenant;
use App\Models\User;
use App\Services\UsageService;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $plan = Plan::firstOrCreate(
            ['code' => 'default'],
            ['name' => 'Fluxy Default', 'limits' => UsageService::DEFAULT_LIMITS, 'is_active' => true],
        );

        User::firstOrCreate(
            ['email' => env('SEED_ADMIN_EMAIL', 'admin@fluxy.local')],
            [
                'name' => 'Fluxy Admin',
                'password' => env('SEED_ADMIN_PASSWORD', 'ChangeMe123!'),
                'provider' => 'email',
                'is_admin' => true,
                'email_verified_at' => now(),
            ],
        );

        $tenant = Tenant::firstOrCreate(
            ['slug' => 'toko-maju-jaya'],
            [
                'name' => 'Toko Maju Jaya',
                'business_name' => 'Toko Maju Jaya',
                'industry_category' => 'E-commerce / Online Shop',
                'timezone' => 'Asia/Jakarta',
                'status' => 'active',
                'approved_at' => now(),
            ],
        );

        $user = User::firstOrCreate(
            ['email' => env('SEED_TENANT_EMAIL', 'demo@fluxy.local')],
            [
                'name' => 'Andi Wijaya',
                'password' => env('SEED_TENANT_PASSWORD', 'Demo12345!'),
                'provider' => 'email',
                'is_admin' => true,
                'current_tenant_id' => $tenant->id,
                'email_verified_at' => now(),
            ],
        );
        $tenant->users()->syncWithoutDetaching([$user->id => ['role' => 'owner']]);

        Subscription::firstOrCreate(
            ['tenant_id' => $tenant->id, 'starts_at' => now()->startOfMonth()],
            [
                'plan_id' => $plan->id,
                'status' => 'active',
                'ends_at' => now()->addMonths(6)->endOfDay(),
            ],
        );

        \App\Models\FluxyNotification::firstOrCreate(
            ['user_id' => $user->id, 'type' => 'kai_handover'],
            [
                'title' => 'Perhatian Admin: Handover Kai WA',
                'message' => 'Pelanggan (6281234567890) menanyakan pembayaran. Respons manual diperlukan.',
                'data' => ['url' => '/kai/chatbot'],
                'created_at' => now()->subMinutes(15),
            ]
        );

        \App\Models\FluxyNotification::firstOrCreate(
            ['user_id' => $user->id, 'type' => 'maya_failed'],
            [
                'title' => 'Postingan Instagram Gagal',
                'message' => 'Posting Promo Merdeka ke @tokomajujaya gagal dipublikasikan.',
                'data' => ['url' => '/maya/calendar'],
                'created_at' => now()->subHours(2),
            ]
        );
    }
}

