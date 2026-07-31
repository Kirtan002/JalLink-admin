type StatTone = 'blue' | 'green' | 'slate' | 'amber';

const TONE_CLASSES: Record<StatTone, string> = {
  blue: 'text-(--color-brand-blue-dark)',
  green: 'text-(--color-brand-green-dark)',
  slate: 'text-slate-600 dark:text-slate-300',
  amber: 'text-amber-600 dark:text-amber-400',
};

export function StatCard({
  label,
  value,
  tone = 'blue',
}: {
  label: string;
  value: string | number;
  tone?: StatTone;
}) {
  return (
    <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 shadow-sm">
      <p className="text-sm text-(--color-text-muted)">{label}</p>
      <p className={`mt-2 text-3xl font-semibold ${TONE_CLASSES[tone]}`}>{value}</p>
    </div>
  );
}
