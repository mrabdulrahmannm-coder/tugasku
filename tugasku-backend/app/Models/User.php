<?php

namespace App\Models;

use App\Notifications\ResetPasswordNotification;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'nim',
        'email',
        'role',
        'password',
        'prodi',
        'semester',
        'avatar_url',
    ];

    /**
     * Aksesor: kembalikan URL lengkap avatar (bukan path relatif).
     */
    public function getAvatarUrlAttribute(): ?string
    {
        $path = $this->getRawOriginal('avatar_url');

        if (! $path) {
            return null;
        }

        // Jika sudah berupa URL lengkap, kembalikan apa adanya
        if (str_starts_with($path, 'http')) {
            return $path;
        }

        return url('storage/' . $path);
    }

    protected $hidden = [
        'password',
        'remember_token',
    ];

    public function mataKuliah()
    {
        return $this->hasMany(MataKuliah::class);
    }

    /**
     * Kirim notifikasi tautan atur ulang password ke email pengguna.
     */
    public function sendPasswordResetNotification($token): void
    {
        $this->notify(new ResetPasswordNotification($token));
    }

    public function tugas()
    {
        return $this->hasMany(Tugas::class);
    }
}