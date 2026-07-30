<?php

namespace App\Http\Controllers\Api\V1;

use App\Services\UsageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UsageController extends ApiController
{
    public function __invoke(Request $request, UsageService $usage): JsonResponse
    {
        abort_if(! $request->user()->currentTenant, 404, 'Tenant not found.');

        return $this->data($usage->summary($request->user()->currentTenant));
    }
}
