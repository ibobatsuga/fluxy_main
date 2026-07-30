<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Post extends Model
{
    use HasUlids;

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'platform_account_ids' => 'array', 'scheduled_at' => 'datetime',
            'actual_published_at' => 'datetime',
        ];
    }

    public function content(): BelongsTo
    {
        return $this->belongsTo(Content::class);
    }
}
