import { PageHeader } from '@/components/PageHeader';
import { StatCard } from '@/components/StatCard';
import { DemoDataNotice } from '@/components/DemoDataNotice';
import { DataTable } from '@/components/DataTable';
import { MOCK_ANALYTICS_ROWS } from '@/lib/mockData';

export default function AnalyticsPage() {
  return (
    <>
      <PageHeader title="Analytics" description="Week-over-week business metrics." />
      <DemoDataNotice />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Active subscribers" value="412" tone="green" href="/subscriptions?status=active" />
        <StatCard label="New signups (7d)" value="34" tone="blue" href="/users" />
        <StatCard label="Skipped delivery rate" value="3.1%" tone="amber" href="/deliveries" />
        <StatCard label="Avg. delivery time" value="18 min" tone="slate" href="/deliveries" />
      </div>

      <div className="mt-8">
        <DataTable
          columns={[
            { header: 'Metric', cell: (r) => <span className="font-medium text-(--color-text)">{r.metric}</span> },
            { header: 'This week', cell: (r) => r.thisWeek },
            { header: 'Last week', cell: (r) => <span className="text-(--color-text-muted)">{r.lastWeek}</span> },
            {
              header: 'Change',
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
