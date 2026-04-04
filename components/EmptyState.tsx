import Link from 'next/link';

interface EmptyStateProps {
  icon: string;
  message: string;
  buttonLabel?: string;
  buttonHref?: string;
  onButtonClick?: () => void;
}

export function EmptyState({
  icon,
  message,
  buttonLabel,
  buttonHref,
  onButtonClick,
}: EmptyStateProps) {
  return (
    <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-12 text-center">
      <div className="text-6xl mb-4">{icon}</div>
      <p className="text-slate-400 text-lg mb-6">{message}</p>
      {buttonLabel && (buttonHref || onButtonClick) && (
        <>
          {buttonHref ? (
            <Link
              href={buttonHref}
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(22,163,74,0.4)] transition-all duration-300 min-h-[44px]"
            >
              {buttonLabel}
            </Link>
          ) : (
            <button
              onClick={onButtonClick}
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(22,163,74,0.4)] transition-all duration-300 min-h-[44px]"
            >
              {buttonLabel}
            </button>
          )}
        </>
      )}
    </div>
  );
}
