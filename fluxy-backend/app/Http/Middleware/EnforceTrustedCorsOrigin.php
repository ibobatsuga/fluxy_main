<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnforceTrustedCorsOrigin
{
    private const CORS_RESPONSE_HEADERS = [
        'Access-Control-Allow-Origin',
        'Access-Control-Allow-Credentials',
        'Access-Control-Allow-Methods',
        'Access-Control-Allow-Headers',
        'Access-Control-Expose-Headers',
        'Access-Control-Max-Age',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);
        $origin = $request->headers->get('Origin');
        if ($origin === null || $origin === '') {
            return $response;
        }

        $allowedOrigins = config('cors.allowed_origins', []);
        if (in_array('*', $allowedOrigins, true) || in_array($origin, $allowedOrigins, true)) {
            return $response;
        }

        foreach (self::CORS_RESPONSE_HEADERS as $header) {
            $response->headers->remove($header);
        }

        return $response;
    }
}
