'use client';

import Link from 'next/link';
import { AlertCircle } from 'lucide-react';

interface ScoutModeBannerProps {
  isVisible: boolean;
}

export function ScoutModeBanner({ isVisible }: ScoutModeBannerProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-2xl animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-gradient-to-r from-yellow-600 to-orange-600 border border-yellow-500/50 rounded-xl shadow-2xl p-4 md:p-5">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <AlertCircle className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm md:text-base">
              You're in scout mode — sign up free to save your work!
            </p>
            <Link
              href="/signup"
              className="inline-block mt-2 text-sm font-semibold text-white underline hover:text-yellow-100 transition-colors"
            >
              Sign up now →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
