import { api, ApiError } from '@/lib/api';
import { PageHeader } from '@/components/PageHeader';
import { ErrorBanner } from '@/components/ErrorBanner';
import { Card } from '@/components/Card';
import { CreatePartnerForm } from './create-partner-form';
import { PartnersTable } from './partners-table';

export default async function DeliveryPartnersPage() {
  let partners;
  try {
    partners = await api.listDeliveryPartners();
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
        description="Assigned to a subscription from the start — the same partner handles every delivery for that subscription."
      />

      <Card className="mb-8">
        <CreatePartnerForm />
      </Card>

      <PartnersTable partners={partners} />
    </>
  );
}
