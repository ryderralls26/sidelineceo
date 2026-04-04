import React from 'react';

export interface DataTableColumn<T = any> {
  key: string;
  label: string;
  className?: string;
  headerClassName?: string;
  render?: (row: T, rowIndex: number) => React.ReactNode;
  width?: string; // e.g., "min-w-[200px]"
}

export interface DataTableProps<T = any> {
  columns: DataTableColumn<T>[];
  data: T[];
  getRowKey?: (row: T, index: number) => string | number;
  className?: string;
  emptyMessage?: string;
  onRowClick?: (row: T, index: number) => void;
}

/**
 * Unified DataTable component with dark navy/green/white styling
 *
 * Standard Styling:
 * - Container Background: Dark navy (bg-slate-800/30 backdrop-blur-sm)
 * - Headers: Lighter navy/teal background (bg-slate-800/50), white text, bold
 * - Rows: Alternating shades (striped effect with bg-slate-900/20)
 * - Hover: Subtle lighter bg on row hover (hover:bg-slate-800/30)
 * - Data: White text, consistent borders
 * - Accents: Green (text-[#16a34a]) for active states
 */
export function DataTable<T = any>({
  columns,
  data,
  getRowKey,
  className = '',
  emptyMessage = 'No data available',
  onRowClick,
}: DataTableProps<T>) {
  const defaultGetRowKey = (row: T, index: number) => {
    if (getRowKey) return getRowKey(row, index);
    if (typeof row === 'object' && row !== null && 'id' in row) {
      return (row as any).id;
    }
    return index;
  };

  return (
    <div className={`bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-800/50 border-b border-slate-700">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-4 text-left text-sm font-semibold text-slate-300 ${column.width || ''} ${column.headerClassName || ''}`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-12 text-center text-slate-400"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={defaultGetRowKey(row, rowIndex)}
                  className={`border-b border-slate-700/30 hover:bg-slate-800/30 transition-colors ${
                    rowIndex % 2 === 0 ? 'bg-slate-900/20' : ''
                  } ${onRowClick ? 'cursor-pointer' : ''}`}
                  onClick={() => onRowClick?.(row, rowIndex)}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-6 py-4 ${column.className || ''}`}
                    >
                      {column.render
                        ? column.render(row, rowIndex)
                        : (row as any)[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
