import { api, ApiError } from '@/lib/api';
import { PageHeader } from '@/components/PageHeader';
import { ErrorBanner } from '@/components/ErrorBanner';
import { Card } from '@/components/Card';
import { StatCard } from '@/components/StatCard';
import { getDictionary } from '@/lib/i18n/server';
import { CreatePartnerForm } from './create-partner-form';
import { PartnersTable } from './partners-table';

export default async function DeliveryPartnersPage() {
  const t = await getDictionary();

  let partners;
  let wallets: Record<string, string>;
  try {
    partners = await api.listDeliveryPartners();
    // Wallet balances are a per-partner call; only approved partners can hold one, so the
    // rest are skipped rather than fanning out a request that can only answer "0.00".
    const walletEntries = await Promise.all(
      partners.map(async (p) =>
        p.kycStatus === 'approved'
          ? ([p.id, (await api.getDeliveryPartnerWallet(p.id)).balance] as const)
          : ([p.id, '0.00'] as const),
      ),
    );
    wallets = Object.fromEntries(walletEntries);
  } catch (err) {
    const message = err instanceof ApiError ? err.message : t.common.apiUnreachable;
    return (
      <>
        <PageHeader title={t.deliveryPartners.title} />
        <ErrorBanner message={message} />
      </>
    );
  }

  const pending = partners.filter((p) => p.kycStatus === 'pending').length;
  const approved = partners.filter((p) => p.kycStatus === 'approved' && p.isActive).length;
  const rejected = partners.filter((p) => p.kycStatus === 'rejected').length;
  const suspended = partners.filter((p) => !p.isActive).length;

  return (
    <>
      <PageHeader title={t.deliveryPartners.title} description={t.deliveryPartners.description} />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          label={t.deliveryPartners.awaitingReview}
          value={pending}
          tone={pending > 0 ? 'amber' : 'slate'}
        />
        <StatCard label={t.deliveryPartners.approved} value={approved} tone="green" />
        <StatCard label={t.deliveryPartners.rejected} value={rejected} tone="slate" />
        <StatCard label={t.deliveryPartners.suspended} value={suspended} tone="slate" />
      </div>

      <div className="mt-8">
        <PartnersTable partners={partners} wallets={wallets} />
      </div>

      <Card title={t.deliveryPartners.addManually} className="mt-8">
        <p className="mb-5 text-sm text-(--color-text-muted)">{t.deliveryPartners.addManuallyHint}</p>
        <CreatePartnerForm />
      </Card>
    </>
  );
}
