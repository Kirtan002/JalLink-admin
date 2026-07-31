import { Logo } from '@/components/Logo';
import { LoginForm } from './login-form';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-(--color-surface-muted) px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-8 shadow-sm">
          <h1 className="mb-1 text-xl font-semibold text-slate-900 dark:text-slate-50">Sign in</h1>
          <p className="mb-6 text-sm text-(--color-text-muted)">Internal admin panel — authorized staff only.</p>
          <LoginForm next={next && next.startsWith('/') ? next : '/'} />
        </div>
      </div>
    </div>
  );
}
