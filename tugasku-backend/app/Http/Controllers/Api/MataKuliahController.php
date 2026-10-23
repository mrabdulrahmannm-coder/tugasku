<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MataKuliah;
use Illuminate\Http\Request;

class MataKuliahController extends Controller
{
    public function index(Request $request)
    {
        $query = MataKuliah::where('user_id', $request->user()->id);

        if ($request->has('search') && $request->search !== '') {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('kode_matkul', 'like', "%{$search}%")
                    ->orWhere('nama_matkul', 'like', "%{$search}%");
            });
        }

        return response()->json($query->orderBy('kode_matkul', 'asc')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'kode_matkul' => 'required|string|max:100',
            'nama_matkul' => 'required|string|max:255',
            'sks' => 'nullable|integer|min:1|max:6',
            'kategori' => 'nullable|string|max:100',
            'dosen_pengampu' => 'nullable|string|max:255',
            'ruangan' => 'nullable|string|max:255',
        ]);

        $validated['user_id'] = $request->user()->id;

        $mataKuliah = MataKuliah::create($validated);

        return response()->json([
            'message' => 'Mata kuliah berhasil ditambahkan',
            'data' => $mataKuliah,
        ], 201);
    }

    public function destroy(Request $request, $id)
    {
        $mataKuliah = MataKuliah::where('user_id', $request->user()->id)->findOrFail($id);

        // Hapus semua tugas terkait terlebih dahulu
        $mataKuliah->tugas()->delete();

        $mataKuliah->delete();

        return response()->json([
            'message' => 'Mata kuliah dan semua tugas terkait berhasil dihapus',
        ]);
    }
}
