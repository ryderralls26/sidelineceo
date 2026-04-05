import type { Metadata } from 'next';
import { getTeam } from '@/lib/actions/teams';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ teamId: string }>;
}): Promise<Metadata> {
  try {
    const { teamId } = await params;
    const result = await getTeam(teamId);
    const teamName = result.success && result.team ? result.team.name : 'Team';

    return {
      title: `${teamName} Schedule`,
    };
  } catch (error) {
    return {
      title: 'Team Schedule',
    };
  }
}

export default function ScheduleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}