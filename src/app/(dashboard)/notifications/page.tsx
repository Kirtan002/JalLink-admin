import { PageHeader } from '@/components/PageHeader';
import { StatCard } from '@/components/StatCard';
import { DemoDataNotice } from '@/components/DemoDataNotice';
import { DataTable } from '@/components/DataTable';
import { NotificationStatusBadge } from '@/components/StatusBadge';
import { MOCK_NOTIFICATIONS } from '@/lib/mockData';
import { getDictionary } from '@/lib/i18n/server';

export default async function NotificationsPage() {
  const t = await getDictionary();

  const totalSent = MOCK_NOTIFICATIONS.reduce((sum, c) => sum + c.sent, 0);
  const totalDelivered = MOCK_NOTIFICATIONS.reduce((sum, c) => sum + c.delivered, 0);
  const deliveryRate = totalSent > 0 ? Math.round((totalDelivered / totalSent) * 100) : 0;
  const failed = MOCK_NOTIFICATIONS.filter((c) => c.status === 'failed').length;

  return (
    <>
      <PageHeader title={t.notifications.title} description={t.notifications.description} />
      <DemoDataNotice message={t.common.demoNotice} />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label={t.notifications.sent} value={totalSent} tone="blue" href="/users" />
        <StatCard label={t.notifications.deliveryRate} value={`${deliveryRate}%`} tone="green" />
        <StatCard label={t.notifications.campaigns} value={MOCK_NOTIFICATIONS.length} tone="slate" />
        <StatCard label={t.notifications.failedCampaigns} value={failed} tone="amber" />
      </div>

      <div className="mt-8">
        <DataTable
          columns={[
            {
              header: t.notifications.campaign,
              cell: (c) => <span className="font-medium text-(--color-text)">{c.campaign}</span>,
            },
            {
              header: t.notifications.audience,
              cell: (c) => <span className="text-(--color-text-muted)">{c.audience}</span>,
            },
            { header: t.notifications.sent, cell: (c) => c.sent },
            { header: t.notifications.delivered, cell: (c) => c.delivered },
            { header: t.common.status, cell: (c) => <NotificationStatusBadge status={c.status} /> },
          ]}
          rows={MOCK_NOTIFICATIONS}
        />
      </div>
    </>
  );
}
