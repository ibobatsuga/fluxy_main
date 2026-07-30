<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class KaiConversation extends Model
{
    use HasUlids;

    protected $guarded = [];

    protected function casts(): array
    {
        return ['last_message_at' => 'datetime', 'handoff_at' => 'datetime', 'resumed_at' => 'datetime'];
    }

    public function messages(): HasMany
    {
        return $this->hasMany(KaiConversationMessage::class, 'conversation_id');
    }
}
