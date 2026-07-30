<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;

class Content extends Model
{
    use HasUlids;

    protected $guarded = [];

    protected function casts(): array
    {
        return ['media_urls' => 'array'];
    }
}
