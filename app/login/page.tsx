'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, Mail, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const redirectPath = searchParams.get('redirect');
  const verified = searchParams.get('verified');

  useEffect(() => {
    if (verified === 'true') {
      setSuccessMessage('Email verified successfully! Please log in to continue.');
    }
  }, [verified]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    const success = await login(email, password, redirectPath || undefined);

    if (success) {
      // Redirect to the original destination or default to coach-dashboard
      router.push(redirectPath || '/coach-dashboard');
    } else {
      setError('Invalid email or password');
      setIsLoading(false);
    }
  };

  return (
    <div className=\"min-h-screen bg-[#1e293b] text-slate-100 font-[family-name:var(--font-inter)] flex items-center justify-center px-4\">
      <div className=\"max-w-md w-full\">\n        {/* Logo */}\n        <div className=\"text-center mb-8\">\n          <Link\n            href=\"/\"\n            className=\"inline-block font-[family-name:var(--font-playfair)] text-4xl font-bold bg-gradient-to-r from-[#16a34a] to-[#22c55e] bg-clip-text text-transparent mb-2\"\n          >\n            FlagFooty\n          </Link>\n          <p className=\"text-slate-400 text-lg\">Welcome back, Coach. Your playbook awaits.</p>\n        </div>\n\n        {/* Login Form */}\n        <div className=\"bg-slate-800/30 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50\">\n          <h1 className=\"font-[family-name:var(--font-playfair)] text-2xl font-bold mb-6 text-center\">\n            Sign In\n          </h1>\n\n          {successMessage && (\n            <div className=\"mb-6 bg-[#16a34a]/10 border border-[#16a34a]/30 rounded-lg p-4 flex items-start gap-3\">\n              <CheckCircle className=\"w-5 h-5 text-[#16a34a] flex-shrink-0 mt-0.5\" />\n              <p className=\"text-[#22c55e] text-sm\">{successMessage}</p>\n            </div>\n          )}\n\n          {error && (\n            <div className=\"mb-6 bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3\">\n              <AlertCircle className=\"w-5 h-5 text-red-400 flex-shrink-0 mt-0.5\" />\n              <p className=\"text-red-300 text-sm\">{error}</p>\n            </div>\n          )}\n\n          <form onSubmit={handleSubmit} className=\"space-y-5\">\n            <div>\n              <label className=\"block text-sm font-semibold text-slate-300 mb-2\">\n                Email\n              </label>\n              <div className=\"relative\">\n                <div className=\"absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none\">\n                  <Mail className=\"w-5 h-5 text-slate-500\" />\n                </div>\n                <input\n                  type=\"email\"\n                  value={email}\n                  onChange={(e) => setEmail(e.target.value)}\n                  className=\"w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/20 transition-all\"\n                  placeholder=\"your@email.com\"\n                  required\n                />\n              </div>\n            </div>\n\n            <div>\n              <label className=\"block text-sm font-semibold text-slate-300 mb-2\">\n                Password\n              </label>\n              <div className=\"relative\">\n                <div className=\"absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none\">\n                  <Lock className=\"w-5 h-5 text-slate-500\" />\n                </div>\n                <input\n                  type=\"password\"\n                  value={password}\n                  onChange={(e) => setPassword(e.target.value)}\n                  className=\"w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/20 transition-all\"\n                  placeholder=\"Enter your password\"\n                  required\n                />\n              </div>\n            </div>\n\n            <div className=\"flex items-center justify-between text-sm\">\n              <Link\n                href=\"/reset-password\"\n                className=\"text-[#16a34a] hover:text-[#22c55e] transition-colors\"\n              >\n                Forgot password?\n              </Link>\n            </div>\n\n            <button\n              type=\"submit\"\n              disabled={isLoading}\n              className=\"w-full bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(22,163,74,0.4)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed\"\n            >\n              {isLoading ? 'Signing in...' : 'Sign In'}\n            </button>\n          </form>\n\n          <div className=\"mt-6 text-center\">\n            <p className=\"text-slate-400 text-sm\">\n              Don&apos;t have an account?{' '}\n              <Link\n                href=\"/signup\"\n                className=\"text-[#16a34a] hover:text-[#22c55e] font-semibold transition-colors\"\n              >\n                Sign up\n              </Link>\n            </p>\n          </div>\n        </div>\n\n        {/* Back to Home */}\n        <div className=\"mt-6 text-center\">\n          <Link\n            href=\"/\"\n            className=\"text-slate-400 hover:text-slate-300 text-sm transition-colors\"\n          >\n            Back to Home\n          </Link>\n        </div>\n      </div>\n    </div>\n  );\n}\n