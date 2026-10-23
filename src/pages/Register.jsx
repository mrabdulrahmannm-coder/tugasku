import { useState } from 'react';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Check,
  Loader2,
  GraduationCap,
} from 'lucide-react';
import api from '../api/axios';
import Logo from '../assets/Logo.png';

export default function Register({ onNavigate, onLogin }) {
  const [formData, setFormData] = useState({
    name: '',
    nim: '',
    email: '',
    prodi: 'D4 Rekayasa Perangkat Lunak',
    password: '',
    password_confirmation: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.password_confirmation) {
      alert('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post('/register', formData);

      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      setIsLoading(false);

      if (onLogin) {
        onLogin('Beranda');
      } else if (onNavigate) {
        onNavigate('Beranda');
      }
    } catch (error) {
      setIsLoading(false);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.errors?.email?.[0] ||
        error.response?.data?.errors?.nim?.[0] ||
        'Gagal mendaftar. Periksa kembali kelengkapan data kamu.';
      alert(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-[#EBF0EC] dark:bg-[#121E16] font-sans antialiased text-gray-800 dark:text-emerald-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 transition-colors duration-200">
      <div className="w-full max-w-5xl bg-white dark:bg-[#1C2A20] rounded-3xl border border-emerald-900/10 dark:border-emerald-800/30 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[620px] transition-colors">
        
        {/* Visual Branding Side */}
        <div className="lg:col-span-5 bg-[#2E4034] dark:bg-[#152219] text-white p-8 lg:p-10 flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 dark:bg-emerald-950/40 backdrop-blur-md rounded-2xl border border-white/10 dark:border-emerald-800/30">
                <img src={Logo} alt="Logo TugasKu" className="w-10 h-10 object-contain rounded-xl" />
              </div>
              <div>
                <h1 className="font-black text-2xl leading-tight text-white">TugasKu</h1>
                <p className="text-xs text-emerald-300/90 font-medium">Polibatam Edition</p>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <span className="bg-[#A3D9A5]/20 text-[#A3D9A5] text-[11px] font-bold px-3.5 py-1.5 rounded-full inline-flex items-center gap-2 border border-[#A3D9A5]/30">
                <span className="w-2 h-2 rounded-full bg-[#A3D9A5] animate-pulse"></span>
                PENDAFTARAN AKUN
              </span>
              <h2 className="text-2xl lg:text-3xl font-black text-white leading-tight">
                Mulai Kelola Tugas Kuliah Kamu.
              </h2>
              <p className="text-xs text-emerald-100/80 leading-relaxed font-normal">
                Buat akun TugasKu untuk mencatat, mengorganisir, dan memantau progres akademik semester aktif.
              </p>
            </div>
          </div>

          <div className="relative z-10 space-y-3 my-6 pt-6 border-t border-emerald-700/40">
            <div className="flex items-center gap-2.5 text-xs text-emerald-100/90 font-medium">
              <div className="w-5 h-5 rounded-full bg-[#A3D9A5] text-[#1E3023] flex items-center justify-center font-bold">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span>Manajemen jadwal tugas & kuis akademik.</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-emerald-100/90 font-medium">
              <div className="w-5 h-5 rounded-full bg-[#A3D9A5] text-[#1E3023] flex items-center justify-center font-bold">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span>Pantau persentase penyelesaian tugas per minggu.</span>
            </div>
          </div>

          <div className="relative z-10 bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-[#A3D9A5] shrink-0" />
            <p className="text-[11px] text-emerald-100/90 leading-snug font-medium">
              Data terenkripsi aman dan tersimpan secara privat di sistem.
            </p>
          </div>
        </div>

        {/* Register Form Side */}
        <div className="lg:col-span-7 p-8 lg:p-10 flex flex-col justify-between bg-white dark:bg-[#1C2A20]">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-emerald-100">Buat Akun Baru ✨</h3>
                <p className="text-xs text-gray-500 dark:text-emerald-300/60 font-medium mt-1">
                  Lengkapi identitas mahasiswa di bawah ini.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('Login')}
                className="text-xs font-bold text-[#3D5245] dark:text-emerald-400 hover:underline cursor-pointer"
              >
                Sudah ada akun?
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Nama Lengkap */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-emerald-200 mb-1">
                  Nama Lengkap *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-emerald-300/50" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="Contoh: Sarah Amelia"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-[#152219] border border-gray-200 dark:border-emerald-800/40 rounded-xl text-xs font-semibold text-gray-800 dark:text-emerald-100 outline-none focus:bg-white dark:focus:bg-[#18281D] focus:ring-2 focus:ring-[#2E4034]/20 transition-all"
                  />
                </div>
              </div>

              {/* NIM & Program Studi */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-emerald-200 mb-1">
                    NIM *
                  </label>
                  <div className="relative">
                    <GraduationCap className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-emerald-300/50" />
                    <input
                      type="text"
                      required
                      value={formData.nim}
                      onChange={(e) => handleChange('nim', e.target.value)}
                      placeholder="3312201045"
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-[#152219] border border-gray-200 dark:border-emerald-800/40 rounded-xl text-xs font-semibold text-gray-800 dark:text-emerald-100 outline-none focus:bg-white dark:focus:bg-[#18281D] focus:ring-2 focus:ring-[#2E4034]/20 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-emerald-200 mb-1">
                    Program Studi
                  </label>
                  <input
                    type="text"
                    value={formData.prodi}
                    onChange={(e) => handleChange('prodi', e.target.value)}
                    placeholder="D4 Rekayasa Perangkat Lunak"
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#152219] border border-gray-200 dark:border-emerald-800/40 rounded-xl text-xs font-semibold text-gray-800 dark:text-emerald-100 outline-none focus:bg-white dark:focus:bg-[#18281D] focus:ring-2 focus:ring-[#2E4034]/20 transition-all"
                  />
                </div>
              </div>

              {/* Email Student */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-emerald-200 mb-1">
                  Email Student *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-emerald-300/50" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="sarah@student.polibatam.ac.id"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-[#152219] border border-gray-200 dark:border-emerald-800/40 rounded-xl text-xs font-semibold text-gray-800 dark:text-emerald-100 outline-none focus:bg-white dark:focus:bg-[#18281D] focus:ring-2 focus:ring-[#2E4034]/20 transition-all"
                  />
                </div>
              </div>

              {/* Password & Password Confirmation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-emerald-200 mb-1">
                    Kata Sandi *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-emerald-300/50" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      placeholder="Min. 6 Karakter"
                      className="w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-[#152219] border border-gray-200 dark:border-emerald-800/40 rounded-xl text-xs font-semibold text-gray-800 dark:text-emerald-100 outline-none focus:bg-white dark:focus:bg-[#18281D] focus:ring-2 focus:ring-[#2E4034]/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-emerald-300/50 hover:text-gray-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-emerald-200 mb-1">
                    Konfirmasi Sandi *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-emerald-300/50" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password_confirmation}
                      onChange={(e) => handleChange('password_confirmation', e.target.value)}
                      placeholder="Ulangi Sandi"
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-[#152219] border border-gray-200 dark:border-emerald-800/40 rounded-xl text-xs font-semibold text-gray-800 dark:text-emerald-100 outline-none focus:bg-white dark:focus:bg-[#18281D] focus:ring-2 focus:ring-[#2E4034]/20 transition-all"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#2E4034] dark:bg-emerald-800 hover:bg-[#233328] dark:hover:bg-emerald-700 active:scale-[0.99] text-white font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-[#2E4034]/20 mt-3 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Mendaftarkan Akun...</span>
                  </div>
                ) : (
                  <>
                    <span>Daftar Akun Sekarang</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-emerald-900/30 flex items-center justify-between text-xs text-gray-500 dark:text-emerald-300/50 font-medium">
            <span>&copy; 2026 TugasKu Polibatam</span>
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('Login')}
              className="text-[#2E4034] dark:text-emerald-400 font-bold hover:underline cursor-pointer"
            >
              Sudah punya akun? Masuk
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}