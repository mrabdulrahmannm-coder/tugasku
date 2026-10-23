import { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Clock,
  ExternalLink,
  Edit3,
  Trash2,
  Copy,
  X,
  Check,
  FileText,
  User,
  AlertTriangle,
  Calendar as CalendarIcon,
  CheckCircle2,
  BookOpen,
  Sparkles,
  Layers,
  GraduationCap,
  ShieldAlert,
  Hourglass,
  CheckSquare,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import TaskForm from '../components/TaskForm';
import api from '../api/axios';

export default function Kalendar({ onNavigate, onLogout }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('Bulan'); // 'Bulan' | 'Minggu' | 'Agenda'
  const [user, setUser] = useState(null);
  const [activeFilter, setActiveFilter] = useState('Semua');
  const [calendarTasks, setCalendarTasks] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isCopied, setIsCopied] = useState(false);
  const [currentDate, setCurrentDate] = useState(() => new Date());

  const fetchCalendarTasks = async () => {
    try {
      const res = await api.get('/tugas');
      setCalendarTasks((res.data || []).filter((t) => t.status !== 'Selesai'));
    } catch (e) {
      setCalendarTasks([]);
    }
  };

  useEffect(() => {
    fetchCalendarTasks();

    // Muat data user dari localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Gagal parse user data:', e);
      }
    }
  }, [refreshKey]);

  const handleCopyLink = () => {
    const linkToCopy =
      selectedTask?.link && selectedTask.link !== '-'
        ? selectedTask.link
        : 'https://elearning.polibatam.ac.id';
    navigator.clipboard.writeText(linkToCopy);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const filteredTasks = calendarTasks.filter((t) => {
    if (activeFilter === 'Semua') return true;
    const nama = (t.nama_tugas || '').toLowerCase();
    if (activeFilter === 'Praktikum') return nama.includes('praktikum') || nama.includes('prak');
    if (activeFilter === 'Kuis') return nama.includes('kuis');
    if (activeFilter === 'Tugas Teori') return nama.includes('tugas') || nama.includes('teori');
    return true;
  });

  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const firstDayOffset = (monthStart.getDay() + 6) % 7;
  const calendarDays = Array.from({ length: firstDayOffset + monthEnd.getDate() }, (_, index) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), index - firstDayOffset + 1);
    const dateKey = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0'),
    ].join('-');
    const tasks = filteredTasks.filter((task) => task.deadline_date?.slice(0, 10) === dateKey);
    const isCurrentMonth = date.getMonth() === currentDate.getMonth();
    const isToday = date.toDateString() === new Date().toDateString();

    return {
      date,
      day: date.getDate(),
      dateKey,
      tasks,
      isCurrentMonth,
      isToday,
    };
  });

  const monthLabel = currentDate.toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric',
  });

  const openTaskDetail = (task) => {
    const deadlineTime = task.deadline_time || '23:59';
    const [hours = '23', minutes = '59'] = deadlineTime.split(':');
    setSelectedTask({
      id: task.id,
      title: task.nama_tugas,
      code: task.kode_matkul || '-',
      subject: task.mata_kuliah || '-',
      lecturer: task.dosen || '-',
      hours,
      minutes,
      seconds: '00',
      deadline: `${task.deadline_date || '-'}, ${deadlineTime} WIB`,
      status: task.status || 'Mendatang',
      priority: task.prioritas || 'Sedang',
      description: task.catatan || 'Tidak ada deskripsi tugas.',
      link: task.link_elearning || '-',
    });
    setIsDetailOpen(true);
  };

  const handleCompleteTask = async () => {
    if (!selectedTask?.id) return;
    if (!window.confirm('Tandai tugas ini sebagai selesai?')) return;
    try {
      await api.patch(`/tugas/${selectedTask.id}/complete`);
      setRefreshKey((k) => k + 1);
      alert('Tugas ditandai sebagai selesai.');
      setIsDetailOpen(false);
    } catch (e) {
      alert('Gagal memperbarui status tugas.');
    }
  };

  const handleEditTask = () => {
    onNavigate?.('Daftar Tugas');
  };

  const handleDeleteTask = async () => {
    if (!selectedTask?.id) return;
    if (!window.confirm('Yakin ingin menghapus tugas ini?')) return;
    try {
      await api.delete(`/tugas/${selectedTask.id}`);
      setRefreshKey((k) => k + 1);
      alert('Tugas berhasil dihapus.');
      setIsDetailOpen(false);
    } catch (e) {
      alert('Gagal menghapus tugas.');
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F0F4F1] dark:bg-[#121E16] font-sans antialiased text-gray-800 dark:text-emerald-100 transition-colors duration-200">
      {/* Sidebar Navigation */}
      <Sidebar
        activePage="Kalender"
        onNavigate={onNavigate}
        onLogout={onLogout}
        onOpenTambahTugas={() => setIsModalOpen(true)}
        user={user}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onNavigate={onNavigate} user={user} />

        <main className="p-6 lg:p-8 max-w-[1400px] mx-auto w-full space-y-6">
          
          {/* Header Title & Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#1C2A20] p-6 rounded-3xl border border-emerald-900/10 dark:border-emerald-800/30 shadow-xs transition-colors">
            <div>
              <span className="text-[10px] font-bold tracking-wider text-[#3D5245] dark:text-emerald-400 uppercase flex items-center gap-1.5 mb-1">
                <span className="w-2 h-2 rounded-full bg-[#3D5245] dark:bg-emerald-400 animate-pulse"></span>
                JADWAL AKADEMIK
              </span>
              <h1 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-emerald-100 tracking-tight">
                Kalender Penugasan
              </h1>
              <p className="text-xs text-gray-500 dark:text-emerald-300/60 mt-1 font-medium">
                Visualisasi tenggat waktu kuis, praktikum, dan tugas perkuliahan Polibatam.
              </p>
            </div>

            {/* View Switcher Tabs */}
            <div className="flex items-center bg-[#F4F7F4] dark:bg-emerald-950/60 p-1.5 rounded-2xl border border-emerald-900/10 dark:border-emerald-800/40 shrink-0 text-xs font-bold text-gray-600 dark:text-emerald-200">
              {['Bulan', 'Minggu', 'Agenda'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-4 py-2 rounded-xl transition-all duration-200 cursor-pointer ${
                    viewMode === mode
                      ? 'bg-white dark:bg-[#1C2A20] text-gray-900 dark:text-emerald-100 shadow-xs'
                      : 'hover:text-gray-900 dark:hover:text-emerald-100 hover:bg-white/50 dark:hover:bg-emerald-900/30'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Filter Chips Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#1C2A20] p-4 rounded-2xl border border-emerald-900/10 dark:border-emerald-800/30 shadow-2xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold text-gray-400 dark:text-emerald-300/60 tracking-wider uppercase mr-1">
                FILTER:
              </span>
              <button
                onClick={() => setActiveFilter('Semua')}
                className={`px-3.5 py-2 rounded-full text-xs font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                  activeFilter === 'Semua'
                    ? 'bg-[#3D5245] dark:bg-emerald-800 text-white shadow-xs'
                    : 'bg-gray-100 dark:bg-emerald-950/40 text-gray-700 dark:text-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/40'
                }`}
              >
                <span>Semua Deadline</span>
                <span className="bg-white/20 dark:bg-emerald-900/50 px-1.5 py-0.5 rounded-md text-[10px]">
                  {calendarTasks.length}
                </span>
              </button>

              <button
                onClick={() => setActiveFilter('Praktikum')}
                className={`px-3.5 py-2 rounded-full text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                  activeFilter === 'Praktikum'
                    ? 'bg-[#3D5245] dark:bg-emerald-800 text-white shadow-xs'
                    : 'bg-gray-100 dark:bg-emerald-950/40 text-gray-700 dark:text-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/40'
                }`}
              >
                <span>Praktikum</span>
              </button>

              <button
                onClick={() => setActiveFilter('Kuis')}
                className={`px-3.5 py-2 rounded-full text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                  activeFilter === 'Kuis'
                    ? 'bg-[#3D5245] dark:bg-emerald-800 text-white shadow-xs'
                    : 'bg-gray-100 dark:bg-emerald-950/40 text-gray-700 dark:text-emerald-200 hover:bg-amber-50 dark:hover:bg-emerald-900/40'
                }`}
              >
                <span>Kuis</span>
              </button>

              <button
                onClick={() => setActiveFilter('Tugas Teori')}
                className={`px-3.5 py-2 rounded-full text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                  activeFilter === 'Tugas Teori'
                    ? 'bg-[#3D5245] dark:bg-emerald-800 text-white shadow-xs'
                    : 'bg-gray-100 dark:bg-emerald-950/40 text-gray-700 dark:text-emerald-200 hover:bg-blue-50 dark:hover:bg-emerald-900/40'
                }`}
              >
                <span>Tugas Teori</span>
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-emerald-300/60">
              <RotateCw className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Tersinkronisasi dengan Moodle Polibatam</span>
            </div>
          </div>

          {/* Main Calendar Grid & Detail Side-panel */}
          <div className="grid grid-cols-12 gap-6">
            
            {/* Grid Kalender Utama */}
            <div className={`${isDetailOpen ? 'col-span-12 lg:col-span-8' : 'col-span-12'} transition-all duration-300 space-y-4`}>
              <div className="bg-white dark:bg-[#1C2A20] p-6 rounded-3xl border border-emerald-900/10 dark:border-emerald-800/30 shadow-xs space-y-4">
                
                {/* Controls Month Selector */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setCurrentDate((date) => new Date(date.getFullYear(), date.getMonth() - 1, 1))}
                      className="p-2 rounded-xl bg-gray-100 dark:bg-emerald-950/60 text-gray-600 dark:text-emerald-200 hover:bg-gray-200 dark:hover:bg-emerald-900/50 transition cursor-pointer"
                      aria-label="Bulan sebelumnya"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <h2 className="text-base lg:text-lg font-black text-gray-900 dark:text-emerald-100">
                      {monthLabel}
                    </h2>
                    <button
                      onClick={() => setCurrentDate((date) => new Date(date.getFullYear(), date.getMonth() + 1, 1))}
                      className="p-2 rounded-xl bg-gray-100 dark:bg-emerald-950/60 text-gray-600 dark:text-emerald-200 hover:bg-gray-200 dark:hover:bg-emerald-900/50 transition cursor-pointer"
                      aria-label="Bulan berikutnya"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => setCurrentDate(new Date())}
                    className="px-3 py-1.5 rounded-xl bg-[#EBF7EC] dark:bg-emerald-950/60 text-[#2E4034] dark:text-emerald-300 text-xs font-bold border border-[#D6ECD8] dark:border-emerald-800/40 hover:bg-emerald-100 transition cursor-pointer"
                  >
                    Hari Ini
                  </button>
                </div>

                {/* Days Header */}
                <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-gray-400 dark:text-emerald-300/50 py-2 border-b border-gray-100 dark:border-emerald-900/30">
                  <span>Sen</span>
                  <span>Sel</span>
                  <span>Rab</span>
                  <span>Kam</span>
                  <span>Jum</span>
                  <span>Sab</span>
                  <span>Min</span>
                </div>

                {/* Dates Matrix */}
                <div className="grid grid-cols-7 gap-2">
                  {calendarDays.map((item) => (
                    <div
                      key={item.dateKey}
                      onClick={() => item.tasks[0] && openTaskDetail(item.tasks[0])}
                      className={`min-h-[85px] p-2 rounded-2xl border transition-all flex flex-col justify-between cursor-pointer ${
                        !item.isCurrentMonth
                          ? 'bg-gray-50/50 dark:bg-emerald-950/10 border-transparent text-gray-300 dark:text-emerald-900'
                          : item.isToday
                          ? 'bg-[#EBF7EC] dark:bg-emerald-950/70 border-[#3D5245] dark:border-emerald-500 font-bold'
                          : 'bg-white dark:bg-[#152219] border-gray-100 dark:border-emerald-800/30 hover:border-emerald-300 dark:hover:border-emerald-600'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className={item.isToday ? 'text-[#3D5245] dark:text-emerald-400 font-black' : 'text-gray-700 dark:text-emerald-200'}>
                          {item.day}
                        </span>
                        {item.isToday && (
                          <span className="text-[9px] bg-[#3D5245] dark:bg-emerald-700 text-white font-extrabold px-1.5 py-0.5 rounded-full">
                            Hari Ini
                          </span>
                        )}
                      </div>

                      {item.tasks.length > 0 && (
                        <div
                          className={`text-[10px] font-bold p-1.5 rounded-xl truncate mt-1 ${
                            item.tasks.some((task) => task.status === 'Terlambat')
                              ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800/50'
                              : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800/50'
                          }`}
                        >
                          {item.tasks[0].nama_tugas}
                          {item.tasks.length > 1 && ` +${item.tasks.length - 1}`}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Legend Bottom Bar */}
                <div className="pt-4 border-t border-gray-100 dark:border-emerald-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-medium text-gray-500 dark:text-emerald-300/60">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                      <span>Terlambat</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                      <span>Hari Ini</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                      <span>Mendatang</span>
                    </span>
                  </div>
                  <div>
                    <span>Ketercapaian Minggu Ini: <strong className="text-gray-800 dark:text-emerald-100">78%</strong></span>
                  </div>
                </div>

              </div>
            </div>

            {/* Right Panel - Detail Tugas Terpilih */}
            {isDetailOpen && selectedTask && (
              <div className="col-span-12 lg:col-span-4 bg-white dark:bg-[#1C2A20] p-6 rounded-3xl border border-emerald-900/10 dark:border-emerald-800/30 shadow-xs space-y-5 animate-in fade-in duration-200 h-fit">
                
                {/* Header Panel */}
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-emerald-900/30">
                  <span className="text-[10px] font-bold text-gray-400 dark:text-emerald-300/60 uppercase tracking-wider">
                    DETAIL TUGAS TERPILIH
                  </span>
                  <button
                    onClick={() => setIsDetailOpen(false)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-emerald-200 hover:bg-gray-100 dark:hover:bg-emerald-950/60 rounded-xl transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Title & Subject */}
                <div className="space-y-1">
                  <h3 className="font-black text-lg text-gray-900 dark:text-emerald-100 leading-snug">
                    {selectedTask.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-emerald-300/70">
                    <span className="bg-[#EBF7EC] dark:bg-emerald-950/60 text-[#2E4034] dark:text-emerald-300 px-2 py-0.5 rounded-md font-bold text-[11px]">
                      {selectedTask.code}
                    </span>
                    <span>{selectedTask.subject}</span>
                  </div>
                  <p className="text-xs text-gray-400 dark:text-emerald-300/50 pt-0.5">
                    Dosen: {selectedTask.lecturer}
                  </p>
                </div>

                {/* Countdown Banner */}
                <div className="p-4 bg-[#F4F7F4] dark:bg-emerald-950/50 rounded-2xl border border-emerald-900/10 dark:border-emerald-800/30 space-y-2">
                  <span className="text-[10px] font-extrabold text-[#3D5245] dark:text-emerald-400 uppercase tracking-wider block">
                    HITUNG MUNDUR DEADLINE
                  </span>
                  <div className="flex items-center gap-2 font-mono text-lg font-black text-gray-900 dark:text-emerald-100">
                    <div className="bg-white dark:bg-[#152219] px-2.5 py-1 rounded-xl border border-gray-200 dark:border-emerald-800/40 text-center">
                      {selectedTask.hours} <span className="text-[9px] font-sans text-gray-400 block font-normal">JAM</span>
                    </div>
                    <span>:</span>
                    <div className="bg-white dark:bg-[#152219] px-2.5 py-1 rounded-xl border border-gray-200 dark:border-emerald-800/40 text-center">
                      {selectedTask.minutes} <span className="text-[9px] font-sans text-gray-400 block font-normal">MENIT</span>
                    </div>
                    <span>:</span>
                    <div className="bg-white dark:bg-[#152219] px-2.5 py-1 rounded-xl border border-gray-200 dark:border-emerald-800/40 text-center">
                      {selectedTask.seconds} <span className="text-[9px] font-sans text-gray-400 block font-normal">DETIK</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-emerald-300/60 font-medium pt-1">
                    Tenggat Waktu: {selectedTask.deadline}
                  </p>
                </div>

                {/* Status & Priority */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-gray-50 dark:bg-emerald-950/30 rounded-xl border border-gray-100 dark:border-emerald-800/30">
                    <span className="text-[10px] text-gray-400 dark:text-emerald-300/50 block mb-0.5">Status Saat Ini</span>
                    <span className="font-bold text-amber-700 dark:text-amber-300">{selectedTask.status}</span>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-emerald-950/30 rounded-xl border border-gray-100 dark:border-emerald-800/30">
                    <span className="text-[10px] text-gray-400 dark:text-emerald-300/50 block mb-0.5">Tingkat Prioritas</span>
                    <span className="font-bold text-red-600 dark:text-red-400">{selectedTask.priority}</span>
                  </div>
                </div>

                {/* Deskripsi & Instruksi */}
                <div className="space-y-1.5 text-xs">
                  <span className="font-bold text-gray-700 dark:text-emerald-200 uppercase tracking-wider text-[10px] block">
                    DESKRIPSI & INSTRUKSI
                  </span>
                  <p className="text-gray-600 dark:text-emerald-300/80 leading-relaxed bg-gray-50 dark:bg-emerald-950/30 p-3 rounded-xl border border-gray-100 dark:border-emerald-800/30 font-medium">
                    {selectedTask.description}
                  </p>
                </div>

                {/* Tautan E-Learning */}
                <div className="space-y-2 text-xs">
                  <span className="font-bold text-gray-700 dark:text-emerald-200 uppercase tracking-wider text-[10px] block">
                    TAUTAN RESMI E-LEARNING
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={selectedTask.link}
                      className="w-full bg-gray-50 dark:bg-[#152219] p-2.5 rounded-xl border border-gray-200 dark:border-emerald-800/40 text-gray-600 dark:text-emerald-200 font-medium outline-none truncate"
                    />
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="p-2.5 bg-gray-100 dark:bg-emerald-950/60 hover:bg-gray-200 dark:hover:bg-emerald-900/50 rounded-xl transition cursor-pointer text-gray-600 dark:text-emerald-200 shrink-0"
                      title="Salin Tautan"
                    >
                      {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (selectedTask?.link && selectedTask.link !== '-') {
                        window.open(selectedTask.link.startsWith('http') ? selectedTask.link : `https://${selectedTask.link}`, '_blank');
                      }
                    }}
                    className="w-full bg-[#3D5245] dark:bg-emerald-800 hover:bg-[#2F4036] dark:hover:bg-emerald-700 text-white text-xs font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
                  >
                    <span>Buka Langsung di E-Learning Polibatam</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Bottom Action Buttons */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100 dark:border-emerald-900/30 text-xs font-bold">
                  <button
                    onClick={handleCompleteTask}
                    className="p-2.5 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-200 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span>Selesai</span>
                  </button>
                  <button
                    onClick={handleEditTask}
                    className="p-2.5 bg-gray-100 dark:bg-emerald-950/60 text-gray-700 dark:text-emerald-200 hover:bg-gray-200 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={handleDeleteTask}
                    className="p-2.5 bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 hover:bg-red-200 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                </div>

              </div>
            )}

          </div>

        </main>
      </div>

      {/* Modal Tambah Tugas Baru */}
      <TaskForm
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setRefreshKey((k) => k + 1);
        }}
        onCreated={() => {
          setIsModalOpen(false);
          setRefreshKey((k) => k + 1);
        }}
      />
    </div>
  );
}