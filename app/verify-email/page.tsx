'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'no-token'>('verifying');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('no-token');
        return;
      }

      try {
        const response = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setStatus('success');
          // Redirect to login after 2 seconds
          setTimeout(() => {
            router.push('/login?verified=true');
          }, 2000);
        } else {
          setStatus('error');
          setErrorMessage(data.error || 'Verification failed');
        }
      } catch (error) {
        setStatus('error');
        setErrorMessage('An unexpected error occurred');
      }
    };

    verifyEmail();
  }, [token, router]);

  return (
    <div className=\"min-h-screen bg-[#1e293b] text-slate-100 font-[family-name:var(--font-inter)] flex items-center justify-center px-4\">
      <div className=\"max-w-md w-full\">
        {/* Logo */}
        <div className=\"text-center mb-8\">
          <Link
            href=\"/\"
            className=\"inline-block font-[family-name:var(--font-playfair)] text-4xl font-bold bg-gradient-to-r from-[#16a34a] to-[#22c55e] bg-clip-text text-transparent mb-2\"
          >
            FlagFooty
          </Link>
          <p className=\"text-slate-400 text-lg\">Email Verification</p>
        </div>

        {/* Verification Status Card */}
        <div className=\"bg-slate-800/30 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50\">
          {status === 'verifying' && (
            <div className=\"text-center\">
              <div className=\"flex justify-center mb-4\">
                <Loader2 className=\"w-16 h-16 text-[#16a34a] animate-spin\" />
              </div>
              <h1 className=\"font-[family-name:var(--font-playfair)] text-2xl font-bold mb-3\">
                Verifying Your Email
              </h1>
              <p className=\"text-slate-400\">Please wait while we verify your email address...</p>
            </div>
          )}

          {status === 'success' && (
            <div className=\"text-center\">
              <div className=\"flex justify-center mb-4\">
                <CheckCircle className=\"w-16 h-16 text-[#16a34a]\" />
              </div>
              <h1 className=\"font-[family-name:var(--font-playfair)] text-2xl font-bold mb-3 text-[#16a34a]\">
                Email Verified!
              </h1>
              <p className=\"text-slate-400 mb-6\">
                Your email has been successfully verified. Redirecting you to login...
              </p>
              <Link
                href=\"/login\"
                className=\"inline-block bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(22,163,74,0.4)] transition-all duration-300\"
              >
                Go to Login
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div className=\"text-center\">
              <div className=\"flex justify-center mb-4\">
                <XCircle className=\"w-16 h-16 text-red-400\" />
              </div>
              <h1 className=\"font-[family-name:var(--font-playfair)] text-2xl font-bold mb-3 text-red-400\">
                Verification Failed
              </h1>
              <p className=\"text-slate-400 mb-6\">
                {errorMessage || 'The verification link is invalid or has expired.'}
              </p>
              <div className=\"space-y-3\">
                <Link
                  href=\"/login\"
                  className=\"block w-full bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(22,163,74,0.4)] transition-all duration-300\"
                >
                  Go to Login
                </Link>
                <Link
                  href=\"/signup\"
                  className=\"block w-full border border-slate-700 text-slate-300 px-6 py-3 rounded-lg font-semibold hover:bg-slate-800/50 transition-all duration-300\"
                >
                  Create New Account
                </Link>
              </div>
            </div>
          )}

          {status === 'no-token' && (
            <div className=\"text-center\">
              <div className=\"flex justify-center mb-4\">
                <Mail className=\"w-16 h-16 text-slate-500\" />
              </div>
              <h1 className=\"font-[family-name:var(--font-playfair)] text-2xl font-bold mb-3\">
                No Verification Token
              </h1>
              <p className=\"text-slate-400 mb-6\">
                No verification token was provided. Please check your email for the verification link.
              </p>
              <Link
                href=\"/login\"
                className=\"inline-block bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(22,163,74,0.4)] transition-all duration-300\"
              >
                Go to Login
              </Link>
            </div>
          )}
        </div>

        {/* Back to Home */}
        <div className=\"mt-6 text-center\">
          <Link
            href=\"/\"
            className=\"text-slate-400 hover:text-slate-300 text-sm transition-colors\"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
