import { PageHeader } from '@/components/PageHeader';
import { StatCard } from '@/components/StatCard';
import { DemoDataNotice } from '@/components/DemoDataNotice';
import { DataTable } from '@/components/DataTable';
import { MOCK_ANALYTICS_ROWS } from '@/lib/mockData';
import { getDictionary } from '@/lib/i18n/server';

export default async function AnalyticsPage() {
  const t = await getDictionary();

  return (
    <>
      <PageHeader title={t.analytics.title} description={t.analytics.description} />
      <DemoDataNotice message={t.common.demoNotice} />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label={t.analytics.activeSubscribers} value="412" tone="green" href="/subscriptions?status=active" />
        <StatCard label={t.analytics.newSignups} value="34" tone="blue" href="/users" />
        <StatCard label={t.analytics.skipRate} value="3.1%" tone="amber" href="/deliveries" />
        <StatCard label={t.analytics.avgDeliveryTime} value="18 min" tone="slate" href="/deliveries" />
      </div>

      <div className="mt-8">
        <DataTable
          columns={[
            { header: t.analytics.metric, cell: (r) => <span className="font-medium text-(--color-text)">{r.metric}</span> },
            { header: t.analytics.thisWeek, cell: (r) => r.thisWeek },
            { header: t.analytics.lastWeek, cell: (r) => <span className="text-(--color-text-muted)">{r.lastWeek}</span> },
            {
              header: t.analytics.change,
              align: 'right',
              cell: (r) => (
                <span className={r.trend === 'up' ? 'text-(--color-brand-green-dark)' : r.trend === 'down' ? 'text-red-600 dark:text-red-400' : 'text-(--color-text-muted)'}>
                  {r.change}
                </span>
              ),
            },
          ]}
          rows={MOCK_ANALYTICS_ROWS}
        />
      </div>
    </>
  );
}
