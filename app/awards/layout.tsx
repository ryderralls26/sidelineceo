import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Awards Leaderboard',
};

export default function AwardsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
