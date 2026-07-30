<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\KaiDevice;
use App\Support\ModulePresenter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class KaiAdminController extends ApiController
{
    public function pending(): JsonResponse
    {
        return $this->data(KaiDevice::where('status', 'pending')->latest()->get()->map(
            fn ($device) => ModulePresenter::kaiDevice($device),
        ));
    }

    public function activate(Request $request, KaiDevice $device): JsonResponse
    {
        $validated = $request->validate([
            'device_key' => ['required', 'string', 'max:500'],
            'api_key' => ['required', 'string', 'max:2000'],
            'business_name' => ['nullable', 'string', 'max:160'],
        ]);
        abort_unless($device->status === 'pending', 409, 'Device is not pending.');
        $device->update([
            'provider_phone_number_id' => $validated['device_key'],
            'access_token' => $validated['api_key'],
            'business_name' => $validated['business_name'] ?? $device->business_name,
            'status' => 'connected', 'connected_at' => now(),
        ]);

        return $this->data(ModulePresenter::kaiDevice($device));
    }

    public function reject(KaiDevice $device): JsonResponse
    {
        abort_unless($device->status === 'pending', 409, 'Device is not pending.');
        $device->update(['status' => 'rejected']);

        return $this->data(ModulePresenter::kaiDevice($device));
    }
}
