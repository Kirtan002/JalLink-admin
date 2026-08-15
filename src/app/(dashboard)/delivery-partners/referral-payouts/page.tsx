import Link from 'next/link';
import { api, ApiError } from '@/lib/api';
import { PageHeader } from '@/components/PageHeader';
import { ErrorBanner } from '@/components/ErrorBanner';
import { EmptyState } from '@/components/EmptyState';
import { StatCard } from '@/components/StatCard';
import { DataTable } from '@/components/DataTable';
import { formatCurrency, formatDateTime } from '@/lib/format';
import { getDictionary } from '@/lib/i18n/server';

/**
 * The ledger behind a delivery partner's own referralCode (see CheckoutSubscriptionInput.
 * deliveryPartnerCode on the backend) — separate from the /referrals pages, which cover the
 * user-to-user referral-links program. Backend scopes this by the caller's Bearer token: an
 * admin session sees every payout, a manager session only the ones attributed to them.
 */
export default async function DeliveryPartnerReferralPayoutsPage() {
  const t = await getDictionary();

  let payouts;
  try {
    payouts = await api.listDeliveryPartnerReferralPayouts();
  } catch (err) {
    const message = err instanceof ApiError ? err.message : t.common.apiUnreachable;
    return (
      <>
        <PageHeader title={t.deliveryPartners.referralPayouts.title} />
        <ErrorBanner message={message} />
      </>
    );
  }

  const totalPartnerAmount = payouts.reduce((sum, p) => sum + Number(p.partnerAmount), 0);
  const totalManagerAmount = payouts.reduce((sum, p) => sum + Number(p.managerAmount), 0);

  return (
    <>
      <Link
        href="/delivery-partners"
        className="mb-4 inline-block text-sm font-medium text-(--color-brand-blue-dark) hover:underline"
      >
        {t.deliveryPartners.referralPayouts.back}
      </Link>

      <PageHeader
        title={t.deliveryPartners.referralPayouts.title}
        description={t.deliveryPartners.referralPayouts.description}
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <StatCard label={t.deliveryPartners.referralPayouts.totalPayouts} value={payouts.length} tone="blue" />
        <StatCard
          label={t.deliveryPartners.referralPayouts.totalPartnerAmount}
          value={formatCurrency(String(totalPartnerAmount))}
          tone="green"
        />
        <StatCard
          label={t.deliveryPartners.referralPayouts.totalManagerAmount}
          value={formatCurrency(String(totalManagerAmount))}
          tone="amber"
        />
      </div>

      <div className="mt-8">
        {payouts.length === 0 ? (
          <EmptyState
            title={t.deliveryPartners.referralPayouts.empty}
            description={t.deliveryPartners.referralPayouts.emptyHint}
          />
        ) : (
          <DataTable
            columns={[
              {
                header: t.deliveryPartners.title,
                cell: (p) => (
                  <Link href={`/delivery-partners/${p.deliveryPartner.id}`} className="group block">
                    <div className="font-medium text-(--color-text) group-hover:text-(--color-brand-blue-dark) group-hover:underline">
                      {p.deliveryPartner.name ?? p.deliveryPartner.mobile}
                    </div>
                    <div className="font-mono text-xs text-(--color-text-muted)">{p.referralCode}</div>
                  </Link>
                ),
              },
              {
                header: t.deliveryPartners.referralPayouts.buyer,
                cell: (p) => (
                  <div>
                    <div className="text-(--color-text)">{p.buyer.name ?? t.common.unnamedCustomer}</div>
                    <div className="text-xs text-(--color-text-muted)">{p.buyer.mobile}</div>
                  </div>
                ),
              },
              {
                header: t.deliveryPartners.referralPayouts.partnerAmount,
                align: 'right',
                cell: (p) => formatCurrency(p.partnerAmount),
              },
              {
                header: t.deliveryPartners.referralPayouts.managerAmount,
                align: 'right',
                cell: (p) =>
                  p.manager ? (
                    <div className="text-right">
                      <div>{formatCurrency(p.managerAmount)}</div>
                      <div className="text-xs text-(--color-text-muted)">{p.manager.name}</div>
                    </div>
                  ) : (
                    <span className="text-(--color-text-muted)">{t.common.dash}</span>
                  ),
              },
              {
                header: t.common.time,
                cell: (p) => <span className="text-(--color-text-muted)">{formatDateTime(p.createdAt)}</span>,
              },
            ]}
            rows={payouts}
          />
        )}
      </div>
    </>
  );
}
