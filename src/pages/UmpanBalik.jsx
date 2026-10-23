import { useState, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  Star,
  Upload,
  Check,
  Loader2,
  Bug,
  Lightbulb,
  Heart,
  HelpCircle,
  Paperclip,
  X,
  Sparkles,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import TaskForm from '../components/TaskForm';
import api from '../api/axios';

export default function UmpanBalik({ onNavigate, onLogout }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form State
  const [category, setCategory] = useState('saran'); // 'saran' | 'bug' | 'pujian' | 'lainnya'
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [attachment, setAttachment] = useState(null);

  // Sync user state dari localStorage & event listener update
  useEffect(() => {
    const loadUser = () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error('Gagal parse user data:', e);
        }
      }
    };
    loadUser();
    window.addEventListener('user-updated', loadUser);
    return () => window.removeEventListener('user-updated', loadUser);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      alert('Harap isi judul dan detail umpan balik.');
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('kategori', category);
      formData.append('rating', rating);
      formData.append('judul', subject);
      formData.append('pesan', message);
      if (attachment) {
        formData.append('lampiran', attachment);
      }

      await api.post('/umpan-balik', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setIsSuccess(true);
      setSubject('');
      setMessage('');
      setAttachment(null);
      setRating(5);
      setCategory('saran');

      setTimeout(() => setIsSuccess(false), 5000);
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || 'Gagal mengirim umpan balik. Silakan coba lagi.';
      alert(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };
  const categories = [
    {
      id: 'saran',
      label: 'Saran Fitur',
      icon: Lightbulb,
      color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800/40',
    },
    {
      id: 'bug',
      label: 'Laporan Bug',
      icon: Bug,
      color: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-800/40',
    },
    {
      id: 'pujian',
      label: 'Apresiasi',
      icon: Heart,
      color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800/40',
    },
    {
      id: 'lainnya',
      label: 'Lainnya',
      icon: HelpCircle,
      color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800/40',
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#F0F4F1] dark:bg-[#121E16] font-sans antialiased text-gray-800 dark:text-emerald-100 transition-colors duration-200">
      {/* Sidebar Navigation */}
      <Sidebar
        activePage="Umpan Balik"
        onNavigate={onNavigate}
        onLogout={onLogout}
        onOpenTambahTugas={() => setIsModalOpen(true)}
        user={user}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onNavigate={onNavigate} user={user} />

        <main className="p-6 lg:p-8 max-w-[1400px] mx-auto w-full space-y-6">
          
          {/* Header Title */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#1C2A20] p-6 rounded-3xl border border-emerald-900/10 dark:border-emerald-800/30 shadow-xs transition-colors">
            <div>
              <span className="text-[10px] font-bold tracking-wider text-[#3D5245] dark:text-emerald-400 uppercase flex items-center gap-1.5 mb-1">
                <span className="w-2 h-2 rounded-full bg-[#3D5245] dark:bg-emerald-400 animate-pulse"></span>
                PUSAT DUKUNGAN & MASUKAN
              </span>
              <h1 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-emerald-100 tracking-tight">
                Kirim Umpan Balik
              </h1>
              <p className="text-xs text-gray-500 dark:text-emerald-300/60 mt-1 font-medium max-w-xl leading-relaxed">
                Bantu kami mengembangkan TugasKu Polibatam Edition menjadi lebih baik dengan menyampaikan masukan, laporan kendala, atau ide fitur baru.
              </p>
            </div>

            <div className="bg-[#EBF7EC] dark:bg-emerald-950/60 border border-[#D6ECD8] dark:border-emerald-800/40 p-3.5 rounded-2xl flex items-center gap-3 shrink-0">
              <MessageSquare className="w-5 h-5 text-[#2E4034] dark:text-emerald-400" />
              <div className="text-xs">
                <p className="font-bold text-gray-900 dark:text-emerald-100">Respon Tim Dev</p>
                <p className="text-[11px] text-gray-500 dark:text-emerald-300/60">Estimasi 1x24 jam kerja</p>
              </div>
            </div>
          </div>

          {/* Banner Sukses saat Umpan Balik Terkirim */}
          {isSuccess && (
            <div className="p-4 bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 rounded-2xl flex items-center gap-3.5 text-emerald-900 dark:text-emerald-100 animate-in fade-in duration-300">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 font-bold">
                <Check className="w-5 h-5 stroke-[3]" />
              </div>
              <div>
                <h4 className="text-xs font-bold">Umpan Balik Berhasil Terkirim!</h4>
                <p className="text-[11px] text-emerald-800 dark:text-emerald-300/80 font-medium mt-0.5">
                  Terima kasih atas kontribusimu. Tim pengembang akan meninjau pesan kamu secepatnya.
                </p>
              </div>
            </div>
          )}

          {/* Form Card */}
          <div className="bg-white dark:bg-[#1C2A20] p-6 lg:p-8 rounded-3xl border border-emerald-900/10 dark:border-emerald-800/30 shadow-xs space-y-6 transition-colors">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* 1. Pilih Kategori Umpan Balik */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 dark:text-emerald-200">
                  Jenis Umpan Balik *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {categories.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#3D5245] dark:border-emerald-500 bg-[#EBF7EC] dark:bg-emerald-950/70 text-gray-900 dark:text-emerald-100 font-bold shadow-2xs'
                            : 'border-gray-200 dark:border-emerald-800/40 text-gray-600 dark:text-emerald-200 hover:bg-gray-50 dark:hover:bg-emerald-950/40'
                        }`}
                      >
                        <div className={`p-2 rounded-xl ${cat.color} shrink-0`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Rating Kepuasan */}
              <div className="p-5 bg-[#F4F7F4] dark:bg-emerald-950/40 border border-emerald-900/10 dark:border-emerald-800/30 rounded-2xl space-y-2">
                <div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-emerald-100">Penilaian Pengalaman Penggunaan</h4>
                  <p className="text-[11px] text-gray-500 dark:text-emerald-300/60 font-medium">
                    Seberapa puas kamu dengan performa aplikasi TugasKu saat ini?
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 transition-transform hover:scale-110 cursor-pointer"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= (hoverRating || rating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-gray-300 dark:text-emerald-800/60'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-black text-gray-700 dark:text-emerald-200 ml-2">
                    {(hoverRating || rating)}.0 / 5.0
                  </span>
                </div>
              </div>

              {/* 3. Judul Umpan Balik */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 dark:text-emerald-200">
                  Judul Ringkas *
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Contoh: Usulan integrasi jadwal dengan Google Calendar"
                  className="w-full px-4 py-2.5 bg-[#F4F7F4] dark:bg-[#152219] border border-emerald-900/10 dark:border-emerald-800/40 focus:border-[#3D5245] dark:focus:border-emerald-500 focus:bg-white dark:focus:bg-[#18281D] rounded-xl text-xs font-semibold text-gray-800 dark:text-emerald-100 outline-none focus:ring-2 focus:ring-[#3D5245]/20 transition-all placeholder:text-gray-400 dark:placeholder:text-emerald-300/40"
                />
              </div>

              {/* 4. Detail Pesan */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 dark:text-emerald-200">
                  Detail Pesan & Penjelasan *
                </label>
                <textarea
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tuliskan masukan, kronologi kendala, atau penjelasan fitur yang diharapkan..."
                  className="w-full p-4 bg-[#F4F7F4] dark:bg-[#152219] border border-emerald-900/10 dark:border-emerald-800/40 focus:border-[#3D5245] dark:focus:border-emerald-500 focus:bg-white dark:focus:bg-[#18281D] rounded-2xl text-xs font-semibold text-gray-800 dark:text-emerald-100 outline-none focus:ring-2 focus:ring-[#3D5245]/20 transition-all placeholder:text-gray-400 dark:placeholder:text-emerald-300/40 resize-none leading-relaxed"
                />
              </div>

              {/* 5. Lampiran File (Tangkapan Layar) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 dark:text-emerald-200">
                  Lampiran Tangkapan Layar (Opsional)
                </label>

                {attachment ? (
                  <div className="p-3 bg-[#F4F7F4] dark:bg-[#152219] border border-emerald-900/10 dark:border-emerald-800/40 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <Paperclip className="w-4 h-4 text-[#3D5245] dark:text-emerald-400 shrink-0" />
                      <span className="font-bold text-gray-800 dark:text-emerald-100 truncate">{attachment.name}</span>
                      <span className="text-[10px] text-gray-400 dark:text-emerald-300/50 shrink-0">
                        ({(attachment.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAttachment(null)}
                      className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 p-1 rounded-lg transition cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      type="file"
                      id="attachment-file-input"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setAttachment(file);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => document.getElementById('attachment-file-input')?.click()}
                      className="w-full p-4 bg-[#F4F7F4] dark:bg-[#152219] border border-dashed border-emerald-900/20 dark:border-emerald-800/50 hover:border-[#3D5245] dark:hover:border-emerald-500 rounded-2xl text-xs font-semibold text-gray-600 dark:text-emerald-200 flex items-center justify-center gap-2 transition cursor-pointer"
                    >
                      <Upload className="w-4 h-4 text-gray-400 dark:text-emerald-300/50" />
                      <span>Pilih Berkas / Foto Screenshot (Maksimal 5MB)</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full sm:w-auto bg-[#3D5245] hover:bg-[#2F4036] dark:bg-emerald-800 dark:hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold px-6 py-3.5 rounded-2xl flex items-center justify-center gap-2 transition cursor-pointer shadow-md shadow-[#3D5245]/20 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-300" />
                      <span>Mengirim Masukan...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-emerald-200" />
                      <span>Kirim Umpan Balik</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>

        </main>
      </div>

      {/* Modal Tambah Tugas Baru */}
      <TaskForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}