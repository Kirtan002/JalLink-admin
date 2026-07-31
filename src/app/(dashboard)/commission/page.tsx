import { PageHeader } from '@/components/PageHeader';
import { StatCard } from '@/components/StatCard';
import { DemoDataNotice } from '@/components/DemoDataNotice';
import { DataTable } from '@/components/DataTable';
import { Badge } from '@/components/Badge';
import { MOCK_COMMISSION_TIERS } from '@/lib/mockData';

export default function CommissionPage() {
  const activeTiers = MOCK_COMMISSION_TIERS.filter((t) => t.isActive);
  const totalPartners = MOCK_COMMISSION_TIERS.reduce((sum, t) => sum + t.partnerCount, 0);
  const avgRate =
    activeTiers.reduce((sum, t) => sum + t.ratePercent, 0) / (activeTiers.length || 1);

  return (
    <>
      <PageHeader title="Commission" description="Commission tiers applied to delivery partner payouts." />
      <DemoDataNotice />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Active tiers" value={activeTiers.length} tone="blue" />
        <StatCard label="Avg. commission rate" value={`${avgRate.toFixed(1)}%`} tone="green" />
        <StatCard label="Partners earning commission" value={totalPartners} tone="slate" />
        <StatCard label="Highest tier rate" value={`${Math.max(...activeTiers.map((t) => t.ratePercent))}%`} tone="amber" />
      </div>

      <div className="mt-8">
        <DataTable
          columns={[
            { header: 'Tier', cell: (t) => <span className="font-medium text-(--color-text)">{t.name}</span> },
            { header: 'Rate', cell: (t) => `${t.ratePercent}%` },
            { header: 'Delivery partners', cell: (t) => t.partnerCount },
            {
              header: 'Status',
              cell: (t) => <Badge tone={t.isActive ? 'green' : 'slate'}>{t.isActive ? 'Active' : 'Inactive'}</Badge>,
            },
          ]}
          rows={MOCK_COMMISSION_TIERS}
        />
      </div>
    </>
  );
}
