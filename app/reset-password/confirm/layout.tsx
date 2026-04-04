import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reset Password',
};

export const dynamic = 'force-dynamic';

export default function ResetPasswordConfirmLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
