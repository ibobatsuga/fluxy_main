<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;

class Plan extends Model
{
    use HasUlids;

    protected $fillable = ['code', 'name', 'is_active', 'limits'];

    protected function casts(): array
    {
        return ['is_active' => 'boolean', 'limits' => 'array'];
    }
}
