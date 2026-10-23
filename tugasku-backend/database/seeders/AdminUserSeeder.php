<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@tugasku.local'],
            [
                'name' => 'Admin TugasKu',
                'nim' => null,
                'role' => 'admin',
                'password' => Hash::make('AdminTugasKu2026!'),
                'prodi' => 'Administrasi Sistem',
                'semester' => 'Admin',
            ]
        );
    }
}
