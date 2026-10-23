import { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Loader2,
} from 'lucide-react';
import api from '../api/axios';

export default function MiniCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  // Ambil daftar tugas untuk menandai tanggal tenggat
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api.get('/tugas')
      .then((res) => {
        if (mounted) {
          setTasks(res.data || []);
        }
      })
      .catch((err) => {
        console.error('Gagal memuat tugas di MiniCalendar:', err);
        if (mounted) setTasks([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Helper navigasi bulan
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Nama bulan & hari Bahasa Indonesia
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const daysOfWeek = ['Sn', 'Sl', 'Rb', 'Km', 'Jm', 'Sb', 'Mn'];

  // Kalkulasi matriks tanggal
  const firstDayOfMonthIndex = (new Date(year, month, 1).getDay() + 6) % 7; // Senin = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const today = new Date();
  const isThisMonth = today.getFullYear() === year && today.getMonth() === month;
  const todayDate = today.getDate();

  // Mengumpulkan tanggal dari bulan lalu, bulan ini, dan bulan depan
  const calendarCells = [];

  // Padded days dari bulan lalu
  for (let i = firstDayOfMonthIndex - 1; i >= 0; i--) {
    calendarCells.push({
      day: daysInPrevMonth - i,
      isCurrentMonth: false,
    });
  }

  // Hari di bulan aktif
  for (let d = 1; d <= daysInMonth; d++) {
    // Format YYYY-MM-DD sederhana untuk pengecekan deadline tugas
    const formattedDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    
    // Cek apakah ada tugas belum selesai pada tanggal ini
    const hasPendingTask = tasks.some((t) => {
      if (t.status === 'Selesai') return false;
      if (!t.deadline_date) return false;
      return t.deadline_date.startsWith(formattedDateStr) || t.deadline_date.includes(`${d} `);
    });

    calendarCells.push({
      day: d,
      isCurrentMonth: true,
      isToday: isThisMonth && d === todayDate,
      hasTask: hasPendingTask,
    });
  }

  // Padded days untuk melengkapi sisa grid (42 sel = 6 baris x 7 kolom)
  const remainingCells = 42 - calendarCells.length;
  for (let i = 1; i <= remainingCells; i++) {
    calendarCells.push({
      day: i,
      isCurrentMonth: false,
    });
  }

  return (
    <div className="bg-white dark:bg-[#1C2A20] p-6 rounded-3xl border border-emerald-900/10 dark:border-emerald-800/30 shadow-xs space-y-4 transition-colors">
      {/* Header Widget */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-[#3D5245] dark:text-emerald-400" />
          <h3 className="font-extrabold text-sm text-gray-900 dark:text-emerald-100">
            {monthNames[month]} {year}
          </h3>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1.5 rounded-xl bg-gray-50 dark:bg-emerald-950/60 text-gray-600 dark:text-emerald-200 hover:bg-gray-100 dark:hover:bg-emerald-900/50 transition cursor-pointer"
            title="Bulan Sebelumnya"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1.5 rounded-xl bg-gray-50 dark:bg-emerald-950/60 text-gray-600 dark:text-emerald-200 hover:bg-gray-100 dark:hover:bg-emerald-900/50 transition cursor-pointer"
            title="Bulan Berikutnya"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid Hari */}
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-gray-400 dark:text-emerald-300/50 pb-1 border-b border-gray-100 dark:border-emerald-900/30">
        {daysOfWeek.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>

      {/* Matrix Tanggal */}
      {loading ? (
        <div className="py-8 flex flex-col items-center justify-center gap-2 text-xs text-gray-400 dark:text-emerald-300/50">
          <Loader2 className="w-5 h-5 animate-spin text-[#3D5245] dark:text-emerald-400" />
          <span>Memuat kalender...</span>
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-semibold">
          {calendarCells.map((cell, idx) => (
            <div
              key={idx}
              className={`h-8 rounded-xl flex items-center justify-center relative transition-all ${
                !cell.isCurrentMonth
                  ? 'text-gray-300 dark:text-emerald-900/60'
                  : cell.isToday
                  ? 'bg-[#3D5245] dark:bg-emerald-600 text-white font-extrabold shadow-xs'
                  : 'text-gray-700 dark:text-emerald-200 hover:bg-[#EBF7EC] dark:hover:bg-emerald-900/40'
              }`}
            >
              <span>{cell.day}</span>

              {/* Indikator Titik Tugas Pending */}
              {cell.hasTask && cell.isCurrentMonth && !cell.isToday && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 absolute bottom-1 left-1/2 -translate-x-1/2"></span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Footnote Legend */}
      <div className="pt-2 border-t border-gray-100 dark:border-emerald-900/30 flex items-center justify-between text-[11px] font-medium text-gray-500 dark:text-emerald-300/60">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#3D5245] dark:bg-emerald-500"></span>
          <span>Hari Ini</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          <span>Ada Deadline</span>
        </div>
      </div>
    </div>
  );
}