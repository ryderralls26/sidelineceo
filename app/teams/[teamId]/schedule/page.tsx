'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, MapPin, Eye, Clock } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { getGamesByTeam } from '@/lib/actions/games';
import { getTeam } from '@/lib/actions/teams';
import { checkUserTeamAccess } from '@/lib/utils/access-control';

interface Game {
  id: number;
  date: string;
  time?: string | null;
  opponent: string;
  location: string;
  field?: string | null;
  status: string;
  result?: string | null;
  isFinalized: boolean;
}

interface Team {
  id: string;
  name: string;
}

export default function ParentSchedulePage() {
  const router = useRouter();
  const params = useParams();
  const { session, isAuthenticated } = useAuth();
  const [team, setTeam] = useState<Team | null>(null);
  const [games, setGames] = useState<Game[]>([]);
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

      // Load team and games
      const [teamResult, gamesResult] = await Promise.all([
        getTeam(teamId),
        getGamesByTeam(teamId),
      ]);

      if (teamResult.success && teamResult.team) {
        setTeam(teamResult.team);
      }

      if (gamesResult.success && gamesResult.games) {
        setGames(gamesResult.games);
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

  const upcomingGames = games.filter(g => !g.isFinalized);
  const completedGames = games.filter(g => g.isFinalized);

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
                {team?.name || 'Team'} Schedule
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
              className="px-4 py-3 text-slate-400 hover:text-white transition-colors"
            >
              Roster
            </Link>
            <Link
              href={`/teams/${teamId}/schedule`}
              className="px-4 py-3 text-[#16a34a] border-b-2 border-[#16a34a] font-semibold"
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
        {games.length === 0 ? (
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-16 text-center">
            <Calendar className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No Games Scheduled</h3>
            <p className="text-slate-400">The coach hasn&apos;t added any games to the schedule yet.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Upcoming Games */}
            {upcomingGames.length > 0 && (
              <div>
                <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold mb-4 text-[#16a34a]">
                  Upcoming Games
                </h2>
                <div className="space-y-4">
                  {upcomingGames.map(game => (
                    <div
                      key={game.id}
                      className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6 hover:border-[#16a34a]/50 transition-all"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-2">
                            vs {game.opponent}
                          </h3>
                          <div className="space-y-2 text-sm text-slate-400">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              {new Date(game.date).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </div>
                            {game.time && (
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                {game.time}
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              {game.location}
                              {game.field && ` - Field ${game.field}`}
                            </div>
                          </div>
                        </div>
                        <div>
                          <span className="px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg text-sm font-semibold">
                            {game.status === 'scheduled' ? 'Scheduled' : game.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Completed Games */}
            {completedGames.length > 0 && (
              <div>
                <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold mb-4 text-slate-400">
                  Completed Games
                </h2>
                <div className="space-y-4">
                  {completedGames.map(game => (
                    <div
                      key={game.id}
                      className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6 opacity-75"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-2">
                            vs {game.opponent}
                          </h3>
                          <div className="space-y-2 text-sm text-slate-400">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              {new Date(game.date).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              {game.location}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          {game.result && (
                            <p className="text-lg font-bold text-white mb-2">{game.result}</p>
                          )}
                          <span className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg text-sm font-semibold">
                            Completed
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
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
