<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class MediaAsset extends Model
{
    use HasUlids;

    protected $guarded = [];

    protected function casts(): array
    {
        return ['metadata' => 'array'];
    }

    public function getUrlAttribute(): string
    {
        return Storage::disk($this->disk)->url($this->path);
    }
}
