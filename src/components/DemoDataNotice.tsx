export function DemoDataNotice({ message }: { message?: string }) {
  return (
    <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
      {message ?? 'Preview UI — shown with sample data until this module is wired to a backend service.'}
    </div>
  );
}
