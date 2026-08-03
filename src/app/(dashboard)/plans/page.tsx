import Link from 'next/link';
import { api, ApiError } from '@/lib/api';
import { PageHeader } from '@/components/PageHeader';
import { ErrorBanner } from '@/components/ErrorBanner';
import { Card } from '@/components/Card';
import { CreatePlanForm } from './create-plan-form';
import { PlansTable } from './plans-table';
import { SettingsForm } from './settings-form';

export default async function PlansPage() {
  let plans;
  let settings;
  try {
    [plans, settings] = await Promise.all([api.listAdminPlans(), api.getSettings()]);
  } catch (err) {
    const message = err instanceof ApiError ? err.message : 'Could not reach the JalLink API.';
    return (
      <>
        <PageHeader title="Plans" />
        <ErrorBanner message={message} />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Plans"
        description={
          <>
            Create and manage the subscription plans customers can purchase. Deactivating a plan hides it from
            checkout without affecting{' '}
            <Link href="/subscriptions" className="font-medium text-(--color-brand-blue-dark) hover:underline">
              existing subscriptions
            </Link>
            .
          </>
        }
      />

      <Card title="Referral & pricing settings" className="mb-8">
        <SettingsForm settings={settings} />
        <div className="mt-4 flex flex-wrap gap-4 border-t border-(--color-border) pt-4 text-sm">
          <Link href="/referrals" className="font-medium text-(--color-brand-blue-dark) hover:underline">
            View referrals →
          </Link>
          <Link href="/extra-bottle-orders" className="font-medium text-(--color-brand-blue-dark) hover:underline">
            View extra-bottle orders →
          </Link>
          <Link href="/settings" className="font-medium text-(--color-brand-blue-dark) hover:underline">
            Support contact →
          </Link>
        </div>
      </Card>

      <Card className="mb-8">
        <CreatePlanForm />
      </Card>

      <PlansTable plans={plans} />
    </>
  );
}
