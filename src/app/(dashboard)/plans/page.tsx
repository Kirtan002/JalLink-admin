import Link from 'next/link';
import { api, ApiError } from '@/lib/api';
import { PageHeader } from '@/components/PageHeader';
import { ErrorBanner } from '@/components/ErrorBanner';
import { Card } from '@/components/Card';
import { CreatePlanForm } from './create-plan-form';
import { PlansTable } from './plans-table';
import { SettingsForm } from './settings-form';
import { getDictionary } from '@/lib/i18n/server';

export default async function PlansPage() {
  const t = await getDictionary();

  let plans;
  let settings;
  try {
    [plans, settings] = await Promise.all([api.listAdminPlans(), api.getSettings()]);
  } catch (err) {
    const message = err instanceof ApiError ? err.message : t.common.apiUnreachable;
    return (
      <>
        <PageHeader title={t.plans.title} />
        <ErrorBanner message={message} />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={t.plans.title}
        description={
          <>
            {t.plans.descriptionBefore}
            <Link href="/subscriptions" className="font-medium text-(--color-brand-blue-dark) hover:underline">
              {t.plans.descriptionLink}
            </Link>
            {t.plans.descriptionAfter}
          </>
        }
      />

      <Card title={t.plans.pricingSettings} className="mb-8">
        <SettingsForm settings={settings} />
        <div className="mt-4 flex flex-wrap gap-4 border-t border-(--color-border) pt-4 text-sm">
          <Link href="/referrals" className="font-medium text-(--color-brand-blue-dark) hover:underline">
            {t.plans.viewReferrals}
          </Link>
          <Link href="/extra-bottle-orders" className="font-medium text-(--color-brand-blue-dark) hover:underline">
            {t.plans.viewExtraBottles}
          </Link>
          <Link href="/settings" className="font-medium text-(--color-brand-blue-dark) hover:underline">
            {t.plans.supportContact}
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
