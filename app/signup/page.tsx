'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Mail, User, AlertCircle, Shield } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { UserRole } from '@/lib/storage';

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('coach');
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    const success = await signup(email, password, firstName, lastName, role, isAdmin);

    if (success) {
      router.push('/coach-dashboard');
    } else {
      setError('An account with this email already exists');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1e293b] text-slate-100 font-[family-name:var(--font-inter)] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-block font-[family-name:var(--font-playfair)] text-4xl font-bold bg-gradient-to-r from-[#16a34a] to-[#22c55e] bg-clip-text text-transparent mb-2"
          >
            FlagFooty
          </Link>
          <p className="text-slate-400 text-lg">Create your account</p>
        </div>

        {/* Signup Form */}
        <div className="bg-slate-800/30 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50">
          <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold mb-6 text-center">
            Sign Up
          </h1>

          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  First Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="w-5 h-5 text-slate-500" />
                  </div>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/20 transition-all"
                    placeholder="John"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/20 transition-all"
                  placeholder="Doe"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-slate-500" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/20 transition-all"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-slate-500" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/20 transition-all"
                  placeholder="Min. 6 characters"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-slate-500" />
                </div>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/20 transition-all"
                  placeholder="Confirm password"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Role
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Shield className="w-5 h-5 text-slate-500" />
                </div>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/20 transition-all cursor-pointer"
                  required
                >
                  <option value="coach">Coach (Full Access)</option>
                  <option value="parent">Parent (Read-only)</option>
                  <option value="player">Player (Read-only)</option>
                </select>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                {role === 'coach' && 'Full access to all features including editing and management.'}
                {role === 'parent' && 'View-only access. Can be granted admin privileges.'}
                {role === 'player' && 'View-only access to see your stats and team info.'}
              </p>
            </div>

            {role === 'parent' && (
              <div className="flex items-start gap-3 p-4 bg-slate-900/30 rounded-lg border border-slate-700/50">
                <input
                  type="checkbox"
                  id="isAdmin"
                  checked={isAdmin}
                  onChange={(e) => setIsAdmin(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded border-slate-600 bg-slate-800 text-[#16a34a] focus:ring-[#16a34a] focus:ring-offset-0 cursor-pointer"
                />
                <div>
                  <label htmlFor="isAdmin" className="text-sm font-semibold text-slate-300 cursor-pointer">
                    Grant Admin Access
                  </label>
                  <p className="text-xs text-slate-500 mt-1">
                    Allow editing and managing team data
                  </p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(22,163,74,0.4)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-400 text-sm">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-[#16a34a] hover:text-[#22c55e] font-semibold transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-slate-400 hover:text-slate-300 text-sm transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
