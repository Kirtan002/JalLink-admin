export function Logo({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <linearGradient id="drop-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#16a34a" />
          </linearGradient>
        </defs>
        <path
          d="M12 2C12 2 4.5 11.5 4.5 15.5C4.5 19.6 7.9 23 12 23C16.1 23 19.5 19.6 19.5 15.5C19.5 11.5 12 2 12 2Z"
          fill="url(#drop-gradient)"
        />
      </svg>
      <span className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50">
        JalLink <span className="brand-gradient-text">Admin</span>
      </span>
    </div>
  );
}
