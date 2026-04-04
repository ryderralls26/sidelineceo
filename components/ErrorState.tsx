import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  message = 'Something went wrong loading your data. Please refresh the page or contact support.',
  onRetry,
  className = ''
}: ErrorStateProps) {
  return (
    <div className={`bg-red-500/10 border border-red-500/30 rounded-xl p-8 ${className}`}>
      <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
        <AlertTriangle className="w-16 h-16 text-red-400 mb-4" />
        <h3 className="text-xl font-semibold text-red-300 mb-2">
          Error Loading Data
        </h3>
        <p className="text-red-200/90 mb-6">
          {message}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 px-6 py-3 rounded-lg font-semibold transition-all duration-300 border border-red-500/30"
          >
            <RefreshCw className="w-5 h-5" />
            Refresh
          </button>
        )}
      </div>
    </div>
  );
}
