import { PageHeader } from '@/components/PageHeader';
import { StatCard } from '@/components/StatCard';
import { DemoDataNotice } from '@/components/DemoDataNotice';
import { DataTable } from '@/components/DataTable';
import { ReferralStatusBadge } from '@/components/StatusBadge';
import { MOCK_REFERRALS } from '@/lib/mockData';

export default function ReferralsPage() {
  const rewarded = MOCK_REFERRALS.filter((r) => r.status === 'rewarded').length;
  const pending = MOCK_REFERRALS.filter((r) => r.status === 'pending').length;
  const conversionRate = Math.round((rewarded / (MOCK_REFERRALS.length || 1)) * 100);

  return (
    <>
      <PageHeader title="Referrals" description="Customer referral codes and rewards." />
      <DemoDataNotice />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Total referrals" value={MOCK_REFERRALS.length} tone="blue" />
        <StatCard label="Rewarded" value={rewarded} tone="green" />
        <StatCard label="Pending" value={pending} tone="amber" />
        <StatCard label="Conversion rate" value={`${conversionRate}%`} tone="slate" />
      </div>

      <div className="mt-8">
        <DataTable
          columns={[
            { header: 'Referrer', cell: (r) => <span className="font-medium text-(--color-text)">{r.referrerName}</span> },
            { header: 'Code', cell: (r) => <span className="font-mono text-xs">{r.code}</span> },
            { header: 'Referred', cell: (r) => r.referredName },
            { header: 'Reward', cell: (r) => r.reward },
            { header: 'Status', cell: (r) => <ReferralStatusBadge status={r.status} /> },
          ]}
          rows={MOCK_REFERRALS}
        />
      </div>
    </>
  );
}
