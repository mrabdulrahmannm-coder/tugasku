# TugasKu

TugasKu adalah aplikasi web manajemen tugas kuliah untuk mahasiswa. Aplikasi ini
membantu pengguna mencatat deadline, mengatur mata kuliah, memantau progres tugas,
melihat jadwal melalui kalender, dan mengirimkan feedback kepada pengembang.

TugasKu menggunakan React untuk antarmuka pengguna dan Laravel API sebagai backend.
Autentikasi API menggunakan Laravel Sanctum.

## Fitur Utama

### Untuk mahasiswa

- **Beranda**
  - Melihat ringkasan tugas dan progres penyelesaian.
  - Melihat notifikasi deadline.
  - Melihat jadwal tugas terdekat.
- **Daftar Tugas**
  - Menambahkan tugas baru.
  - Mencari dan memfilter tugas.
  - Melihat status: terlambat, hari ini, mendatang, dan selesai.
  - Menandai tugas sebagai selesai.
  - Menghapus tugas.
- **Kalender**
  - Melihat tugas berdasarkan tanggal deadline.
  - Berpindah bulan.
  - Membuka detail tugas langsung dari kalender.
  - Kalender hanya menampilkan tugas milik user yang sedang login.
- **Mata Kuliah**
  - Menambahkan mata kuliah.
  - Melihat data kode, SKS, kategori, dosen, dan ruangan.
- **Umpan Balik**
  - Mengirim saran fitur.
  - Melaporkan bug.
  - Mengirim apresiasi atau pesan lainnya.
  - Memberikan rating dan lampiran.
- **Pengaturan**
  - Mengubah profil.
  - Mengunggah foto profil.
  - Mengubah password.
  - Mengatur tema, notifikasi, dan sinkronisasi.
- **Autentikasi**
  - Login menggunakan NIM atau email.
  - Registrasi akun baru.
  - Lupa password dan reset password.
  - Login SSO Polibatam.

### Untuk admin

- **Kotak Masuk Feedback Admin**
  - Melihat seluruh feedback dari user.
  - Mencari feedback berdasarkan judul, pesan, kategori, atau pengirim.
  - Melihat total feedback dan rata-rata rating.
  - Melihat detail pengirim dan isi feedback.
- Akses admin dilindungi oleh role `admin` dan middleware khusus.

## Teknologi

### Frontend

- React
- Vite
- React Router
- Axios
- Tailwind CSS
- Lucide React

### Backend

- Laravel
- PHP `^8.3`
- Laravel Sanctum
- Eloquent ORM
- Database migrations dan seeders

## Struktur Proyek

```text
tugasku/
├── src/
│   ├── api/
│   │   └── axios.js
│   ├── components/
│   │   ├── Sidebar.jsx
│   │   ├── Topbar.jsx
│   │   ├── TaskForm.jsx
│   │   └── UserAvatar.jsx
│   ├── pages/
│   │   ├── Beranda.jsx
│   │   ├── DaftarTugas.jsx
│   │   ├── Kalendar.jsx
│   │   ├── MataKuliah.jsx
│   │   ├── Pengaturan.jsx
│   │   ├── UmpanBalik.jsx
│   │   └── AdminFeedback.jsx
│   ├── App.jsx
│   └── main.jsx
├── tugasku-backend/
│   ├── app/
│   │   ├── Http/Controllers/Api/
│   │   ├── Http/Middleware/
│   │   └── Models/
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   └── routes/api.php
├── package.json
└── README.md
```

## Persiapan Frontend

Pastikan Node.js dan npm sudah terpasang.

```powershell
cd D:\ABDUL\xampp\htdocs\tugasku
npm install
```

Jika URL API berbeda dari default, buat atau ubah file `.env`:

```env
VITE_API_URL=http://127.0.0.1:8000/api
```

Jalankan frontend dalam mode pengembangan:

```powershell
npm run dev
```

Frontend biasanya tersedia pada alamat yang ditampilkan oleh Vite, misalnya
`http://localhost:5173`.

Perintah lain:

```powershell
npm run build
npm run preview
npm run lint
```

## Persiapan Backend

Pastikan PHP, Composer, dan database sudah tersedia.

```powershell
cd D:\ABDUL\xampp\htdocs\tugasku\tugasku-backend
composer install
copy .env.example .env
php artisan key:generate
```

Atur koneksi database pada file `.env`, kemudian jalankan migrasi:

```powershell
php artisan migrate
```

Jalankan backend:

```powershell
php artisan serve
```

Backend tersedia pada:

```text
http://127.0.0.1:8000
```

Frontend mengambil API dari:

```text
http://127.0.0.1:8000/api
```

## Akun Admin Lokal

Akun admin untuk melihat halaman feedback dapat dibuat dengan:

```powershell
cd D:\ABDUL\xampp\htdocs\tugasku\tugasku-backend
php artisan migrate
php artisan db:seed --class=AdminUserSeeder
```

Kredensial admin lokal:

```text
Email    : admin@tugasku.local
Password : AdminTugasKu2026!
```

Setelah login, admin akan diarahkan ke:

```text
http://localhost:5173/admin/feedback
```

> Kredensial di atas hanya untuk pengembangan lokal. Ganti password sebelum
> aplikasi digunakan di lingkungan produksi.

## Endpoint Utama

Semua endpoint berikut berada di bawah prefix `/api` dan sebagian besar
membutuhkan token Sanctum.

| Method | Endpoint | Keterangan |
| --- | --- | --- |
| `POST` | `/login` | Login user |
| `POST` | `/register` | Registrasi user |
| `GET` | `/dashboard/summary` | Ringkasan dashboard |
| `GET` | `/tugas` | Daftar tugas user |
| `POST` | `/tugas` | Membuat tugas |
| `PATCH` | `/tugas/{id}/complete` | Menyelesaikan tugas |
| `GET` | `/dashboard/kalender` | Data kalender |
| `GET` | `/mata-kuliah` | Daftar mata kuliah |
| `POST` | `/umpan-balik` | Mengirim feedback |
| `GET` | `/umpan-balik` | Feedback milik user |
| `GET` | `/admin/umpan-balik` | Semua feedback untuk admin |

Endpoint `/admin/umpan-balik` hanya dapat digunakan oleh user dengan role
`admin`.

## Validasi

Validasi frontend:

```powershell
cd D:\ABDUL\xampp\htdocs\tugasku
npm run build
npm run lint
```

Validasi backend:

```powershell
cd D:\ABDUL\xampp\htdocs\tugasku\tugasku-backend
php artisan route:list
php artisan test
```

## Catatan Pengembangan

- Data tugas dan feedback dipisahkan berdasarkan user yang sedang login.
- Foto profil memakai foto yang diunggah user; jika belum ada, aplikasi
  menampilkan avatar berupa inisial nama.
- Kalender tidak lagi menampilkan data tugas contoh ketika akun belum memiliki
  tugas.
- Pastikan konfigurasi CORS, database, dan URL API disesuaikan ketika aplikasi
  dipindahkan ke server lain.

## Lisensi

Proyek ini dibuat untuk kebutuhan pengembangan dan pembelajaran aplikasi
manajemen tugas kuliah TugasKu.
