import type { ReactNode } from 'react';

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
}) {
  // Stacks below `sm` — a header action sitting beside a two-line title has nowhere to go on
  // a phone, and wrapping it under the text keeps both readable.
  return (
    <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <div className="min-w-0">
        <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl dark:text-slate-50">
          {title}
        </h1>
        {description && <p className="mt-1 text-sm text-(--color-text-muted)">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
