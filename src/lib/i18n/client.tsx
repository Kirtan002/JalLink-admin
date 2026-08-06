'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { DEFAULT_LOCALE, type Locale } from './config';
import { DICTIONARIES, type Dictionary } from './dictionaries';

interface I18nValue {
  locale: Locale;
  dict: Dictionary;
}

const I18nContext = createContext<I18nValue | null>(null);

/**
 * Hands the active dictionary to Client Components.
 *
 * A Server Component reads it with `getDictionary()`; a form or table marked `'use client'`
 * cannot, so the layout passes the already-resolved dictionary down through this provider.
 * Only the active locale crosses the wire — the other translations never reach the browser.
 */
export function I18nProvider({
  locale,
  dict,
  children,
}: {
  locale: Locale;
  dict: Dictionary;
  children: ReactNode;
}) {
  return <I18nContext.Provider value={{ locale, dict }}>{children}</I18nContext.Provider>;
}

/** Falls back to the default dictionary rather than throwing: a missing provider should show
 * an untranslated panel, not a blank error page. */
export function useTranslations(): Dictionary {
  return useContext(I18nContext)?.dict ?? DICTIONARIES[DEFAULT_LOCALE];
}

export function useLocale(): Locale {
  return useContext(I18nContext)?.locale ?? DEFAULT_LOCALE;
}
