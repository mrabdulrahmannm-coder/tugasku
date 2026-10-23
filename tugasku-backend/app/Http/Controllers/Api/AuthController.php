<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password as PasswordRule;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Daftar akun baru.
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'min:3', 'max:255'],
            'nim' => ['required', 'string', 'max:50', 'unique:users,nim'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'prodi' => ['nullable', 'string', 'max:100'],
            'semester' => ['nullable', 'string', 'max:50'],
            'password' => ['required', 'string', 'confirmed', PasswordRule::min(8)->letters()->numbers()],
        ]);

        $user = User::create([
            'name' => trim($validated['name']),
            'nim' => trim($validated['nim']),
            'email' => Str::lower(trim($validated['email'])),
            'prodi' => $validated['prodi'] ?? 'D4 Teknik Informatika',
            'semester' => $validated['semester'] ?? 'Semester 4 (Genap)',
            'password' => Hash::make($validated['password']),
        ]);

        $token = $user->createToken('tugasku-token')->plainTextToken;

        return response()->json([
            'message' => 'Pendaftaran berhasil',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user,
        ], 201);
    }

    /**
     * Login dengan NIM atau email.
     */
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email_or_nim' => ['required', 'string', 'max:255'],
            'password' => ['required', 'string', 'max:255'],
        ]);

        $identifier = trim($validated['email_or_nim']);

        $user = User::where('email', Str::lower($identifier))
            ->orWhere('nim', $identifier)
            ->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email_or_nim' => ['Kredensial yang dimasukkan tidak cocok dengan data kami.'],
            ]);
        }

        $token = $user->createToken('tugasku-token')->plainTextToken;

        return response()->json([
            'message' => 'Login berhasil',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user,
        ]);
    }

    /**
     * Kirim tautan reset password ke email pengguna.
     *
     * Selalu mengembalikan pesan yang sama agar keberadaan email tidak bocor.
     */
    public function forgotPassword(Request $request)
    {
        $request->validate([
            'email' => ['required', 'string', 'email', 'max:255'],
        ]);

        $email = Str::lower(trim($request->input('email')));

        Password::sendResetLink(['email' => $email], function ($user, $token) {
            $user->sendPasswordResetNotification($token);
        });

        return response()->json([
            'message' => 'Jika email tersebut terdaftar, tautan reset password akan dikirim ke inbox kamu.',
        ]);
    }

    /**
     * Atur password baru memakai token reset dari email.
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'token' => ['required', 'string'],
            'email' => ['required', 'string', 'email', 'max:255'],
            'password' => ['required', 'string', 'confirmed', PasswordRule::min(8)->letters()->numbers()],
        ]);

        $status = Password::reset(
            [
                'token' => $request->input('token'),
                'email' => Str::lower(trim($request->input('email'))),
                'password' => $request->input('password'),
                'password_confirmation' => $request->input('password_confirmation'),
            ],
            function ($user, $password) {
                $user->forceFill([
                    'password' => Hash::make($password),
                    'remember_token' => Str::random(60),
                ])->save();

                // Cabut semua token API lama agar sesi lain ikut logout.
                $user->tokens()->delete();
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages([
                'token' => [$this->resetStatusMessage($status)],
            ]);
        }

        return response()->json([
            'message' => 'Password berhasil diperbarui. Silakan masuk dengan password baru kamu.',
        ]);
    }

    /**
     * Pesan aman untuk setiap status broker password.
     */
    protected function resetStatusMessage(string $status): string
    {
        return match ($status) {
            Password::INVALID_TOKEN => 'Tautan reset password tidak valid atau sudah kedaluwarsa.',
            Password::INVALID_USER => 'Tautan reset password tidak valid atau sudah kedaluwarsa.',
            Password::RESET_THROTTLED => 'Terlalu banyak percobaan. Silakan coba lagi beberapa saat lagi.',
            default => 'Permintaan reset password gagal diproses.',
        };
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    public function logout(Request $request)
    {
        $token = $request->user()->currentAccessToken();

        if ($token) {
            $token->delete();
        }

        return response()->json([
            'message' => 'Berhasil keluar akun',
        ]);
    }
}