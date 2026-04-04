import { ReactNode } from 'react';

interface LoadingSkeletonProps {
  rows?: number;
  type?: 'table' | 'card' | 'list';
  className?: string;
}

export function LoadingSkeleton({ rows = 5, type = 'table', className = '' }: LoadingSkeletonProps) {
  const renderTableSkeleton = () => (
    <div className={`bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-800/50 border-b border-slate-700">
              {[1, 2, 3, 4].map((i) => (
                <th key={i} className="px-6 py-4">
                  <div className="h-4 bg-slate-700/50 rounded animate-pulse w-24"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, index) => (
              <tr
                key={index}
                className={`border-b border-slate-700/30 ${
                  index % 2 === 0 ? 'bg-slate-900/20' : ''
                }`}
              >
                {[1, 2, 3, 4].map((i) => (
                  <td key={i} className="px-6 py-4">
                    <div className="h-4 bg-slate-700/50 rounded animate-pulse"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderCardSkeleton = () => (
    <div className={`grid md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden"
        >
          <div className="h-40 bg-gradient-to-br from-slate-700 to-slate-800 animate-pulse"></div>
          <div className="p-6 space-y-3">
            <div className="h-6 bg-slate-700/50 rounded animate-pulse w-3/4"></div>
            <div className="h-4 bg-slate-700/50 rounded animate-pulse w-1/2"></div>
            <div className="h-4 bg-slate-700/50 rounded animate-pulse w-2/3"></div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderListSkeleton = () => (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6"
        >
          <div className="space-y-3">
            <div className="h-6 bg-slate-700/50 rounded animate-pulse w-1/2"></div>
            <div className="flex gap-4">
              <div className="h-4 bg-slate-700/50 rounded animate-pulse w-32"></div>
              <div className="h-4 bg-slate-700/50 rounded animate-pulse w-32"></div>
              <div className="h-4 bg-slate-700/50 rounded animate-pulse w-32"></div>
            </div>
            <div className="flex gap-2">
              <div className="h-10 bg-slate-700/50 rounded animate-pulse w-32"></div>
              <div className="h-10 bg-slate-700/50 rounded animate-pulse w-32"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  if (type === 'card') {
    return renderCardSkeleton();
  } else if (type === 'list') {
    return renderListSkeleton();
  } else {
    return renderTableSkeleton();
  }
}
