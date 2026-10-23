import { useState, useEffect } from 'react';
import {
  RotateCw,
  Plus,
  AlertTriangle,
  Clock,
  Calendar as CalendarIcon,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  GraduationCap,
  MapPin,
  Building2,
  Award,
  BookOpen,
  User,
  Sparkles,
  Info,
  CheckSquare,
  BellDot,
  Loader2,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import MiniCalendar from '../components/MiniCalendar';
import TaskForm from '../components/TaskForm';
import api from '../api/axios';

export default function Beranda({ onNavigate, onLogout }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [summary, setSummary] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [user, setUser] = useState(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [s, t] = await Promise.all([
          api.get('/dashboard/summary'),
          api.get('/tugas'),
        ]);
        if (mounted) {
          setSummary(s.data || {});
          setTasks(t.data || []);
        }
      } catch (error) {
        if (mounted) {
          setSummary({ total_tugas: 0, terlambat: 0, hari_ini: 0, selesai: 0, persentase_selesai: 0 });
          setTasks([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();

    // Muat data user dari localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser && mounted) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Gagal parse user data:', e);
      }
    }

    return () => {
      mounted = false;
    };
  }, [refreshKey]);

  const urgentTasks = tasks.filter((t) => t.status !== 'Selesai').slice(0, 3);
  const selesaiCount = summary?.selesai || 0;
  const totalCount = summary?.total_tugas || 1;
  const percentage = summary?.persentase_selesai ?? Math.round((selesaiCount / totalCount) * 100);

  const handleComplete = async (id) => {
    try {
      await api.patch(`/tugas/${id}/complete`);
      setRefreshKey((k) => k + 1);
    } catch (e) {
      alert('Gagal memperbarui status tugas.');
    }
  };

  // Format tanggal hari ini dalam Bahasa Indonesia
  const todayFormatted = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="flex min-h-screen bg-[#F0F4F1] dark:bg-[#121E16] font-sans antialiased text-gray-800 dark:text-emerald-100 transition-colors duration-200">
      {/* Sidebar Navigation */}
      <Sidebar
        activePage="Beranda"
        onNavigate={onNavigate}
        onLogout={onLogout}
        onOpenTambahTugas={() => setIsModalOpen(true)}
        user={user}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onNavigate={onNavigate} user={user} />

        <main className="p-6 lg:p-8 max-w-[1400px] mx-auto w-full space-y-6">
          
          <div className="grid grid-cols-12 gap-6">
            
            {/* ================= KOLOM KIRI (8/12) ================= */}
            <div className="col-span-12 lg:col-span-8 space-y-6">
              
              {/* 1. Banner Menyapa */}
              <div className="bg-[#3D5245] dark:bg-[#1C2A20] text-white p-6 sm:p-8 rounded-3xl relative overflow-hidden shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 border border-transparent dark:border-emerald-800/30">
                <div className="space-y-2 relative z-10 max-w-xl">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-300 animate-pulse" />
                    <span className="text-xs font-bold text-emerald-200 uppercase tracking-wider">
                      {todayFormatted}
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                    Halo, {user?.name || 'Mahasiswa'}!
                  </h1>
                  <p className="text-xs text-emerald-100/80 font-medium leading-relaxed">
                    Ini ringkasan tugas akademikmu hari ini di Polibatam. Kelola waktu dengan tenang dan jangan biarkan deadline menumpuk.
                  </p>
                </div>

                <div className="flex items-center gap-2.5 relative z-10 shrink-0">
                  <button
                    type="button"
                    onClick={() => setRefreshKey((k) => k + 1)}
                    className="bg-[#4E6756] hover:bg-[#5C7865] dark:bg-emerald-900/60 dark:hover:bg-emerald-900 text-emerald-100 font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 transition cursor-pointer text-xs shadow-inner"
                  >
                    <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    <span>Sinkron E-Learn</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="bg-[#A3D9A5] hover:bg-[#8EC890] dark:bg-emerald-600 dark:hover:bg-emerald-500 text-[#1E3023] dark:text-white font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 transition cursor-pointer text-xs shadow-md"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>Tugas Baru</span>
                  </button>
                </div>
              </div>

              {/* 2. Grid 4 Stat Card */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                {/* Card 1: Terlambat */}
                <div className="bg-white dark:bg-[#1C2A20] p-4.5 rounded-2xl border border-emerald-900/10 dark:border-emerald-800/30 shadow-2xs space-y-1 transition-colors">
                  <span className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider block">
                    PERLU TINDAKAN
                  </span>
                  <h4 className="text-xs font-bold text-gray-500 dark:text-emerald-300/60">Terlambat</h4>
                  <p className="text-2xl font-black text-red-600 dark:text-red-400">
                    {loading ? '-' : summary?.terlambat ?? 0}
                  </p>
                  <p className="text-[10px] text-gray-400 dark:text-emerald-300/40 font-medium">tugas terlewat</p>
                </div>

                {/* Card 2: Hari Ini */}
                <div className="bg-white dark:bg-[#1C2A20] p-4.5 rounded-2xl border border-emerald-900/10 dark:border-emerald-800/30 shadow-2xs space-y-1 transition-colors">
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
                    MENDESAK
                  </span>
                  <h4 className="text-xs font-bold text-gray-500 dark:text-emerald-300/60">Hari Ini</h4>
                  <p className="text-2xl font-black text-amber-600 dark:text-amber-400">
                    {loading ? '-' : summary?.hari_ini ?? 0}
                  </p>
                  <p className="text-[10px] text-gray-400 dark:text-emerald-300/40 font-medium">Tenggat pukul 23:59 WIB</p>
                </div>

                {/* Card 3: Total */}
                <div className="bg-white dark:bg-[#1C2A20] p-4.5 rounded-2xl border border-emerald-900/10 dark:border-emerald-800/30 shadow-2xs space-y-1 transition-colors">
                  <span className="text-[10px] font-bold text-gray-400 dark:text-emerald-300/60 uppercase tracking-wider block">
                    TOTAL TUGAS
                  </span>
                  <h4 className="text-xs font-bold text-gray-500 dark:text-emerald-300/60">Semua Tugas</h4>
                  <p className="text-2xl font-black text-gray-900 dark:text-emerald-100">
                    {loading ? '-' : summary?.total_tugas ?? 0}
                  </p>
                  <p className="text-[10px] text-gray-400 dark:text-emerald-300/40 font-medium">D4 Rekayasa Perangkat Lunak</p>
                </div>

                {/* Card 4: Selesai */}
                <div className="bg-white dark:bg-[#1C2A20] p-4.5 rounded-2xl border border-emerald-900/10 dark:border-emerald-800/30 shadow-2xs space-y-1 transition-colors">
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                    PENCAPAIAN
                  </span>
                  <h4 className="text-xs font-bold text-gray-500 dark:text-emerald-300/60">Sudah Selesai</h4>
                  <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300">
                    {loading ? '-' : summary?.selesai ?? 0}
                  </p>
                  <p className="text-[10px] text-gray-400 dark:text-emerald-300/40 font-medium">telah diserahkan</p>
                </div>
              </div>

              {/* 3. Perlu Perhatian Segera */}
              <div className="bg-white dark:bg-[#1C2A20] p-6 rounded-3xl border border-emerald-900/10 dark:border-emerald-800/30 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <h3 className="font-extrabold text-base text-gray-900 dark:text-emerald-100">
                      Perlu Perhatian Segera
                    </h3>
                    <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-md">
                      {urgentTasks.length} Tugas Prioritas
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onNavigate && onNavigate('Daftar Tugas')}
                    className="text-xs font-bold text-[#3D5245] dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Lihat Semua Tugas</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-3">
                  {loading ? (
                    <div className="p-8 text-center text-xs font-medium text-gray-400 dark:text-emerald-300/50 flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-[#3D5245] dark:text-emerald-400" />
                      <span>Memuat data tugas...</span>
                    </div>
                  ) : urgentTasks.length === 0 ? (
                    <div className="p-6 bg-[#F4F7F4] dark:bg-emerald-950/30 rounded-2xl border border-emerald-900/10 dark:border-emerald-800/30 text-center text-xs font-semibold text-gray-500 dark:text-emerald-300/60">
                      Tidak ada tugas mendesak saat ini. Kerja bagus!
                    </div>
                  ) : (
                    urgentTasks.map((tugas) => (
                      <div
                        key={tugas.id}
                        className="p-4 rounded-2xl bg-[#F4F7F4] dark:bg-emerald-950/40 border border-emerald-900/10 dark:border-emerald-800/30 hover:border-emerald-300 dark:hover:border-emerald-600 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-[#2E4034] dark:text-emerald-300 bg-white dark:bg-[#152219] px-2 py-0.5 rounded-md border border-gray-200 dark:border-emerald-800/40">
                              {tugas.mata_kuliah?.nama_matkul || 'Mata Kuliah'}
                            </span>
                            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-md">
                              {tugas.status}
                            </span>
                            <span className="text-xs text-gray-400 dark:text-emerald-300/50 font-medium flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {tugas.deadline_date} ({tugas.deadline_time || '23:59'})
                            </span>
                          </div>
                          <h4 className="font-extrabold text-sm text-gray-900 dark:text-emerald-100">
                            {tugas.nama_tugas}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-emerald-300/60 font-medium">
                            Dosen: {tugas.dosen || 'Dosen Pengampu'}
                          </p>
                          {tugas.catatan && (
                            <p className="text-[11px] text-gray-600 dark:text-emerald-300/70 italic bg-white/60 dark:bg-[#152219]/60 p-2 rounded-xl mt-1">
                              Catatan: {tugas.catatan}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
                          {tugas.link_elearning && (
                            <a
                              href={tugas.link_elearning.startsWith('http') ? tugas.link_elearning : `https://${tugas.link_elearning}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs font-bold text-gray-700 dark:text-emerald-200 bg-white dark:bg-[#152219] border border-gray-200 dark:border-emerald-800/40 hover:bg-gray-50 px-3 py-1.5 rounded-xl flex items-center gap-1 transition"
                            >
                              <span>E-Learn</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => handleComplete(tugas.id)}
                            className="text-xs font-bold text-[#3D5245] dark:text-emerald-300 bg-[#EBF7EC] dark:bg-emerald-950/80 hover:bg-emerald-100 border border-[#D6ECD8] dark:border-emerald-800/40 px-3 py-1.5 rounded-xl flex items-center gap-1 transition cursor-pointer"
                          >
                            <span>Tandai Selesai ✓</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* 4. Progres Tugas Minggu Ini */}
              <div className="bg-white dark:bg-[#1C2A20] p-6 rounded-3xl border border-emerald-900/10 dark:border-emerald-800/30 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-base text-gray-900 dark:text-emerald-100 flex items-center gap-2">
                      <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Progres Tugas Minggu Ini</span>
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-emerald-300/60 font-medium mt-0.5">
                      Periode {new Date().toLocaleDateString('id-ID', { day: 'numeric' })} - {new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <span className="text-xl font-black text-[#3D5245] dark:text-emerald-300">
                    {percentage}%
                  </span>
                </div>

                <div className="w-full bg-gray-100 dark:bg-emerald-950/80 h-3 rounded-full overflow-hidden p-0.5 border border-gray-200/50 dark:border-emerald-800/40">
                  <div
                    className="bg-[#3D5245] dark:bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>

                <p className="text-xs text-gray-500 dark:text-emerald-300/60 font-medium">
                  <strong>{selesaiCount}</strong> tugas terselesaikan. Sisa <strong>{Math.max(0, totalCount - selesaiCount)}</strong> tugas lagi yang perlu diserahkan pada periode ini.
                </p>
              </div>

              {/* 5. Portal Pembelajaran Banner */}
              <div className="bg-[#EBF7EC] dark:bg-emerald-950/40 border border-[#D6ECD8] dark:border-emerald-800/40 p-6 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[#2E4034] dark:text-emerald-300 text-xs font-bold">
                    <BookOpen className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                    <span>Portal Pembelajaran</span>
                  </div>
                  <h4 className="font-extrabold text-sm text-gray-900 dark:text-emerald-100">
                    Akses Cepat Polibatam Learning Center
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-emerald-300/70 font-medium leading-relaxed max-w-lg">
                    Periksa materi kuliah terbaru, ruang kuis daring, dan rekaman kelas praktikum tanpa login ulang. Pastikan Anda terhubung dengan SSO Polibatam.
                  </p>
                </div>

                <a
                  href="https://elearning.polibatam.ac.id"
                  target="_blank"
                  rel="noreferrer"
                  className="bg-[#3D5245] dark:bg-emerald-800 hover:bg-[#2F4036] text-white text-xs font-bold px-4.5 py-2.5 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer shrink-0 shadow-xs"
                >
                  <span>Buka Learning Hub</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

            </div>

            {/* ================= KOLOM KANAN (4/12) ================= */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
              
              {/* Mini Calendar Widget */}
              <MiniCalendar />

              {/* Jadwal Kuliah Hari Ini */}
              <div className="bg-white dark:bg-[#1C2A20] p-6 rounded-3xl border border-emerald-900/10 dark:border-emerald-800/30 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-[#3D5245] dark:text-emerald-400" />
                    <h3 className="font-extrabold text-base text-gray-900 dark:text-emerald-100">
                      Jadwal Kuliah
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 dark:text-emerald-300/50">
                    2 Sesi Hari Ini
                  </span>
                </div>

                <div className="space-y-3">
                  {/* Sesi 1 */}
                  <div className="p-3.5 bg-[#F4F7F4] dark:bg-emerald-950/40 rounded-2xl border border-emerald-900/10 dark:border-emerald-800/30 flex items-start gap-3">
                    <div className="bg-[#3D5245] text-white p-2 rounded-xl text-center shrink-0 w-12">
                      <span className="text-xs font-black block">08:00</span>
                      <span className="text-[9px] font-bold block opacity-80">WIB</span>
                    </div>
                    <div className="space-y-0.5 overflow-hidden">
                      <span className="text-[9px] font-extrabold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-md inline-block">
                        Selesai
                      </span>
                      <h5 className="font-extrabold text-xs text-gray-900 dark:text-emerald-100 truncate">
                        Praktikum Pemrograman Web Lanjut (IF-4B)
                      </h5>
                      <p className="text-[11px] text-gray-500 dark:text-emerald-300/60 font-medium flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                        <span>Lab Komputer 302 (Gedung TI)</span>
                      </p>
                    </div>
                  </div>

                  {/* Sesi 2 */}
                  <div className="p-3.5 bg-[#F4F7F4] dark:bg-emerald-950/40 rounded-2xl border border-emerald-900/10 dark:border-emerald-800/30 flex items-start gap-3">
                    <div className="bg-[#3D5245] text-white p-2 rounded-xl text-center shrink-0 w-12">
                      <span className="text-xs font-black block">13:00</span>
                      <span className="text-[9px] font-bold block opacity-80">WIB</span>
                    </div>
                    <div className="space-y-0.5 overflow-hidden">
                      <span className="text-[9px] font-extrabold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/80 px-2 py-0.5 rounded-md inline-block">
                        Sesi Berikutnya
                      </span>
                      <h5 className="font-extrabold text-xs text-gray-900 dark:text-emerald-100 truncate">
                        Rekayasa Perangkat Lunak (IF-4B)
                      </h5>
                      <p className="text-[11px] text-gray-500 dark:text-emerald-300/60 font-medium flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                        <span>Ruang Teori 4.2 (Gedung Utama)</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Kabar Baik Card */}
              <div className="bg-[#3D5245] dark:bg-[#1C2A20] text-white p-6 rounded-3xl space-y-3 relative overflow-hidden shadow-xs border border-transparent dark:border-emerald-800/30">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-300" />
                  <span className="text-xs font-bold text-emerald-200 uppercase tracking-wider">
                    Pembaruan Nilai
                  </span>
                </div>
                <h4 className="font-black text-lg">Kabar Baik!</h4>
                <p className="text-xs text-emerald-100/80 leading-relaxed font-medium">
                  Hore! 3 tugas praktikum mata kuliah Pemrograman Web minggu lalu sudah dinilai dengan skor A oleh dosen pengampu. Pertahankan ritme belajarmu!
                </p>
                <button
                  type="button"
                  onClick={() => onNavigate && onNavigate('Mata Kuliah')}
                  className="bg-[#A3D9A5] dark:bg-emerald-700 hover:bg-[#8EC890] dark:hover:bg-emerald-600 text-[#1E3023] dark:text-emerald-100 font-bold px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-2xs"
                >
                  <span>Cek Nilai Lengkap</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>

          </div>

        </main>
      </div>

      {/* Modal Tambah Tugas Baru */}
      <TaskForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={() => {
          setIsModalOpen(false);
          setRefreshKey((k) => k + 1);
        }}
      />
    </div>
  );
}