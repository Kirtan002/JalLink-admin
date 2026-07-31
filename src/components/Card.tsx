import type { ReactNode } from 'react';

export function Card({ title, children, className = '' }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 shadow-sm ${className}`}>
      {title && (
        <h2 className="mb-4 text-xs font-semibold tracking-wide text-(--color-text-muted) uppercase">{title}</h2>
      )}
      {children}
    </div>
  );
}
