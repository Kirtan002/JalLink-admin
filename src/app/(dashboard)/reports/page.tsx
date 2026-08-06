import { PageHeader } from '@/components/PageHeader';
import { StatCard } from '@/components/StatCard';
import { DemoDataNotice } from '@/components/DemoDataNotice';
import { DataTable } from '@/components/DataTable';
import { ReportStatusBadge } from '@/components/StatusBadge';
import { formatDateTime } from '@/lib/format';
import { MOCK_REPORTS } from '@/lib/mockData';
import { getDictionary } from '@/lib/i18n/server';

export default async function ReportsPage() {
  const t = await getDictionary();

  const ready = MOCK_REPORTS.filter((r) => r.status === 'ready').length;
  const processing = MOCK_REPORTS.filter((r) => r.status === 'processing').length;
  const failed = MOCK_REPORTS.filter((r) => r.status === 'failed').length;

  return (
    <>
      <PageHeader title={t.reports.title} description={t.reports.description} />
      <DemoDataNotice message={t.common.demoNotice} />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <StatCard label={t.reports.ready} value={ready} tone="green" />
        <StatCard label={t.reports.processing} value={processing} tone="blue" />
        <StatCard label={t.reports.failed} value={failed} tone="amber" />
      </div>

      <div className="mt-8">
        <DataTable
          columns={[
            { header: t.reports.report, cell: (r) => <span className="font-medium text-(--color-text)">{r.name}</span> },
            { header: t.reports.period, cell: (r) => r.period },
            { header: t.reports.format, cell: (r) => <span className="font-mono text-xs">{r.format}</span> },
            { header: t.common.status, cell: (r) => <ReportStatusBadge status={r.status} /> },
            {
              header: t.reports.generated,
              cell: (r) => <span className="text-(--color-text-muted)">{formatDateTime(r.generatedAt)}</span>,
            },
          ]}
          rows={MOCK_REPORTS}
        />
      </div>
    </>
  );
}
