import { cookies } from 'next/headers';
import { DEFAULT_LOCALE, LOCALE_COOKIE_NAME, isLocale, type Locale } from './config';
import { DICTIONARIES, type Dictionary } from './dictionaries';

/**
 * Reading the locale from cookies makes a route dynamic. Every page in this panel already is
 * (session cookie + `no-store` API calls), so this costs nothing here — but it is the reason
 * these helpers are kept out of anything that might one day want to be static.
 */
export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE_NAME)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

/** The active dictionary. Server Components call this directly; Client Components read the
 * same object out of context (see ./client) rather than importing it. */
export async function getDictionary(): Promise<Dictionary> {
  return DICTIONARIES[await getLocale()];
}

/** Both at once, for the layouts that need the locale for `<html lang>` as well. */
export async function getI18n(): Promise<{ locale: Locale; dict: Dictionary }> {
  const locale = await getLocale();
  return { locale, dict: DICTIONARIES[locale] };
}
