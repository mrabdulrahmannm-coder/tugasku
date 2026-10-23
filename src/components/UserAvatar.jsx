export default function UserAvatar({ user, className = '' }) {
  const name = user?.name?.trim() || 'User';
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  if (user?.avatar_url || user?.avatar) {
    return (
      <img
        src={user.avatar_url || user.avatar}
        alt={name}
        className={`object-cover ${className}`}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={name}
      className={`flex items-center justify-center bg-[#A3D9A5] text-[#1E3023] font-black ${className}`}
    >
      {initials}
    </div>
  );
}
