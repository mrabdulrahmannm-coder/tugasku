import { useEffect, useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import api from '../api/axios';

export default function SsoCallback({ onLogin }) {
  const [error, setError] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (!code) {
      // Nilai "kode tidak ditemukan" dihitung saat render (lihat missingCode),
      // bukan di dalam effect, agar tidak memicu cascading render.
      return;
    }

    // Kirim authorization code ke backend Laravel untuk ditukar token Sanctum
    api.post('/auth/polibatam/callback', { code })
      .then((res) => {
        localStorage.setItem('token', res.data.access_token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        
        if (onLogin) {
          onLogin('Beranda');
        } else {
          window.location.href = '/';
        }
      })
      .catch((err) => {
        const msg = err.response?.data?.message || 'Gagal memproses otentikasi akun Dokpol.';
        setError(msg);
      });
  }, [onLogin]);

  // Ditampilkan ketika parameter ?code= tidak ada pada URL.
  const missingCode = error === null && !new URLSearchParams(window.location.search).get('code');

  if (error || missingCode) {
    return (
      <div className="min-h-screen bg-[#F0F4F1] dark:bg-[#121E16] flex items-center justify-center p-4">
        <div className="bg-white dark:bg-[#1C2A20] p-8 rounded-3xl border border-red-200 dark:border-red-900/40 max-w-md w-full text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
          <h3 className="font-extrabold text-base text-gray-900 dark:text-emerald-100">Gagal Masuk via SSO</h3>
          <p className="text-xs text-gray-500 dark:text-emerald-300/60">
            {error || 'Authorization Code dari server SSO Polibatam tidak ditemukan.'}
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full bg-[#3D5245] hover:bg-[#2F4036] text-white text-xs font-bold py-3 rounded-xl transition"
          >
            Kembali ke Halaman Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F4F1] dark:bg-[#121E16] flex flex-col items-center justify-center p-4 text-center space-y-3">
      <Loader2 className="w-10 h-10 animate-spin text-[#3D5245] dark:text-emerald-400" />
      <h3 className="font-extrabold text-sm text-gray-900 dark:text-emerald-100">Memverifikasi Akun Dokpol Polibatam...</h3>
      <p className="text-xs text-gray-500 dark:text-emerald-300/60">Mohon tunggu sebentar, sistem sedang menyinkronkan data profil kamu.</p>
    </div>
  );
}