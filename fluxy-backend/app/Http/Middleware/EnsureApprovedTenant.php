<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureApprovedTenant
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user?->is_admin) {
            return $next($request);
        }

        if (! $user?->currentTenant?->approved_at) {
            return response()->json(['message' => 'Account is pending and not approved.'], 403);
        }

        return $next($request);
    }
}
