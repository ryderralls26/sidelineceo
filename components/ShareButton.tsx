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
        title=\"Share FlagFooty\"
        aria-label=\"Share FlagFooty\"
      >\n        Share\n      </button>\n    );\n  }\n\n  if (variant === 'link') {\n    return (\n      <button\n        onClick={handleShareClick}\n        className={`px-6 py-2 bg-gray-200 text-[#16a34a] rounded-lg font-semibold hover:bg-gray-300 transition-all duration-200 ${className}`}\n      >\n        {children || 'Share'}\n      </button>\n    );\n  }\n\n  // Default: button variant - matches Sign Up Free button size/shape\n  return (\n    <button\n      onClick={handleShareClick}\n      className={`px-10 py-5 bg-gray-200 text-[#16a34a] rounded-full text-lg font-semibold hover:bg-gray-300 transition-all duration-300 ${className}`}\n    >\n      {children || 'Share'}\n    </button>\n  );\n}\n