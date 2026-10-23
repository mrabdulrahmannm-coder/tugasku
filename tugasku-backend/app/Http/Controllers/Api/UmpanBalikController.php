<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UmpanBalik;
use Illuminate\Http\Request;

class UmpanBalikController extends Controller
{
    /**
     * Simpan umpan balik baru dari user yang login.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'kategori' => 'nullable|in:saran,bug,pujian,lainnya',
            'rating' => 'nullable|integer|min:1|max:5',
            'judul' => 'required|string|max:255',
            'pesan' => 'required|string|max:5000',
            'lampiran' => 'nullable|file|mimes:jpeg,png,jpg,gif,pdf|max:5120',
        ]);

        $data = [
            'user_id' => $request->user()->id,
            'kategori' => $validated['kategori'] ?? 'saran',
            'rating' => $validated['rating'] ?? 5,
            'judul' => trim($validated['judul']),
            'pesan' => trim($validated['pesan']),
        ];

        if ($request->hasFile('lampiran')) {
            $data['lampiran'] = $request->file('lampiran')->store('umpan-balik', 'public');
        }

        $umpanBalik = UmpanBalik::create($data);

        return response()->json([
            'message' => 'Umpan balik berhasil dikirim. Terima kasih!',
            'data' => $umpanBalik,
        ], 201);
    }

    /**
     * Daftar umpan balik milik user yang login (terbaru dahulu).
     */
    public function index(Request $request)
    {
        $umpanBalik = UmpanBalik::where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json($umpanBalik);
    }

    /**
     * Semua kiriman feedback untuk akun admin.
     */
    public function adminIndex()
    {
        return response()->json(
            UmpanBalik::with('user:id,name,nim,email')
                ->latest()
                ->get()
        );
    }
}
