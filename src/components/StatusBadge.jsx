export default function StatusBadge({ status, size = 'sm' }) {
  const variants = {
    Selesai: { bg: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-600', label: 'Selesai' },
    'Hari Ini': { bg: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500', label: 'Hari Ini' },
    Mendatang: { bg: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500', label: 'Mendatang' },
    Terlambat: { bg: 'bg-red-100 text-red-700', dot: 'bg-red-500', label: 'Terlambat' },
    done: { bg: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-600', label: 'Selesai' },
    today: { bg: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500', label: 'Hari Ini' },
    upcoming: { bg: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500', label: 'Mendatang' },
    overdue: { bg: 'bg-red-100 text-red-700', dot: 'bg-red-500', label: 'Terlambat' },
  };

  const v = variants[status] || variants.Mendatang;
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';
  const pad = size === 'sm' ? 'px-2.5 py-0.5' : 'px-3 py-1';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full ${v.bg} ${v.textSize} font-medium ${pad}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${v.dot}`}></span>
      {v.label}
    </span>
  );
}
