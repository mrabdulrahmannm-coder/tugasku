import { useState, useEffect } from 'react';
import {
  User,
  Bell,
  RotateCw,
  Palette,
  Shield,
  Save,
  Check,
  Upload,
  Mail,
  GraduationCap,
  BookOpen,
  Globe,
  Sun,
  Moon,
  Laptop,
  Trash2,
  Download,
  Key,
  ExternalLink,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import TaskForm from '../components/TaskForm';
import UserAvatar from '../components/UserAvatar';

export default function Pengaturan({ onNavigate, onLogout }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('profil'); // 'profil' | 'elearning' | 'notifikasi' | 'tampilan' | 'data'
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  // Form States
  const [profile, setProfile] = useState({
    name: '',
    nim: '',
    prodi: '',
    semester: '',
    email: ''
  });

  // Password states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Settings states
  const [notifications, setNotifications] = useState({
    browser: true,
    emailDigest: true,
    reminderDeadline: true,
    h1: true,
    h3Hours: true
  });

  const [syncConfig, setSyncConfig] = useState({
    autoSync: true,
    syncInterval: '15',
    syncOnLaunch: true
  });

  const [theme, setTheme] = useState('light'); // 'light' | 'dark' | 'system'

  // Helper untuk mendapatkan URL Foto Profil yang valid
  const getAvatarUrl = (path) => {
    if (avatarPreview) return avatarPreview;
    if (!path) return null;
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const baseUrl = api.defaults?.baseURL ? api.defaults.baseURL.replace(/\/api\/?$/, '') : 'http://127.0.0.1:8000';
    return `${baseUrl}/storage/${path.replace(/^\//, '')}`;
  };

  // Muat user dari localStorage & sinkronkan event update
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

  // Inisialisasi & sinkronisasi status tema
  useEffect(() => {
    const syncTheme = () => {
      const savedTheme = localStorage.getItem('theme') || 'light';
      setTheme(savedTheme);
    };
    syncTheme();
    window.addEventListener('theme-updated', syncTheme);
    return () => window.removeEventListener('theme-updated', syncTheme);
  }, []);

  // Ambil profil dari backend
  useEffect(() => {
    let mounted = true;
    const storedUserStr = localStorage.getItem('user');
    let localUser = null;
    if (storedUserStr) {
      try {
        localUser = JSON.parse(storedUserStr);
        if (mounted) setUser(localUser);
      } catch (e) {
        console.error('Gagal parse user data:', e);
      }
    }

    api.get('/pengaturan/profil')
      .then((res) => {
        if (!mounted) return;
        const data = res.data?.data || {};
        const u = data.user || {};
        const s = data.settings || {};

        setProfile({
          name: u.name || localUser?.name || '',
          nim: u.nim || localUser?.nim || '',
          prodi: u.prodi || localUser?.prodi || '',
          semester: u.semester || localUser?.semester || '',
          email: u.email || localUser?.email || ''
        });

        const updatedUser = {
          ...localUser,
          name: u.name || localUser?.name,
          nim: u.nim || localUser?.nim,
          prodi: u.prodi || localUser?.prodi,
          semester: u.semester || localUser?.semester,
          email: u.email || localUser?.email,
          avatar_url: u.avatar_url || localUser?.avatar_url
        };

        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));

        if (s.notifications) setNotifications(s.notifications);
        if (s.sync) setSyncConfig(s.sync);
        if (s.theme) {
          setTheme(s.theme);
          applyTheme(s.theme, false);
        }
      })
      .catch(() => {
        if (mounted && localUser) {
          setProfile({
            name: localUser.name || '',
            nim: localUser.nim || '',
            prodi: localUser.prodi || '',
            semester: localUser.semester || '',
            email: localUser.email || ''
          });
        }
      });

    return () => { mounted = false; };
  }, []);

  // Fungsi untuk mengganti tema global
  const applyTheme = (newTheme, shouldSaveToBackend = true) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);

    const isDark =
      newTheme === 'dark' ||
      (newTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    window.dispatchEvent(new Event('theme-updated'));

    if (shouldSaveToBackend) {
      api.put('/pengaturan/settings', {
        settings: { notifications, sync: syncConfig, theme: newTheme }
      }).catch(() => {});
    }
  };

  // Simpan profil ke backend
  const handleSaveProfile = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setIsLoading(true);
    try {
      const res = await api.put('/pengaturan/profil', profile);
      const u = res.data?.data?.user || {};

      const updatedUser = {
        ...user,
        name: u.name || profile.name,
        nim: u.nim || profile.nim,
        prodi: u.prodi || profile.prodi,
        semester: u.semester || profile.semester,
        email: u.email || profile.email,
        avatar_url: u.avatar_url || user?.avatar_url || null,
      };

      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      window.dispatchEvent(new Event('user-updated'));
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal menyimpan profil.';
      alert(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Unggah foto profil ke backend
  const handleUploadFoto = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!avatarFile) return;
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', avatarFile);
      const res = await api.post('/pengaturan/foto', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const u = res.data?.data?.user || {};
      const updatedUser = {
        ...user,
        avatar_url: u.avatar_url || user?.avatar_url || null,
      };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      window.dispatchEvent(new Event('user-updated'));
      setAvatarFile(null);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal mengunggah foto profil.';
      alert(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Simpan password ke backend
  const handleSavePassword = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      alert('Konfirmasi kata sandi baru tidak cocok.');
      return;
    }
    setIsLoading(true);
    try {
      await api.put('/pengaturan/password', {
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmNewPassword,
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal memperbarui password.';
      alert(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Simpan pengaturan umum
  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      const settings = { notifications, sync: syncConfig, theme };
      await api.put('/pengaturan/settings', { settings });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    } catch (err) {
      alert('Gagal menyimpan pengaturan.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handler tombol simpan header atas
  const handleGlobalSave = () => {
    if (activeTab === 'profil') handleSaveProfile();
    else if (activeTab === 'elearning' || activeTab === 'notifikasi' || activeTab === 'tampilan') handleSaveSettings();
  };

  // Unduh data cadangan
  const handleExportData = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/pengaturan/export');
      const data = res.data?.data || res.data;
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tugasku-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    } catch (err) {
      alert('Gagal mengekspor data.');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset semua data
  const handleResetData = async () => {
    if (!window.confirm('Yakin ingin menghapus semua data tugas dan mata kuliah? Tindakan ini tidak dapat diurungkan.')) return;
    setIsLoading(true);
    try {
      await api.delete('/pengaturan/reset');
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    } catch (err) {
      alert('Gagal mereset data.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F0F4F1] dark:bg-[#121E16] font-sans antialiased text-gray-800 dark:text-emerald-100 transition-colors duration-200">
      {/* Sidebar Navigation */}
      <Sidebar
        activePage="Pengaturan"
        onNavigate={onNavigate}
        onLogout={onLogout}
        onOpenTambahTugas={() => setIsModalOpen(true)}
        user={user}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onNavigate={onNavigate} user={user} />

        <main className="p-6 lg:p-8 max-w-[1400px] mx-auto w-full space-y-6">
          
          {/* Header Title & Save Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#1C2A20] p-6 rounded-3xl border border-emerald-900/10 dark:border-emerald-800/30 shadow-xs transition-colors">
            <div>
              <span className="text-[10px] font-bold tracking-wider text-[#3D5245] dark:text-emerald-400 uppercase flex items-center gap-1.5 mb-1">
                <span className="w-2 h-2 rounded-full bg-[#3D5245] dark:bg-emerald-400 animate-pulse"></span>
                SISTEM & PREFERENSI AKUN
              </span>
              <h1 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-emerald-100 tracking-tight">
                Pengaturan Aplikasi
              </h1>
              <p className="text-xs text-gray-500 dark:text-emerald-300/60 mt-1 max-w-xl font-medium leading-relaxed">
                Kelola profil akademik, integrasi Polibatam E-Learning, preferensi pengingat tugas, dan kustomisasi tampilan.
              </p>
            </div>

            {activeTab !== 'data' && (
              <button
                onClick={handleGlobalSave}
                disabled={isLoading}
                className="bg-[#3D5245] hover:bg-[#2F4036] dark:bg-emerald-800 dark:hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold px-5 py-3 rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-[#3D5245]/20 shrink-0 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-300" />
                    <span>Menyimpan...</span>
                  </>
                ) : isSaved ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300 stroke-[3]" />
                    <span>Tersimpan!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 text-emerald-200" />
                    <span>Simpan Perubahan</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Grid Layout Pengaturan */}
          <div className="grid grid-cols-12 gap-6">
            
            {/* Navigasi Tab Kiri (3/12 Columns) */}
            <div className="col-span-12 lg:col-span-3 space-y-3">
              <div className="bg-white dark:bg-[#1C2A20] p-2.5 rounded-3xl border border-emerald-900/10 dark:border-emerald-800/30 shadow-xs space-y-1">
                {[
                  { id: 'profil', label: 'Profil Mahasiswa', icon: User, desc: 'Identitas & Prodi' },
                  { id: 'elearning', label: 'Integrasi E-Learning', icon: RotateCw, desc: 'Moodle & Sync Hub' },
                  { id: 'notifikasi', label: 'Notifikasi & Pengingat', icon: Bell, desc: 'Pengingat Deadline' },
                  { id: 'tampilan', label: 'Tampilan & Tema', icon: Palette, desc: 'Warna & Mode Malam' },
                  { id: 'data', label: 'Keamanan & Data', icon: Shield, desc: 'Ekspor & Reset Data' }
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full p-3 rounded-2xl flex items-center gap-3 transition-all text-left cursor-pointer ${
                        isActive
                          ? 'bg-[#3D5245] dark:bg-emerald-800 text-white shadow-md shadow-[#3D5245]/20'
                          : 'text-gray-700 dark:text-emerald-200 hover:bg-[#EBF7EC] dark:hover:bg-emerald-900/30'
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                          isActive
                            ? 'bg-white/15 text-emerald-300'
                            : 'bg-gray-100 dark:bg-emerald-950/60 text-gray-500 dark:text-emerald-300/60'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="text-xs font-bold truncate leading-snug">{item.label}</h4>
                        <p
                          className={`text-[10px] truncate mt-0.5 ${
                            isActive ? 'text-emerald-100/80' : 'text-gray-400 dark:text-emerald-300/50'
                          }`}
                        >
                          {item.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Status Info Box */}
              <div className="bg-[#EBF7EC] dark:bg-emerald-950/60 border border-[#D6ECD8] dark:border-emerald-800/40 p-4 rounded-3xl space-y-2">
                <div className="flex items-center gap-2 text-[#2E4034] dark:text-emerald-300 text-xs font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                  <span>Status Aplikasi</span>
                </div>
                <p className="text-[11px] text-gray-600 dark:text-emerald-200/80 leading-relaxed font-medium">
                  TugasKu v2.4 (Polibatam Edition) berjalan optimal dan terhubung ke server CAS Polibatam.
                </p>
              </div>
            </div>

            {/* Konten Tab Kanan (9/12 Columns) */}
            <div className="col-span-12 lg:col-span-9">
              
              {/* TAB 1: PROFIL MAHASISWA */}
              {activeTab === 'profil' && (
                <div className="bg-white dark:bg-[#1C2A20] p-6 lg:p-8 rounded-3xl border border-emerald-900/10 dark:border-emerald-800/30 shadow-xs space-y-6">
                  <div>
                    <h3 className="font-black text-gray-900 dark:text-emerald-100 text-lg">Profil Mahasiswa</h3>
                    <p className="text-xs text-gray-500 dark:text-emerald-300/60 font-medium mt-0.5">
                      Informasi akademik yang terhubung dengan kartu mahasiswa dan laporan tugas.
                    </p>
                  </div>

                  {/* Photo Avatar Section */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 bg-[#F4F7F4] dark:bg-emerald-950/40 border border-emerald-900/10 dark:border-emerald-800/30 rounded-2xl">
                    <div className="relative shrink-0">
                      {avatarPreview ? (
                        <img
                          src={avatarPreview}
                          alt="Avatar Profil"
                          className="w-20 h-20 rounded-full object-cover border-2 border-white dark:border-emerald-800 shadow-sm"
                        />
                      ) : (
                        <UserAvatar
                          user={{ ...user, avatar_url: getAvatarUrl(user?.avatar_url) }}
                          className="w-20 h-20 rounded-full border-2 border-white dark:border-emerald-800 shadow-sm"
                        />
                      )}
                      <input
                        id="avatar-file-input"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setAvatarFile(file);
                            setAvatarPreview(URL.createObjectURL(file));
                          }
                        }}
                      />
                      {avatarFile && (
                        <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full shadow-xs">
                          Baru
                        </span>
                      )}
                    </div>

                    <div className="space-y-2 flex-1">
                      <div>
                        <h4 className="text-xs font-bold text-gray-900 dark:text-emerald-100">Foto Profil Utama</h4>
                        <p className="text-[11px] text-gray-500 dark:text-emerald-300/60 font-medium">
                          Format JPG, PNG, atau WEBP. Ukuran maksimal 2MB.
                        </p>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => document.getElementById('avatar-file-input')?.click()}
                          className="bg-white dark:bg-[#152219] hover:bg-gray-50 dark:hover:bg-emerald-900/40 text-gray-800 dark:text-emerald-200 border border-gray-200 dark:border-emerald-800/40 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                        >
                          <Upload className="w-3.5 h-3.5 text-gray-500 dark:text-emerald-400" />
                          <span>Pilih Foto</span>
                        </button>

                        {avatarFile && (
                          <button
                            type="button"
                            onClick={handleUploadFoto}
                            disabled={isLoading}
                            className="bg-[#3D5245] dark:bg-emerald-800 hover:bg-[#2F4036] text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-xs disabled:opacity-50"
                          >
                            {isLoading ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <>
                                <span>Unggah</span>
                                <Check className="w-3.5 h-3.5" />
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Form Inputs */}
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="block font-bold text-gray-700 dark:text-emerald-200 mb-1.5">Nama Lengkap *</label>
                        <div className="relative">
                          <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-emerald-300/50" />
                          <input
                            type="text"
                            required
                            value={profile.name}
                            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                            className="w-full pl-10 pr-4 py-2.5 bg-[#F4F7F4] dark:bg-[#152219] border border-emerald-900/10 dark:border-emerald-800/40 focus:border-[#3D5245] dark:focus:border-emerald-500 focus:bg-white dark:focus:bg-[#18281D] rounded-xl font-semibold text-gray-800 dark:text-emerald-100 outline-none focus:ring-2 focus:ring-[#3D5245]/20 transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-gray-700 dark:text-emerald-200 mb-1.5">NIM (Nomor Induk Mahasiswa) *</label>
                        <div className="relative">
                          <Key className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-emerald-300/50" />
                          <input
                            type="text"
                            required
                            value={profile.nim}
                            onChange={(e) => setProfile({ ...profile, nim: e.target.value })}
                            className="w-full pl-10 pr-4 py-2.5 bg-[#F4F7F4] dark:bg-[#152219] border border-emerald-900/10 dark:border-emerald-800/40 focus:border-[#3D5245] dark:focus:border-emerald-500 focus:bg-white dark:focus:bg-[#18281D] rounded-xl font-semibold text-gray-800 dark:text-emerald-100 outline-none focus:ring-2 focus:ring-[#3D5245]/20 transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-gray-700 dark:text-emerald-200 mb-1.5">Program Studi *</label>
                        <div className="relative">
                          <GraduationCap className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-emerald-300/50" />
                          <input
                            type="text"
                            required
                            value={profile.prodi}
                            onChange={(e) => setProfile({ ...profile, prodi: e.target.value })}
                            className="w-full pl-10 pr-4 py-2.5 bg-[#F4F7F4] dark:bg-[#152219] border border-emerald-900/10 dark:border-emerald-800/40 focus:border-[#3D5245] dark:focus:border-emerald-500 focus:bg-white dark:focus:bg-[#18281D] rounded-xl font-semibold text-gray-800 dark:text-emerald-100 outline-none focus:ring-2 focus:ring-[#3D5245]/20 transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-gray-700 dark:text-emerald-200 mb-1.5">Semester Aktif *</label>
                        <div className="relative">
                          <BookOpen className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-emerald-300/50" />
                          <input
                            type="text"
                            required
                            value={profile.semester}
                            onChange={(e) => setProfile({ ...profile, semester: e.target.value })}
                            className="w-full pl-10 pr-4 py-2.5 bg-[#F4F7F4] dark:bg-[#152219] border border-emerald-900/10 dark:border-emerald-800/40 focus:border-[#3D5245] dark:focus:border-emerald-500 focus:bg-white dark:focus:bg-[#18281D] rounded-xl font-semibold text-gray-800 dark:text-emerald-100 outline-none focus:ring-2 focus:ring-[#3D5245]/20 transition-all"
                          />
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block font-bold text-gray-700 dark:text-emerald-200 mb-1.5">Email Mahasiswa Polibatam *</label>
                        <div className="relative">
                          <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-emerald-300/50" />
                          <input
                            type="email"
                            required
                            value={profile.email}
                            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                            className="w-full pl-10 pr-4 py-2.5 bg-[#F4F7F4] dark:bg-[#152219] border border-emerald-900/10 dark:border-emerald-800/40 focus:border-[#3D5245] dark:focus:border-emerald-500 focus:bg-white dark:focus:bg-[#18281D] rounded-xl font-semibold text-gray-800 dark:text-emerald-100 outline-none focus:ring-2 focus:ring-[#3D5245]/20 transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  </form>

                  {/* Password Change Section */}
                  <div className="bg-[#F4F7F4] dark:bg-emerald-950/40 p-5 rounded-2xl border border-emerald-900/10 dark:border-emerald-800/30 space-y-4">
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-emerald-100 text-sm">Ubah Kata Sandi Akses</h4>
                      <p className="text-[11px] text-gray-500 dark:text-emerald-300/60 font-medium">
                        Perbarui kata sandi untuk mengamankan sesi aplikasi TugasKu kamu.
                      </p>
                    </div>

                    <form onSubmit={handleSavePassword} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                        <div>
                          <label className="block font-bold text-gray-700 dark:text-emerald-200 mb-1">Sandi Saat Ini</label>
                          <input
                            type="password"
                            required
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-white dark:bg-[#152219] rounded-xl border border-gray-200 dark:border-emerald-800/40 font-semibold text-gray-800 dark:text-emerald-100 outline-none focus:ring-2 focus:ring-[#3D5245]/20"
                            placeholder="••••••••"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-gray-700 dark:text-emerald-200 mb-1">Sandi Baru</label>
                          <input
                            type="password"
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-white dark:bg-[#152219] rounded-xl border border-gray-200 dark:border-emerald-800/40 font-semibold text-gray-800 dark:text-emerald-100 outline-none focus:ring-2 focus:ring-[#3D5245]/20"
                            placeholder="••••••••"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-gray-700 dark:text-emerald-200 mb-1">Konfirmasi Sandi Baru</label>
                          <input
                            type="password"
                            required
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-white dark:bg-[#152219] rounded-xl border border-gray-200 dark:border-emerald-800/40 font-semibold text-gray-800 dark:text-emerald-100 outline-none focus:ring-2 focus:ring-[#3D5245]/20"
                            placeholder="••••••••"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="bg-[#3D5245] dark:bg-emerald-800 hover:bg-[#2F4036] text-white text-xs font-bold py-2.5 px-5 rounded-xl transition cursor-pointer shadow-xs disabled:opacity-60 flex items-center justify-center gap-2"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-300" />
                            <span>Memproses...</span>
                          </>
                        ) : (
                          <span>Perbarui Kata Sandi</span>
                        )}
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* TAB 2: INTEGRASI E-LEARNING */}
              {activeTab === 'elearning' && (
                <div className="bg-white dark:bg-[#1C2A20] p-6 lg:p-8 rounded-3xl border border-emerald-900/10 dark:border-emerald-800/30 shadow-xs space-y-6">
                  <div>
                    <h3 className="font-black text-gray-900 dark:text-emerald-100 text-lg">Integrasi Polibatam E-Learning</h3>
                    <p className="text-xs text-gray-500 dark:text-emerald-300/60 font-medium mt-0.5">
                      Pengaturan koneksi akun Moodle Polibatam untuk impor otomatis kuis dan tugas kuliah.
                    </p>
                  </div>

                  {/* Connected Account Card */}
                  <div className="p-5 bg-[#EBF7EC] dark:bg-emerald-950/60 border border-[#D6ECD8] dark:border-emerald-800/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-[#3D5245] dark:bg-emerald-800 text-white flex items-center justify-center shrink-0 font-black text-base shadow-xs">
                        M
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-gray-900 dark:text-emerald-100">elearning.polibatam.ac.id</h4>
                        <p className="text-[11px] text-gray-600 dark:text-emerald-200/80 font-medium mt-0.5">
                          Terhubung sebagai: <strong className="text-[#2E4034] dark:text-emerald-300">{profile.email || user?.email || 'Mahasiswa'}</strong> (Token SSO Aktif)
                        </p>
                      </div>
                    </div>

                    <button 
                      type="button"
                      onClick={() => alert('Koneksi ke Hub E-Learning Polibatam Berhasil!')}
                      className="bg-white dark:bg-[#152219] hover:bg-gray-50 dark:hover:bg-emerald-900/40 text-gray-700 dark:text-emerald-200 border border-gray-200 dark:border-emerald-800/40 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer shrink-0 shadow-2xs"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-gray-500 dark:text-emerald-400" />
                      <span>Uji Koneksi Hub</span>
                    </button>
                  </div>

                  {/* Sync Controls */}
                  <div className="space-y-3 text-xs font-medium">
                    <div className="flex items-center justify-between p-4 bg-[#F4F7F4] dark:bg-emerald-950/40 rounded-2xl border border-emerald-900/10 dark:border-emerald-800/30">
                      <div>
                        <h5 className="font-bold text-gray-900 dark:text-emerald-100">Sinkronisasi Otomatis Latar Belakang</h5>
                        <p className="text-[11px] text-gray-500 dark:text-emerald-300/60 mt-0.5">Periksa tugas baru secara berkala tanpa perlu membuka Moodle</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSyncConfig({ ...syncConfig, autoSync: !syncConfig.autoSync })}
                        className={`w-12 h-6.5 rounded-full p-0.5 transition-all cursor-pointer flex items-center ${
                          syncConfig.autoSync ? 'bg-[#3D5245] dark:bg-emerald-600 justify-end' : 'bg-gray-300 dark:bg-emerald-950/80 justify-start'
                        }`}
                      >
                        <div className="w-5.5 h-5.5 bg-white dark:bg-emerald-100 rounded-full shadow-md"></div>
                      </button>
                    </div>

                    <div className="p-4 bg-[#F4F7F4] dark:bg-emerald-950/40 rounded-2xl border border-emerald-900/10 dark:border-emerald-800/30 space-y-2">
                      <label className="font-bold text-gray-900 dark:text-emerald-100 block">Interval Frekuensi Sinkronisasi</label>
                      <select
                        value={syncConfig.syncInterval}
                        onChange={(e) => setSyncConfig({ ...syncConfig, syncInterval: e.target.value })}
                        className="w-full p-2.5 bg-white dark:bg-[#152219] rounded-xl font-semibold text-gray-800 dark:text-emerald-100 outline-none border border-gray-200 dark:border-emerald-800/40 cursor-pointer focus:ring-2 focus:ring-[#3D5245]/20"
                      >
                        <option value="15">Setiap 15 Menit</option>
                        <option value="30">Setiap 30 Menit</option>
                        <option value="60">Setiap 1 Jam</option>
                        <option value="360">Setiap 6 Jam</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-[#F4F7F4] dark:bg-emerald-950/40 rounded-2xl border border-emerald-900/10 dark:border-emerald-800/30">
                      <div>
                        <h5 className="font-bold text-gray-900 dark:text-emerald-100">Sinkronkan Saat Aplikasi Dibuka</h5>
                        <p className="text-[11px] text-gray-500 dark:text-emerald-300/60 mt-0.5">Langsung perbarui daftar kuis & tugas saat TugasKu pertama kali dimuat</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSyncConfig({ ...syncConfig, syncOnLaunch: !syncConfig.syncOnLaunch })}
                        className={`w-12 h-6.5 rounded-full p-0.5 transition-all cursor-pointer flex items-center ${
                          syncConfig.syncOnLaunch ? 'bg-[#3D5245] dark:bg-emerald-600 justify-end' : 'bg-gray-300 dark:bg-emerald-950/80 justify-start'
                        }`}
                      >
                        <div className="w-5.5 h-5.5 bg-white dark:bg-emerald-100 rounded-full shadow-md"></div>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: NOTIFIKASI & PENGINGAT */}
              {activeTab === 'notifikasi' && (
                <div className="bg-white dark:bg-[#1C2A20] p-6 lg:p-8 rounded-3xl border border-emerald-900/10 dark:border-emerald-800/30 shadow-xs space-y-6">
                  <div>
                    <h3 className="font-black text-gray-900 dark:text-emerald-100 text-lg">Notifikasi & Pengingat Deadline</h3>
                    <p className="text-xs text-gray-500 dark:text-emerald-300/60 font-medium mt-0.5">
                      Atur toleransi waktu peringatan agar tidak ada tugas perkuliahan yang terlewat.
                    </p>
                  </div>

                  <div className="space-y-3 text-xs font-medium">
                    <div className="flex items-center justify-between p-4 bg-[#F4F7F4] dark:bg-emerald-950/40 rounded-2xl border border-emerald-900/10 dark:border-emerald-800/30">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#152219] text-[#3D5245] dark:text-emerald-300 flex items-center justify-center font-bold shadow-2xs">
                          <Bell className="w-4 h-4" />
                        </div>
                        <div>
                          <h5 className="font-bold text-gray-900 dark:text-emerald-100">Notifikasi Pop-up Desktop</h5>
                          <p className="text-[11px] text-gray-500 dark:text-emerald-300/60 mt-0.5">Tampilkan peringatan langsung di peramban browser komputer</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setNotifications({ ...notifications, browser: !notifications.browser })}
                        className={`w-12 h-6.5 rounded-full p-0.5 transition-all cursor-pointer flex items-center ${
                          notifications.browser ? 'bg-[#3D5245] dark:bg-emerald-600 justify-end' : 'bg-gray-300 dark:bg-emerald-950/80 justify-start'
                        }`}
                      >
                        <div className="w-5.5 h-5.5 bg-white dark:bg-emerald-100 rounded-full shadow-md"></div>
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-[#F4F7F4] dark:bg-emerald-950/40 rounded-2xl border border-emerald-900/10 dark:border-emerald-800/30">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#152219] text-[#3D5245] dark:text-emerald-300 flex items-center justify-center font-bold shadow-2xs">
                          <Mail className="w-4 h-4" />
                        </div>
                        <div>
                          <h5 className="font-bold text-gray-900 dark:text-emerald-100">Ringkasan Harian via Email</h5>
                          <p className="text-[11px] text-gray-500 dark:text-emerald-300/60 mt-0.5">Kirim daftar tugas mendatang ke email mahasiswa setiap jam 07:00 WIB</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setNotifications({ ...notifications, emailDigest: !notifications.emailDigest })}
                        className={`w-12 h-6.5 rounded-full p-0.5 transition-all cursor-pointer flex items-center ${
                          notifications.emailDigest ? 'bg-[#3D5245] dark:bg-emerald-600 justify-end' : 'bg-gray-300 dark:bg-emerald-950/80 justify-start'
                        }`}
                      >
                        <div className="w-5.5 h-5.5 bg-white dark:bg-emerald-100 rounded-full shadow-md"></div>
                      </button>
                    </div>

                    <div className="p-4 bg-[#F4F7F4] dark:bg-emerald-950/40 rounded-2xl border border-emerald-900/10 dark:border-emerald-800/30 space-y-3">
                      <h5 className="font-bold text-gray-900 dark:text-emerald-100">Waktu Peringatan Sebelum Tenggat</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <label className="flex items-center gap-3 p-3.5 bg-white dark:bg-[#152219] rounded-xl border border-gray-200 dark:border-emerald-800/40 cursor-pointer hover:border-[#3D5245] dark:hover:border-emerald-500 transition-colors">
                          <input
                            type="checkbox"
                            checked={notifications.h1}
                            onChange={(e) => setNotifications({ ...notifications, h1: e.target.checked })}
                            className="w-4 h-4 accent-[#3D5245] dark:accent-emerald-500 rounded cursor-pointer"
                          />
                          <span className="font-bold text-gray-800 dark:text-emerald-200">H-1 Hari (24 Jam)</span>
                        </label>

                        <label className="flex items-center gap-3 p-3.5 bg-white dark:bg-[#152219] rounded-xl border border-gray-200 dark:border-emerald-800/40 cursor-pointer hover:border-[#3D5245] dark:hover:border-emerald-500 transition-colors">
                          <input
                            type="checkbox"
                            checked={notifications.h3Hours}
                            onChange={(e) => setNotifications({ ...notifications, h3Hours: e.target.checked })}
                            className="w-4 h-4 accent-[#3D5245] dark:accent-emerald-500 rounded cursor-pointer"
                          />
                          <span className="font-bold text-gray-800 dark:text-emerald-200">H-3 Jam Sebelum Deadline</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: TAMPILAN & TEMA */}
              {activeTab === 'tampilan' && (
                <div className="bg-white dark:bg-[#1C2A20] p-6 lg:p-8 rounded-3xl border border-emerald-900/10 dark:border-emerald-800/30 shadow-xs space-y-6">
                  <div>
                    <h3 className="font-black text-gray-900 dark:text-emerald-100 text-lg">Tampilan & Mode Tema</h3>
                    <p className="text-xs text-gray-500 dark:text-emerald-300/60 font-medium mt-0.5">
                      Pilih skema warna antarmuka agar nyaman saat belajar malam hari.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-medium">
                    <button
                      type="button"
                      onClick={() => applyTheme('light')}
                      className={`p-5 rounded-2xl border flex flex-col items-center gap-2.5 transition-all cursor-pointer ${
                        theme === 'light'
                          ? 'border-[#3D5245] bg-[#EBF7EC] text-gray-900 dark:text-emerald-950 font-bold shadow-xs'
                          : 'border-gray-200 dark:border-emerald-800/40 text-gray-600 dark:text-emerald-200 hover:bg-gray-50 dark:hover:bg-emerald-950/40'
                      }`}
                    >
                      <Sun className="w-6 h-6 text-amber-500" />
                      <span>Mode Terang (Sage)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => applyTheme('dark')}
                      className={`p-5 rounded-2xl border flex flex-col items-center gap-2.5 transition-all cursor-pointer ${
                        theme === 'dark'
                          ? 'border-emerald-500 bg-[#3D5245] text-white font-bold shadow-xs'
                          : 'border-gray-200 dark:border-emerald-800/40 text-gray-600 dark:text-emerald-200 hover:bg-gray-50 dark:hover:bg-emerald-950/40'
                      }`}
                    >
                      <Moon className="w-6 h-6 text-emerald-300" />
                      <span>Mode Gelap (Malam)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => applyTheme('system')}
                      className={`p-5 rounded-2xl border flex flex-col items-center gap-2.5 transition-all cursor-pointer ${
                        theme === 'system'
                          ? 'border-[#3D5245] dark:border-emerald-500 bg-[#EBF7EC] dark:bg-emerald-950 text-gray-900 dark:text-emerald-100 font-bold shadow-xs'
                          : 'border-gray-200 dark:border-emerald-800/40 text-gray-600 dark:text-emerald-200 hover:bg-gray-50 dark:hover:bg-emerald-950/40'
                      }`}
                    >
                      <Laptop className="w-6 h-6 text-gray-600 dark:text-emerald-300" />
                      <span>Ikuti Sistem</span>
                    </button>
                  </div>

                  <div className="p-4 bg-[#F4F7F4] dark:bg-emerald-950/40 rounded-2xl border border-emerald-900/10 dark:border-emerald-800/30 flex items-center justify-between text-xs font-medium">
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-gray-600 dark:text-emerald-300" />
                      <div>
                        <h5 className="font-bold text-gray-900 dark:text-emerald-100">Bahasa Antarmuka</h5>
                        <p className="text-[11px] text-gray-500 dark:text-emerald-300/60 mt-0.5">Bahasa pengantar aplikasi TugasKu</p>
                      </div>
                    </div>
                    <select className="p-2.5 bg-white dark:bg-[#152219] rounded-xl border border-gray-200 dark:border-emerald-800/40 font-bold text-gray-800 dark:text-emerald-100 outline-none cursor-pointer focus:ring-2 focus:ring-[#3D5245]/20">
                      <option>Bahasa Indonesia (ID)</option>
                      <option>English (EN)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* TAB 5: KEAMANAN & DATA */}
              {activeTab === 'data' && (
                <div className="bg-white dark:bg-[#1C2A20] p-6 lg:p-8 rounded-3xl border border-emerald-900/10 dark:border-emerald-800/30 shadow-xs space-y-6">
                  <div>
                    <h3 className="font-black text-gray-900 dark:text-emerald-100 text-lg">Keamanan & Manajemen Data</h3>
                    <p className="text-xs text-gray-500 dark:text-emerald-300/60 font-medium mt-0.5">
                      Cadangkan catatan tugas kamu atau atur ulang memori lokal peramban.
                    </p>
                  </div>

                  <div className="space-y-4 text-xs font-medium">
                    <div className="p-5 bg-[#F4F7F4] dark:bg-emerald-950/40 rounded-2xl border border-emerald-900/10 dark:border-emerald-800/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h5 className="font-bold text-gray-900 dark:text-emerald-100">Cadangkan Data Tugas (Backup JSON)</h5>
                        <p className="text-[11px] text-gray-500 dark:text-emerald-300/60 mt-0.5">Unduh seluruh catatan dan daftar tugas sebagai berkas cadangan lokal</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleExportData}
                        disabled={isLoading}
                        className="bg-white dark:bg-[#152219] hover:bg-gray-50 dark:hover:bg-emerald-900/40 text-gray-800 dark:text-emerald-200 border border-gray-200 dark:border-emerald-800/40 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer shrink-0 shadow-2xs disabled:opacity-60"
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin text-gray-500 dark:text-emerald-400" />
                        ) : (
                          <Download className="w-4 h-4 text-gray-600 dark:text-emerald-400" />
                        )}
                        <span>Unduh Data</span>
                      </button>
                    </div>

                    <div className="p-5 bg-red-50/70 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h5 className="font-bold text-red-700 dark:text-red-400">Bersihkan Memori Data Lokal</h5>
                        <p className="text-[11px] text-red-600/80 dark:text-red-300/60 mt-0.5">Hapus seluruh riwayat tugas tersimpan dari memori peramban ini</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleResetData}
                        disabled={isLoading}
                        className="bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer shrink-0 shadow-xs disabled:opacity-60"
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                        <span>Reset Data</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </main>
      </div>

      {/* Modal Tambah Tugas Baru */}
      <TaskForm isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}