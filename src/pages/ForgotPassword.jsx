import { useEffect, useState } from 'react';
import {
  Mail,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Check,
  Loader2,
  MailCheck,
} from 'lucide-react';
import api from '../api/axios';
import Logo from '../assets/Logo.png';

// Backend membatasi 3 permintaan / menit per (IP + email), jadi frontend
// ikut menerapkan cooldown agar tombol "Kirim Ulang" tidak memicu HTTP 429.
const RESEND_COOLDOWN_SECONDS = 60;

export default function ForgotPassword({ onNavigate }) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [cooldown, setCooldown] = useState(0);

  // Hitung mundur tombol kirim ulang.
  useEffect(() => {
    if (cooldown <= 0) return undefined;

    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email.trim()) {
      setErrorMessage('Harap isi alamat email kamu.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post('/forgot-password', {
        email: email.trim(),
      });

      setIsLoading(false);
      setCooldown(RESEND_COOLDOWN_SECONDS);
      setSuccessMessage(
        response.data.message ||
          'Jika email tersebut terdaftar, tautan reset password akan dikirim ke inbox kamu.'
      );
    } catch (error) {
      setIsLoading(false);

      // 429 = rate limit backend tercapai; aktifkan cooldown sesuai Retry-After.
      if (error.response?.status === 429) {
        const retryAfter = Number(error.response.headers?.['retry-after']);
        setCooldown(Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter : RESEND_COOLDOWN_SECONDS);
        setErrorMessage(
          'Terlalu banyak permintaan. Silakan coba lagi dalam beberapa saat lagi.'
        );
        return;
      }

      setErrorMessage(
        error.response?.data?.message ||
          error.response?.data?.errors?.email?.[0] ||
          'Gagal mengirim tautan reset password. Silakan coba lagi beberapa saat lagi.'
      );
    }
  };

  // Kembali ke formulir untuk mengirim ulang (ke email lain atau email yang sama).
  const handleResend = () => {
    setSuccessMessage('');
    setErrorMessage('');
    setEmail('');
    setCooldown(RESEND_COOLDOWN_SECONDS);
  };

  return (
    <div className="min-h-screen bg-[#EBF0EC] dark:bg-[#121E16] font-sans antialiased text-gray-800 dark:text-emerald-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 transition-colors duration-200">
      <div className="w-full max-w-5xl bg-white dark:bg-[#1C2A20] rounded-3xl border border-emerald-900/10 dark:border-emerald-800/30 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[620px] transition-colors">

        {/* Sisi Kiri: Visual Branding */}
        <div className="lg:col-span-5 bg-[#2E4034] dark:bg-[#152219] text-white p-8 lg:p-10 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-16 -bottom-16 w-72 h-72 rounded-full bg-[#4E6756]/40 dark:bg-emerald-900/30 blur-2xl pointer-events-none"></div>
          <div className="absolute -left-16 -top-16 w-56 h-56 rounded-full bg-[#A3D9A5]/10 dark:bg-emerald-500/10 blur-xl pointer-events-none"></div>

          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 dark:bg-emerald-950/40 backdrop-blur-md rounded-2xl border border-white/10 dark:border-emerald-800/30 shadow-inner">
                <img src={Logo} alt="Logo TugasKu" className="w-10 h-10 object-contain rounded-xl" />
              </div>
              <div>
                <h1 className="font-black text-2xl leading-tight text-white tracking-tight">TugasKu</h1>
                <p className="text-xs text-emerald-300/90 font-medium tracking-wide">Polibatam Edition</p>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <span className="bg-[#A3D9A5]/20 text-[#A3D9A5] text-[11px] font-bold px-3.5 py-1.5 rounded-full inline-flex items-center gap-2 border border-[#A3D9A5]/30">
                <span className="w-2 h-2 rounded-full bg-[#A3D9A5] animate-pulse"></span>
                PEMULIHAN AKUN
              </span>
              <h2 className="text-2xl lg:text-3xl font-black text-white leading-tight tracking-tight">
                Lupa Kata Sandi? Tenang.
              </h2>
              <p className="text-xs text-emerald-100/80 dark:text-emerald-300/70 leading-relaxed font-normal">
                Masukkan email yang kamu gunakan saat mendaftar. Kami akan mengirim tautan untuk mengatur ulang kata sandi.
              </p>
            </div>
          </div>

          <div className="relative z-10 space-y-3.5 my-8 pt-6 border-t border-emerald-700/40 dark:border-emerald-800/50">
            <div className="flex items-start gap-3 text-xs text-emerald-100/90 dark:text-emerald-200/90 font-medium">
              <div className="w-5 h-5 rounded-full bg-[#A3D9A5] dark:bg-emerald-600 text-[#1E3023] dark:text-white flex items-center justify-center shrink-0 mt-0.5 font-bold shadow-xs">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span>Tautan reset berlaku selama 60 menit.</span>
            </div>
            <div className="flex items-start gap-3 text-xs text-emerald-100/90 dark:text-emerald-200/90 font-medium">
              <div className="w-5 h-5 rounded-full bg-[#A3D9A5] dark:bg-emerald-600 text-[#1E3023] dark:text-white flex items-center justify-center shrink-0 mt-0.5 font-bold shadow-xs">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span>Tautan hanya bisa dipakai satu kali.</span>
            </div>
          </div>

          <div className="relative z-10 bg-white/10 dark:bg-emerald-950/40 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 dark:border-emerald-800/30 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-[#A3D9A5] dark:text-emerald-400 shrink-0" />
            <p className="text-[11px] text-emerald-100/90 dark:text-emerald-200/80 leading-snug font-medium">
              Data terenkripsi aman dan tersimpan secara privat di sistem.
            </p>
          </div>
        </div>

        {/* Sisi Kanan: Form Lupa Password */}
        <div className="lg:col-span-7 p-8 lg:p-12 flex flex-col justify-between bg-white dark:bg-[#1C2A20] transition-colors">
          <div>
            <div className="mb-8">
              <h3 className="text-2xl font-black text-gray-900 dark:text-emerald-100 tracking-tight">Atur Ulang Kata Sandi</h3>
              <p className="text-xs text-gray-500 dark:text-emerald-300/60 font-medium mt-1">
                Kami akan mengirim tautan reset ke email terdaftar kamu.
              </p>
            </div>

            {successMessage ? (
              <div className="space-y-5">
                <div className="bg-[#EBF7EC] dark:bg-emerald-950/50 border border-emerald-900/10 dark:border-emerald-800/40 rounded-2xl p-5 flex items-start gap-3">
                  <MailCheck className="w-5 h-5 text-[#2E4034] dark:text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-[#2E4034] dark:text-emerald-200 font-semibold leading-relaxed">
                    {successMessage}
                  </p>
                </div>

                <p className="text-xs text-gray-500 dark:text-emerald-300/60 font-medium leading-relaxed">
                  Belum menerima email? Periksa folder spam atau coba kirim ulang dalam beberapa saat lagi.
                </p>

                <button
                  type="button"
                  onClick={handleResend}
                  disabled={cooldown > 0}
                  className="w-full bg-[#EBF7EC] dark:bg-emerald-950/60 text-[#2E4034] dark:text-emerald-300 hover:bg-[#D8F0DC] text-xs font-bold py-3 px-6 rounded-2xl border border-emerald-900/10 dark:border-emerald-800/40 transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {cooldown > 0
                    ? `Kirim Ulang dalam ${cooldown} detik`
                    : 'Kirim Ulang ke Email Lain'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 my-6">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-emerald-200 mb-1.5">
                    Email Student *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-emerald-300/50" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@polibatam.ac.id"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-[#152219] border border-gray-200 dark:border-emerald-800/40 rounded-xl text-xs font-semibold text-gray-800 dark:text-emerald-100 outline-none focus:bg-white dark:focus:bg-[#18281D] focus:ring-2 focus:ring-[#2E4034]/20 dark:focus:border-emerald-500 transition-all placeholder:text-gray-400 dark:placeholder:text-emerald-300/40"
                    />
                  </div>
                </div>

                {errorMessage && (
                  <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl px-3.5 py-3">
                    <p className="text-xs font-semibold text-red-600 dark:text-red-400">{errorMessage}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#2E4034] dark:bg-emerald-800 hover:bg-[#233328] dark:hover:bg-emerald-700 active:scale-[0.99] text-white font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-[#2E4034]/20 mt-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Mengirim Tautan...</span>
                    </div>
                  ) : (
                    <>
                      <span>Kirim Tautan Reset</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          <div className="pt-6 border-t border-gray-100 dark:border-emerald-900/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500 dark:text-emerald-300/50 font-medium">
            <span>Ingat kata sandimu?</span>
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('Login')}
              className="text-[#2E4034] dark:text-emerald-400 font-bold hover:underline cursor-pointer inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Kembali ke Halaman Masuk
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
