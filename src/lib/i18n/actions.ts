'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { LOCALE_COOKIE_MAX_AGE, LOCALE_COOKIE_NAME, isLocale } from './config';

/**
 * Switches the panel's language.
 *
 * Deliberately not session-gated: the login page carries the switcher too, and the cookie
 * holds nothing but a two-letter language tag. An unrecognized value is ignored rather than
 * rejected loudly — there is no useful error to show for it.
 *
 * The revalidate covers the root layout, so `<html lang>` and every rendered string update
 * together instead of the page keeping stale copy until its next fetch.
 */
export async function setLocale(locale: string): Promise<void> {
  if (!isLocale(locale)) {
    return;
  }

  const store = await cookies();
  store.set(LOCALE_COOKIE_NAME, locale, {
    httpOnly: false,
    sameSite: 'lax',
    path: '/',
    maxAge: LOCALE_COOKIE_MAX_AGE,
  });

  revalidatePath('/', 'layout');
}
