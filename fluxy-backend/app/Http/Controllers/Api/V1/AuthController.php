<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\FluxyNotification;
use App\Models\Tenant;
use App\Models\User;
use App\Support\TenantPresenter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Throwable;

class AuthController extends ApiController
{
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'business_name' => ['required', 'string', 'max:160'],
            'industry_category' => ['required', 'string', 'max:120'],
            'timezone' => ['nullable', 'timezone'],
        ]);

        DB::transaction(function () use ($validated) {
            $tenant = Tenant::create([
                'name' => $validated['business_name'],
                'slug' => $this->uniqueSlug($validated['business_name']),
                'business_name' => $validated['business_name'],
                'industry_category' => $validated['industry_category'],
                'timezone' => $validated['timezone'] ?? 'Asia/Jakarta',
                'status' => 'pending',
            ]);

            $user = User::create([
                'name' => $validated['name'],
                'email' => Str::lower($validated['email']),
                'password' => $validated['password'],
                'provider' => 'email',
                'current_tenant_id' => $tenant->id,
            ]);

            $tenant->users()->attach($user->id, ['role' => 'owner']);

            FluxyNotification::create([
                'tenant_id' => $tenant->id, 'user_id' => $user->id, 'type' => 'tenant_pending',
                'title' => 'Pendaftaran diterima',
                'message' => 'Akun Anda sedang menunggu persetujuan Admin Fluxy.',
            ]);
            User::where('is_admin', true)->each(function (User $admin) use ($tenant) {
                FluxyNotification::create([
                    'tenant_id' => $tenant->id, 'user_id' => $admin->id, 'type' => 'tenant_registration',
                    'title' => 'Tenant baru menunggu persetujuan',
                    'message' => $tenant->business_name.' baru saja mendaftar.',
                ]);
            });
        });

        return $this->data([
            'message' => 'Registrasi berhasil! Akun Anda menunggu persetujuan admin.',
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', Str::lower($validated['email']))->first();

        if (! $user || ! $user->password || ! Hash::check($validated['password'], $user->password)) {
            return response()->json(['message' => 'Email atau password tidak sesuai.'], 422);
        }

        $user->tokens()->where('name', 'web')->delete();
        $token = $user->createToken('web', ['*'], now()->addDays(30))->plainTextToken;

        return $this->data([
            'user' => TenantPresenter::user($user),
            'token' => $token,
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return $this->data(TenantPresenter::user($request->user()));
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()?->delete();

        return $this->data(null);
    }

    public function setPassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $request->user()->update(['password' => $validated['password']]);

        return $this->data(null);
    }

    public function googleRedirect(): JsonResponse|RedirectResponse
    {
        if (! config('services.google.client_id')) {
            return response()->json(['message' => 'Google OAuth belum dikonfigurasi.'], 503);
        }

        return Socialite::driver('google')->stateless()->redirect();
    }

    public function googleCallback(): RedirectResponse
    {
        $frontend = rtrim(config('app.frontend_url'), '/');

        try {
            $google = Socialite::driver('google')->stateless()->user();

            $user = DB::transaction(function () use ($google) {
                $user = User::where('provider', 'google')->where('provider_id', $google->getId())->first()
                    ?? User::where('email', Str::lower($google->getEmail()))->first();

                if ($user) {
                    $user->update(['provider' => 'google', 'provider_id' => $google->getId()]);

                    return $user;
                }

                $tenant = Tenant::create([
                    'name' => $google->getName() ?: 'Bisnis Baru',
                    'slug' => $this->uniqueSlug($google->getName() ?: 'bisnis-baru'),
                    'business_name' => $google->getName() ?: 'Bisnis Baru',
                    'industry_category' => 'Lainnya',
                    'timezone' => 'Asia/Jakarta',
                    'status' => 'pending',
                ]);

                $user = User::create([
                    'name' => $google->getName() ?: 'Pengguna Fluxy',
                    'email' => Str::lower($google->getEmail()),
                    'provider' => 'google',
                    'provider_id' => $google->getId(),
                    'email_verified_at' => now(),
                    'current_tenant_id' => $tenant->id,
                ]);
                $tenant->users()->attach($user->id, ['role' => 'owner']);

                return $user;
            });

            $token = $user->createToken('web', ['*'], now()->addDays(30))->plainTextToken;

            return redirect()->away($frontend.'/auth/callback?token='.urlencode($token));
        } catch (Throwable $exception) {
            report($exception);

            return redirect()->away($frontend.'/auth/callback?error=oauth_failed');
        }
    }

    private function uniqueSlug(string $name): string
    {
        $base = Str::slug($name) ?: 'tenant';
        $slug = $base;
        $suffix = 1;

        while (Tenant::where('slug', $slug)->exists()) {
            $slug = $base.'-'.$suffix++;
        }

        return $slug;
    }
}
