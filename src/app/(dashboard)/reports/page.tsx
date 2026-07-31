import { PageHeader } from '@/components/PageHeader';
import { StatCard } from '@/components/StatCard';
import { DemoDataNotice } from '@/components/DemoDataNotice';
import { DataTable } from '@/components/DataTable';
import { ReportStatusBadge } from '@/components/StatusBadge';
import { formatDateTime } from '@/lib/format';
import { MOCK_REPORTS } from '@/lib/mockData';

export default function ReportsPage() {
  const ready = MOCK_REPORTS.filter((r) => r.status === 'ready').length;
  const processing = MOCK_REPORTS.filter((r) => r.status === 'processing').length;
  const failed = MOCK_REPORTS.filter((r) => r.status === 'failed').length;

  return (
    <>
      <PageHeader title="Reports" description="Scheduled exports for subscriptions, deliveries, and payments." />
      <DemoDataNotice />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <StatCard label="Ready" value={ready} tone="green" />
        <StatCard label="Processing" value={processing} tone="blue" />
        <StatCard label="Failed" value={failed} tone="amber" />
      </div>

      <div className="mt-8">
        <DataTable
          columns={[
            { header: 'Report', cell: (r) => <span className="font-medium text-(--color-text)">{r.name}</span> },
            { header: 'Period', cell: (r) => r.period },
            { header: 'Format', cell: (r) => <span className="font-mono text-xs">{r.format}</span> },
            { header: 'Status', cell: (r) => <ReportStatusBadge status={r.status} /> },
            {
              header: 'Generated',
              cell: (r) => <span className="text-(--color-text-muted)">{formatDateTime(r.generatedAt)}</span>,
            },
          ]}
          rows={MOCK_REPORTS}
        />
      </div>
    </>
  );
}
