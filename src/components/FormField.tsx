import type { ReactNode } from 'react';

export const inputClass =
  'rounded-lg border border-(--color-border) bg-(--color-surface) px-3.5 py-2.5 text-sm outline-none focus:border-(--color-brand-blue) focus:ring-2 focus:ring-(--color-brand-blue)/20';
export const labelClass = 'text-sm font-medium text-slate-700 dark:text-slate-300';
/** Denser label for forms nested inside a table row (see plans/edit-plan-form). */
export const compactLabelClass = 'text-xs font-medium text-(--color-text-muted)';

/**
 * Row layout for the inline forms. Deliberately `items-start`, not `items-end`: bottom
 * alignment made any field carrying a hint taller than its neighbours, which shoved that
 * field's label up and dropped the submit button below the input line.
 */
export const formRowClass = 'flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start';

export function FormField({
  label,
  htmlFor,
  hint,
  className = '',
  compact = false,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: ReactNode;
  className?: string;
  compact?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={htmlFor} className={compact ? compactLabelClass : labelClass}>
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-(--color-text-muted)">{hint}</p>}
    </div>
  );
}

/**
 * Reserves exactly one label's height, so whatever follows lands on the input line rather
 * than the top of the row. Hidden on mobile, where the row stacks and there is nothing to
 * align to. Use `FormSubmit` for a plain submit button; use this directly for button groups.
 */
export function FormLabelSpacer({ compact = false }: { compact?: boolean }) {
  return (
    <span aria-hidden="true" className={`hidden select-none sm:block ${compact ? compactLabelClass : labelClass}`}>
      &nbsp;
    </span>
  );
}

/** Submit button that lines up with the inputs beside it — see FormLabelSpacer. */
export function FormSubmit({
  pending,
  label,
  pendingLabel,
}: {
  pending: boolean;
  label: string;
  pendingLabel: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <FormLabelSpacer />
      <button
        type="submit"
        disabled={pending}
        className="brand-gradient rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-60"
      >
        {pending ? pendingLabel : label}
      </button>
    </div>
  );
}

/** Full-width error line under a form row. */
export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm text-red-600 sm:basis-full dark:text-red-400">{message}</p>;
}
