<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\User;
use App\Services\AuditService;
use App\Services\Meta\MetaAssetSyncService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MetaAdminController extends ApiController
{
    public function sync(Request $request, MetaAssetSyncService $sync, AuditService $audit): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => ['required', 'string', 'exists:users,id'],
        ]);
        $user = User::with('currentTenant')->findOrFail($validated['user_id']);
        abort_if($user->is_admin || ! $user->currentTenant, 422, 'User tenant tidak valid.');
        $tenant = $user->currentTenant;
        $result = $sync->sync($tenant);

        $audit->write(
            'meta_sync',
            'Aset Facebook, Instagram, dan WhatsApp disinkronkan dari Meta.',
            $tenant,
            $request->user(),
            $result,
            $request,
        );

        return $this->data($result);
    }
}
