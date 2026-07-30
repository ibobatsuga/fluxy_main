<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\Request;

class AuditService
{
    public function write(
        string $type,
        string $message,
        ?Tenant $tenant = null,
        ?User $actor = null,
        array $context = [],
        ?Request $request = null,
    ): AuditLog {
        return AuditLog::create([
            'tenant_id' => $tenant?->id,
            'actor_id' => $actor?->id,
            'type' => $type,
            'message' => $message,
            'context' => $context,
            'ip_address' => $request?->ip(),
        ]);
    }
}
