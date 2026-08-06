import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';
import { StatCard } from '@/components/StatCard';
import { DemoDataNotice } from '@/components/DemoDataNotice';
import { DataTable } from '@/components/DataTable';
import { Badge } from '@/components/Badge';
import { MOCK_COMMISSION_TIERS } from '@/lib/mockData';
import { getDictionary } from '@/lib/i18n/server';

export default async function CommissionPage() {
  const t = await getDictionary();

  const activeTiers = MOCK_COMMISSION_TIERS.filter((t) => t.isActive);
  const totalPartners = MOCK_COMMISSION_TIERS.reduce((sum, t) => sum + t.partnerCount, 0);
  const avgRate =
    activeTiers.reduce((sum, t) => sum + t.ratePercent, 0) / (activeTiers.length || 1);

  return (
    <>
      <PageHeader
        title={t.commission.title}
        description={
          <>
            {t.commission.descriptionBefore}
            <Link href="/delivery-partners" className="font-medium text-(--color-brand-blue-dark) hover:underline">
              {t.commission.descriptionLink}
            </Link>
            {t.commission.descriptionAfter}
          </>
        }
      />
      <DemoDataNotice message={t.common.demoNotice} />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label={t.commission.activeTiers} value={activeTiers.length} tone="blue" />
        <StatCard label={t.commission.avgRate} value={`${avgRate.toFixed(1)}%`} tone="green" />
        <StatCard
          label={t.commission.partnersEarning}
          value={totalPartners}
          tone="slate"
          href="/delivery-partners"
        />
        <StatCard
          label={t.commission.highestTier}
          value={`${Math.max(...activeTiers.map((tier) => tier.ratePercent))}%`}
          tone="amber"
        />
      </div>

      <div className="mt-8">
        <DataTable
          columns={[
            {
              header: t.commission.tier,
              cell: (tier) => <span className="font-medium text-(--color-text)">{tier.name}</span>,
            },
            { header: t.commission.rate, cell: (tier) => `${tier.ratePercent}%` },
            { header: t.commission.deliveryPartners, cell: (tier) => tier.partnerCount },
            {
              header: t.common.status,
              cell: (tier) => (
                <Badge tone={tier.isActive ? 'green' : 'slate'}>
                  {tier.isActive ? t.commission.active : t.commission.inactive}
                </Badge>
              ),
            },
          ]}
          rows={MOCK_COMMISSION_TIERS}
        />
      </div>
    </>
  );
}
