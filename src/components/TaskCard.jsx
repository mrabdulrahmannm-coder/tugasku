import { Check, Clock, Trash2 } from 'lucide-react';
import { useState } from 'react';
import api from '../api/axios';
import StatusBadge from './StatusBadge';

export default function TaskCard({ task, onRefresh, onSelect }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleComplete = async () => {
    try {
      await api.patch(`/tugas/${task.id}/complete`);
      onRefresh?.();
    } catch (error) {
      alert('Gagal menandai tugas selesai.');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Yakin ingin menghapus tugas ini?')) return;
    setIsDeleting(true);
    try {
      await api.delete(`/tugas/${task.id}`);
      onRefresh?.();
    } catch (error) {
      alert('Gagal menghapus tugas.');
    } finally {
      setIsDeleting(false);
    }
  };

  const isSelesai = task.status === 'Selesai';
  const deadline = task.deadline_date
    ? new Date(task.deadline_date).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '-';

  return (
    <div
      onClick={() => onSelect?.()}
      className={`bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-start justify-between gap-4 ${isSelesai ? 'bg-gray-50/50' : ''} cursor-pointer hover:bg-gray-50 transition`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <StatusBadge status={task.status} />
          {task.prioritas === 'Tinggi' && (
            <span className="inline-flex items-center gap-1 rounded-md bg-red-50 text-red-700 text-[10px] font-bold px-2 py-0.5">
              ! Prioritas Tinggi
            </span>
          )}
        </div>
        <h3 className={`font-bold text-gray-900 text-base leading-tight ${isSelesai ? 'line-through text-gray-400' : ''}`}>
          {task.nama_tugas}
        </h3>
        <div className="mt-2 space-y-1 text-xs text-gray-600">
          {task.mata_kuliah && (
            <div className="flex items-center gap-1">
              <span className="w-3.5 h-3.5 flex-shrink-0">📚</span>
              <span>{task.mata_kuliah.nama_matkul}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>
              {deadline}
              {task.deadline_time ? ` • ${task.deadline_time.slice(0, 5)}` : ''}
            </span>
          </div>
          {task.dosen && <span>👤 {task.dosen}</span>}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {isSelesai ? (
          <span className="p-1 text-emerald-500"><Check className="w-4 h-4" /></span>
        ) : (
          <button
            onClick={handleComplete}
            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
            title="Tandai selesai"
          >
            <Check className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
          title="Hapus"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
