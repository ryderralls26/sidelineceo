'use client';

import Link from 'next/link';
import { X } from 'lucide-react';

interface ScoutModePopupProps {
  isOpen: boolean;
  onDismiss: () => void;
  onScoutMode: () => void;
}

export function ScoutModePopup({ isOpen, onDismiss, onScoutMode }: ScoutModePopupProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
        onClick={onDismiss}
      />

      {/* Modal - Desktop centered, Mobile bottom sheet */}
      <div className="fixed inset-x-0 bottom-0 md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:bottom-auto z-50 w-full md:max-w-lg">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border-t md:border border-slate-700 rounded-t-3xl md:rounded-2xl shadow-2xl p-6 md:p-8 animate-in slide-in-from-bottom-4 md:slide-in-from-bottom-0 duration-300">
          {/* Close button - desktop only */}
          <button
            onClick={onDismiss}
            className="absolute top-4 right-4 hidden md:block p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>

          {/* Content */}
          <div className="text-center">
            {/* Icon */}
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-[#16a34a] to-[#22c55e] rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>

            {/* Heading */}
            <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-bold text-white mb-3">
              Ready to Run Your Team?
            </h2>

            {/* Subtext */}
            <p className="text-slate-300 text-base md:text-lg mb-8 leading-relaxed">
              Sign up free to save your roster, build lineups, and print professional game cards. Or scout it out first — no account needed.
            </p>

            {/* Buttons */}
            <div className="space-y-3">
              <Link
                href="/signup"
                className="block w-full px-6 py-4 bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white rounded-xl font-semibold hover:shadow-[0_0_20px_rgba(22,163,74,0.4)] transition-all duration-300 text-center"
              >
                Sign Up Free
              </Link>

              <button
                onClick={onScoutMode}
                className="block w-full px-6 py-4 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 text-slate-300 hover:text-white rounded-xl font-semibold transition-all duration-300"
              >
                Scout It Out
              </button>
            </div>

            {/* Fine print */}
            <p className="text-slate-500 text-xs mt-6">
              No credit card required • Free forever
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
