import Link from 'next/link';

type StatTone = 'blue' | 'green' | 'slate' | 'amber';

const TONE_CLASSES: Record<StatTone, string> = {
  blue: 'text-(--color-brand-blue-dark)',
  green: 'text-(--color-brand-green-dark)',
  slate: 'text-slate-600 dark:text-slate-300',
  amber: 'text-amber-600 dark:text-amber-400',
};

const BASE_CLASSES = 'rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 shadow-sm';

export function StatCard({
  label,
  value,
  tone = 'blue',
  href,
}: {
  label: string;
  value: string | number;
  tone?: StatTone;
  /** When set, the whole tile becomes a link to the page this number came from. */
  href?: string;
}) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-(--color-text-muted)">{label}</p>
        {href && (
          <span aria-hidden="true" className="text-(--color-text-muted) opacity-0 transition group-hover:opacity-100">
            →
          </span>
        )}
      </div>
      <p className={`mt-2 text-3xl font-semibold ${TONE_CLASSES[tone]}`}>{value}</p>
    </>
  );

  if (!href) {
    return <div className={BASE_CLASSES}>{body}</div>;
  }

  return (
    <Link
      href={href}
      className={`${BASE_CLASSES} group block transition hover:-translate-y-0.5 hover:border-(--color-brand-blue) hover:shadow-md`}
    >
      {body}
    </Link>
  );
}
