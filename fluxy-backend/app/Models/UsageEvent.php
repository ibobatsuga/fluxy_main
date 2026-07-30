<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;

class UsageEvent extends Model
{
    use HasUlids;

    protected $fillable = [
        'tenant_id', 'employee', 'action', 'quantity', 'idempotency_key',
        'metadata', 'occurred_at',
    ];

    protected function casts(): array
    {
        return ['metadata' => 'array', 'occurred_at' => 'datetime'];
    }
}
