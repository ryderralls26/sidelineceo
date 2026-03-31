'use client';

import Link from 'next/link';

interface LoginPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginPromptModal({ isOpen, onClose }: LoginPromptModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="bg-slate-800 rounded-2xl border border-slate-700 max-w-md w-full p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold mb-4 text-white">
          Login Required
        </h2>
        <p className="text-slate-300 mb-6">
          Please login to access full features and functionality.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-slate-700 text-white rounded-lg font-semibold hover:bg-slate-600 transition-all duration-300"
          >
            Cancel
          </button>
          <Link
            href="/login"
            className="flex-1 px-6 py-3 bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(22,163,74,0.4)] transition-all duration-300 text-center"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
