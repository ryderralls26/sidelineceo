'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Mail, User, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

    try {
      // Call signup API directly to get verification token
      const normalizedEmail = email.trim().toLowerCase();
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail, password, firstName, lastName, role: 'COACH', isAdmin: false }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // In production, verification link would be emailed
        // For dev, we'll redirect to verify-email with the token
        if (data.verificationToken) {\n          router.push(`/verify-email?token=${data.verificationToken}`);\n        } else {\n          router.push('/coach-dashboard');\n        }\n      } else {\n        setError(data.error || 'An account with this email already exists');\n        setIsLoading(false);\n      }\n    } catch (err) {\n      setError('An unexpected error occurred');\n      setIsLoading(false);\n    }\n  };\n\n  return (\n    <div className=\"min-h-screen bg-[#1e293b] text-slate-100 font-[family-name:var(--font-inter)] flex items-center justify-center px-4 py-12\">\n      <div className=\"max-w-md w-full\">\n        {/* Logo */}\n        <div className=\"text-center mb-8\">\n          <Link\n            href=\"/\"\n            className=\"inline-block font-[family-name:var(--font-playfair)] text-4xl font-bold bg-gradient-to-r from-[#16a34a] to-[#22c55e] bg-clip-text text-transparent mb-2\"\n          >\n            FlagFooty\n          </Link>\n          <p className=\"text-slate-400 text-lg\">Get in the huddle. Your team needs you.</p>\n        </div>\n\n        {/* Signup Form */}\n        <div className=\"bg-slate-800/30 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50\">\n          <h1 className=\"font-[family-name:var(--font-playfair)] text-2xl font-bold mb-6 text-center\">\n            Sign Up\n          </h1>\n\n          {error && (\n            <div className=\"mb-6 bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3\">\n              <AlertCircle className=\"w-5 h-5 text-red-400 flex-shrink-0 mt-0.5\" />\n              <p className=\"text-red-300 text-sm\">{error}</p>\n            </div>\n          )}\n\n          <form onSubmit={handleSubmit} className=\"space-y-5\">\n            <div className=\"grid grid-cols-2 gap-4\">\n              <div>\n                <label className=\"block text-sm font-semibold text-slate-300 mb-2\">\n                  First Name\n                </label>\n                <div className=\"relative\">\n                  <div className=\"absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none\">\n                    <User className=\"w-5 h-5 text-slate-500\" />\n                  </div>\n                  <input\n                    type=\"text\"\n                    value={firstName}\n                    onChange={(e) => setFirstName(e.target.value)}\n                    className=\"w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/20 transition-all\"\n                    placeholder=\"John\"\n                    required\n                  />\n                </div>\n              </div>\n\n              <div>\n                <label className=\"block text-sm font-semibold text-slate-300 mb-2\">\n                  Last Name\n                </label>\n                <input\n                  type=\"text\"\n                  value={lastName}\n                  onChange={(e) => setLastName(e.target.value)}\n                  className=\"w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/20 transition-all\"\n                  placeholder=\"Doe\"\n                  required\n                />\n              </div>\n            </div>\n\n            <div>\n              <label className=\"block text-sm font-semibold text-slate-300 mb-2\">\n                Email\n              </label>\n              <div className=\"relative\">\n                <div className=\"absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none\">\n                  <Mail className=\"w-5 h-5 text-slate-500\" />\n                </div>\n                <input\n                  type=\"email\"\n                  value={email}\n                  onChange={(e) => setEmail(e.target.value)}\n                  className=\"w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/20 transition-all\"\n                  placeholder=\"your@email.com\"\n                  required\n                />\n              </div>\n            </div>\n\n            <div>\n              <label className=\"block text-sm font-semibold text-slate-300 mb-2\">\n                Password\n              </label>\n              <div className=\"relative\">\n                <div className=\"absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none\">\n                  <Lock className=\"w-5 h-5 text-slate-500\" />\n                </div>\n                <input\n                  type=\"password\"\n                  value={password}\n                  onChange={(e) => setPassword(e.target.value)}\n                  className=\"w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/20 transition-all\"\n                  placeholder=\"Min. 6 characters\"\n                  required\n                />\n              </div>\n            </div>\n\n            <div>\n              <label className=\"block text-sm font-semibold text-slate-300 mb-2\">\n                Confirm Password\n              </label>\n              <div className=\"relative\">\n                <div className=\"absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none\">\n                  <Lock className=\"w-5 h-5 text-slate-500\" />\n                </div>\n                <input\n                  type=\"password\"\n                  value={confirmPassword}\n                  onChange={(e) => setConfirmPassword(e.target.value)}\n                  className=\"w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/20 transition-all\"\n                  placeholder=\"Confirm password\"\n                  required\n                />\n              </div>\n            </div>\n\n            <button\n              type=\"submit\"\n              disabled={isLoading}\n              className=\"w-full bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(22,163,74,0.4)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed\"\n            >\n              {isLoading ? 'Creating account...' : 'Create Account'}\n            </button>\n          </form>\n\n          <div className=\"mt-6 text-center\">\n            <p className=\"text-slate-400 text-sm\">\n              Already have an account?{' '}\n              <Link\n                href=\"/login\"\n                className=\"text-[#16a34a] hover:text-[#22c55e] font-semibold transition-colors\"\n              >\n                Sign in\n              </Link>\n            </p>\n          </div>\n        </div>\n\n        {/* Back to Home */}\n        <div className=\"mt-6 text-center\">\n          <Link\n            href=\"/\"\n            className=\"text-slate-400 hover:text-slate-300 text-sm transition-colors\"\n          >\n            Back to Home\n          </Link>\n        </div>\n      </div>\n    </div>\n  );\n}\n