import type { ReactNode } from 'react';

type BadgeTone = 'green' | 'blue' | 'slate' | 'amber' | 'red';

const TONE_CLASSES: Record<BadgeTone, string> = {
  green: 'bg-(--color-brand-green-light) text-(--color-brand-green-dark)',
  blue: 'bg-(--color-brand-blue-light) text-(--color-brand-blue-dark)',
  slate: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  amber: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  red: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300',
};

export function Badge({ tone, children }: { tone: BadgeTone; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap ${TONE_CLASSES[tone]}`}>
      {children}
    </span>
  );
}
