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
      <div className="min-h-screen bg-[#1e293b] text-slate-100 font-[family-name:var(--font-inter)] flex items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#16a34a] animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading invite...</p>
        </div>
      </div>
    );
  }

  if (error && !invite) {
    return (
      <div className="min-h-screen bg-[#1e293b] text-slate-100 font-[family-name:var(--font-inter)] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-slate-800/30 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold mb-3">
              Invalid Invite
            </h1>
            <p className="text-slate-400 mb-6">{error}</p>
            <Link
              href="/"
              className="inline-block bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(22,163,74,0.4)] transition-all duration-300"
            >
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1e293b] text-slate-100 font-[family-name:var(--font-inter)] flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-block font-[family-name:var(--font-playfair)] text-4xl font-bold bg-gradient-to-r from-[#16a34a] to-[#22c55e] bg-clip-text text-transparent mb-2"
          >
            SidelineCEO
          </Link>
          <p className="text-slate-400 text-lg">Team Invite</p>
        </div>

        {/* Invite Info */}
        {invite && (
          <div className="bg-slate-800/30 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 mb-6">
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 flex items-start gap-3 mb-4">
              <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-green-300 font-semibold mb-1">You&apos;re invited!</p>
                <p className="text-green-300/80 text-sm">
                  {invite.sentByUser.firstName} {invite.sentByUser.lastName} has invited you to join{' '}
                  <span className="font-semibold">{invite.team.name}</span> as a viewer.
                </p>
              </div>
            </div>

            <div className="space-y-2 text-sm text-slate-400">
              <h3 className="text-slate-300 font-semibold mb-2">As a viewer, you&apos;ll have access to:</h3>
              <ul className="space-y-1">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  Team roster (names and jersey numbers)
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  Game schedule
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  Game archives with print option
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Auth Forms */}
        <div className="bg-slate-800/30 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50">
          <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold mb-6 text-center">
            {showSignup ? 'Create Account' : 'Sign In to Accept'}
          </h1>

          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {showSignup ? (
            /* Sign Up Form */
            <form onSubmit={handleSignup} className="space-y-5">
              <div className="grid grid-cols-2 gap-3">
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
                    placeholder="Create a password"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(22,163,74,0.4)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Creating Account...' : 'Create Account & Join Team'}
              </button>

              <div className="text-center">
                <p className="text-slate-400 text-sm">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setShowSignup(false)}
                    className="text-[#16a34a] hover:text-[#22c55e] font-semibold transition-colors"
                  >
                    Sign in
                  </button>
                </p>
              </div>
            </form>
          ) : (
            /* Sign In Form */
            <form onSubmit={handleLogin} className="space-y-5">
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
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(22,163,74,0.4)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Signing In...' : 'Sign In & Join Team'}
              </button>

              <div className="text-center">
                <p className="text-slate-400 text-sm">
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setShowSignup(true)}
                    className="text-[#16a34a] hover:text-[#22c55e] font-semibold transition-colors"
                  >
                    Create one
                  </button>
                </p>
              </div>
            </form>
          )}
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

export default function JoinPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#1e293b] text-slate-100 font-[family-name:var(--font-inter)] flex items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#16a34a] animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    }>
      <JoinPageContent />
    </Suspense>
  );
}
