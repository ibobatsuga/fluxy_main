<?php

namespace App\Support;

use App\Models\Tenant;
use App\Models\User;
use Carbon\CarbonInterface;

class TenantPresenter
{
    public static function subscriptionStatus(?Tenant $tenant): string
    {
        if (! $tenant || $tenant->status === 'pending' || $tenant->status === 'rejected') {
            return 'none';
        }

        if ($tenant->status === 'suspended') {
            return 'suspended';
        }

        $subscription = $tenant->currentSubscription;

        if (! $subscription) {
            return 'none';
        }

        if ($subscription->status !== 'active' || $subscription->ends_at->isPast()) {
            return 'expired';
        }

        return 'active';
    }

    public static function user(User $user): array
    {
        $user->loadMissing('currentTenant.currentSubscription');
        $tenant = $user->currentTenant;
        $subscription = $tenant?->currentSubscription;

        return [
            'id' => (string) $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'business_name' => $tenant?->business_name,
            'industry_category' => $tenant?->industry_category,
            'provider' => $user->provider,
            'is_approved' => $user->is_admin || (bool) $tenant?->approved_at,
            'is_admin' => $user->is_admin,
            'timezone' => $tenant?->timezone,
            'subscription_status' => $user->is_admin ? 'active' : self::subscriptionStatus($tenant),
            'subscription_start_date' => self::iso($subscription?->starts_at),
            'subscription_end_date' => self::iso($subscription?->ends_at),
            'created_at' => self::iso($user->created_at),
            'updated_at' => self::iso($user->updated_at),
        ];
    }

    private static function iso(?CarbonInterface $date): ?string
    {
        return $date?->toISOString();
    }
}
