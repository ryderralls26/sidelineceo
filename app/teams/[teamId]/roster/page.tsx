'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Users, Hash, User, Eye } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { getPlayersByTeam } from '@/lib/actions/players';
import { getTeam } from '@/lib/actions/teams';
import { checkUserTeamAccess } from '@/lib/utils/access-control';

interface Player {
  id: number;
  jerseyNumber: string;
  firstName: string;
  lastName: string;
  position1: string;
  position2?: string | null;
}

interface Team {
  id: string;
  name: string;
  sport: string;
  division?: string | null;
  season: string;
  year: string;
}

export default function ParentRosterPage() {
  const router = useRouter();
  const params = useParams();
  const { session, isAuthenticated } = useAuth();
  const [team, setTeam] = useState<Team | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  const teamId = params.teamId as string;

  useEffect(() => {
    if (!isAuthenticated || !session) {
      router.push('/login');
      return;
    }

    checkAccessAndLoadData();
  }, [isAuthenticated, session, teamId]);

  const checkAccessAndLoadData = async () => {
    if (!session) return;

    try {
      // Check access
      const access = await checkUserTeamAccess(session.userId, teamId);

      if (!access.hasAccess) {
        setAccessDenied(true);
        setLoading(false);
        return;
      }

      // Load team and players
      const [teamResult, playersResult] = await Promise.all([
        getTeam(teamId),
        getPlayersByTeam(teamId),
      ]);

      if (teamResult.success && teamResult.team) {
        setTeam(teamResult.team);
      }

      if (playersResult.success && playersResult.players) {
        setPlayers(playersResult.players);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setAccessDenied(true);
      setLoading(false);
    }
  };

  if (!isAuthenticated || !session) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1e293b] text-slate-100 font-[family-name:var(--font-inter)] flex items-center justify-center">
        <p className="text-slate-400">Loading...</p>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-[#1e293b] text-slate-100 font-[family-name:var(--font-inter)] flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-red-400">Access Denied</h1>
          <p className="text-slate-400 mb-6">You do not have permission to view this team.</p>
          <Link
            href="/dashboard"
            className="inline-block bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(22,163,74,0.4)] transition-all duration-300"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1e293b] text-slate-100 font-[family-name:var(--font-inter)]">
      {/* Header */}
      <div className="bg-slate-800/30 backdrop-blur-sm border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-slate-400 hover:text-[#16a34a] transition-colors mb-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Link>
              <h1 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold">
                {team?.name || 'Team'} Roster
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-sm font-semibold rounded flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  Viewer Access (Read-Only)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-slate-800/20 border-b border-slate-700/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-6">
            <Link
              href={`/teams/${teamId}/roster`}
              className="px-4 py-3 text-[#16a34a] border-b-2 border-[#16a34a] font-semibold"
            >
              Roster
            </Link>
            <Link
              href={`/teams/${teamId}/schedule`}
              className="px-4 py-3 text-slate-400 hover:text-white transition-colors"
            >
              Schedule
            </Link>
            <Link
              href={`/teams/${teamId}/archive`}
              className="px-4 py-3 text-slate-400 hover:text-white transition-colors"
            >
              Archive
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {players.length === 0 ? (
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-16 text-center">
            <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No Players Yet</h3>
            <p className="text-slate-400">The coach hasn&apos;t added any players to the roster yet.</p>
          </div>
        ) : (
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-800/50 border-b border-slate-700">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                      <div className="flex items-center gap-2">
                        <Hash className="w-4 h-4" />
                        Jersey #
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Player Name
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Primary Position</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Secondary Position</th>
                  </tr>
                </thead>
                <tbody>
                  {players.map((player, index) => (
                    <tr
                      key={player.id}
                      className={`border-b border-slate-700/30 hover:bg-slate-800/30 transition-colors ${
                        index % 2 === 0 ? 'bg-slate-900/20' : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#16a34a] text-white font-bold">
                          {player.jerseyNumber}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-white">
                          {player.firstName} {player.lastName}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-slate-300">{player.position1}</td>
                      <td className="px-6 py-4 text-slate-300">{player.position2 || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <p className="text-blue-300 text-sm">
            <strong>Note:</strong> As a viewer, you can only see player names and jersey numbers.
            Contact information and other details are restricted to coaches only.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-slate-800/50 mt-12">
        <div className="max-w-7xl mx-auto text-center">
          <h3 className="font-[family-name:var(--font-playfair)] text-2xl font-bold mb-2 bg-gradient-to-r from-[#16a34a] to-[#22c55e] bg-clip-text text-transparent">
            SidelineCEO
          </h3>
          <p className="text-slate-500 text-sm">
            &copy; {new Date().getFullYear()} SidelineCEO. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
