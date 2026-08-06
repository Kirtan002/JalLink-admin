import type { Metadata, Viewport } from 'next';
import { LOCALE_TAGS } from '@/lib/i18n/config';
import { getI18n } from '@/lib/i18n/server';
import './globals.css';

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.app.title, description: dict.app.description };
}

/** Without this the panel renders at desktop width and is scaled down on a phone, which is
 * the single biggest reason a responsive layout can still look unusable there. */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { locale } = await getI18n();

  return (
    <html lang={LOCALE_TAGS[locale]} className="h-full" suppressHydrationWarning>
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
