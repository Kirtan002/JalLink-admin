import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { I18nProvider } from '@/lib/i18n/client';
import { getI18n } from '@/lib/i18n/server';
import { getSession } from '@/lib/auth';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const { locale, dict } = await getI18n();
  const session = await getSession();
  // proxy.ts already gates every page under this layout — this is defense in depth for the
  // rare request that reaches here without it.
  if (!session) {
    redirect('/login');
  }

  return (
    <I18nProvider locale={locale} dict={dict}>
      <AppShell username={session.name} role={session.role}>
        {children}
      </AppShell>
    </I18nProvider>
  );
}
