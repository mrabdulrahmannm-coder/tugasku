import { useState, useEffect, useRef } from 'react';
import {
  Search,
  Sun,
  Moon,
  Bell,
  MessageSquare,
  PanelLeftClose,
  PanelLeft,
  Check,
} from 'lucide-react';
import UserAvatar from './UserAvatar';

export default function Topbar({ onNavigate, user: userProp }) {
  const [theme, setTheme] = useState('light');
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const notifRef = useRef(null);

  // 1. Muat data user dari localStorage
  useEffect(() => {
    const loadUser = () => {
      const stored = localStorage.getItem('user');
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch (e) {
          console.error('Gagal parse user data:', e);
        }
      }
    };
    loadUser();
    window.addEventListener('user-updated', loadUser);
    return () => window.removeEventListener('user-updated', loadUser);
  }, []);

  // 2. Inisialisasi tema saat pertama dimuat & dengarkan event sync
  useEffect(() => {
    const applyTheme = () => {
      const savedTheme = localStorage.getItem('theme') || 'light';
      setTheme(savedTheme);
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    applyTheme();
    window.addEventListener('theme-updated', applyTheme);
    return () => window.removeEventListener('theme-updated', applyTheme);
  }, []);

  // 3. Tutup dropdown notifikasi saat klik di luar area
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Toggle Sidebar
  const handleToggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
    window.dispatchEvent(new Event('toggle-sidebar'));
  };

  // Toggle Mode Gelap / Terang
  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);

    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Pemicu event agar komponen lain (seperti Pengaturan) ikut berubah
    window.dispatchEvent(new Event('theme-updated'));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    console.log('Search:', searchQuery);
  };

  const currentUser = userProp || user;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-3.5 bg-white/90 dark:bg-[#1C2A20]/90 backdrop-blur-md border-b border-emerald-900/10 dark:border-emerald-800/30 shadow-xs w-full transition-colors duration-200 select-none">
      
      {/* Kiri: Tombol Toggle Sidebar & Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button 
          type="button" 
          onClick={handleToggleSidebar}
          title={isSidebarOpen ? "Sembunyikan Sidebar" : "Tampilkan Sidebar"}
          className="w-10 h-10 rounded-2xl bg-[#3D5245] hover:bg-[#2F4036] active:scale-95 text-white flex items-center justify-center shrink-0 transition-all cursor-pointer shadow-sm shadow-[#3D5245]/20"
        >
          {isSidebarOpen ? (
            <PanelLeftClose className="w-4 h-4 text-emerald-200" />
          ) : (
            <PanelLeft className="w-4 h-4 text-emerald-200" />
          )}
        </button>

        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search
            className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-800/40 dark:text-emerald-300/60 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Cari tugas, mata kuliah, atau dosen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-12 py-2.5 bg-[#F4F7F4] dark:bg-emerald-950/40 border border-emerald-900/10 dark:border-emerald-800/40 focus:border-[#3D5245] dark:focus:border-emerald-500 rounded-2xl text-xs font-semibold text-gray-800 dark:text-emerald-100 outline-none focus:bg-white dark:focus:bg-[#152219] focus:ring-2 focus:ring-[#3D5245]/15 transition-all placeholder:text-gray-400 dark:placeholder:text-emerald-300/40"
          />
          <kbd className="hidden sm:inline-flex items-center absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 text-[10px] font-bold text-gray-400 dark:text-emerald-300/60 bg-white dark:bg-emerald-900/40 rounded-lg border border-gray-200 dark:border-emerald-800/40 shadow-2xs pointer-events-none">
            ⌘K
          </kbd>
        </form>
      </div>

      {/* Kanan: Badge Semester, Feedback, Theme Toggle, Notifikasi, Foto Profil */}
      <div className="flex items-center gap-2.5">
        
        {/* Badge Semester */}
        <div className="bg-[#EBF7EC] dark:bg-emerald-950/60 text-[#224A2A] dark:text-emerald-300 text-xs font-bold px-3.5 py-1.5 rounded-full hidden md:flex items-center gap-2 border border-[#D6ECD8] dark:border-emerald-800/40 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-[#3D5245] dark:bg-emerald-400 animate-pulse"></span>
          <span>Genap 2024/2025</span>
        </div>

        {/* Tombol Umpan Balik */}
        <button
          type="button"
          onClick={() => onNavigate?.('Umpan Balik')}
          className="p-2.5 text-gray-600 dark:text-emerald-200 hover:text-[#3D5245] dark:hover:text-white hover:bg-[#EBF7EC] dark:hover:bg-emerald-900/40 active:scale-95 rounded-2xl transition-all cursor-pointer"
          title="Umpan Balik"
        >
          <MessageSquare className="w-4 h-4" />
        </button>

        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2.5 text-gray-600 dark:text-emerald-200 hover:text-[#3D5245] dark:hover:text-white hover:bg-[#EBF7EC] dark:hover:bg-emerald-900/40 active:scale-95 rounded-2xl transition-all cursor-pointer"
          title={theme === 'dark' ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </button>

        {/* Notifikasi Dropdown Container */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setNotifOpen((prev) => !prev)}
            className="p-2.5 text-gray-600 dark:text-emerald-200 hover:text-[#3D5245] dark:hover:text-white hover:bg-[#EBF7EC] dark:hover:bg-emerald-900/40 active:scale-95 rounded-2xl relative transition-all cursor-pointer"
            title="Notifikasi"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-[#1C2A20]" />
          </button>

          {/* Popover Notifikasi */}
          {notifOpen && (
            <div className="absolute right-0 top-12 w-80 bg-white dark:bg-[#1E2E23] border border-emerald-900/10 dark:border-emerald-800/40 rounded-3xl shadow-xl py-3 z-50">
              <div className="px-4 py-2 border-b border-gray-100 dark:border-emerald-900/30 flex items-center justify-between">
                <h3 className="text-xs font-bold text-gray-900 dark:text-emerald-100 uppercase tracking-wider">
                  Notifikasi
                </h3>
                <span className="text-[10px] font-bold bg-[#EBF7EC] dark:bg-emerald-900/60 text-[#224A2A] dark:text-emerald-300 px-2 py-0.5 rounded-full border border-[#D6ECD8] dark:border-emerald-800/40">
                  3 Baru
                </span>
              </div>

              <div className="divide-y divide-gray-50 dark:divide-emerald-900/20 max-h-80 overflow-y-auto">
                <button
                  type="button"
                  onClick={() => setNotifOpen(false)}
                  className="w-full flex items-start gap-3 p-3.5 text-left hover:bg-[#F4F7F4] dark:hover:bg-emerald-900/30 transition-colors"
                >
                  <div className="w-8 h-8 rounded-xl bg-[#EBF7EC] dark:bg-emerald-950 text-[#224A2A] dark:text-emerald-300 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 dark:text-emerald-100 truncate">
                      Tugas baru diterbitkan
                    </p>
                    <p className="text-[10px] text-gray-500 dark:text-emerald-300/60 truncate mt-0.5">
                      2 jam lalu • Pemrograman Web
                    </p>
                  </div>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                </button>

                <button
                  type="button"
                  onClick={() => setNotifOpen(false)}
                  className="w-full flex items-start gap-3 p-3.5 text-left hover:bg-[#F4F7F4] dark:hover:bg-emerald-900/30 transition-colors"
                >
                  <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 dark:text-emerald-100 truncate">
                      Deadline mendekati: Makalah RPL
                    </p>
                    <p className="text-[10px] text-gray-500 dark:text-emerald-300/60 truncate mt-0.5">
                      5 jam lalu • Rekayasa Perangkat Lunak
                    </p>
                  </div>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                </button>

                <button
                  type="button"
                  onClick={() => setNotifOpen(false)}
                  className="w-full flex items-start gap-3 p-3.5 text-left hover:bg-[#F4F7F4] dark:hover:bg-emerald-900/30 transition-colors"
                >
                  <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                    <Check className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 dark:text-emerald-100 truncate">
                      Pengumuman jadwal UTS
                    </p>
                    <p className="text-[10px] text-gray-500 dark:text-emerald-300/60 truncate mt-0.5">
                      1 hari lalu • Akademik
                    </p>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Foto Profil */}
        <div className="relative cursor-pointer ml-1" onClick={() => onNavigate?.('Pengaturan')}>
          <UserAvatar
            user={currentUser}
            className="w-9 h-9 rounded-full ring-2 ring-[#3D5245]/20 hover:ring-[#3D5245] hover:scale-105 active:scale-95 transition-all shadow-xs"
          />
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 ring-2 ring-white dark:ring-[#1C2A20] rounded-full" />
        </div>

      </div>
    </header>
  );
}