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
      const [teamResult, playersResult] = await Promise.all([\n        getTeam(teamId),\n        getPlayersByTeam(teamId),\n      ]);\n\n      if (teamResult.success && teamResult.team) {\n        setTeam(teamResult.team);\n      }\n\n      if (playersResult.success && playersResult.players) {\n        setPlayers(playersResult.players);\n      }\n\n      setLoading(false);\n    } catch (error) {\n      console.error('Error loading data:', error);\n      setAccessDenied(true);\n      setLoading(false);\n    }\n  };\n\n  if (!isAuthenticated || !session) {\n    return null;\n  }\n\n  if (loading) {\n    return (\n      <div className=\"min-h-screen bg-[#1e293b] text-slate-100 font-[family-name:var(--font-inter)] flex items-center justify-center\">\n        <p className=\"text-slate-400\">Loading...</p>\n      </div>\n    );\n  }\n\n  if (accessDenied) {\n    return (\n      <div className=\"min-h-screen bg-[#1e293b] text-slate-100 font-[family-name:var(--font-inter)] flex items-center justify-center px-4\">\n        <div className=\"text-center\">\n          <h1 className=\"text-2xl font-bold mb-4 text-red-400\">Access Denied</h1>\n          <p className=\"text-slate-400 mb-6\">You do not have permission to view this team.</p>\n          <Link\n            href=\"/dashboard\"\n            className=\"inline-block bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(22,163,74,0.4)] transition-all duration-300\"\n          >\n            Back to Dashboard\n          </Link>\n        </div>\n      </div>\n    );\n  }\n\n  return (\n    <div className=\"min-h-screen bg-[#1e293b] text-slate-100 font-[family-name:var(--font-inter)]\">\n      {/* Header */}\n      <div className=\"bg-slate-800/30 backdrop-blur-sm border-b border-slate-700/50\">\n        <div className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6\">\n          <div className=\"flex items-center justify-between\">\n            <div>\n              <Link\n                href=\"/dashboard\"\n                className=\"flex items-center gap-2 text-slate-400 hover:text-[#16a34a] transition-colors mb-2\"\n              >\n                <ArrowLeft className=\"w-4 h-4\" />\n                Back to Dashboard\n              </Link>\n              <h1 className=\"font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold\">\n                {team?.name || 'Team'} Roster\n              </h1>\n              <div className=\"flex items-center gap-2 mt-2\">\n                <span className=\"px-3 py-1 bg-blue-500/20 text-blue-400 text-sm font-semibold rounded flex items-center gap-1\">\n                  <Eye className=\"w-3 h-3\" />\n                  Viewer Access (Read-Only)\n                </span>\n              </div>\n            </div>\n          </div>\n        </div>\n      </div>\n\n      {/* Navigation Tabs */}\n      <div className=\"bg-slate-800/20 border-b border-slate-700/30\">\n        <div className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8\">\n          <div className=\"flex gap-6\">\n            <Link\n              href={`/teams/${teamId}/roster`}\n              className=\"px-4 py-3 text-[#16a34a] border-b-2 border-[#16a34a] font-semibold\"\n            >\n              Roster\n            </Link>\n            <Link\n              href={`/teams/${teamId}/schedule`}\n              className=\"px-4 py-3 text-slate-400 hover:text-white transition-colors\"\n            >\n              Schedule\n            </Link>\n            <Link\n              href={`/teams/${teamId}/archive`}\n              className=\"px-4 py-3 text-slate-400 hover:text-white transition-colors\"\n            >\n              Archive\n            </Link>\n          </div>\n        </div>\n      </div>\n\n      {/* Main Content */}\n      <div className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8\">\n        {players.length === 0 ? (\n          <div className=\"bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-16 text-center\">\n            <Users className=\"w-16 h-16 text-slate-600 mx-auto mb-4\" />\n            <h3 className=\"text-xl font-bold mb-2\">No Players Yet</h3>\n            <p className=\"text-slate-400\">The coach hasn&apos;t added any players to the roster yet.</p>\n          </div>\n        ) : (\n          <div className=\"bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden\">\n            <div className=\"overflow-x-auto\">\n              <table className=\"w-full\">\n                <thead>\n                  <tr className=\"bg-slate-800/50 border-b border-slate-700\">\n                    <th className=\"px-6 py-4 text-left text-sm font-semibold text-slate-300\">\n                      <div className=\"flex items-center gap-2\">\n                        <Hash className=\"w-4 h-4\" />\n                        Jersey #\n                      </div>\n                    </th>\n                    <th className=\"px-6 py-4 text-left text-sm font-semibold text-slate-300\">\n                      <div className=\"flex items-center gap-2\">\n                        <User className=\"w-4 h-4\" />\n                        Player Name\n                      </div>\n                    </th>\n                    <th className=\"px-6 py-4 text-left text-sm font-semibold text-slate-300\">Primary Position</th>\n                    <th className=\"px-6 py-4 text-left text-sm font-semibold text-slate-300\">Secondary Position</th>\n                  </tr>\n                </thead>\n                <tbody>\n                  {players.map((player, index) => (\n                    <tr\n                      key={player.id}\n                      className={`border-b border-slate-700/30 hover:bg-slate-800/30 transition-colors ${\n                        index % 2 === 0 ? 'bg-slate-900/20' : ''\n                      }`}\n                    >\n                      <td className=\"px-6 py-4\">\n                        <span className=\"inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#16a34a] text-white font-bold\">\n                          {player.jerseyNumber}\n                        </span>\n                      </td>\n                      <td className=\"px-6 py-4\">\n                        <p className=\"font-semibold text-white\">\n                          {player.firstName} {player.lastName}\n                        </p>\n                      </td>\n                      <td className=\"px-6 py-4 text-slate-300\">{player.position1}</td>\n                      <td className=\"px-6 py-4 text-slate-300\">{player.position2 || '—'}</td>\n                    </tr>\n                  ))}\n                </tbody>\n              </table>\n            </div>\n          </div>\n        )}\n\n        <div className=\"mt-6 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4\">\n          <p className=\"text-blue-300 text-sm\">\n            <strong>Note:</strong> As a viewer, you can only see player names and jersey numbers.\n            Contact information and other details are restricted to coaches only.\n          </p>\n        </div>\n      </div>\n\n      {/* Footer */}\n      <footer className=\"py-12 px-4 border-t border-slate-800/50 mt-12\">\n        <div className=\"max-w-7xl mx-auto text-center\">\n          <h3 className=\"font-[family-name:var(--font-playfair)] text-2xl font-bold mb-2 bg-gradient-to-r from-[#16a34a] to-[#22c55e] bg-clip-text text-transparent\">\n            FlagFooty\n          </h3>\n          <p className=\"text-slate-500 text-sm\">\n            &copy; {new Date().getFullYear()} FlagFooty. All rights reserved.\n          </p>\n        </div>\n      </footer>\n    </div>\n  );\n}\n