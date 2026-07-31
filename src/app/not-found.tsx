import Link from 'next/link';
import { Logo } from '@/components/Logo';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-(--color-surface-muted) px-4 text-center">
      <Logo />
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">Not found</h1>
        <p className="mt-1 text-sm text-(--color-text-muted)">This page or record doesn&apos;t exist.</p>
      </div>
      <Link href="/" className="brand-gradient rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm">
        Back to dashboard
      </Link>
    </div>
  );
}
