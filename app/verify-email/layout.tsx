import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Verify Email',
};

export const dynamic = 'force-dynamic';

export default function VerifyEmailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
