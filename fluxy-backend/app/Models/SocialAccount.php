<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;

class SocialAccount extends Model
{
    use HasUlids;

    protected $guarded = [];

    protected $hidden = ['access_token', 'refresh_token'];

    protected function casts(): array
    {
        return [
            'access_token' => 'encrypted', 'refresh_token' => 'encrypted',
            'provider_metadata' => 'array',
            'token_expires_at' => 'datetime', 'connected_at' => 'datetime', 'is_active' => 'boolean',
        ];
    }
}
