import type { ReactNode } from 'react';
import { Sidebar } from '@/components/Sidebar';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-start">
      <Sidebar username={process.env.ADMIN_USERNAME ?? 'admin'} />
      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-6xl px-8 py-10">{children}</div>
      </main>
    </div>
  );
}
