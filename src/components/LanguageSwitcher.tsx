'use client';

import { useTransition } from 'react';
import { LOCALES, type Locale } from '@/lib/i18n/config';
import { DICTIONARIES } from '@/lib/i18n/dictionaries';
import { setLocale } from '@/lib/i18n/actions';
import { useLocale, useTranslations } from '@/lib/i18n/client';

/**
 * Each language is labelled in its own script (English / हिन्दी), never translated — someone
 * looking for Hindi is looking for "हिन्दी", not for whatever the current language calls it.
 *
 * A native `<select>` rather than a custom dropdown: it is one tap on mobile, gets the OS
 * picker for free, and needs no outside-click or focus-trap handling of its own.
 */
export function LanguageSwitcher({ className = '' }: { className?: string }) {
  const t = useTranslations();
  const locale = useLocale();
  const [pending, startTransition] = useTransition();

  return (
    <label className={`flex items-center gap-2 text-xs text-(--color-text-muted) ${className}`}>
      <span className="sr-only">{t.app.language}</span>
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden="true"
        className="shrink-0"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c2.5 2.7 2.5 15.3 0 18M12 3c-2.5 2.7-2.5 15.3 0 18" />
      </svg>
      <select
        value={locale}
        disabled={pending}
        onChange={(event) => {
          const next = event.target.value as Locale;
          startTransition(() => {
            void setLocale(next);
          });
        }}
        className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-2 py-1.5 text-sm text-(--color-text) outline-none focus:border-(--color-brand-blue) disabled:opacity-60"
      >
        {LOCALES.map((value) => (
          <option key={value} value={value}>
            {DICTIONARIES[value].meta.languageName}
          </option>
        ))}
      </select>
    </label>
  );
}
