<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;

class KaiChatbotSetting extends Model
{
    use HasUlids;

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean', 'payment_keywords' => 'array', 'resume_keywords' => 'array',
            'csv_last_synced' => 'datetime',
        ];
    }
}
