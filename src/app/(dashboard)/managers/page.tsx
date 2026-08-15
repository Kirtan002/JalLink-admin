import { redirect } from 'next/navigation';
import { api, ApiError } from '@/lib/api';
import { getSession } from '@/lib/auth';
import { PageHeader } from '@/components/PageHeader';
import { ErrorBanner } from '@/components/ErrorBanner';
import { Card } from '@/components/Card';
import { getDictionary } from '@/lib/i18n/server';
import { CreateManagerForm } from './create-manager-form';
import { ManagersTable } from './managers-table';

/** Admin-only: creating and deactivating manager (and other admin) accounts. proxy.ts
 * already keeps a manager off this route entirely — this redirect is defense in depth for
 * the same rare edge case the (dashboard)/layout.tsx session check covers. */
export default async function ManagersPage() {
  const t = await getDictionary();
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    redirect('/profile');
  }

  let admins;
  try {
    admins = await api.listAdminStaff();
  } catch (err) {
    const message = err instanceof ApiError ? err.message : t.common.apiUnreachable;
    return (
      <>
        <PageHeader title={t.managers.title} />
        <ErrorBanner message={message} />
      </>
    );
  }

  return (
    <>
      <PageHeader title={t.managers.title} description={t.managers.description} />

      <div className="mb-8">
        <ManagersTable admins={admins} currentAdminId={session.adminId} />
      </div>

      <Card title={t.managers.addManager}>
        <p className="mb-5 text-sm text-(--color-text-muted)">{t.managers.addManagerHint}</p>
        <CreateManagerForm />
      </Card>
    </>
  );
}
