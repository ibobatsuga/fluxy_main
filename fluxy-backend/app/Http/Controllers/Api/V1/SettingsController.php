<?php

namespace App\Http\Controllers\Api\V1;

use App\Support\TenantPresenter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingsController extends ApiController
{
    public function show(Request $request): JsonResponse
    {
        return $this->data(TenantPresenter::user($request->user()));
    }

    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:120'],
            'business_name' => ['sometimes', 'string', 'max:160'],
            'industry_category' => ['sometimes', 'string', 'max:120'],
            'timezone' => ['sometimes', 'timezone'],
        ]);
        $user = $request->user();

        if (isset($validated['name'])) {
            $user->update(['name' => $validated['name']]);
        }

        $tenantData = collect($validated)->only(['business_name', 'industry_category', 'timezone'])->all();
        if ($tenantData && $user->currentTenant) {
            $user->currentTenant->update($tenantData);
        }

        return $this->data(TenantPresenter::user($user->fresh()));
    }
}
