<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;

class KaiLog extends Model
{
    use HasUlids;

    protected $guarded = [];

    protected function casts(): array
    {
        return ['detail' => 'array'];
    }
}
