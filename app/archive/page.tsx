'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Archive, Calendar, MapPin, Trash2, Eye } from 'lucide-react';
import { StorageManager, FinalizedGame, CoachData } from '@/lib/storage';
import { CoachCard, RefereeCard } from '@/components/GameCards';
import { LoginPromptModal } from '@/components/LoginPromptModal';
import { Navigation } from '@/components/Navigation';
import { useAuth } from '@/lib/AuthContext';

function ArchiveContent() {
  const { canEdit, isAuthenticated } = useAuth();
  const searchParams = useSearchParams();
  const [finalizedGames, setFinalizedGames] = useState<FinalizedGame[]>([]);
  const [selectedGame, setSelectedGame] = useState<FinalizedGame | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [coaches, setCoaches] = useState<CoachData>({
    coach1Name: 'Coach 1',
    coach2Name: 'Coach 2',
    selectedCoachIndex: 0,
  });

  useEffect(() => {
    loadFinalizedGames();
    // Load coach data
    const savedCoaches = StorageManager.getCoachData();
    setCoaches(savedCoaches);
  }, []);

  const loadFinalizedGames = () => {
    const games = StorageManager.getAllFinalizedGames();
    // Sort by finalized date, most recent first
    games.sort((a, b) => new Date(b.finalizedAt).getTime() - new Date(a.finalizedAt).getTime());
    setFinalizedGames(games);

    // Check if there's a gameId in the URL query parameters
    const gameIdParam = searchParams.get('gameId');
    if (gameIdParam) {
      const gameId = parseInt(gameIdParam, 10);
      const game = games.find(g => g.gameId === gameId);
      if (game) {
        setSelectedGame(game);
      }
    }
  };

  const handleDelete = (gameId: number) => {
    if (confirm('Are you sure you want to delete this archived game? This action cannot be undone.')) {
      StorageManager.deleteFinalizedGame(gameId);
      loadFinalizedGames();
      if (selectedGame?.gameId === gameId) {
        setSelectedGame(null);
      }
    }
  };

  const handleView = (game: FinalizedGame) => {
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }
    setSelectedGame(game);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#1e293b] text-slate-100 font-[family-name:var(--font-inter)]">
      <div className="print:hidden">
        <Navigation />
      </div>

      {/* Main Content */}
      <div className="pt-24 px-4 pb-12 print:pt-0">
        <div className="max-w-7xl mx-auto">
          {!selectedGame ? (
            <>
              {/* Header */}
              <div className="mb-8 print:hidden">
                <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl font-bold mb-4">
                  Game <span className="text-[#16a34a]">Archive</span>
                </h1>
                <p className="text-slate-400 text-lg">
                  View read-only versions of finalized game lineups and cards.
                </p>
              </div>

              {/* Archived Games List */}
              {finalizedGames.length === 0 ? (
                <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-12 text-center">
                  <Archive className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-400 mb-2">
                    No Archived Games
                  </h3>
                  <p className="text-slate-500 mb-6">
                    Finalized game lineups will appear here.
                  </p>
                  <Link
                    href="/schedule"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(22,163,74,0.4)] transition-all duration-300"
                  >
                    Go to Schedule
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {finalizedGames.map((game) => (
                    <div
                      key={game.gameId}
                      className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6 hover:border-[#16a34a]/50 transition-all duration-300"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="text-xl font-bold text-white">
                              vs {game.opponent}
                            </h3>
                            <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-500/20 text-green-400">
                              Finalized
                            </span>
                          </div>

                          <div className="flex items-center gap-4 text-slate-400 text-sm flex-wrap">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(game.gameDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              <span>{game.location}</span>
                            </div>
                          </div>

                          <div className="text-xs text-slate-500">
                            Finalized on: {new Date(game.finalizedAt).toLocaleString()}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleView(game)}
                            className="flex items-center gap-2 bg-[#16a34a] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#22c55e] transition-all duration-300"
                          >
                            <Eye className="w-4 h-4" />
                            View Cards
                          </button>
                          {canEdit && (
                            <button
                              onClick={() => handleDelete(game.gameId)}
                              className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800/50 rounded-lg transition-all"
                              title="Delete archived game"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              {/* View Mode - Show Cards */}
              <div className="print:hidden mb-8">
                <button
                  onClick={() => setSelectedGame(null)}
                  className="text-slate-400 hover:text-[#16a34a] transition-colors mb-4"
                >
                  ← Back to Archive
                </button>
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="font-[family-name:var(--font-playfair)] text-4xl font-bold mb-2">
                      vs {selectedGame.opponent}
                    </h1>
                    <p className="text-slate-400">
                      {new Date(selectedGame.gameDate).toLocaleDateString()} • {selectedGame.location}
                    </p>
                  </div>
                  <button
                    onClick={handlePrint}
                    className="bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(22,163,74,0.4)] transition-all duration-300"
                  >
                    Print Cards
                  </button>
                </div>
              </div>

              {/* Game Cards */}
              <div className="grid md:grid-cols-2 gap-8 print:grid-cols-1 print:gap-4">
                <CoachCard
                  players={selectedGame.roster}
                  gameInfo={{
                    opponent: selectedGame.opponent,
                    date: selectedGame.gameDate,
                    location: selectedGame.location,
                  }}
                  coachName={coaches.selectedCoachIndex === 0 ? coaches.coach1Name : coaches.coach2Name}
                />
                <RefereeCard
                  players={selectedGame.roster}
                  gameInfo={{
                    opponent: selectedGame.opponent,
                    date: selectedGame.gameDate,
                    location: selectedGame.location,
                  }}
                  coachName={coaches.selectedCoachIndex === 0 ? coaches.coach1Name : coaches.coach2Name}
                />
              </div>

              {/* Lineup Display */}
              {selectedGame.lineup && (
                <div className="mt-8 print:mt-4">
                  <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold mb-6 print:text-2xl">
                    Quarter <span className="text-[#16a34a]">Breakdown</span>
                  </h2>
                  <div className="grid md:grid-cols-2 gap-6 print:grid-cols-2 print:gap-3">
                    {selectedGame.lineup.quarters.map((quarter: any) => (
                      <div
                        key={quarter.quarter}
                        className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6 print:bg-white print:text-slate-900 print:p-4"
                      >
                        <h3 className="font-[family-name:var(--font-playfair)] text-2xl font-bold mb-4 print:text-lg">
                          Quarter {quarter.quarter}
                        </h3>
                        <div className="space-y-2">
                          {Object.entries(quarter.positions).map(([position, player]: [string, any]) => (
                            <div
                              key={position}
                              className="flex items-center justify-between p-2 bg-slate-900/50 rounded-lg print:bg-slate-100"
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-10 h-10 bg-gradient-to-br from-[#16a34a] to-[#22c55e] rounded-lg flex items-center justify-center font-bold text-white text-sm print:w-8 print:h-8 print:text-xs">
                                  {position}
                                </div>
                                <div className="text-sm">
                                  {player ? (
                                    <>
                                      <p className="font-semibold">
                                        {player.nickname || `${player.firstName} ${player.lastName}`.trim()}
                                      </p>
                                      <p className="text-xs text-slate-400 print:text-slate-600">
                                        #{player.jerseyNumber}
                                      </p>
                                    </>
                                  ) : (
                                    <p className="text-slate-500 italic">Empty</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Login Prompt Modal */}
      <LoginPromptModal
        isOpen={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
      />

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-slate-800/50 print:hidden">
        <div className="max-w-7xl mx-auto text-center">
          <h3 className="font-[family-name:var(--font-playfair)] text-2xl font-bold mb-2 bg-gradient-to-r from-[#16a34a] to-[#22c55e] bg-clip-text text-transparent">
            FlagFooty
          </h3>
          <p className="text-slate-500 text-sm">
            &copy; {new Date().getFullYear()} FlagFooty. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            background: white;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function ArchivePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#1e293b] text-slate-100 flex items-center justify-center">Loading...</div>}>
      <ArchiveContent />
    </Suspense>
  );
}
