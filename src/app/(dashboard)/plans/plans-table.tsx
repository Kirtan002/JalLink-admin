'use client';

import { useState, useTransition } from 'react';
import { EmptyState } from '@/components/EmptyState';
import { Badge } from '@/components/Badge';
import { formatCurrency } from '@/lib/format';
import { useTranslations } from '@/lib/i18n/client';
import { interpolate } from '@/lib/i18n/config';
import type { Plan } from '@/lib/types';
import { deletePlan, setPlanActive } from './actions';
import { EditPlanForm } from './edit-plan-form';

export function PlansTable({ plans }: { plans: Plan[] }) {
  const t = useTranslations();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function toggleActive(plan: Plan) {
    setError(null);
    startTransition(async () => {
      const res = await setPlanActive(plan.id, !plan.isActive);
      if (res.error) setError(res.error);
    });
  }

  function handleDelete(plan: Plan) {
    if (!window.confirm(interpolate(t.plans.deleteConfirm, { name: plan.name }))) return;
    setError(null);
    startTransition(async () => {
      const res = await deletePlan(plan.id);
      if (res.error) setError(res.error);
    });
  }

  if (plans.length === 0) {
    return <EmptyState title={t.plans.empty} description={t.plans.emptyHint} />;
  }

  /** Shared by both layouts so an edit form, a toggle and a delete never drift apart. */
  function actions(plan: Plan) {
    return (
      <div className="flex flex-wrap justify-end gap-3">
        <button
          type="button"
          onClick={() => setEditingId(plan.id)}
          className="font-medium text-(--color-brand-blue-dark) hover:underline"
        >
          {t.plans.edit}
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => toggleActive(plan)}
          className="font-medium text-(--color-text-muted) hover:underline disabled:opacity-60"
        >
          {plan.isActive ? t.plans.deactivate : t.plans.activate}
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => handleDelete(plan)}
          className="font-medium text-red-600 hover:underline disabled:opacity-60 dark:text-red-400"
        >
          {t.plans.delete}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
          {error}
        </p>
      )}

      {/* Desktop: a table, with the edit form expanding in place over the whole row. */}
      <div className="hidden overflow-x-auto rounded-2xl border border-(--color-border) bg-(--color-surface) shadow-sm md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-(--color-border) text-left text-xs tracking-wide text-(--color-text-muted) uppercase">
              <th className="px-5 py-3 font-medium">{t.common.name}</th>
              <th className="px-5 py-3 font-medium">{t.plans.duration}</th>
              <th className="px-5 py-3 font-medium">{t.plans.bottleSize}</th>
              <th className="px-5 py-3 font-medium">{t.plans.priceGroundPlusOne}</th>
              <th className="px-5 py-3 font-medium">{t.plans.priceHigherFloors}</th>
              <th className="px-5 py-3 font-medium">{t.plans.discountTiers}</th>
              <th className="px-5 py-3 font-medium">{t.common.status}</th>
              <th className="px-5 py-3 text-right font-medium">{t.plans.actions}</th>
            </tr>
          </thead>
          <tbody>
            {plans.map((p) =>
              editingId === p.id ? (
                <tr key={p.id} className="border-b border-(--color-border) last:border-0">
                  <td colSpan={8} className="px-5 py-4">
                    <EditPlanForm plan={p} onDone={() => setEditingId(null)} />
                  </td>
                </tr>
              ) : (
                <tr key={p.id} className="border-b border-(--color-border) last:border-0">
                  <td className="px-5 py-3 font-medium text-(--color-text)">{p.name}</td>
                  <td className="px-5 py-3">
                    {interpolate(t.plans.bottlesUnit, { count: p.durationDays })}
                  </td>
                  <td className="px-5 py-3">{p.bottleSizeLtr}L</td>
                  <td className="px-5 py-3">{formatCurrency(p.priceGroundPlusOne)}</td>
                  <td className="px-5 py-3">{formatCurrency(p.priceHigherFloors)}</td>
                  <td className="px-5 py-3 font-mono text-xs text-(--color-text-muted)">
                    {p.tier1Percent}/{p.tier2Percent}/{p.tier3Percent}/{p.tier4Percent}%
                  </td>
                  <td className="px-5 py-3">
                    <Badge tone={p.isActive ? 'green' : 'slate'}>
                      {p.isActive ? t.plans.active : t.plans.inactive}
                    </Badge>
                  </td>
                  <td className="px-5 py-3">{actions(p)}</td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile: one card per plan, matching the DataTable card layout used elsewhere. */}
      <div className="flex flex-col gap-3 md:hidden">
        {plans.map((p) => (
          <div
            key={p.id}
            className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 shadow-sm"
          >
            {editingId === p.id ? (
              <EditPlanForm plan={p} onDone={() => setEditingId(null)} />
            ) : (
              <>
                <div className="mb-3 flex items-start justify-between gap-3">
                  <span className="font-medium text-(--color-text)">{p.name}</span>
                  <Badge tone={p.isActive ? 'green' : 'slate'}>
                    {p.isActive ? t.plans.active : t.plans.inactive}
                  </Badge>
                </div>
                <dl className="flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-3">
                    <dt className="text-xs tracking-wide text-(--color-text-muted) uppercase">
                      {t.plans.duration}
                    </dt>
                    <dd className="text-sm">
                      {interpolate(t.plans.bottlesUnit, { count: p.durationDays })}
                    </dd>
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <dt className="text-xs tracking-wide text-(--color-text-muted) uppercase">
                      {t.plans.bottleSize}
                    </dt>
                    <dd className="text-sm">{p.bottleSizeLtr}L</dd>
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <dt className="text-xs tracking-wide text-(--color-text-muted) uppercase">
                      {t.plans.priceGroundPlusOne}
                    </dt>
                    <dd className="text-sm">{formatCurrency(p.priceGroundPlusOne)}</dd>
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <dt className="text-xs tracking-wide text-(--color-text-muted) uppercase">
                      {t.plans.priceHigherFloors}
                    </dt>
                    <dd className="text-sm">{formatCurrency(p.priceHigherFloors)}</dd>
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <dt className="text-xs tracking-wide text-(--color-text-muted) uppercase">
                      {t.plans.discountTiers}
                    </dt>
                    <dd className="font-mono text-xs text-(--color-text-muted)">
                      {p.tier1Percent}/{p.tier2Percent}/{p.tier3Percent}/{p.tier4Percent}%
                    </dd>
                  </div>
                </dl>
                <div className="mt-3 border-t border-(--color-border) pt-3">{actions(p)}</div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
