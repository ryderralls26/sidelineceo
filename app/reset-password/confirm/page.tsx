'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { StorageManager } from '@/lib/storage';

function ResetPasswordConfirmContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link');
      setIsLoading(false);
      return;
    }

    const resetToken = StorageManager.getResetToken(token);
    if (!resetToken) {
      setError('This reset link is invalid or has expired');
      setIsLoading(false);
      return;
    }

    setIsValidToken(true);
    setIsLoading(false);
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!token) {
      setError('Invalid reset link');
      return;
    }

    const resetToken = StorageManager.getResetToken(token);
    if (!resetToken) {
      setError('This reset link is invalid or has expired');
      return;
    }

    // Update user password via API
    try {
      const response = await fetch('/api/auth/reset-password/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsSuccess(true);
        // Redirect to login after 2 seconds
        setTimeout(() => {\n          router.push('/login');\n        }, 2000);\n      } else {\n        setError(data.error || 'Failed to reset password');\n      }\n    } catch (err) {\n      setError('An unexpected error occurred');\n    }\n  };\n\n  if (isLoading) {\n    return (\n      <div className=\"min-h-screen bg-[#1e293b] text-slate-100 flex items-center justify-center\">\n        <div className=\"text-slate-400\">Loading...</div>\n      </div>\n    );\n  }\n\n  if (isSuccess) {\n    return (\n      <div className=\"min-h-screen bg-[#1e293b] text-slate-100 font-[family-name:var(--font-inter)] flex items-center justify-center px-4\">\n        <div className=\"max-w-md w-full\">\n          <div className=\"text-center mb-8\">\n            <Link\n              href=\"/\"\n              className=\"inline-block font-[family-name:var(--font-playfair)] text-4xl font-bold bg-gradient-to-r from-[#16a34a] to-[#22c55e] bg-clip-text text-transparent mb-2\"\n            >\n              FlagFooty\n            </Link>\n          </div>\n\n          <div className=\"bg-slate-800/30 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50\">\n            <div className=\"text-center\">\n              <div className=\"inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#16a34a] to-[#22c55e] rounded-full mb-6\">\n                <CheckCircle className=\"w-8 h-8 text-white\" />\n              </div>\n\n              <h1 className=\"font-[family-name:var(--font-playfair)] text-2xl font-bold mb-4\">\n                Password Reset Successful!\n              </h1>\n\n              <p className=\"text-slate-400 mb-6\">\n                Your password has been updated. Redirecting to login...\n              </p>\n            </div>\n          </div>\n        </div>\n      </div>\n    );\n  }\n\n  if (!isValidToken) {\n    return (\n      <div className=\"min-h-screen bg-[#1e293b] text-slate-100 font-[family-name:var(--font-inter)] flex items-center justify-center px-4\">\n        <div className=\"max-w-md w-full\">\n          <div className=\"text-center mb-8\">\n            <Link\n              href=\"/\"\n              className=\"inline-block font-[family-name:var(--font-playfair)] text-4xl font-bold bg-gradient-to-r from-[#16a34a] to-[#22c55e] bg-clip-text text-transparent mb-2\"\n            >\n              FlagFooty\n            </Link>\n          </div>\n\n          <div className=\"bg-slate-800/30 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50\">\n            <div className=\"text-center\">\n              <AlertCircle className=\"w-16 h-16 text-red-400 mx-auto mb-6\" />\n\n              <h1 className=\"font-[family-name:var(--font-playfair)] text-2xl font-bold mb-4\">\n                Invalid Reset Link\n              </h1>\n\n              <p className=\"text-slate-400 mb-6\">{error}</p>\n\n              <Link\n                href=\"/reset-password\"\n                className=\"inline-block bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(22,163,74,0.4)] transition-all duration-300\"\n              >\n                Request New Link\n              </Link>\n            </div>\n          </div>\n        </div>\n      </div>\n    );\n  }\n\n  return (\n    <div className=\"min-h-screen bg-[#1e293b] text-slate-100 font-[family-name:var(--font-inter)] flex items-center justify-center px-4\">\n      <div className=\"max-w-md w-full\">\n        <div className=\"text-center mb-8\">\n          <Link\n            href=\"/\"\n            className=\"inline-block font-[family-name:var(--font-playfair)] text-4xl font-bold bg-gradient-to-r from-[#16a34a] to-[#22c55e] bg-clip-text text-transparent mb-2\"\n          >\n            FlagFooty\n          </Link>\n          <p className=\"text-slate-400 text-lg\">Create a new password</p>\n        </div>\n\n        <div className=\"bg-slate-800/30 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50\">\n          <h1 className=\"font-[family-name:var(--font-playfair)] text-2xl font-bold mb-6 text-center\">\n            Reset Password\n          </h1>\n\n          {error && (\n            <div className=\"mb-6 bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3\">\n              <AlertCircle className=\"w-5 h-5 text-red-400 flex-shrink-0 mt-0.5\" />\n              <p className=\"text-red-300 text-sm\">{error}</p>\n            </div>\n          )}\n\n          <form onSubmit={handleSubmit} className=\"space-y-5\">\n            <div>\n              <label className=\"block text-sm font-semibold text-slate-300 mb-2\">\n                New Password\n              </label>\n              <div className=\"relative\">\n                <div className=\"absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none\">\n                  <Lock className=\"w-5 h-5 text-slate-500\" />\n                </div>\n                <input\n                  type=\"password\"\n                  value={password}\n                  onChange={(e) => setPassword(e.target.value)}\n                  className=\"w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/20 transition-all\"\n                  placeholder=\"Min. 6 characters\"\n                  required\n                />\n              </div>\n            </div>\n\n            <div>\n              <label className=\"block text-sm font-semibold text-slate-300 mb-2\">\n                Confirm New Password\n              </label>\n              <div className=\"relative\">\n                <div className=\"absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none\">\n                  <Lock className=\"w-5 h-5 text-slate-500\" />\n                </div>\n                <input\n                  type=\"password\"\n                  value={confirmPassword}\n                  onChange={(e) => setConfirmPassword(e.target.value)}\n                  className=\"w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/20 transition-all\"\n                  placeholder=\"Confirm password\"\n                  required\n                />\n              </div>\n            </div>\n\n            <button\n              type=\"submit\"\n              className=\"w-full bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(22,163,74,0.4)] transition-all duration-300\"\n            >\n              Reset Password\n            </button>\n          </form>\n        </div>\n\n        <div className=\"mt-6 text-center\">\n          <Link\n            href=\"/login\"\n            className=\"text-slate-400 hover:text-slate-300 text-sm transition-colors\"\n          >\n            Back to Login\n          </Link>\n        </div>\n      </div>\n    </div>\n  );\n}\n\nexport default function ResetPasswordConfirmPage() {\n  return (\n    <Suspense fallback={\n      <div className=\"min-h-screen bg-[#1e293b] text-slate-100 flex items-center justify-center\">\n        <div className=\"text-slate-400\">Loading...</div>\n      </div>\n    }>\n      <ResetPasswordConfirmContent />\n    </Suspense>\n  );\n}\n