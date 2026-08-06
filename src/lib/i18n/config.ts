/**
 * Locale is carried in a cookie, not in the URL.
 *
 * The alternative — an `app/[lang]/…` segment — is the pattern the Next docs describe, and
 * it is the right one for a public site where a shared link has to open in the sender's
 * language. This panel is a single-operator internal tool behind a login: nobody shares its
 * URLs, every route is already dynamic (cookie-based session, `no-store` fetches), and the
 * cookie keeps `/subscriptions?status=active` meaning one thing instead of two.
 */
export const LOCALES = ['en', 'hi', 'gu'] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

export const LOCALE_COOKIE_NAME = 'jallink_admin_locale';
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/** BCP-47 tags for `Intl` and the `<html lang>` attribute. Every locale formats numbers,
 * dates and currency the Indian way; only the language differs. */
export const LOCALE_TAGS: Record<Locale, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  gu: 'gu-IN',
};

export function isLocale(value: string | undefined | null): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

/**
 * Fills `{placeholders}` in a dictionary string.
 *
 * Dictionaries have to survive the server→client boundary, so entries are plain strings, not
 * functions. A missing variable is left as-is rather than rendered as "undefined" — a visible
 * `{count}` is a bug report; the word "undefined" in the UI is a mystery.
 */
export function interpolate(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in vars ? String(vars[key]) : match,
  );
}
