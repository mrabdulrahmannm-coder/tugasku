import { useEffect, useMemo, useState } from 'react';
import {
  Archive,
  Inbox,
  Loader2,
  MessageSquare,
  Search,
  Star,
  UserRound,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import UserAvatar from '../components/UserAvatar';
import api from '../api/axios';

const categoryLabels = {
  saran: 'Saran fitur',
  bug: 'Laporan bug',
  pujian: 'Apresiasi',
  lainnya: 'Lainnya',
};

export default function AdminFeedback({ onNavigate, onLogout }) {
  const [user, setUser] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        setError('Data sesi admin tidak dapat dibaca.');
      }
    }

    api.get('/admin/umpan-balik')
      .then((response) => setFeedback(response.data || []))
      .catch((requestError) => {
        setError(requestError.response?.data?.message || 'Gagal memuat kiriman feedback.');
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredFeedback = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) return feedback;
    return feedback.filter((item) =>
      [item.judul, item.pesan, item.user?.name, item.user?.email, item.kategori]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query))
    );
  }, [feedback, search]);

  return (
    <div className="flex min-h-screen bg-[#F0F4F1] dark:bg-[#121E16] text-gray-800 dark:text-emerald-100">
      <Sidebar
        activePage="Feedback Admin"
        onNavigate={onNavigate}
        onLogout={onLogout}
        user={user}
      />
      <div className="flex-1 min-w-0">
        <Topbar onNavigate={onNavigate} user={user} />
        <main className="max-w-[1500px] mx-auto p-6 lg:p-10 space-y-7">
          <header className="relative overflow-hidden rounded-[2rem] bg-[#1E3023] p-7 lg:p-10 text-white shadow-xl">
            <div className="absolute -right-20 -top-28 h-80 w-80 rounded-full bg-[#A3D9A5]/20 blur-3xl" />
            <div className="relative max-w-2xl">
              <div className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-[#A3D9A5]">
                <Inbox className="h-4 w-4" />
                Admin workspace
              </div>
              <h1 className="text-3xl font-black tracking-tight lg:text-5xl">Kotak Masuk Feedback</h1>
              <p className="mt-3 text-sm leading-relaxed text-emerald-100/70">
                Dengarkan pengalaman pengguna, temukan pola masalah, dan ubah masukan menjadi perbaikan nyata.
              </p>
            </div>
          </header>

          <section className="grid gap-4 sm:grid-cols-3">
            {[
              ['Total kiriman', feedback.length, MessageSquare],
              ['Rata-rata rating', feedback.length ? (feedback.reduce((sum, item) => sum + Number(item.rating || 0), 0) / feedback.length).toFixed(1) : '0.0', Star],
              ['Laporan bug', feedback.filter((item) => item.kategori === 'bug').length, Archive],
            ].map(([label, value, Icon]) => (
              <div key={label} className="rounded-3xl border border-emerald-900/10 bg-white p-5 shadow-sm dark:border-emerald-800/30 dark:bg-[#1C2A20]">
                <Icon className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
                <p className="mt-5 text-xs font-bold text-gray-500 dark:text-emerald-300/60">{label}</p>
                <p className="mt-1 text-3xl font-black text-gray-900 dark:text-emerald-100">{value}</p>
              </div>
            ))}
          </section>

          <section className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
            <div className="rounded-3xl border border-emerald-900/10 bg-white p-5 shadow-sm dark:border-emerald-800/30 dark:bg-[#1C2A20]">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-black text-gray-900 dark:text-emerald-100">Kiriman terbaru</h2>
                  <p className="mt-1 text-xs text-gray-500 dark:text-emerald-300/60">Pilih satu pesan untuk membaca detailnya.</p>
                </div>
                <div className="relative sm:w-64">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari feedback..." className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-3 text-xs outline-none focus:border-emerald-600 dark:border-emerald-800/40 dark:bg-[#152219]" />
                </div>
              </div>
              {loading && <Loader2 className="mx-auto my-16 h-7 w-7 animate-spin text-emerald-600" />}
              {!loading && error && <p className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
              {!loading && !error && filteredFeedback.length === 0 && (
                <div className="py-16 text-center text-sm text-gray-500 dark:text-emerald-300/60">Belum ada feedback yang cocok.</div>
              )}
              <div className="space-y-2">
                {filteredFeedback.map((item) => (
                  <button key={item.id} onClick={() => setSelectedFeedback(item)} className={`w-full rounded-2xl border p-4 text-left transition ${selectedFeedback?.id === item.id ? 'border-emerald-600 bg-emerald-50 dark:border-emerald-500 dark:bg-emerald-950/40' : 'border-transparent hover:border-emerald-900/10 hover:bg-gray-50 dark:hover:bg-emerald-950/30'}`}>
                    <div className="flex items-start gap-3">
                      <UserAvatar user={item.user} className="h-10 w-10 shrink-0 rounded-xl text-xs" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <p className="truncate text-sm font-black text-gray-900 dark:text-emerald-100">{item.judul}</p>
                          <span className="shrink-0 text-[10px] font-bold text-gray-400">{new Date(item.created_at).toLocaleDateString('id-ID')}</span>
                        </div>
                        <p className="mt-1 text-xs text-gray-500 dark:text-emerald-300/60">{item.user?.name || 'Pengguna'} · {categoryLabels[item.kategori] || item.kategori}</p>
                        <p className="mt-2 truncate text-xs text-gray-600 dark:text-emerald-200/70">{item.pesan}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <aside className="rounded-3xl border border-emerald-900/10 bg-[#E8F2E9] p-6 dark:border-emerald-800/30 dark:bg-[#1C2A20]">
              {selectedFeedback ? (
                <>
                  <div className="flex items-center gap-3 border-b border-emerald-900/10 pb-5 dark:border-emerald-800/30">
                    <UserAvatar user={selectedFeedback.user} className="h-12 w-12 rounded-2xl text-sm" />
                    <div className="min-w-0">
                      <p className="font-black text-gray-900 dark:text-emerald-100">{selectedFeedback.user?.name || 'Pengguna'}</p>
                      <p className="truncate text-xs text-gray-500 dark:text-emerald-300/60">{selectedFeedback.user?.email || selectedFeedback.user?.nim}</p>
                    </div>
                  </div>
                  <span className="mt-5 inline-flex rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300">{categoryLabels[selectedFeedback.kategori] || selectedFeedback.kategori}</span>
                  <h2 className="mt-4 text-2xl font-black text-gray-900 dark:text-emerald-100">{selectedFeedback.judul}</h2>
                  <div className="mt-3 flex gap-1 text-amber-500">{Array.from({ length: 5 }, (_, index) => <Star key={index} className={`h-4 w-4 ${index < selectedFeedback.rating ? 'fill-current' : ''}`} />)}</div>
                  <p className="mt-6 whitespace-pre-wrap text-sm leading-7 text-gray-700 dark:text-emerald-200/80">{selectedFeedback.pesan}</p>
                </>
              ) : (
                <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
                  <MessageSquare className="h-8 w-8 text-emerald-700/50" />
                  <p className="mt-4 text-sm font-bold text-gray-700 dark:text-emerald-200">Pilih feedback</p>
                  <p className="mt-1 max-w-xs text-xs text-gray-500 dark:text-emerald-300/60">Detail kiriman user akan muncul di panel ini.</p>
                </div>
              )}
            </aside>
          </section>
        </main>
      </div>
    </div>
  );
}
