<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\MataKuliah;
use App\Models\Tugas;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
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

        // User default (login: NIM 3312201045 / password123)
        $user = User::create([
            'name' => 'Sarah Amelia Putri',
            'nim' => '3312201045',
            'email' => 'sarah.amelia@polibatam.ac.id',
            'role' => 'user',
            'password' => Hash::make('password123'),
            'prodi' => 'D4 Teknik Informatika',
            'semester' => 'Semester 4 (Genap)',
            'avatar_url' => null,
        ]);

        // Data mata kuliah contoh (sinkron dengan data di React)
        $mataKuliah = [
            [
                'kode_matkul' => 'IF-401',
                'nama_matkul' => 'Pemrograman Web',
                'sks' => 4,
                'kategori' => 'Praktikum & Teori',
                'dosen_pengampu' => 'Pak Ahmad Fauzi, M.Kom',
                'ruangan' => 'Lab Komputer TA-3',
            ],
            [
                'kode_matkul' => 'IF-404',
                'nama_matkul' => 'Rekayasa Perangkat Lunak',
                'sks' => 3,
                'kategori' => 'Teori',
                'dosen_pengampu' => 'Bu Rina Mardiana, S.T., M.T.',
                'ruangan' => 'Ruang Teori R-202',
            ],
            [
                'kode_matkul' => 'IF-402',
                'nama_matkul' => 'Basis Data Lanjut',
                'sks' => 3,
                'kategori' => 'Praktikum',
                'dosen_pengampu' => 'Pak Hendra Wijaya, M.T.',
                'ruangan' => 'Lab Oracle TA-1',
            ],
            [
                'kode_matkul' => 'IF-405',
                'nama_matkul' => 'Interaksi Manusia dan Komputer',
                'sks' => 3,
                'kategori' => 'Studio Desain',
                'dosen_pengampu' => 'Bu Novita Sari, M.Cs.',
                'ruangan' => 'Studio Multimedia 2',
            ],
            [
                'kode_matkul' => 'IF-403',
                'nama_matkul' => 'Jaringan Komputer & Keamanan',
                'sks' => 4,
                'kategori' => 'Praktikum Cisco',
                'dosen_pengampu' => 'Pak Irwan Syahputra, S.Kom., M.Kom.',
                'ruangan' => 'Lab Jaringan Cisco',
            ],
            [
                'kode_matkul' => 'IF-406',
                'nama_matkul' => 'Kecerdasan Buatan & Data Science',
                'sks' => 3,
                'kategori' => 'Riset & Teori',
                'dosen_pengampu' => 'Dr. Siti Rahayu, M.Eng.',
                'ruangan' => null,
            ],
        ];

        foreach ($mataKuliah as $mk) {
            MataKuliah::create(array_merge(['user_id' => $user->id], $mk));
        }

        $web = MataKuliah::where('user_id', $user->id)->where('kode_matkul', 'IF-401')->first();
        $rpl = MataKuliah::where('user_id', $user->id)->where('kode_matkul', 'IF-404')->first();
        $bdl = MataKuliah::where('user_id', $user->id)->where('kode_matkul', 'IF-402')->first();

        // Data tugas contoh
        Tugas::create([
            'user_id' => $user->id,
            'mata_kuliah_id' => $web?->id,
            'nama_tugas' => 'Laporan Praktikum Modul 5',
            'dosen' => $web?->dosen_pengampu,
            'deadline_date' => '2024-10-25',
            'deadline_time' => '23:59:00',
            'prioritas' => 'Tinggi',
            'status' => 'Mendatang',
            'link_elearning' => 'https://elearning.polibatam.ac.id/mod/assign/view.php?id=84291',
            'catatan' => 'Format laporan PDF maksimal 5MB, sertakan screenshot hasil uji coba.',
            'is_pengingat_active' => true,
            'nilai' => null,
        ]);

        Tugas::create([
            'user_id' => $user->id,
            'mata_kuliah_id' => $rpl?->id,
            'nama_tugas' => 'Quiz Software Architecture',
            'dosen' => $rpl?->dosen_pengampu,
            'deadline_date' => '2024-10-21',
            'deadline_time' => '23:59:00',
            'prioritas' => 'Tinggi',
            'status' => 'Hari Ini',
            'link_elearning' => 'https://elearning.polibatam.ac.id/mod/quiz/view.php?id=84291',
            'catatan' => '20 soal pilihan ganda dan 2 soal studi kasus, durasi 60 menit.',
            'is_pengingat_active' => true,
            'nilai' => null,
        ]);

        Tugas::create([
            'user_id' => $user->id,
            'mata_kuliah_id' => $bdl?->id,
            'nama_tugas' => 'Latihan SQL Query Agregasi & Join',
            'dosen' => $bdl?->dosen_pengampu,
            'deadline_date' => '2024-10-18',
            'deadline_time' => '23:59:00',
            'prioritas' => 'Sedang',
            'status' => 'Selesai',
            'link_elearning' => null,
            'catatan' => 'Sudah dikirim dan dinilai 95/100.',
            'is_pengingat_active' => false,
            'nilai' => 95,
        ]);

        Tugas::create([
            'user_id' => $user->id,
            'mata_kuliah_id' => $rpl?->id,
            'nama_tugas' => 'Tugas Ujian Tengah Semester',
            'dosen' => $rpl?->dosen_pengampu,
            'deadline_date' => '2024-10-15',
            'deadline_time' => '23:59:00',
            'prioritas' => 'Tinggi',
            'status' => 'Terlambat',
            'link_elearning' => null,
            'catatan' => 'Tugas desain arsitektur perangkat lunak.',
            'is_pengingat_active' => true,
            'nilai' => null,
        ]);
    }
}
