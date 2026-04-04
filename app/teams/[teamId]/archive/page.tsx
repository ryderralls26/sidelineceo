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

      const [teamResult, gamesResult] = await Promise.all([
        getTeam(teamId),
        getGamesByTeam(teamId),
      ]);

      if (teamResult.success && teamResult.team) {
        setTeam(teamResult.team);
      }

      if (gamesResult.success && gamesResult.games) {
        const finalizedGames = gamesResult.games.filter((g: Game) => g.isFinalized);
        setGames(finalizedGames);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setAccessDenied(true);
      setLoading(false);
    }
  };

  const handlePrint = (game: Game) => {
    // Simple print functionality
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Game Card - ${game.opponent}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h1 { color: #16a34a; }
              .info { margin: 10px 0; }
            </style>
          </head>
          <body>
            <h1>${team?.name} vs ${game.opponent}</h1>
            <div class="info"><strong>Date:</strong> ${new Date(game.date).toLocaleDateString()}</div>
            <div class="info"><strong>Location:</strong> ${game.location}</div>
            ${game.finalScore ? `<div class="info"><strong>Final Score:</strong> ${game.finalScore}</div>` : ''}
            <script>window.print(); window.close();</script>
          </body>
        </html>
      `);
    }
  };

  if (!isAuthenticated || !session) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1e293b] text-slate-100 flex items-center justify-center">
        <p className="text-slate-400">Loading...</p>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-[#1e293b] text-slate-100 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-red-400">Access Denied</h1>
          <p className="text-slate-400 mb-6">You do not have permission to view this team.</p>
          <Link href="/dashboard" className="inline-block bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white px-6 py-3 rounded-lg font-semibold">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1e293b] text-slate-100 font-[family-name:var(--font-inter)]">
      <div className="bg-slate-800/30 backdrop-blur-sm border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-[#16a34a] transition-colors mb-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold">
            {team?.name || 'Team'} Archive
          </h1>
          <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-blue-500/20 text-blue-400 text-sm font-semibold rounded">
            <Eye className="w-3 h-3" />
            Viewer Access (Read-Only)
          </span>
        </div>
      </div>

      <div className="bg-slate-800/20 border-b border-slate-700/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-6">
            <Link href={`/teams/${teamId}/roster`} className="px-4 py-3 text-slate-400 hover:text-white transition-colors">
              Roster
            </Link>
            <Link href={`/teams/${teamId}/schedule`} className="px-4 py-3 text-slate-400 hover:text-white transition-colors">
              Schedule
            </Link>
            <Link href={`/teams/${teamId}/archive`} className="px-4 py-3 text-[#16a34a] border-b-2 border-[#16a34a] font-semibold">
              Archive
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {games.length === 0 ? (
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-16 text-center">
            <ArchiveIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No Archived Games</h3>
            <p className="text-slate-400">Completed games will appear here once finalized by the coach.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map(game => (
              <div key={game.id} className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6 hover:border-[#16a34a]/50 transition-all">
                <h3 className="text-xl font-bold text-white mb-3">vs {game.opponent}</h3>
                <div className="space-y-2 text-sm text-slate-400 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(game.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>
                  {game.finalScore && (
                    <p className="text-lg font-bold text-[#16a34a]">{game.finalScore}</p>
                  )}
                </div>
                <button
                  onClick={() => handlePrint(game)}
                  className="w-full flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-all"
                >
                  <Printer className="w-4 h-4" />
                  Print Game Card
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <footer className="py-12 px-4 border-t border-slate-800/50 mt-12">
        <div className="max-w-7xl mx-auto text-center">
          <h3 className="font-[family-name:var(--font-playfair)] text-2xl font-bold mb-2 bg-gradient-to-r from-[#16a34a] to-[#22c55e] bg-clip-text text-transparent">
            SidelineCEO
          </h3>
          <p className="text-slate-500 text-sm">&copy; {new Date().getFullYear()} SidelineCEO. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
