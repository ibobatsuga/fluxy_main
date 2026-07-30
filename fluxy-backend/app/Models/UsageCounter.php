<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;

class UsageCounter extends Model
{
    use HasUlids;

    protected $fillable = ['tenant_id', 'employee', 'period_start', 'period_end', 'used', 'limit'];

    protected function casts(): array
    {
        return ['period_start' => 'date', 'period_end' => 'date'];
    }
}
