export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-(--color-border) bg-(--color-surface) px-6 py-16 text-center">
      <p className="text-sm font-medium text-(--color-text)">{title}</p>
      {description && <p className="mt-1 text-sm text-(--color-text-muted)">{description}</p>}
    </div>
  );
}
