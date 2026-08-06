import { Logo } from '@/components/Logo';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { I18nProvider } from '@/lib/i18n/client';
import { getI18n } from '@/lib/i18n/server';
import { LoginForm } from './login-form';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  // The login page is outside the dashboard layout, so it carries its own provider — the
  // language has to be switchable *before* you can sign in.
  const { locale, dict } = await getI18n();

  return (
    <I18nProvider locale={locale} dict={dict}>
      <div className="flex min-h-screen items-center justify-center bg-(--color-surface-muted) px-4 py-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex justify-center">
            <Logo />
          </div>
          <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 shadow-sm sm:p-8">
            <h1 className="mb-1 text-xl font-semibold text-slate-900 dark:text-slate-50">
              {dict.login.title}
            </h1>
            <p className="mb-6 text-sm text-(--color-text-muted)">{dict.login.subtitle}</p>
            <LoginForm next={next && next.startsWith('/') ? next : '/'} />
          </div>
          <div className="mt-6 flex justify-center">
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </I18nProvider>
  );
}
