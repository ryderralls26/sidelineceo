'use client';

import { ReactNode } from 'react';
import { handleShare as executeShare } from '@/lib/share';

interface ShareButtonProps {
  variant?: 'button' | 'link' | 'icon';
  className?: string;
  children?: ReactNode;
}

export function ShareButton({ variant = 'button', className = '', children }: ShareButtonProps) {
  const handleShareClick = () => {
    executeShare({ type: 'referral' });
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={handleShareClick}
        className={`px-6 py-2 bg-gray-200 text-[#16a34a] rounded-lg font-semibold hover:bg-gray-300 transition-all duration-200 ${className}`}
        title="Share SidelineCEO"
        aria-label="Share SidelineCEO"
      >
        Share
      </button>
    );
  }

  if (variant === 'link') {
    return (
      <button
        onClick={handleShareClick}
        className={`px-6 py-2 bg-gray-200 text-[#16a34a] rounded-lg font-semibold hover:bg-gray-300 transition-all duration-200 ${className}`}
      >
        {children || 'Share'}
      </button>
    );
  }

  // Default: button variant - matches Sign Up Free button size/shape
  return (
    <button
      onClick={handleShareClick}
      className={`px-10 py-5 bg-gray-200 text-[#16a34a] rounded-full text-lg font-semibold hover:bg-gray-300 transition-all duration-300 ${className}`}
    >
      {children || 'Share'}
    </button>
  );
}
