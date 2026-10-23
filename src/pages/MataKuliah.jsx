import { useState, useEffect } from 'react';
import {
  Plus,
  BookOpen,
  RotateCw,
  Trash2,
  MapPin,
  ChevronRight,
  Loader2,
  GraduationCap
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import TaskForm from '../components/TaskForm';
import CourseForm from '../components/CourseForm';
import api from '../api/axios';

export default function MataKuliah({ onNavigate, onLogout }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCourseFormOpen, setIsCourseFormOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Sync user state dari localStorage & event update
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

  // Fetch Data Mata Kuliah & Tugas
  useEffect(() => {
    let mounted = true;
    setLoading(true);

    Promise.all([
      api.get('/mata-kuliah'),
      api.get('/tugas'),
    ])
      .then(([mkRes, tRes]) => {
        if (!mounted) return;
        const mk = mkRes.data || [];
        const tugas = tRes.data || [];

        const formattedCourses = mk.map((m) => {
          const mkTugas = tugas.filter((t) => t.mata_kuliah_id === m.id);
          const total = mkTugas.length;
          const selesai = mkTugas.filter((t) => t.status === 'Selesai').length;
          
          let badge = 'Belum Ada Tugas';
          let badgeType = 'neutral';

          if (total === 0) {
            badge = 'Belum Ada Tugas';
            badgeType = 'neutral';
          } else if (selesai === total) {
            badge = 'Semua Beres';
            badgeType = 'success';
          } else {
            const late = mkTugas.some((t) => t.status === 'Terlambat');
            const today = mkTugas.some((t) => t.status === 'Hari Ini');
            if (late) {
              badge = 'Tugas Terlambat';
              badgeType = 'danger';
            } else if (today) {
              badge = 'Deadline Hari Ini';
              badgeType = 'warning';
            } else {
              badge = 'Tugas Mendatang';
              badgeType = 'info';
            }
          }

          const activeTask = mkTugas.find((t) => t.status !== 'Selesai');

          return {
            id: m.id,
            code: m.kode_matkul,
            sks: `${m.sks} SKS`,
            badge,
            badgeType,
            title: m.nama_matkul,
            category: m.kategori || 'Wajib',
            lecturer: m.dosen_pengampu || 'Dosen Pengampu',
            activeTaskLabel: 'Tugas Aktif',
            activeTaskTitle: activeTask ? activeTask.nama_tugas : 'Tidak ada tugas aktif',
            completed: selesai,
            total,
            percentage: total > 0 ? Math.round((selesai / total) * 100) : 0,
            location: m.ruangan || 'Gedung Utama',
          };
        });

        setCourses(formattedCourses);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Gagal mengambil data mata kuliah:', err);
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [refreshKey]);

  const handleDeleteCourse = async (id, namaMatkul) => {
    if (!window.confirm(`Yakin ingin menghapus mata kuliah "${namaMatkul}"? Semua tugas terkait juga akan dihapus.`)) return;
    try {
      await api.delete(`/mata-kuliah/${id}`);
      setRefreshKey((k) => k + 1);
    } catch (e) {
      alert('Gagal menghapus mata kuliah.');
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F0F4F1] dark:bg-[#121E16] font-sans antialiased text-gray-800 dark:text-emerald-100 transition-colors duration-200">
      {/* Sidebar Navigation */}
      <Sidebar
        activePage="Mata Kuliah"
        onNavigate={onNavigate}
        onLogout={onLogout}
        onOpenTambahTugas={() => setIsModalOpen(true)}
        user={user}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onNavigate={onNavigate} user={user} />

        <main className="p-6 lg:p-8 max-w-[1400px] mx-auto w-full space-y-6">
          
          {/* Header Title & Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#1C2A20] p-6 rounded-3xl border border-emerald-900/10 dark:border-emerald-800/30 shadow-xs transition-colors">
            <div>
              <span className="text-[10px] font-bold tracking-wider text-[#3D5245] dark:text-emerald-400 uppercase flex items-center gap-1.5 mb-1">
                <span className="w-2 h-2 rounded-full bg-[#3D5245] dark:bg-emerald-400 animate-pulse"></span>
                AKADEMIK AKTIF
              </span>
              <h1 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-emerald-100 tracking-tight">
                Mata Kuliah Semester Ini
              </h1>
              <p className="text-xs text-gray-500 dark:text-emerald-300/60 mt-1 font-medium">
                Semester Genap 2024/2025 • Program Studi D4 Rekayasa Perangkat Lunak Polibatam
              </p>
            </div>

            <button
              onClick={() => setIsCourseFormOpen(true)}
              className="bg-[#3D5245] hover:bg-[#2F4036] dark:bg-emerald-800 dark:hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold px-5 py-3 rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-[#3D5245]/20 shrink-0"
            >
              <Plus className="w-4 h-4 text-emerald-300 stroke-[3]" />
              <span>Tambah Mata Kuliah</span>
            </button>
          </div>

          {/* 5 Summary Cards Horizontal */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
            <div className="bg-white dark:bg-[#1C2A20] p-4.5 rounded-2xl border border-emerald-900/10 dark:border-emerald-800/30 shadow-2xs space-y-1 transition-colors">
              <span className="text-[10px] font-bold text-gray-400 dark:text-emerald-300/60 uppercase tracking-wider">Mata Kuliah</span>
              <h3 className="text-2xl font-black text-gray-900 dark:text-emerald-100">{courses.length}</h3>
              <p className="text-[11px] text-gray-500 dark:text-emerald-300/50 font-medium">Aktif Semester Ini</p>
            </div>

            <div className="bg-white dark:bg-[#1C2A20] p-4.5 rounded-2xl border border-emerald-900/10 dark:border-emerald-800/30 shadow-2xs space-y-1 transition-colors">
              <span className="text-[10px] font-bold text-gray-400 dark:text-emerald-300/60 uppercase tracking-wider">Total Tugas</span>
              <h3 className="text-2xl font-black text-gray-900 dark:text-emerald-100">
                {courses.reduce((acc, c) => acc + c.total, 0)}
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-emerald-300/50 font-medium">Semua Penugasan</p>
            </div>

            <div className="bg-white dark:bg-[#1C2A20] p-4.5 rounded-2xl border border-emerald-900/10 dark:border-emerald-800/30 shadow-2xs space-y-1 transition-colors">
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Tuntas</span>
              <h3 className="text-2xl font-black text-emerald-700 dark:text-emerald-300">
                {courses.reduce((acc, c) => acc + c.completed, 0)}
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-emerald-300/50 font-medium">Selesai Dikerjakan</p>
            </div>

            <div className="bg-white dark:bg-[#1C2A20] p-4.5 rounded-2xl border border-emerald-900/10 dark:border-emerald-800/30 shadow-2xs space-y-1 transition-colors">
              <span className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">Perlu Perhatian</span>
              <h3 className="text-2xl font-black text-red-600 dark:text-red-400">
                {courses.filter((c) => c.badgeType === 'danger').length}
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-emerald-300/50 font-medium">Ada Tugas Terlambat</p>
            </div>

            <div className="bg-white dark:bg-[#1C2A20] p-4.5 rounded-2xl border border-emerald-900/10 dark:border-emerald-800/30 shadow-2xs space-y-1 col-span-2 sm:col-span-1 transition-colors">
              <span className="text-[10px] font-bold text-[#3D5245] dark:text-emerald-400 uppercase tracking-wider">Penyelesaian</span>
              <h3 className="text-2xl font-black text-[#3D5245] dark:text-emerald-300">
                {courses.length > 0
                  ? Math.round((courses.reduce((acc, c) => acc + c.completed, 0) / (courses.reduce((acc, c) => acc + c.total, 0) || 1)) * 100) + '%'
                  : '0%'}
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-emerald-300/50 font-medium">Rata-rata progres</p>
            </div>
          </div>

          {/* Grid Kartu Mata Kuliah */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full bg-white dark:bg-[#1C2A20] p-12 rounded-3xl border border-emerald-900/10 dark:border-emerald-800/30 text-center flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 text-[#3D5245] dark:text-emerald-400 animate-spin" />
                <p className="text-xs font-semibold text-gray-500 dark:text-emerald-300/60">Memuat data mata kuliah & penugasan...</p>
              </div>
            ) : courses.length === 0 ? (
              <div className="col-span-full bg-white dark:bg-[#1C2A20] p-12 rounded-3xl border border-emerald-900/10 dark:border-emerald-800/30 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#EBF7EC] dark:bg-emerald-950/60 text-[#3D5245] dark:text-emerald-300 mx-auto flex items-center justify-center font-bold">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-emerald-100">Belum Ada Mata Kuliah</h4>
                  <p className="text-xs text-gray-500 dark:text-emerald-300/60 mt-0.5">Tambahkan mata kuliah baru untuk mulai mengorganisir tugas kamu.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCourseFormOpen(true)}
                  className="bg-[#3D5245] hover:bg-[#2F4036] dark:bg-emerald-800 dark:hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer"
                >
                  + Tambah Sekarang
                </button>
              </div>
            ) : (
              courses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white dark:bg-[#1C2A20] p-6 rounded-3xl border border-emerald-900/10 dark:border-emerald-800/30 shadow-xs flex flex-col justify-between space-y-5 relative overflow-hidden group hover:shadow-md transition-all duration-200"
                >
                  {/* Top Header Kartu */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-[#2E4034] dark:text-emerald-300 bg-[#EBF7EC] dark:bg-emerald-950/60 border border-[#D6ECD8] dark:border-emerald-800/40 px-2.5 py-1 rounded-lg">
                        {course.code}
                      </span>
                      <span className="text-xs font-bold text-gray-400 dark:text-emerald-300/60">
                        {course.sks}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                        course.badgeType === 'danger'
                          ? 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300'
                          : course.badgeType === 'warning'
                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                          : course.badgeType === 'info'
                          ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                          : course.badgeType === 'success'
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                          : 'bg-gray-100 dark:bg-emerald-950/40 text-gray-600 dark:text-emerald-300/60'
                      }`}
                    >
                      {course.badge}
                    </span>
                  </div>

                  {/* Judul & Detail Dosen + Tombol Hapus */}
                  <div className="space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-extrabold text-base text-gray-900 dark:text-emerald-100 leading-snug group-hover:text-[#3D5245] dark:group-hover:text-emerald-400 transition-colors">
                        {course.title}
                      </h3>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCourse(course.id, course.title);
                        }}
                        className="text-gray-300 dark:text-emerald-300/40 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 p-1.5 rounded-xl transition cursor-pointer shrink-0"
                        title="Hapus Mata Kuliah"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-emerald-300/60 font-medium flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-gray-400 dark:text-emerald-300/50 shrink-0" />
                      <span>{course.lecturer}</span>
                      <span className="text-gray-300 dark:text-emerald-800">•</span>
                      <span className="text-gray-400 dark:text-emerald-300/50">{course.category}</span>
                    </p>
                  </div>

                  {/* Content Box (Tugas Aktif) */}
                  <div className="bg-[#F4F7F4] dark:bg-emerald-950/40 p-3.5 rounded-2xl border border-emerald-900/10 dark:border-emerald-800/30 space-y-1">
                    <span className="text-[10px] font-bold text-[#3D5245] dark:text-emerald-400 uppercase tracking-wider">
                      {course.activeTaskLabel}
                    </span>
                    <p className="text-xs font-bold text-gray-800 dark:text-emerald-100 truncate">
                      {course.activeTaskTitle}
                    </p>
                  </div>

                  {/* Progress Perkuliahan */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-gray-500 dark:text-emerald-300/60">Kemajuan Tugas</span>
                      <span className="text-gray-900 dark:text-emerald-100 font-bold">
                        {course.completed} / {course.total} selesai ({course.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-emerald-950/80 h-2 rounded-full overflow-hidden p-0.5 border border-gray-200/50 dark:border-emerald-800/40">
                      <div
                        className="bg-[#3D5245] dark:bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${course.percentage}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Footer Kartu (Lokasi & Link Ke Tugas) */}
                  <div className="pt-3 border-t border-gray-100 dark:border-emerald-900/30 flex items-center justify-between text-xs">
                    <span className="text-gray-500 dark:text-emerald-300/60 flex items-center gap-1 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 dark:text-emerald-300/50" />
                      {course.location}
                    </span>
                    <button
                      type="button"
                      onClick={() => onNavigate && onNavigate('Daftar Tugas')}
                      className="font-bold text-[#3D5245] dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Lihat Tugas</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Bottom Banner Sync */}
          <div className="bg-[#3D5245] dark:bg-[#1C2A20] text-white p-6 rounded-3xl relative overflow-hidden shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 border border-transparent dark:border-emerald-800/30">
            <div className="space-y-1 relative z-10">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base">Polibatam Learning Hub Sync</h3>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-400/30">
                  Terhubung
                </span>
              </div>
              <p className="text-xs text-emerald-100/80 dark:text-emerald-300/70">
                Sinkronisasi Terakhir dengan Polibatam E-Learning: Hari ini
              </p>
            </div>

            <button
              type="button"
              onClick={() => setRefreshKey((k) => k + 1)}
              className="bg-[#A3D9A5] dark:bg-emerald-700 hover:bg-[#8EC890] dark:hover:bg-emerald-600 active:scale-95 text-[#1E3023] dark:text-emerald-100 font-bold px-4.5 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition cursor-pointer shrink-0 shadow-xs"
            >
              <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Sinkronkan Sekarang</span>
            </button>
          </div>

        </main>
      </div>

      {/* Modal Tambah Tugas */}
      <TaskForm
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setRefreshKey((k) => k + 1);
        }}
      />

      {/* Modal Tambah Mata Kuliah */}
      <CourseForm
        isOpen={isCourseFormOpen}
        onClose={() => {
          setIsCourseFormOpen(false);
          setRefreshKey((k) => k + 1);
        }}
        onCreated={() => {
          setRefreshKey((k) => k + 1);
        }}
      />
    </div>
  );
}