<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    use HasUlids;

    protected $fillable = ['tenant_id', 'actor_id', 'type', 'message', 'context', 'ip_address'];

    protected function casts(): array
    {
        return ['context' => 'array'];
    }
}
