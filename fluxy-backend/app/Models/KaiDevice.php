<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;

class KaiDevice extends Model
{
    use HasUlids;

    protected $guarded = [];

    protected $hidden = ['access_token'];

    protected function casts(): array
    {
        return ['access_token' => 'encrypted', 'connected_at' => 'datetime', 'qr_expires_at' => 'datetime'];
    }
}
