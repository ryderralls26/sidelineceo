'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import TeamSwitcher from './TeamSwitcher';
import { ShareButton } from './ShareButton';
import { NotificationBell } from './NotificationBell';

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { session, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
    setMobileMenuOpen(false);
  };

  const getHomeLink = () => {
    if (isAuthenticated && session) {
      return '/dashboard';
    }
    return '/';
  };

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/roster', label: 'Roster' },
    { href: '/schedule', label: 'Schedule' },
    { href: '/mgmt', label: 'MGMT' },
    { href: '/awards', label: 'Awards' },
    { href: '/archive', label: 'Archive' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#1e293b]/95 backdrop-blur-sm border-b border-slate-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link
              href="/"
              className="font-[family-name:var(--font-playfair)] text-2xl font-bold bg-gradient-to-r from-[#16a34a] to-[#22c55e] bg-clip-text text-transparent"
            >
              FlagFooty
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-all duration-200 pb-1 border-b-2 ${
                  isActive(link.href)
                    ? 'text-[#16a34a] font-semibold border-[#16a34a]'
                    : 'text-slate-300 hover:text-[#16a34a] border-transparent hover:border-[#16a34a]/30'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated && session ? (
              <>
                <NotificationBell />
                <div className="text-slate-400 text-sm">
                  {session.firstName}
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-slate-300 hover:text-red-400 transition-colors duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-slate-300 hover:text-[#16a34a] transition-colors duration-200"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white px-6 py-2 rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(22,163,74,0.4)] transition-all duration-300"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-300 hover:text-white p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-700/50 bg-[#1e293b]">
          <div className="px-4 pt-2 pb-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-4 py-3 min-h-[44px] flex items-center rounded-lg transition-all ${
                  isActive(link.href)
                    ? 'text-[#16a34a] font-semibold bg-slate-800/50'
                    : 'text-slate-300 hover:text-[#16a34a] hover:bg-slate-800/50'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated && session ? (
              <>
                <div className="px-4 py-3 min-h-[44px] text-slate-400 text-sm flex items-center">
                  {session.firstName}
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 min-h-[44px] text-red-400 hover:bg-slate-800/50 rounded-lg transition-all flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block px-4 py-3 min-h-[44px] flex items-center text-slate-300 hover:text-[#16a34a] hover:bg-slate-800/50 rounded-lg transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="block px-4 py-3 min-h-[44px] flex items-center justify-center text-center bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white rounded-lg font-semibold"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
