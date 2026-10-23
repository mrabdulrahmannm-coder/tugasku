import { useState, useEffect } from 'react';
import { Home, CheckSquare, Calendar, BookOpen, Settings, Plus, LogOut, GraduationCap, Building2, MessageSquare } from 'lucide-react';
import Logo from '../assets/Logo.png';
import UserAvatar from './UserAvatar';

export default function Sidebar({ activePage, onNavigate, onOpenTambahTugas, onLogout, user: userProp }) {
  const [liveUser, setLiveUser] = useState(null);
  const [isOpen, setIsOpen] = useState(true); // State kontrol buka/tutup sidebar

  // Muat user dari localStorage dan dengarkan event user-updated & toggle-sidebar
  useEffect(() => {
    const loadUser = () => {
      const stored = localStorage.getItem('user');
      if (stored) {
        try {
          setLiveUser(JSON.parse(stored));
        } catch (e) {
          console.error('Gagal parse user data:', e);
        }
      }
    };
    loadUser();

    const handleToggleSidebar = () => {
      setIsOpen((prev) => !prev);
    };

    window.addEventListener('user-updated', loadUser);
    window.addEventListener('toggle-sidebar', handleToggleSidebar);

    return () => {
      window.removeEventListener('user-updated', loadUser);
      window.removeEventListener('toggle-sidebar', handleToggleSidebar);
    };
  }, []);

  // Jika status closed, sembunyikan sidebar
  if (!isOpen) return null;

  const user = userProp || liveUser;
  const menuItems = [
    { label: 'Beranda', icon: Home },
    { label: 'Daftar Tugas', icon: CheckSquare },
    { label: 'Kalender', icon: Calendar },
    { label: 'Mata Kuliah', icon: BookOpen },
    { label: 'Pengaturan', icon: Settings },
    ...(user?.role === 'admin' ? [{ label: 'Feedback Admin', icon: MessageSquare }] : []),
  ];

  const handleTambahTugasClick = () => {
    if (onOpenTambahTugas) {
      onOpenTambahTugas();
    } else if (onNavigate) {
      onNavigate('Daftar Tugas');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (onLogout) {
      onLogout();
    } else if (onNavigate) {
      onNavigate('Login');
    }
  };

  return (
    <aside className="w-64 bg-[#3D5245] text-white flex flex-col justify-between p-4 h-screen sticky top-0 shrink-0">
      <div className="relative z-10 space-y-6">
        {/* Header Branding */}
        <div className="flex items-center gap-3">
          <img
            src={Logo}
            alt="Logo TugasKu"
            className="w-12 h-12 object-contain rounded-2xl shadow-xs"
          />
          <div>
            <h1 className="font-extrabold text-xl leading-tight text-white tracking-tight">TugasKu</h1>
            <p className="text-xs text-emerald-200 font-medium">Polibatam Edition</p>
          </div>
        </div>

        {/* Action Button */}
        <button 
          type="button"
          onClick={handleTambahTugasClick}
          className="w-full bg-[#A3D9A5] hover:bg-[#8EC890] text-[#1E3023] font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 mb-6 transition cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          <span>Tambah Tugas</span>
        </button>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.label;

            return (
              <button
                key={item.label}
                type="button"
                onClick={() => onNavigate && onNavigate(item.label)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition text-left cursor-pointer ${
                  isActive
                    ? 'bg-[#4E6756] text-white shadow-sm'
                    : 'text-emerald-100 hover:bg-[#4E6756]/50'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Profile Info + Tombol Logout */}
      <div className="bg-[#4E6756]/60 p-3 rounded-xl flex items-center justify-between gap-2 border border-emerald-700/30">
        <div className="flex items-center gap-3 overflow-hidden">
          <UserAvatar user={user} className="w-10 h-10 rounded-full shrink-0" />
          <div className="overflow-hidden flex flex-col items-start">
            <h4 className="text-sm font-semibold truncate w-full">{user?.name || 'Pengguna'}</h4>
            <p className="text-xs text-emerald-200 truncate w-full">{user?.prodi || 'Program Studi'}</p>
            <div className="flex items-center gap-2.5 text-[10px] text-emerald-300 mt-1">
              <span className="flex items-center gap-1 leading-tight whitespace-nowrap">
                <GraduationCap className="w-3 h-3 shrink-0" />
                {user?.semester || "Semester 4"}
              </span>
              <span className="flex items-center gap-1 leading-tight whitespace-nowrap">
                <Building2 className="w-3 h-3 shrink-0" />
                {user?.institusi || "Polibatam"}
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          title="Keluar Akun"
          className="p-2 text-emerald-200 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition cursor-pointer shrink-0"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}