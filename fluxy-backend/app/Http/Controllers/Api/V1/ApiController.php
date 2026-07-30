<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

abstract class ApiController extends Controller
{
    protected function data(mixed $data, int $status = 200, ?array $meta = null): JsonResponse
    {
        $payload = ['data' => $data];

        if ($meta !== null) {
            $payload['meta'] = $meta;
        }

        return response()->json($payload, $status);
    }

    protected function message(string $message, int $status = 200): JsonResponse
    {
        return response()->json(['message' => $message], $status);
    }
}
