import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  CheckCircle2,
  Clock,
  ExternalLink,
  Edit3,
  Trash2,
  ChevronDown,
  Filter,
  RefreshCw,
  BookOpen,
  Calendar as CalendarIcon,
  Sparkles,
  Layers,
  CheckSquare,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import TaskForm from '../components/TaskForm';
import TaskCard from '../components/TaskCard';
import StatusBadge from '../components/StatusBadge';
import api from '../api/axios';

const TABS = [
  { name: 'Semua', status: null },
  { name: 'Terlambat', status: 'Terlambat' },
  { name: 'Hari Ini', status: 'Hari Ini' },
  { name: 'Mendatang', status: 'Mendatang' },
  { name: 'Selesai', status: 'Selesai' },
];

export default function DaftarTugas({ onNavigate, onLogout }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Semua');
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState('');
  const [tugas, setTugas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchTugas = async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeTab !== 'Semua') params.status = activeTab;
      if (search) params.search = search;
      const res = await api.get('/tugas', { params });
      setTugas(res.data || []);
    } catch (error) {
      console.error('Gagal memuat daftar tugas:', error);
      setTugas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTugas();

    // Muat data user dari localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Gagal parse user data:', e);
      }
    }
  }, [activeTab, search, refreshKey]);

  const handleStatusFilter = (tab) => {
    setActiveTab(tab.name);
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const handleCreated = () => {
    setIsModalOpen(false);
    setRefreshKey((k) => k + 1);
  };

  const filtered = tugas;
  const counts = {
    Semua: tugas.length,
    Terlambat: tugas.filter((t) => t.status === 'Terlambat').length,
    'Hari Ini': tugas.filter((t) => t.status === 'Hari Ini').length,
    Mendatang: tugas.filter((t) => t.status === 'Mendatang').length,
    Selesai: tugas.filter((t) => t.status === 'Selesai').length,
  };

  return (
    <div className="flex min-h-screen bg-[#F0F4F1] dark:bg-[#121E16] font-sans antialiased text-gray-800 dark:text-emerald-100 transition-colors duration-200">
      {/* Sidebar Navigation */}
      <Sidebar
        activePage="Daftar Tugas"
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
                SEMESTER GENAP 2024/2025
              </span>
              <h1 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-emerald-100 tracking-tight">
                Daftar Semua Tugas Kuliah
              </h1>
              <p className="text-xs text-gray-500 dark:text-emerald-300/60 mt-1 font-medium max-w-xl leading-relaxed">
                Kelola dan lacak semua penugasan secara terorganisir, terintegrasi langsung dengan E-Learning Polibatam.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="bg-[#EBF7EC] dark:bg-emerald-950/60 border border-[#D6ECD8] dark:border-emerald-800/40 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-[#2E4034] dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{counts.Selesai} Selesai</span>
              </div>

              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-[#3D5245] hover:bg-[#2F4036] dark:bg-emerald-800 dark:hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold px-5 py-3 rounded-2xl flex items-center gap-2.5 transition cursor-pointer shadow-md shadow-[#3D5245]/20"
              >
                <Plus className="w-4 h-4 text-emerald-300 stroke-[3]" />
                <span>Tambah Tugas Baru</span>
              </button>
            </div>
          </div>

          {/* Filter Bar & Input Search */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#1C2A20] p-4 rounded-3xl border border-emerald-900/10 dark:border-emerald-800/30 shadow-2xs">
            {/* Tabs Filter Status */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              {TABS.map((tab) => (
                <button
                  key={tab.name}
                  onClick={() => handleStatusFilter(tab)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                    activeTab === tab.name
                      ? 'bg-[#3D5245] dark:bg-emerald-800 text-white shadow-xs'
                      : 'bg-gray-50 dark:bg-emerald-950/40 text-gray-600 dark:text-emerald-200 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/40 border border-gray-100 dark:border-emerald-800/30'
                  }`}
                >
                  <span>{tab.name}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-md text-[10px] ${
                      activeTab === tab.name
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-200/60 dark:bg-emerald-900/60 text-gray-700 dark:text-emerald-300'
                    }`}
                  >
                    {counts[tab.name] || 0}
                  </span>
                </button>
              ))}
            </div>

            {/* Input Search */}
            <div className="relative min-w-[240px] md:w-72">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-emerald-300/50" />
              <input
                type="text"
                value={search}
                onChange={handleSearch}
                placeholder="Cari nama tugas atau mata kuliah..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#F4F7F4] dark:bg-[#152219] border border-emerald-900/10 dark:border-emerald-800/40 focus:border-[#3D5245] dark:focus:border-emerald-500 focus:bg-white dark:focus:bg-[#18281D] rounded-2xl font-semibold text-xs text-gray-800 dark:text-emerald-100 outline-none focus:ring-2 focus:ring-[#3D5245]/20 transition-all placeholder:text-gray-400 dark:placeholder:text-emerald-300/40"
              />
            </div>
          </div>

          {/* Grid Daftar Tugas */}
          <div className="space-y-4">
            {loading ? (
              <div className="bg-white dark:bg-[#1C2A20] p-12 rounded-3xl border border-emerald-900/10 dark:border-emerald-800/30 text-center flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 text-[#3D5245] dark:text-emerald-400 animate-spin" />
                <p className="text-xs font-semibold text-gray-500 dark:text-emerald-300/60">
                  Memuat daftar tugas perkuliahan...
                </p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="bg-white dark:bg-[#1C2A20] p-12 rounded-3xl border border-emerald-900/10 dark:border-emerald-800/30 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#EBF7EC] dark:bg-emerald-950/60 text-[#3D5245] dark:text-emerald-300 mx-auto flex items-center justify-center font-bold">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-emerald-100">Belum Ada Tugas</h4>
                  <p className="text-xs text-gray-500 dark:text-emerald-300/60 mt-0.5">
                    Tidak ditemukan tugas dengan filter atau kata kunci pencarian saat ini.
                  </p>
                </div>
                {activeTab !== 'Semua' && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('Semua')}
                    className="mt-2 text-xs font-bold text-[#3D5245] dark:text-emerald-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    Lihat semua tugas
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onUpdate={() => setRefreshKey((k) => k + 1)}
                  />
                ))}
              </div>
            )}
          </div>

        </main>
      </div>

      {/* Modal Tambah Tugas Baru */}
      <TaskForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={handleCreated}
      />
    </div>
  );
}