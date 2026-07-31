import type { ReactNode } from 'react';

export interface DataTableColumn<T> {
  header: string;
  align?: 'right';
  cell: (row: T) => ReactNode;
}

export function DataTable<T extends { id: string }>({
  columns,
  rows,
}: {
  columns: DataTableColumn<T>[];
  rows: T[];
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-(--color-border) bg-(--color-surface) shadow-sm">
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
  );
}
