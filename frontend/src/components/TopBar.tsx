import { useUser } from '@clerk/clerk-react';

export default function TopBar({ title }: { title: string }) {
  const { user } = useUser();
  const display = user?.fullName || user?.primaryEmailAddress?.emailAddress || '';
  const email = user?.primaryEmailAddress?.emailAddress || '';
  const initials = display.slice(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-40 bg-[#f8faf8]/80 backdrop-blur-md shadow-[0_4px_24px_-4px_rgba(25,28,27,0.06)] flex justify-between items-center w-full px-8 py-4">
      <h2 className="text-xl font-extrabold tracking-tighter text-[#012d1d]">{title}</h2>
      <div className="flex items-center gap-3 pl-6 border-l border-outline-variant/20">
        <div className="text-right">
          <p className="text-sm font-bold text-primary">{display}</p>
          <p className="text-[10px] text-on-surface-variant">{email}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center ring-2 ring-primary-fixed">
          <span className="text-white text-sm font-bold">{initials}</span>
        </div>
      </div>
    </header>
  );
}
