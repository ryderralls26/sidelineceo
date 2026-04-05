import type { Metadata } from 'next';
import { getTeam } from '@/lib/actions/teams';

type Props = {
  params: Promise<{ teamId: string }>
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { teamId } = await params;
  try {
    const result = await getTeam(teamId);
    const teamName = result.success && result.team ? result.team.name : 'Team';

    return {
      title: `${teamName} Roster`,
    };
  } catch (error) {
    return {
      title: 'Team Roster',
    };
  }
}

export default function RosterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
