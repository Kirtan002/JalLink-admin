'use client';

import { useState, useTransition } from 'react';
import { Badge } from '@/components/Badge';
import { EmptyState } from '@/components/EmptyState';
import { formatCurrency } from '@/lib/format';
import type { Plan } from '@/lib/types';
import { deletePlan, setPlanActive } from './actions';
import { EditPlanForm } from './edit-plan-form';

export function PlansTable({ plans }: { plans: Plan[] }) {
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
    if (!window.confirm(`Delete "${plan.name}"? This can't be undone.`)) return;
    setError(null);
    startTransition(async () => {
      const res = await deletePlan(plan.id);
      if (res.error) setError(res.error);
    });
  }

  if (plans.length === 0) {
    return <EmptyState title="No plans configured" description="Create one above to make it available for checkout." />;
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-(--color-border) bg-(--color-surface) shadow-sm">
      {error && (
        <p className="border-b border-(--color-border) bg-red-50 px-5 py-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
          {error}
        </p>
      )}
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-(--color-border) text-left text-xs tracking-wide text-(--color-text-muted) uppercase">
            <th className="px-5 py-3 font-medium">Name</th>
            <th className="px-5 py-3 font-medium">Duration</th>
            <th className="px-5 py-3 font-medium">Bottle size</th>
            <th className="px-5 py-3 font-medium">Price</th>
            <th className="px-5 py-3 font-medium">Status</th>
            <th className="px-5 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {plans.map((p) =>
            editingId === p.id ? (
              <tr key={p.id} className="border-b border-(--color-border) last:border-0">
                <td colSpan={6} className="px-5 py-4">
                  <EditPlanForm plan={p} onDone={() => setEditingId(null)} />
                </td>
              </tr>
            ) : (
              <tr key={p.id} className="border-b border-(--color-border) last:border-0">
                <td className="px-5 py-3 font-medium text-(--color-text)">{p.name}</td>
                <td className="px-5 py-3">{p.durationDays} bottles</td>
                <td className="px-5 py-3">{p.bottleSizeLtr}L</td>
                <td className="px-5 py-3">{formatCurrency(p.price)}</td>
                <td className="px-5 py-3">
                  <Badge tone={p.isActive ? 'green' : 'slate'}>{p.isActive ? 'Active' : 'Inactive'}</Badge>
                </td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setEditingId(p.id)}
                      className="font-medium text-(--color-brand-blue-dark) hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => toggleActive(p)}
                      className="font-medium text-(--color-text-muted) hover:underline disabled:opacity-60"
                    >
                      {p.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleDelete(p)}
                      className="font-medium text-red-600 hover:underline disabled:opacity-60 dark:text-red-400"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ),
          )}
        </tbody>
      </table>
    </div>
  );
}
