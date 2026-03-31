'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, AlertCircle, CheckCircle } from 'lucide-react';
import { StorageManager } from '@/lib/storage';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [resetLink, setResetLink] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const user = StorageManager.getUserByEmail(email);

    if (!user) {
      setError('No account found with this email address');
      return;
    }

    // Generate reset token
    const token = StorageManager.createResetToken(email);
    const link = `${window.location.origin}/reset-password/confirm?token=${token}`;
    setResetLink(link);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#1e293b] text-slate-100 font-[family-name:var(--font-inter)] flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <Link
              href="/"
              className="inline-block font-[family-name:var(--font-playfair)] text-4xl font-bold bg-gradient-to-r from-[#16a34a] to-[#22c55e] bg-clip-text text-transparent mb-2"
            >
              FlagFooty
            </Link>
          </div>

          <div className="bg-slate-800/30 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#16a34a] to-[#22c55e] rounded-full mb-6">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>

              <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold mb-4">
                Check Your Email
              </h1>

              <p className="text-slate-400 mb-6">
                We&apos;ve sent a password reset link to <strong className="text-slate-300">{email}</strong>
              </p>

              {/* Simulated Email Display */}
              <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 text-left mb-6">
                <p className="text-xs text-slate-500 mb-2">Simulated Email:</p>
                <div className="text-sm text-slate-300 space-y-2">
                  <p>Hi there,</p>
                  <p>Click the link below to reset your password:</p>
                  <a
                    href={resetLink}
                    className="text-[#16a34a] hover:text-[#22c55e] break-all transition-colors"
                  >
                    {resetLink}
                  </a>
                  <p className="text-xs text-slate-500 mt-3">This link will expire in 1 hour.</p>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setEmail('');
                  setResetLink('');
                }}
                className="text-[#16a34a] hover:text-[#22c55e] font-semibold transition-colors"
              >
                Send another reset link
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-slate-400 hover:text-slate-300 text-sm transition-colors"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1e293b] text-slate-100 font-[family-name:var(--font-inter)] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-block font-[family-name:var(--font-playfair)] text-4xl font-bold bg-gradient-to-r from-[#16a34a] to-[#22c55e] bg-clip-text text-transparent mb-2"
          >
            FlagFooty
          </Link>
          <p className="text-slate-400 text-lg">Reset your password</p>
        </div>

        <div className="bg-slate-800/30 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50">
          <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold mb-2 text-center">
            Forgot Password?
          </h1>
          <p className="text-slate-400 text-center mb-6 text-sm">
            Enter your email and we&apos;ll send you a reset link
          </p>

          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
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

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(22,163,74,0.4)] transition-all duration-300"
            >
              Send Reset Link
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-slate-400 hover:text-slate-300 text-sm transition-colors"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
