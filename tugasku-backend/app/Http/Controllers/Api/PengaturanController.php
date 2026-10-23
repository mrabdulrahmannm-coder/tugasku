<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class PengaturanController extends Controller
{
    /**
     * Ambil profil + pengaturan user yang login.
     */
    public function profil(Request $request)
    {
        $user = $request->user()->load('mataKuliah', 'tugas');

        $setting = UserSetting::where('user_id', $user->id)->first();
        $settings = $setting ? $setting->settings : [];

        return response()->json([
            'message' => 'Profil dan pengaturan berhasil diambil',
            'data' => [
                'user' => $user,
                'settings' => $settings,
            ],
        ]);
    }

    /**
     /**
     * Unggah foto profil user.
     */
    public function updateFoto(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        // Hapus foto lama jika ada (gunakan path mentah dari DB, bukan URL lengkap)
        $oldPath = $user->getRawOriginal('avatar_url');
        if ($oldPath && ! str_starts_with($oldPath, 'http') && file_exists(storage_path('app/public/' . $oldPath))) {
            unlink(storage_path('app/public/' . $oldPath));
        }

        // Simpan foto baru
        $path = $request->file('avatar')->store('avatars', 'public');

        $user->update([
            'avatar_url' => $path,
        ]);

        return response()->json([
            'message' => 'Foto profil berhasil diperbarui',
            'data' => [
                'user' => $user,
                'avatar_url' => $user->avatar_url,
            ],
        ]);
    }

    /**
     * Update profil user (nama, nim, prodi, semester, email).
     */
    public function updateProfil(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'nim' => 'sometimes|string|max:50|unique:users,nim,' . $user->id,
            'email' => 'sometimes|string|email|max:255|unique:users,email,' . $user->id,
            'prodi' => 'sometimes|string|max:100',
            'semester' => 'sometimes|string|max:50',
        ]);

        $user->update($validated);
        $user->refresh();

        return response()->json([
            'message' => 'Profil berhasil diperbarui',
            'data' => [
                'user' => $user,
            ],
        ]);
    }

    /**
     * Update password user.
     */
    public function updatePassword(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'current_password' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if (! Hash::check($validated['current_password'], $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Password saat ini tidak sesuai.'],
            ]);
        }

        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        return response()->json([
            'message' => 'Password berhasil diperbarui',
        ]);
    }

    /**
     * Simpan pengaturan notifikasi, sinkronisasi, dan tema.
     */
    public function updateSettings(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'settings' => 'required|array',
        ]);

        $settings = $validated['settings'];

        UserSetting::updateOrCreate(
            ['user_id' => $user->id],
            ['settings' => $settings]
        );

        return response()->json([
            'message' => 'Pengaturan berhasil disimpan',
            'data' => ['settings' => $settings],
        ]);
    }

    /**
     * Unduh semua data tugas sebagai file JSON (backup).
     */
    public function exportData(Request $request)
    {
        $user = $request->user();

        $data = [
            'user' => $user,
            'mata_kuliah' => $user->mataKuliah()->get(),
            'tugas' => $user->tugas()->with('mataKuliah')->get(),
            'settings' => UserSetting::where('user_id', $user->id)->value('settings'),
            'exported_at' => now(),
        ];

        return response()->json([
            'message' => 'Data berhasil diekspor',
            'data' => $data,
        ]);
    }

    /**
     * Hapus semua data user (tugas, mata kuliah, settings) — akun tetap aktif.
     */
    public function resetData(Request $request)
    {
        $user = $request->user();

        // Hapus semua tugas terkait
        $user->tugas()->delete();

        // Hapus semua mata kuliah terkait
        $user->mataKuliah()->delete();

        // Hapus pengaturan
        UserSetting::where('user_id', $user->id)->delete();

        return response()->json([
            'message' => 'Semua data lokal berhasil dihapus (reset)',
        ]);
    }
}