'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, Mail, User, AlertCircle, Check, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { getInviteByToken, acceptInvite } from '@/lib/actions/invites';

function JoinPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session, signup, login } = useAuth();

  const [token, setToken] = useState<string>('');
  const [invite, setInvite] = useState<any>(null);
  const [loadingInvite, setLoadingInvite] = useState(true);
  const [error, setError] = useState('');
  const [showSignup, setShowSignup] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
      loadInvite(tokenParam);
    } else {
      setError('Invalid invite link. No token provided.');
      setLoadingInvite(false);
    }
  }, [searchParams]);

  const loadInvite = async (inviteToken: string) => {
    setLoadingInvite(true);
    const result = await getInviteByToken(inviteToken);

    if (result.success && result.invite) {
      setInvite(result.invite);
      setEmail(result.invite.email);
    } else {
      setError(result.error || 'Failed to load invite');
    }
    setLoadingInvite(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsProcessing(true);

    // Sign up the user
    const signupSuccess = await signup(email, password, firstName, lastName, 'parent');

    if (!signupSuccess) {
      setError('Failed to create account. Email may already be in use.');
      setIsProcessing(false);
      return;
    }

    // Accept the invite (signup automatically logs in)
    await processInviteAcceptance();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsProcessing(true);

    // Log in the user
    const loginSuccess = await login(email, password);

    if (!loginSuccess) {
      setError('Invalid email or password');
      setIsProcessing(false);
      return;
    }

    // Accept the invite
    await processInviteAcceptance();
  };

  const processInviteAcceptance = async () => {
    // Get current session after login/signup
    const currentSession = session;

    if (!currentSession) {
      setError('Authentication failed. Please try again.');
      setIsProcessing(false);
      return;
    }

    // Accept the invite
    const result = await acceptInvite({
      token,
      userId: currentSession.userId,
    });

    if (result.success) {
      // Redirect to dashboard
      router.push('/dashboard');
    } else {
      setError(result.error || 'Failed to accept invite');
      setIsProcessing(false);
    }
  };

  if (loadingInvite) {
    return (
      <div className=\"min-h-screen bg-[#1e293b] text-slate-100 font-[family-name:var(--font-inter)] flex items-center justify-center px-4\">
        <div className=\"text-center\">
          <Loader2 className=\"w-12 h-12 text-[#16a34a] animate-spin mx-auto mb-4\" />
          <p className=\"text-slate-400\">Loading invite...</p>
        </div>
      </div>
    );
  }

  if (error && !invite) {
    return (
      <div className=\"min-h-screen bg-[#1e293b] text-slate-100 font-[family-name:var(--font-inter)] flex items-center justify-center px-4\">
        <div className=\"max-w-md w-full text-center\">
          <div className=\"bg-slate-800/30 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50\">
            <AlertCircle className=\"w-16 h-16 text-red-400 mx-auto mb-4\" />
            <h1 className=\"font-[family-name:var(--font-playfair)] text-2xl font-bold mb-3\">
              Invalid Invite
            </h1>
            <p className=\"text-slate-400 mb-6\">{error}</p>\n            <Link\n              href=\"/\"\n              className=\"inline-block bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(22,163,74,0.4)] transition-all duration-300\"\n            >\n              Go to Home\n            </Link>\n          </div>\n        </div>\n      </div>\n    );\n  }\n\n  return (\n    <div className=\"min-h-screen bg-[#1e293b] text-slate-100 font-[family-name:var(--font-inter)] flex items-center justify-center px-4 py-8\">\n      <div className=\"max-w-md w-full\">\n        {/* Logo */}\n        <div className=\"text-center mb-8\">\n          <Link\n            href=\"/\"\n            className=\"inline-block font-[family-name:var(--font-playfair)] text-4xl font-bold bg-gradient-to-r from-[#16a34a] to-[#22c55e] bg-clip-text text-transparent mb-2\"\n          >\n            FlagFooty\n          </Link>\n          <p className=\"text-slate-400 text-lg\">Team Invite</p>\n        </div>\n\n        {/* Invite Info */}\n        {invite && (\n          <div className=\"bg-slate-800/30 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 mb-6\">\n            <div className=\"bg-green-500/10 border border-green-500/30 rounded-lg p-4 flex items-start gap-3 mb-4\">\n              <Check className=\"w-5 h-5 text-green-400 flex-shrink-0 mt-0.5\" />\n              <div>\n                <p className=\"text-green-300 font-semibold mb-1\">You&apos;re invited!</p>\n                <p className=\"text-green-300/80 text-sm\">\n                  {invite.sentByUser.firstName} {invite.sentByUser.lastName} has invited you to join{' '}\n                  <span className=\"font-semibold\">{invite.team.name}</span> as a viewer.\n                </p>\n              </div>\n            </div>\n\n            <div className=\"space-y-2 text-sm text-slate-400\">\n              <h3 className=\"text-slate-300 font-semibold mb-2\">As a viewer, you&apos;ll have access to:</h3>\n              <ul className=\"space-y-1\">\n                <li className=\"flex items-center gap-2\">\n                  <Check className=\"w-4 h-4 text-green-400\" />\n                  Team roster (names and jersey numbers)\n                </li>\n                <li className=\"flex items-center gap-2\">\n                  <Check className=\"w-4 h-4 text-green-400\" />\n                  Game schedule\n                </li>\n                <li className=\"flex items-center gap-2\">\n                  <Check className=\"w-4 h-4 text-green-400\" />\n                  Game archives with print option\n                </li>\n              </ul>\n            </div>\n          </div>\n        )}\n\n        {/* Auth Forms */}\n        <div className=\"bg-slate-800/30 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50\">\n          <h1 className=\"font-[family-name:var(--font-playfair)] text-2xl font-bold mb-6 text-center\">\n            {showSignup ? 'Create Account' : 'Sign In to Accept'}\n          </h1>\n\n          {error && (\n            <div className=\"mb-6 bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3\">\n              <AlertCircle className=\"w-5 h-5 text-red-400 flex-shrink-0 mt-0.5\" />\n              <p className=\"text-red-300 text-sm\">{error}</p>\n            </div>\n          )}\n\n          {showSignup ? (\n            /* Sign Up Form */\n            <form onSubmit={handleSignup} className=\"space-y-5\">\n              <div className=\"grid grid-cols-2 gap-3\">\n                <div>\n                  <label className=\"block text-sm font-semibold text-slate-300 mb-2\">\n                    First Name\n                  </label>\n                  <div className=\"relative\">\n                    <div className=\"absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none\">\n                      <User className=\"w-5 h-5 text-slate-500\" />\n                    </div>\n                    <input\n                      type=\"text\"\n                      value={firstName}\n                      onChange={(e) => setFirstName(e.target.value)}\n                      className=\"w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/20 transition-all\"\n                      placeholder=\"John\"\n                      required\n                    />\n                  </div>\n                </div>\n                <div>\n                  <label className=\"block text-sm font-semibold text-slate-300 mb-2\">\n                    Last Name\n                  </label>\n                  <input\n                    type=\"text\"\n                    value={lastName}\n                    onChange={(e) => setLastName(e.target.value)}\n                    className=\"w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/20 transition-all\"\n                    placeholder=\"Doe\"\n                    required\n                  />\n                </div>\n              </div>\n\n              <div>\n                <label className=\"block text-sm font-semibold text-slate-300 mb-2\">\n                  Email\n                </label>\n                <div className=\"relative\">\n                  <div className=\"absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none\">\n                    <Mail className=\"w-5 h-5 text-slate-500\" />\n                  </div>\n                  <input\n                    type=\"email\"\n                    value={email}\n                    onChange={(e) => setEmail(e.target.value)}\n                    className=\"w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/20 transition-all\"\n                    required\n                  />\n                </div>\n              </div>\n\n              <div>\n                <label className=\"block text-sm font-semibold text-slate-300 mb-2\">\n                  Password\n                </label>\n                <div className=\"relative\">\n                  <div className=\"absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none\">\n                    <Lock className=\"w-5 h-5 text-slate-500\" />\n                  </div>\n                  <input\n                    type=\"password\"\n                    value={password}\n                    onChange={(e) => setPassword(e.target.value)}\n                    className=\"w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/20 transition-all\"\n                    placeholder=\"Create a password\"\n                    required\n                  />\n                </div>\n              </div>\n\n              <button\n                type=\"submit\"\n                disabled={isProcessing}\n                className=\"w-full bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(22,163,74,0.4)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed\"\n              >\n                {isProcessing ? 'Creating Account...' : 'Create Account & Join Team'}\n              </button>\n\n              <div className=\"text-center\">\n                <p className=\"text-slate-400 text-sm\">\n                  Already have an account?{' '}\n                  <button\n                    type=\"button\"\n                    onClick={() => setShowSignup(false)}\n                    className=\"text-[#16a34a] hover:text-[#22c55e] font-semibold transition-colors\"\n                  >\n                    Sign in\n                  </button>\n                </p>\n              </div>\n            </form>\n          ) : (\n            /* Sign In Form */\n            <form onSubmit={handleLogin} className=\"space-y-5\">\n              <div>\n                <label className=\"block text-sm font-semibold text-slate-300 mb-2\">\n                  Email\n                </label>\n                <div className=\"relative\">\n                  <div className=\"absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none\">\n                    <Mail className=\"w-5 h-5 text-slate-500\" />\n                  </div>\n                  <input\n                    type=\"email\"\n                    value={email}\n                    onChange={(e) => setEmail(e.target.value)}\n                    className=\"w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/20 transition-all\"\n                    required\n                  />\n                </div>\n              </div>\n\n              <div>\n                <label className=\"block text-sm font-semibold text-slate-300 mb-2\">\n                  Password\n                </label>\n                <div className=\"relative\">\n                  <div className=\"absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none\">\n                    <Lock className=\"w-5 h-5 text-slate-500\" />\n                  </div>\n                  <input\n                    type=\"password\"\n                    value={password}\n                    onChange={(e) => setPassword(e.target.value)}\n                    className=\"w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/20 transition-all\"\n                    placeholder=\"Enter your password\"\n                    required\n                  />\n                </div>\n              </div>\n\n              <button\n                type=\"submit\"\n                disabled={isProcessing}\n                className=\"w-full bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(22,163,74,0.4)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed\"\n              >\n                {isProcessing ? 'Signing In...' : 'Sign In & Join Team'}\n              </button>\n\n              <div className=\"text-center\">\n                <p className=\"text-slate-400 text-sm\">\n                  Don&apos;t have an account?{' '}\n                  <button\n                    type=\"button\"\n                    onClick={() => setShowSignup(true)}\n                    className=\"text-[#16a34a] hover:text-[#22c55e] font-semibold transition-colors\"\n                  >\n                    Create one\n                  </button>\n                </p>\n              </div>\n            </form>\n          )}\n        </div>\n\n        {/* Back to Home */}\n        <div className=\"mt-6 text-center\">\n          <Link\n            href=\"/\"\n            className=\"text-slate-400 hover:text-slate-300 text-sm transition-colors\"\n          >\n            Back to Home\n          </Link>\n        </div>\n      </div>\n    </div>\n  );\n}\n\nexport default function JoinPage() {\n  return (\n    <Suspense fallback={\n      <div className=\"min-h-screen bg-[#1e293b] text-slate-100 font-[family-name:var(--font-inter)] flex items-center justify-center px-4\">\n        <div className=\"text-center\">\n          <Loader2 className=\"w-12 h-12 text-[#16a34a] animate-spin mx-auto mb-4\" />\n          <p className=\"text-slate-400\">Loading...</p>\n        </div>\n      </div>\n    }>\n      <JoinPageContent />\n    </Suspense>\n  );\n}\n