<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tugas;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class TugasController extends Controller
{
    public function index(Request $request)
    {
        $query = Tugas::with('mataKuliah')
            ->where('user_id', $request->user()->id);

        if ($request->has('semester') && $request->semester !== '' && $request->semester !== 'Semua') {
            $query->where('semester', $request->semester);
        }

        if ($request->has('status') && $request->status !== 'Semua') {
            $query->where('status', $request->status);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nama_tugas', 'like', "%{$search}%")
                  ->orWhere('dosen', 'like', "%{$search}%");
            });
        }

        $tugas = $query->orderBy('deadline_date', 'asc')->get();

        return response()->json($tugas);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'mata_kuliah_id' => 'required|exists:mata_kuliah,id',
            'nama_tugas' => 'required|string|max:255',
            'dosen' => 'nullable|string|max:255',
            'deadline_date' => 'required|date',
            'deadline_time' => 'nullable',
            'prioritas' => 'required|in:Rendah,Sedang,Tinggi',
            'link_elearning' => 'nullable|url',
            'catatan' => 'nullable|string',
            'is_pengingat_active' => 'boolean',
        ]);

        $validated['user_id'] = $request->user()->id;

        // Tugas baru otomatis mengikuti semester aktif pengguna.
        $validated['semester'] = $request->user()->semester ?: 'Semester 4 (Genap)';

        // Status awal mengikuti deadline tugas.
        $validated['status'] = $this->deriveStatus(
            $validated['deadline_date'],
            $validated['deadline_time'] ?? '23:59'
        );

        $tugas = Tugas::create($validated);

        return response()->json([
            'message' => 'Tugas berhasil ditambahkan',
            'data' => $tugas->load('mataKuliah'),
        ], 201);
    }

    public function show(Request $request, $id)
    {
        $tugas = Tugas::with('mataKuliah')
            ->where('user_id', $request->user()->id)
            ->findOrFail($id);

        return response()->json($tugas);
    }

    public function update(Request $request, $id)
    {
        $tugas = Tugas::where('user_id', $request->user()->id)->findOrFail($id);

        $validated = $request->validate([
            'mata_kuliah_id' => 'sometimes|exists:mata_kuliah,id',
            'nama_tugas' => 'sometimes|string|max:255',
            'dosen' => 'nullable|string|max:255',
            'deadline_date' => 'sometimes|date',
            'deadline_time' => 'nullable',
            'prioritas' => 'sometimes|in:Rendah,Sedang,Tinggi',
            'status' => 'sometimes|in:Terlambat,Hari Ini,Mendatang,Selesai',
            'link_elearning' => 'nullable|url',
            'catatan' => 'nullable|string',
            'is_pengingat_active' => 'boolean',
            'nilai' => 'nullable|integer',
        ]);

        $tugas->update($validated);

        return response()->json([
            'message' => 'Tugas berhasil diperbarui',
            'data' => $tugas->load('mataKuliah'),
        ]);
    }

    public function complete(Request $request, $id)
    {
        $tugas = Tugas::where('user_id', $request->user()->id)->findOrFail($id);
        $tugas->update(['status' => 'Selesai']);

        return response()->json([
            'message' => 'Tugas ditandai selesai',
            'data' => $tugas,
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $tugas = Tugas::where('user_id', $request->user()->id)->findOrFail($id);
        $tugas->delete();

        return response()->json([
            'message' => 'Tugas berhasil dihapus',
        ]);
    }

    public function summary(Request $request)
    {
        $userId = $request->user()->id;

        $total = Tugas::where('user_id', $userId)->count();
        $terlambat = Tugas::where('user_id', $userId)->where('status', 'Terlambat')->count();
        $hariIni = Tugas::where('user_id', $userId)->where('status', 'Hari Ini')->count();
        $selesai = Tugas::where('user_id', $userId)->where('status', 'Selesai')->count();

        $percentage = $total > 0 ? round(($selesai / $total) * 100) : 0;

        return response()->json([
            'total_tugas' => $total,
            'terlambat' => $terlambat,
            'hari_ini' => $hariIni,
            'selesai' => $selesai,
            'persentase_selesai' => $percentage,
        ]);
    }

    /**
     * Notifikasi dinamis yang diturunkan dari tugas milik user.
     */
    public function notifikasi(Request $request)
    {
        $tugas = Tugas::with('mataKuliah')
            ->where('user_id', $request->user()->id)
            ->orderBy('deadline_date', 'asc')
            ->orderBy('deadline_time', 'asc')
            ->get();

        $notifikasi = [];

        foreach ($tugas as $t) {
            if ($t->status === 'Selesai') {
                continue;
            }

            $deadline = $this->deadlineCarbon($t);
            $selisihJam = (int) now()->diffInHours($deadline, false);

            if ($t->status === 'Terlambat') {
                $notifikasi[] = [
                    'id' => 'terlambat-' . $t->id,
                    'tugas_id' => $t->id,
                    'tipe' => 'terlambat',
                    'judul' => 'Tugas sudah lewat deadline',
                    'deskripsi' => $t->nama_tugas,
                    'mata_kuliah' => $t->mataKuliah?->nama_matkul,
                    'deadline' => $t->deadline_date . ' ' . ($t->deadline_time ?? '23:59'),
                    'waktu' => 'Lewat ' . abs($selisihJam) . ' jam',
                    'prioritas' => 'tinggi',
                ];

                continue;
            }

            if ($t->status === 'Hari Ini' || $selisihJam <= 24) {
                $notifikasi[] = [
                    'id' => 'deadline-' . $t->id,
                    'tugas_id' => $t->id,
                    'tipe' => 'deadline',
                    'judul' => 'Deadline mendekati',
                    'deskripsi' => $t->nama_tugas,
                    'mata_kuliah' => $t->mataKuliah?->nama_matkul,
                    'deadline' => $t->deadline_date . ' ' . ($t->deadline_time ?? '23:59'),
                    'waktu' => $selisihJam <= 0 ? 'Jatuh tempo' : $selisihJam . ' jam lagi',
                    'prioritas' => 'sedang',
                ];

                continue;
            }

            $notifikasi[] = [
                'id' => 'tugas-' . $t->id,
                'tugas_id' => $t->id,
                'tipe' => 'tugas',
                'judul' => 'Tugas baru tercatat',
                'deskripsi' => $t->nama_tugas,
                'mata_kuliah' => $t->mataKuliah?->nama_matkul,
                'deadline' => $t->deadline_date . ' ' . ($t->deadline_time ?? '23:59'),
                'waktu' => 'Untuk ' . $this->formatTanggal($t->deadline_date),
                'prioritas' => 'rendah',
            ];
        }

        // Urutkan: terlambat > deadline mendekati > tugas biasa
        $prioritas = ['tinggi' => 0, 'sedang' => 1, 'rendah' => 2];
        usort($notifikasi, fn ($a, $b) => $prioritas[$a['prioritas']] <=> $prioritas[$b['prioritas']]);

        return response()->json([
            'total' => count($notifikasi),
            'data' => $notifikasi,
        ]);
    }

    /**
     * Jadwal akademik yang diturunkan dari mata kuliah milik user.
     */
    public function jadwal(Request $request)
    {
        $mataKuliah = $request->user()->mataKuliah()->orderBy('kode_matkul', 'asc')->get();

        $hari = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

        $jadwal = $mataKuliah->map(function ($mk, $index) use ($hari) {
            $pagi = $index % 2 === 0;

            return [
                'id' => $mk->id,
                'mata_kuliah' => $mk->nama_matkul,
                'kode_matkul' => $mk->kode_matkul,
                'dosen' => $mk->dosen_pengampu,
                'ruangan' => $mk->ruangan,
                'sks' => $mk->sks,
                'kategori' => $mk->kategori,
                'hari' => $hari[$index % 7],
                'jam_mulai' => $pagi ? '08:00' : '13:00',
                'jam_selesai' => $pagi ? '10:00' : '15:00',
            ];
        })->values();

        return response()->json([
            'total' => $jadwal->count(),
            'data' => $jadwal,
        ]);
    }

    /**
     * Data kalender bulanan: seluruh tugas pada bulan & tahun yang dipilih.
     */
    public function kalender(Request $request)
    {
        $bulan = (int) $request->query('bulan', now()->month);
        $tahun = (int) $request->query('tahun', now()->year);

        if ($bulan < 1 || $bulan > 12) {
            $bulan = now()->month;
        }

        $tugas = Tugas::with('mataKuliah')
            ->where('user_id', $request->user()->id)
            ->whereYear('deadline_date', $tahun)
            ->whereMonth('deadline_date', $bulan)
            ->orderBy('deadline_date', 'asc')
            ->orderBy('deadline_time', 'asc')
            ->get();

        $data = $tugas->map(function ($t) {
            return [
                'id' => $t->id,
                'nama_tugas' => $t->nama_tugas,
                'mata_kuliah' => $t->mataKuliah?->nama_matkul,
                'kode_matkul' => $t->mataKuliah?->kode_matkul,
                'dosen' => $t->dosen,
                'deadline_date' => $t->deadline_date,
                'deadline_time' => $t->deadline_time,
                'status' => $t->status,
                'prioritas' => $t->prioritas,
                'link_elearning' => $t->link_elearning,
                'catatan' => $t->catatan,
                'semester' => $t->semester,
            ];
        })->values();

        return response()->json([
            'bulan' => $bulan,
            'tahun' => $tahun,
            'total' => $data->count(),
            'data' => $data,
        ]);
    }

    /**
     * Tentukan status tugas berdasarkan deadline-nya.
     */
    protected function deriveStatus(string $date, string $time): string
    {
        $deadline = $this->carbonFrom($date, $time);

        if ($deadline->lt(now())) {
            return 'Terlambat';
        }

        if ($deadline->isSameDay(now())) {
            return 'Hari Ini';
        }

        return 'Mendatang';
    }

    /**
     * Ubah tanggal + jam string menjadi instance Carbon.
     */
    protected function carbonFrom(string $date, $time): Carbon
    {
        $time = substr((string) $time, 0, 5);

        try {
            return Carbon::parse($date . ' ' . $time);
        } catch (\Exception $e) {
            return Carbon::parse($date . ' 23:59');
        }
    }

    /**
     * Deadline lengkap sebuah tugas sebagai Carbon.
     */
    protected function deadlineCarbon(Tugas $tugas): Carbon
    {
        return $this->carbonFrom($tugas->deadline_date, $tugas->deadline_time ?? '23:59');
    }

    /**
     * Format tanggal menjadi gaya Bahasa Indonesia.
     */
    protected function formatTanggal(?string $date): string
    {
        if (! $date) {
            return '-';
        }

        $bulan = [
            1 => 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
        ];

        $timestamp = strtotime($date);

        if ($timestamp === false) {
            return $date;
        }

        return date('j', $timestamp) . ' ' . $bulan[(int) date('n', $timestamp)] . ' ' . date('Y', $timestamp);
    }
}

