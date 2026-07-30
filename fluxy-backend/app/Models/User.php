<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, HasUlids, Notifiable;

    protected $fillable = [
        'name', 'email', 'password', 'provider', 'provider_id',
        'is_admin', 'current_tenant_id', 'email_verified_at',
    ];

    protected $hidden = ['password', 'remember_token', 'provider_id'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_admin' => 'boolean',
        ];
    }

    public function currentTenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class, 'current_tenant_id');
    }

    public function tenants(): BelongsToMany
    {
        return $this->belongsToMany(Tenant::class, 'tenant_members')
            ->withPivot('role')
            ->withTimestamps();
    }
}
