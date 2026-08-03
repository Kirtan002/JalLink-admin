import { PageHeader } from '@/components/PageHeader';
import { StatCard } from '@/components/StatCard';
import { DemoDataNotice } from '@/components/DemoDataNotice';
import { DataTable } from '@/components/DataTable';
import { NotificationStatusBadge } from '@/components/StatusBadge';
import { MOCK_NOTIFICATIONS } from '@/lib/mockData';

export default function NotificationsPage() {
  const totalSent = MOCK_NOTIFICATIONS.reduce((sum, c) => sum + c.sent, 0);
  const totalDelivered = MOCK_NOTIFICATIONS.reduce((sum, c) => sum + c.delivered, 0);
  const deliveryRate = totalSent > 0 ? Math.round((totalDelivered / totalSent) * 100) : 0;
  const failed = MOCK_NOTIFICATIONS.filter((c) => c.status === 'failed').length;

  return (
    <>
      <PageHeader title="Notifications" description="Delivery reminders, renewal nudges, and other customer campaigns." />
      <DemoDataNotice />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Sent" value={totalSent} tone="blue" href="/users" />
        <StatCard label="Delivery rate" value={`${deliveryRate}%`} tone="green" />
        <StatCard label="Campaigns" value={MOCK_NOTIFICATIONS.length} tone="slate" />
        <StatCard label="Failed campaigns" value={failed} tone="amber" />
      </div>

      <div className="mt-8">
        <DataTable
          columns={[
            { header: 'Campaign', cell: (c) => <span className="font-medium text-(--color-text)">{c.campaign}</span> },
            { header: 'Audience', cell: (c) => <span className="text-(--color-text-muted)">{c.audience}</span> },
            { header: 'Sent', cell: (c) => c.sent },
            { header: 'Delivered', cell: (c) => c.delivered },
            { header: 'Status', cell: (c) => <NotificationStatusBadge status={c.status} /> },
          ]}
          rows={MOCK_NOTIFICATIONS}
        />
      </div>
    </>
  );
}
