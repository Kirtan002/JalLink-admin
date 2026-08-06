import type { ReactNode } from 'react';

export interface DataTableColumn<T> {
  header: string;
  align?: 'right';
  cell: (row: T) => ReactNode;
}

/**
 * One column definition, two layouts.
 *
 * From `md` up this is an ordinary table. Below it, a six-column table inside a horizontal
 * scroller is technically "responsive" and practically unreadable on a phone — so each row
 * becomes a card instead: the first column is the card's heading (it is always the row's
 * identity — a customer, a partner, a plan), headerless columns become the action row at the
 * bottom, and everything else is a label/value line.
 */
export function DataTable<T extends { id: string }>({
  columns,
  rows,
}: {
  columns: DataTableColumn<T>[];
  rows: T[];
}) {
  const [primary, ...rest] = columns;
  const detailColumns = rest.filter((col) => col.header !== '');
  const actionColumns = rest.filter((col) => col.header === '');

  return (
    <>
      <div className="hidden overflow-x-auto rounded-2xl border border-(--color-border) bg-(--color-surface) shadow-sm md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-(--color-border) text-left text-xs tracking-wide text-(--color-text-muted) uppercase">
              {columns.map((col, i) => (
                <th key={i} className={`px-5 py-3 font-medium ${col.align === 'right' ? 'text-right' : ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-(--color-border) last:border-0">
                {columns.map((col, i) => (
                  <td key={i} className={`px-5 py-3 ${col.align === 'right' ? 'text-right' : ''}`}>
                    {col.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 md:hidden">
        {rows.map((row) => (
          <div
            key={row.id}
            className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 shadow-sm"
          >
            {primary && <div className="mb-3 min-w-0 text-sm">{primary.cell(row)}</div>}

            <dl className="flex flex-col gap-2">
              {detailColumns.map((col, i) => (
                <div key={i} className="flex items-start justify-between gap-3">
                  <dt className="shrink-0 text-xs tracking-wide text-(--color-text-muted) uppercase">
                    {col.header}
                  </dt>
                  <dd className="min-w-0 text-right text-sm break-words">{col.cell(row)}</dd>
                </div>
              ))}
            </dl>

            {actionColumns.length > 0 && (
              <div className="mt-3 flex flex-wrap justify-end gap-4 border-t border-(--color-border) pt-3 text-sm">
                {actionColumns.map((col, i) => (
                  <div key={i}>{col.cell(row)}</div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
