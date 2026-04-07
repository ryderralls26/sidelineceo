'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Archive as ArchiveIcon, Eye, Printer, Calendar } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { getGamesByTeam } from '@/lib/actions/games';
import { getTeam } from '@/lib/actions/teams';
import { checkUserTeamAccess } from '@/lib/utils/access-control';

interface Game {
  id: number;
  date: string;
  opponent: string;
  location: string;
  isFinalized: boolean;
  finalScore?: string | null;
  cardData?: any;
}

export default function ParentArchivePage() {
  const router = useRouter();
  const params = useParams();
  const { session, isAuthenticated } = useAuth();
  const [team, setTeam] = useState<any>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

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
      const access = await checkUserTeamAccess(session.userId, teamId);

      if (!access.hasAccess) {
        setAccessDenied(true);
        setLoading(false);
        return;
      }

      const [teamResult, gamesResult] = await Promise.all([\n        getTeam(teamId),\n        getGamesByTeam(teamId),\n      ]);\n\n      if (teamResult.success && teamResult.team) {\n        setTeam(teamResult.team);\n      }\n\n      if (gamesResult.success && gamesResult.games) {\n        const finalizedGames = gamesResult.games.filter((g: Game) => g.isFinalized);\n        setGames(finalizedGames);\n      }\n\n      setLoading(false);\n    } catch (error) {\n      console.error('Error loading data:', error);\n      setAccessDenied(true);\n      setLoading(false);\n    }\n  };\n\n  const handlePrint = (game: Game) => {\n    // Simple print functionality\n    const printWindow = window.open('', '_blank');\n    if (printWindow) {\n      printWindow.document.write(`\n        <html>\n          <head>\n            <title>Game Card - ${game.opponent}</title>\n            <style>\n              body { font-family: Arial, sans-serif; padding: 20px; }\n              h1 { color: #16a34a; }\n              .info { margin: 10px 0; }\n            </style>\n          </head>\n          <body>\n            <h1>${team?.name} vs ${game.opponent}</h1>\n            <div class=\"info\"><strong>Date:</strong> ${new Date(game.date).toLocaleDateString()}</div>\n            <div class=\"info\"><strong>Location:</strong> ${game.location}</div>\n            ${game.finalScore ? `<div class=\"info\"><strong>Final Score:</strong> ${game.finalScore}</div>` : ''}\n            <script>window.print(); window.close();</script>\n          </body>\n        </html>\n      `);\n    }\n  };\n\n  if (!isAuthenticated || !session) return null;\n\n  if (loading) {\n    return (\n      <div className=\"min-h-screen bg-[#1e293b] text-slate-100 flex items-center justify-center\">\n        <p className=\"text-slate-400\">Loading...</p>\n      </div>\n    );\n  }\n\n  if (accessDenied) {\n    return (\n      <div className=\"min-h-screen bg-[#1e293b] text-slate-100 flex items-center justify-center px-4\">\n        <div className=\"text-center\">\n          <h1 className=\"text-2xl font-bold mb-4 text-red-400\">Access Denied</h1>\n          <p className=\"text-slate-400 mb-6\">You do not have permission to view this team.</p>\n          <Link href=\"/dashboard\" className=\"inline-block bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white px-6 py-3 rounded-lg font-semibold\">\n            Back to Dashboard\n          </Link>\n        </div>\n      </div>\n    );\n  }\n\n  return (\n    <div className=\"min-h-screen bg-[#1e293b] text-slate-100 font-[family-name:var(--font-inter)]\">\n      <div className=\"bg-slate-800/30 backdrop-blur-sm border-b border-slate-700/50\">\n        <div className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6\">\n          <Link href=\"/dashboard\" className=\"flex items-center gap-2 text-slate-400 hover:text-[#16a34a] transition-colors mb-2\">\n            <ArrowLeft className=\"w-4 h-4\" />\n            Back to Dashboard\n          </Link>\n          <h1 className=\"font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold\">\n            {team?.name || 'Team'} Archive\n          </h1>\n          <span className=\"inline-flex items-center gap-1 mt-2 px-3 py-1 bg-blue-500/20 text-blue-400 text-sm font-semibold rounded\">\n            <Eye className=\"w-3 h-3\" />\n            Viewer Access (Read-Only)\n          </span>\n        </div>\n      </div>\n\n      <div className=\"bg-slate-800/20 border-b border-slate-700/30\">\n        <div className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8\">\n          <div className=\"flex gap-6\">\n            <Link href={`/teams/${teamId}/roster`} className=\"px-4 py-3 text-slate-400 hover:text-white transition-colors\">\n              Roster\n            </Link>\n            <Link href={`/teams/${teamId}/schedule`} className=\"px-4 py-3 text-slate-400 hover:text-white transition-colors\">\n              Schedule\n            </Link>\n            <Link href={`/teams/${teamId}/archive`} className=\"px-4 py-3 text-[#16a34a] border-b-2 border-[#16a34a] font-semibold\">\n              Archive\n            </Link>\n          </div>\n        </div>\n      </div>\n\n      <div className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8\">\n        {games.length === 0 ? (\n          <div className=\"bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-16 text-center\">\n            <ArchiveIcon className=\"w-16 h-16 text-slate-600 mx-auto mb-4\" />\n            <h3 className=\"text-xl font-bold mb-2\">No Archived Games</h3>\n            <p className=\"text-slate-400\">Completed games will appear here once finalized by the coach.</p>\n          </div>\n        ) : (\n          <div className=\"grid md:grid-cols-2 lg:grid-cols-3 gap-6\">\n            {games.map(game => (\n              <div key={game.id} className=\"bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6 hover:border-[#16a34a]/50 transition-all\">\n                <h3 className=\"text-xl font-bold text-white mb-3\">vs {game.opponent}</h3>\n                <div className=\"space-y-2 text-sm text-slate-400 mb-4\">\n                  <div className=\"flex items-center gap-2\">\n                    <Calendar className=\"w-4 h-4\" />\n                    {new Date(game.date).toLocaleDateString('en-US', {\n                      month: 'short',\n                      day: 'numeric',\n                      year: 'numeric',\n                    })}\n                  </div>\n                  {game.finalScore && (\n                    <p className=\"text-lg font-bold text-[#16a34a]\">{game.finalScore}</p>\n                  )}\n                </div>\n                <button\n                  onClick={() => handlePrint(game)}\n                  className=\"w-full flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-all\"\n                >\n                  <Printer className=\"w-4 h-4\" />\n                  Print Game Card\n                </button>\n              </div>\n            ))}\n          </div>\n        )}\n      </div>\n\n      <footer className=\"py-12 px-4 border-t border-slate-800/50 mt-12\">\n        <div className=\"max-w-7xl mx-auto text-center\">\n          <h3 className=\"font-[family-name:var(--font-playfair)] text-2xl font-bold mb-2 bg-gradient-to-r from-[#16a34a] to-[#22c55e] bg-clip-text text-transparent\">\n            FlagFooty\n          </h3>\n          <p className=\"text-slate-500 text-sm\">&copy; {new Date().getFullYear()} FlagFooty. All rights reserved.</p>\n        </div>\n      </footer>\n    </div>\n  );\n}\n