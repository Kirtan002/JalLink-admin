import type { ReactNode } from 'react';
import { AppShell } from '@/components/AppShell';
import { I18nProvider } from '@/lib/i18n/client';
import { getI18n } from '@/lib/i18n/server';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const { locale, dict } = await getI18n();

  return (
    <I18nProvider locale={locale} dict={dict}>
      <AppShell username={process.env.ADMIN_USERNAME ?? 'admin'}>{children}</AppShell>
    </I18nProvider>
  );
}
