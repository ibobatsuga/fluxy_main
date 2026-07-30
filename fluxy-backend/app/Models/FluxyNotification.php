<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;

class FluxyNotification extends Model
{
    use HasUlids;

    protected $table = 'notifications';

    protected $fillable = ['tenant_id', 'user_id', 'type', 'title', 'message', 'data', 'read_at'];

    protected function casts(): array
    {
        return ['data' => 'array', 'read_at' => 'datetime'];
    }
}
