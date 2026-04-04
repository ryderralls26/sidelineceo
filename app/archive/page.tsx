'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Archive, Calendar, MapPin, Eye, Printer, Unlock, Save, Edit2, X } from 'lucide-react';
import { EditableGameCards } from '@/components/EditableGameCards';
import { LoginPromptModal } from '@/components/LoginPromptModal';
import { Navigation } from '@/components/Navigation';
import { useAuth } from '@/lib/AuthContext';
import { useTeam } from '@/lib/TeamContext';
import { getPositionAbbreviations } from '@/lib/types';
import { EmptyState } from '@/components/EmptyState';
import { ShareButton } from '@/components/ShareButton';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ErrorState } from '@/components/ErrorState';
import { DataTable, DataTableColumn } from '@/components/DataTable';

interface FinalizedGame {
  id: number;
  date: string;
  time?: string | null;
  opponent: string;
  location: string;
  field?: string | null;
  finalScore?: string | null;
  finalizedAt: Date | null;
  cardData?: any;
  teamId: string;
}

function ArchiveContent() {
  const { canEdit, isAuthenticated, session } = useAuth();
  const { activeTeamId } = useTeam();
  const searchParams = useSearchParams();
  const [finalizedGames, setFinalizedGames] = useState<FinalizedGame[]>([]);
  const [selectedGame, setSelectedGame] = useState<FinalizedGame | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [editingScoreId, setEditingScoreId] = useState<number | null>(null);
  const [editedScore, setEditedScore] = useState('');
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [unlockingGameId, setUnlockingGameId] = useState<number | null>(null);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [positions] = useState<string[]>(getPositionAbbreviations());
  const [userTeamRole, setUserTeamRole] = useState<'OWNER' | 'ADMIN' | 'CO_COACH' | 'VIEWER' | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFinalizedGames();
    loadUserTeamRole();
  }, [activeTeamId]);

  const loadUserTeamRole = async () => {
    if (!activeTeamId || !session?.userId) {
      setUserTeamRole(null);
      return;
    }

    try {
      const { checkTeamAccess } = await import('@/lib/actions/teams');
      const result = await checkTeamAccess(session.userId, activeTeamId);
      if (result.success && result.role) {
        setUserTeamRole(result.role);
      }
    } catch (error) {
      console.error('Failed to check team role:', error);
    }
  };

  const loadFinalizedGames = async () => {
    if (!activeTeamId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { getFinalizedGames } = await import('@/lib/actions/games');
      const result = await getFinalizedGames(activeTeamId, session?.userId);
      if (result.success && result.games) {
        setFinalizedGames(result.games);

        // Check if there's a gameId in the URL query parameters
        const gameIdParam = searchParams.get('gameId');
        if (gameIdParam) {
          const gameId = parseInt(gameIdParam, 10);
          const game = result.games.find((g: FinalizedGame) => g.id === gameId);
          if (game) {
            setSelectedGame(game);
          }
        }
      } else {
        setError(result.error || 'Failed to load archived games');
      }
    } catch (err) {
      console.error('Failed to load finalized games:', err);
      setError('An unexpected error occurred while loading archived games');
    } finally {
      setLoading(false);
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

  const handleEditScore = (gameId: number, currentScore: string) => {
    setEditingScoreId(gameId);
    setEditedScore(currentScore || '');
  };

  const handleSaveScore = async (gameId: number) => {
    try {
      const { updateFinalScore } = await import('@/lib/actions/games');
      const result = await updateFinalScore(gameId, editedScore);

      if (result.success) {
        await loadFinalizedGames();
        setEditingScoreId(null);
        // Update selected game if it's the one being edited
        if (selectedGame?.id === gameId) {
          setSelectedGame({ ...selectedGame, finalScore: editedScore });
        }
      } else {
        alert('Failed to update final score');
      }
    } catch (error) {
      console.error('Failed to update final score:', error);
      alert('Failed to update final score');
    }
  };

  const handleUnlockRequest = (gameId: number) => {
    setUnlockingGameId(gameId);
    setShowUnlockModal(true);
  };

  const handleUnlockConfirm = async () => {
    if (!unlockingGameId) return;

    setIsUnlocking(true);

    try {
      const { unlockGame } = await import('@/lib/actions/games');
      const result = await unlockGame(unlockingGameId);

      if (result.success) {
        alert('Game card unlocked successfully! Redirecting to lineup editor...');
        window.location.href = `/schedule/${unlockingGameId}/lineup`;
      } else {
        alert(result.error || 'Failed to unlock game card');
      }
    } catch (error) {
      console.error('Failed to unlock game:', error);
      alert('Failed to unlock game card');
    } finally {
      setIsUnlocking(false);
      setShowUnlockModal(false);
      setUnlockingGameId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#1e293b] text-slate-100 font-[family-name:var(--font-inter)]">
      <div className="print:hidden">
        <Navigation />
      </div>

      {/* Main Content */}
      <div className="pt-24 px-4 pb-12 print:pt-0 animate-in fade-in duration-200">
        <div className="max-w-7xl mx-auto">
          {!selectedGame ? (
            <>
              {/* Header */}
              <div className="mb-8 print:hidden">
                <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl font-bold mb-4">
                  Game <span className="text-[#16a34a]">Archive</span>
                </h1>
                <p className="text-slate-400 text-lg">
                  View and manage finalized game cards and lineups.
                </p>
              </div>

              {/* Archived Games List */}
              {loading ? (
                <LoadingSkeleton rows={4} type="table" />
              ) : error ? (
                <ErrorState message={error} onRetry={loadFinalizedGames} />
              ) : finalizedGames.length === 0 ? (
                <EmptyState
                  icon="📁"
                  message="No archived games yet — finalized game cards will appear here."
                  buttonLabel="View Schedule"
                  buttonHref="/schedule"
                />
              ) : (
                <DataTable
                  columns={[
                    {
                      key: 'date',
                      label: 'Date',
                      render: (game: FinalizedGame) => (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-slate-300">
                            {new Date(game.date).toLocaleDateString()}
                          </span>
                        </div>
                      ),
                    },
                    {
                      key: 'opponent',
                      label: 'Opponent',
                      render: (game: FinalizedGame) => (
                        <div>
                          <p className="font-semibold text-white">vs {game.opponent}</p>
                          <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                            <MapPin className="w-3 h-3" />
                            {game.location}
                          </div>
                        </div>
                      ),
                    },
                    {
                      key: 'finalScore',
                      label: 'Final Score',
                      render: (game: FinalizedGame) =>
                        editingScoreId === game.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editedScore}
                              onChange={(e) => setEditedScore(e.target.value)}
                              className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm text-white w-24"
                              placeholder="14-7"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveScore(game.id)}
                              className="p-1 text-[#16a34a] hover:bg-slate-800 rounded transition-all"
                              title="Save"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingScoreId(null)}
                              className="p-1 text-slate-400 hover:bg-slate-800 rounded transition-all"
                              title="Cancel"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-white">{game.finalScore || '—'}</span>
                            {canEdit && (userTeamRole === 'OWNER' || userTeamRole === 'ADMIN' || userTeamRole === 'CO_COACH') && (
                              <button
                                onClick={() => handleEditScore(game.id, game.finalScore || '')}
                                className="p-1 text-slate-400 hover:text-[#16a34a] transition-colors"
                                title="Edit score"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ),
                    },
                    {
                      key: 'actions',
                      label: 'Actions',
                      headerClassName: 'text-right',
                      render: (game: FinalizedGame) => (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleView(game)}
                            className="flex items-center gap-1 bg-[#16a34a] text-white px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-[#22c55e] transition-all"
                            title="View card"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </button>
                          {canEdit && (userTeamRole === 'OWNER' || userTeamRole === 'ADMIN' || userTeamRole === 'CO_COACH') && (
                            <button
                              onClick={() => handleUnlockRequest(game.id)}
                              className="flex items-center gap-1 bg-slate-700 text-white px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-slate-600 transition-all"
                              title="Unlock card"
                            >
                              <Unlock className="w-4 h-4" />
                              Unlock
                            </button>
                          )}
                        </div>
                      ),
                    },
                  ] as DataTableColumn<FinalizedGame>[]}
                  data={finalizedGames}
                  getRowKey={(game) => game.id}
                />
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
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h1 className="font-[family-name:var(--font-playfair)] text-4xl font-bold mb-2">
                      vs {selectedGame.opponent}
                    </h1>
                    <p className="text-slate-400">
                      {new Date(selectedGame.date).toLocaleDateString()} • {selectedGame.location}
                      {selectedGame.finalScore && <span className="ml-2 text-[#16a34a] font-semibold">• {selectedGame.finalScore}</span>}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handlePrint}
                      className="flex items-center gap-2 bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(22,163,74,0.4)] transition-all"
                    >
                      <Printer className="w-5 h-5" />
                      Print
                    </button>
                    {canEdit && (userTeamRole === 'OWNER' || userTeamRole === 'ADMIN' || userTeamRole === 'CO_COACH') && (
                      <button
                        onClick={() => handleUnlockRequest(selectedGame.id)}
                        className="flex items-center gap-2 bg-slate-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-slate-600 transition-all"
                      >
                        <Unlock className="w-5 h-5" />
                        Unlock Card
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Game Cards - Read Only */}
              {selectedGame.cardData ? (
                <div className="max-w-[8.5in] mx-auto">
                  <EditableGameCards
                    players={selectedGame.cardData.gameRoster || []}
                    gameInfo={selectedGame.cardData.gameInfo || {
                      opponent: selectedGame.opponent,
                      date: selectedGame.date,
                      location: selectedGame.location,
                      field: selectedGame.field,
                      time: selectedGame.time,
                    }}
                    isPrintPreview={true}
                    positions={positions}
                    onGameInfoChange={() => {}}
                    onPlayersChange={() => {}}
                  />
                </div>
              ) : (
                <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-12 text-center">
                  <p className="text-slate-400">No card data available for this game.</p>
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

      {/* Unlock Modal */}
      {showUnlockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-4">Unlock Game Card?</h3>
            <p className="text-slate-300 mb-4">
              Unlocking this card will allow you to edit it again, but this will:
            </p>
            <ul className="list-disc list-inside text-slate-400 mb-6 space-y-2">
              <li>Reset the finalization status</li>
              <li>Delete all associated award records</li>
              <li>Delete all quarters played data</li>
            </ul>
            <p className="text-yellow-400 text-sm mb-6">
              ⚠️ This action will remove historical data. Proceed with caution.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowUnlockModal(false);
                  setUnlockingGameId(null);
                }}
                disabled={isUnlocking}
                className="flex-1 px-6 py-3 bg-slate-700 text-white rounded-lg font-semibold hover:bg-slate-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleUnlockConfirm}
                disabled={isUnlocking}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUnlocking ? 'Unlocking...' : 'Unlock Card'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-slate-800/50 print:hidden">
        <div className="max-w-7xl mx-auto text-center">
          <h3 className="font-[family-name:var(--font-playfair)] text-2xl font-bold mb-2 bg-gradient-to-r from-[#16a34a] to-[#22c55e] bg-clip-text text-transparent">
            SidelineCEO
          </h3>
          <p className="text-slate-500 text-sm mb-4">
            &copy; {new Date().getFullYear()} SidelineCEO. All rights reserved.
          </p>
          <div className="flex justify-center">
            <ShareButton variant="link" />
          </div>
        </div>
      </footer>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: letter portrait;
            margin: 0.25in;
          }
          body {
            background: white;
            margin: 0;
            padding: 0;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:pt-0 {
            padding-top: 0 !important;
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
