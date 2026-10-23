export default function StatCard({ label, title, count, subtitle, note, color }) {
  const styles = {
    red: {
      bg: 'bg-red-50/60',
      border: 'border-red-200',
      badge: 'bg-red-100 text-red-700',
      iconBg: 'bg-red-100 text-red-500',
      textAlert: 'text-red-600',
    },
    amber: {
      bg: 'bg-amber-50/60',
      border: 'border-amber-200',
      badge: 'bg-amber-100 text-amber-700',
      iconBg: 'bg-amber-100 text-amber-600',
      textAlert: 'text-amber-700',
    },
    green: {
      bg: 'bg-emerald-50/60',
      border: 'border-emerald-200',
      badge: 'bg-emerald-100 text-emerald-700',
      iconBg: 'bg-emerald-100 text-emerald-600',
      textAlert: 'text-emerald-700',
    },
  }[color];

  return (
    <div className={`p-4 rounded-2xl border ${styles.border} ${styles.bg} flex flex-col justify-between`}>
      <div>
        <div className="flex justify-between items-start mb-2">
          <span className="text-[11px] font-bold tracking-wider text-gray-500 uppercase">{label}</span>
          <div className={`p-2 rounded-xl ${styles.iconBg}`}>
            <span className="text-xs font-bold">!</span>
          </div>
        </div>
        <h3 className="font-bold text-gray-800 text-base">{title}</h3>
        <div className="flex items-baseline gap-1 mt-1">
          <span className="text-3xl font-extrabold text-gray-900">{count}</span>
          <span className="text-xs text-gray-600">{subtitle}</span>
        </div>
      </div>
      <p className={`text-xs font-medium mt-4 ${styles.textAlert}`}>{note}</p>
    </div>
  );
}