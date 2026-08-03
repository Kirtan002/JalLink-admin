import Link from 'next/link';
import { api, ApiError } from '@/lib/api';
import { PageHeader } from '@/components/PageHeader';
import { ErrorBanner } from '@/components/ErrorBanner';
import { Card } from '@/components/Card';
import { CreatePartnerForm } from './create-partner-form';
import { PartnersTable } from './partners-table';

export default async function DeliveryPartnersPage() {
  let partners;
  let wallets: Record<string, string>;
  try {
    partners = await api.listDeliveryPartners();
    const walletEntries = await Promise.all(
      partners.map(async (p) => [p.id, (await api.getDeliveryPartnerWallet(p.id)).balance] as const),
    );
    wallets = Object.fromEntries(walletEntries);
  } catch (err) {
    const message = err instanceof ApiError ? err.message : 'Could not reach the JalLink API.';
    return (
      <>
        <PageHeader title="Delivery Partners" />
        <ErrorBanner message={message} />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Delivery Partners"
        description={
          <>
            Assigned to a{' '}
            <Link href="/subscriptions" className="font-medium text-(--color-brand-blue-dark) hover:underline">
              subscription
            </Link>{' '}
            from the start — the same partner handles every delivery for that subscription. Wallets have no earning
            logic yet (
            <Link href="/commission" className="font-medium text-(--color-brand-blue-dark) hover:underline">
              commissions
            </Link>{' '}
            are future scope) — withdraw is wired up and ready for when they do.
          </>
        }
      />

      <Card className="mb-8">
        <CreatePartnerForm />
      </Card>

      <PartnersTable partners={partners} wallets={wallets} />
    </>
  );
}
