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
      const [teamResult, gamesResult] = await Promise.all([\n        getTeam(teamId),\n        getGamesByTeam(teamId),\n      ]);\n\n      if (teamResult.success && teamResult.team) {\n        setTeam(teamResult.team);\n      }\n\n      if (gamesResult.success && gamesResult.games) {\n        setGames(gamesResult.games);\n      }\n\n      setLoading(false);\n    } catch (error) {\n      console.error('Error loading data:', error);\n      setAccessDenied(true);\n      setLoading(false);\n    }\n  };\n\n  if (!isAuthenticated || !session) {\n    return null;\n  }\n\n  if (loading) {\n    return (\n      <div className=\"min-h-screen bg-[#1e293b] text-slate-100 font-[family-name:var(--font-inter)] flex items-center justify-center\">\n        <p className=\"text-slate-400\">Loading...</p>\n      </div>\n    );\n  }\n\n  if (accessDenied) {\n    return (\n      <div className=\"min-h-screen bg-[#1e293b] text-slate-100 font-[family-name:var(--font-inter)] flex items-center justify-center px-4\">\n        <div className=\"text-center\">\n          <h1 className=\"text-2xl font-bold mb-4 text-red-400\">Access Denied</h1>\n          <p className=\"text-slate-400 mb-6\">You do not have permission to view this team.</p>\n          <Link\n            href=\"/dashboard\"\n            className=\"inline-block bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(22,163,74,0.4)] transition-all duration-300\"\n          >\n            Back to Dashboard\n          </Link>\n        </div>\n      </div>\n    );\n  }\n\n  const upcomingGames = games.filter(g => !g.isFinalized);\n  const completedGames = games.filter(g => g.isFinalized);\n\n  return (\n    <div className=\"min-h-screen bg-[#1e293b] text-slate-100 font-[family-name:var(--font-inter)]\">\n      {/* Header */}\n      <div className=\"bg-slate-800/30 backdrop-blur-sm border-b border-slate-700/50\">\n        <div className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6\">\n          <div className=\"flex items-center justify-between\">\n            <div>\n              <Link\n                href=\"/dashboard\"\n                className=\"flex items-center gap-2 text-slate-400 hover:text-[#16a34a] transition-colors mb-2\"\n              >\n                <ArrowLeft className=\"w-4 h-4\" />\n                Back to Dashboard\n              </Link>\n              <h1 className=\"font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold\">\n                {team?.name || 'Team'} Schedule\n              </h1>\n              <div className=\"flex items-center gap-2 mt-2\">\n                <span className=\"px-3 py-1 bg-blue-500/20 text-blue-400 text-sm font-semibold rounded flex items-center gap-1\">\n                  <Eye className=\"w-3 h-3\" />\n                  Viewer Access (Read-Only)\n                </span>\n              </div>\n            </div>\n          </div>\n        </div>\n      </div>\n\n      {/* Navigation Tabs */}\n      <div className=\"bg-slate-800/20 border-b border-slate-700/30\">\n        <div className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8\">\n          <div className=\"flex gap-6\">\n            <Link\n              href={`/teams/${teamId}/roster`}\n              className=\"px-4 py-3 text-slate-400 hover:text-white transition-colors\"\n            >\n              Roster\n            </Link>\n            <Link\n              href={`/teams/${teamId}/schedule`}\n              className=\"px-4 py-3 text-[#16a34a] border-b-2 border-[#16a34a] font-semibold\"\n            >\n              Schedule\n            </Link>\n            <Link\n              href={`/teams/${teamId}/archive`}\n              className=\"px-4 py-3 text-slate-400 hover:text-white transition-colors\"\n            >\n              Archive\n            </Link>\n          </div>\n        </div>\n      </div>\n\n      {/* Main Content */}\n      <div className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8\">\n        {games.length === 0 ? (\n          <div className=\"bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-16 text-center\">\n            <Calendar className=\"w-16 h-16 text-slate-600 mx-auto mb-4\" />\n            <h3 className=\"text-xl font-bold mb-2\">No Games Scheduled</h3>\n            <p className=\"text-slate-400\">The coach hasn&apos;t added any games to the schedule yet.</p>\n          </div>\n        ) : (\n          <div className=\"space-y-8\">\n            {/* Upcoming Games */}\n            {upcomingGames.length > 0 && (\n              <div>\n                <h2 className=\"font-[family-name:var(--font-playfair)] text-2xl font-bold mb-4 text-[#16a34a]\">\n                  Upcoming Games\n                </h2>\n                <div className=\"space-y-4\">\n                  {upcomingGames.map(game => (\n                    <div\n                      key={game.id}\n                      className=\"bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6 hover:border-[#16a34a]/50 transition-all\"\n                    >\n                      <div className=\"flex flex-col md:flex-row md:items-center md:justify-between gap-4\">\n                        <div className=\"flex-1\">\n                          <h3 className=\"text-xl font-bold text-white mb-2\">\n                            vs {game.opponent}\n                          </h3>\n                          <div className=\"space-y-2 text-sm text-slate-400\">\n                            <div className=\"flex items-center gap-2\">\n                              <Calendar className=\"w-4 h-4\" />\n                              {new Date(game.date).toLocaleDateString('en-US', {\n                                weekday: 'long',\n                                year: 'numeric',\n                                month: 'long',\n                                day: 'numeric',\n                              })}\n                            </div>\n                            {game.time && (\n                              <div className=\"flex items-center gap-2\">\n                                <Clock className=\"w-4 h-4\" />\n                                {game.time}\n                              </div>\n                            )}\n                            <div className=\"flex items-center gap-2\">\n                              <MapPin className=\"w-4 h-4\" />\n                              {game.location}\n                              {game.field && ` - Field ${game.field}`}\n                            </div>\n                          </div>\n                        </div>\n                        <div>\n                          <span className=\"px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg text-sm font-semibold\">\n                            {game.status === 'scheduled' ? 'Scheduled' : game.status}\n                          </span>\n                        </div>\n                      </div>\n                    </div>\n                  ))}\n                </div>\n              </div>\n            )}\n\n            {/* Completed Games */}\n            {completedGames.length > 0 && (\n              <div>\n                <h2 className=\"font-[family-name:var(--font-playfair)] text-2xl font-bold mb-4 text-slate-400\">\n                  Completed Games\n                </h2>\n                <div className=\"space-y-4\">\n                  {completedGames.map(game => (\n                    <div\n                      key={game.id}\n                      className=\"bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6 opacity-75\"\n                    >\n                      <div className=\"flex flex-col md:flex-row md:items-center md:justify-between gap-4\">\n                        <div className=\"flex-1\">\n                          <h3 className=\"text-xl font-bold text-white mb-2\">\n                            vs {game.opponent}\n                          </h3>\n                          <div className=\"space-y-2 text-sm text-slate-400\">\n                            <div className=\"flex items-center gap-2\">\n                              <Calendar className=\"w-4 h-4\" />\n                              {new Date(game.date).toLocaleDateString('en-US', {\n                                weekday: 'short',\n                                month: 'short',\n                                day: 'numeric',\n                              })}\n                            </div>\n                            <div className=\"flex items-center gap-2\">\n                              <MapPin className=\"w-4 h-4\" />\n                              {game.location}\n                            </div>\n                          </div>\n                        </div>\n                        <div className=\"text-right\">\n                          {game.result && (\n                            <p className=\"text-lg font-bold text-white mb-2\">{game.result}</p>\n                          )}\n                          <span className=\"px-4 py-2 bg-slate-700 text-slate-300 rounded-lg text-sm font-semibold\">\n                            Completed\n                          </span>\n                        </div>\n                      </div>\n                    </div>\n                  ))}\n                </div>\n              </div>\n            )}\n          </div>\n        )}\n      </div>\n\n      {/* Footer */}\n      <footer className=\"py-12 px-4 border-t border-slate-800/50 mt-12\">\n        <div className=\"max-w-7xl mx-auto text-center\">\n          <h3 className=\"font-[family-name:var(--font-playfair)] text-2xl font-bold mb-2 bg-gradient-to-r from-[#16a34a] to-[#22c55e] bg-clip-text text-transparent\">\n            FlagFooty\n          </h3>\n          <p className=\"text-slate-500 text-sm\">\n            &copy; {new Date().getFullYear()} FlagFooty. All rights reserved.\n          </p>\n        </div>\n      </footer>\n    </div>\n  );\n}\n