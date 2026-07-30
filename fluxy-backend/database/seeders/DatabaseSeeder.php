<?php

namespace Database\Seeders;

use App\Models\FluxyNotification;
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

        $adminEmail = env('SEED_ADMIN_EMAIL');
        $adminPassword = env('SEED_ADMIN_PASSWORD');
        $tenantEmail = env('SEED_TENANT_EMAIL');
        $tenantPassword = env('SEED_TENANT_PASSWORD');

        if (! app()->environment('production')) {
            $adminEmail ??= 'admin@fluxy.local';
            $adminPassword ??= 'ChangeMe123!';
            $tenantEmail ??= 'demo@fluxy.local';
            $tenantPassword ??= 'Demo12345!';
        }

        if (! $adminEmail || ! $adminPassword) {
            $this->command?->warn('Skipping admin seed: SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD are not both configured.');
        } else {
            User::firstOrCreate(
                ['email' => $adminEmail],
                [
                    'name' => 'Fluxy Admin',
                    'password' => $adminPassword,
                    'provider' => 'email',
                    'is_admin' => true,
                    'email_verified_at' => now(),
                ],
            );
        }

        if (! $tenantEmail || ! $tenantPassword) {
            $this->command?->warn('Skipping demo tenant seed: SEED_TENANT_EMAIL and SEED_TENANT_PASSWORD are not both configured.');

            return;
        }

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
            ['email' => $tenantEmail],
            [
                'name' => 'Andi Wijaya',
                'password' => $tenantPassword,
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

        FluxyNotification::firstOrCreate(
            ['user_id' => $user->id, 'type' => 'kai_handover'],
            [
                'title' => 'Perhatian Admin: Handover Kai WA',
                'message' => 'Pelanggan (6281234567890) menanyakan pembayaran. Respons manual diperlukan.',
                'data' => ['url' => '/kai/chatbot'],
                'created_at' => now()->subMinutes(15),
            ]
        );

        FluxyNotification::firstOrCreate(
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
