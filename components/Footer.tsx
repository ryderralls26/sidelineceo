'use client';

import Link from 'next/link';
import { handleShare as executeShare } from '@/lib/share';

export function Footer() {
  const handleShareClick = () => {
    executeShare({ type: 'referral' });
  };

  return (
    <footer className="border-t border-slate-700 bg-[#1e293b] mt-auto print:hidden">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {/* Column 1: Brand */}
          <div className="space-y-4">
            <div>
              <h3 className="text-2xl font-bold text-white font-display">FlagFooty</h3>
              <p className="text-slate-300 mt-2">
                The Coach&apos;s Playbook for Team Success
              </p>
            </div>
            <p className="text-sm text-slate-400">
              &copy; 2026 FlagFooty. All rights reserved.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
            <nav className="space-y-2">
              <Link
                href="/"
                className="block text-slate-300 hover:text-[#16a34a] transition-colors duration-200"
              >
                Home
              </Link>
              <Link
                href="/signup"
                className="block text-slate-300 hover:text-[#16a34a] transition-colors duration-200"
              >
                Sign Up
              </Link>
              <Link
                href="/login"
                className="block text-slate-300 hover:text-[#16a34a] transition-colors duration-200"
              >
                Login
              </Link>
              <Link
                href="/awards"
                className="block text-slate-300 hover:text-[#16a34a] transition-colors duration-200"
              >
                Awards
              </Link>
              <Link
                href="/archive"
                className="block text-slate-300 hover:text-[#16a34a] transition-colors duration-200"
              >
                Archive
              </Link>
            </nav>
          </div>

          {/* Column 3: Share & Support */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Share &amp; Support</h4>
            <div className="space-y-4">
              <button
                onClick={handleShareClick}
                className="px-6 py-3 bg-gray-200 text-[#16a34a] rounded-lg font-semibold hover:bg-gray-300 transition-all duration-300 w-full md:w-auto"
              >
                Share
              </button>

              <div className="space-y-2">
                <a
                  href="mailto:support@flagfooty.com"
                  className="block text-slate-300 hover:text-[#16a34a] transition-colors duration-200"
                >
                  Contact Support
                </a>
                <Link
                  href="/privacy"
                  className="block text-slate-300 hover:text-[#16a34a] transition-colors duration-200"
                >
                  Privacy Policy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}