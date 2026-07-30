<?php

namespace App\Http\Middleware;

use App\Support\TenantPresenter;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureActiveSubscription
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user?->is_admin) {
            return $next($request);
        }

        if (TenantPresenter::subscriptionStatus($user?->currentTenant) !== 'active') {
            return response()->json([
                'message' => 'Subscription is not active. Contact Fluxy Admin to continue.',
            ], 403);
        }

        return $next($request);
    }
}
