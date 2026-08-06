import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { getDictionary } from '@/lib/i18n/server';

export default async function NotFound() {
  const t = await getDictionary();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-(--color-surface-muted) px-4 text-center">
      <Logo />
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">{t.common.notFound}</h1>
        <p className="mt-1 text-sm text-(--color-text-muted)">{t.common.notFoundHint}</p>
      </div>
      <Link href="/" className="brand-gradient rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm">
        {t.common.backToDashboard}
      </Link>
    </div>
  );
}
