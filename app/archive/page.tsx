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
    <div className=\"min-h-screen bg-[#1e293b] text-slate-100 font-[family-name:var(--font-inter)]\">
      <div className=\"print:hidden\">
        <Navigation />
      </div>

      {/* Main Content */}
      <div className=\"pt-24 px-4 pb-12 print:pt-0 animate-in fade-in duration-200\">
        <div className=\"max-w-7xl mx-auto\">
          {!selectedGame ? (
            <>
              {/* Header */}
              <div className=\"mb-8 print:hidden\">
                <h1 className=\"font-[family-name:var(--font-playfair)] text-4xl md:text-5xl font-bold mb-4\">
                  Game <span className=\"text-[#16a34a]\">Archive</span>
                </h1>
                <p className=\"text-slate-400 text-lg\">
                  View and manage finalized game cards and lineups.
                </p>
              </div>

              {/* Archived Games List */}
              {loading ? (
                <LoadingSkeleton rows={4} type=\"table\" />
              ) : error ? (
                <ErrorState message={error} onRetry={loadFinalizedGames} />
              ) : finalizedGames.length === 0 ? (
                <EmptyState
                  icon=\"📁\"
                  message=\"No archived games yet — finalized game cards will appear here.\"
                  buttonLabel=\"View Schedule\"
                  buttonHref=\"/schedule\"
                />
              ) : (
                <DataTable
                  columns={[
                    {
                      key: 'date',
                      label: 'Date',
                      render: (game: FinalizedGame) => (
                        <div className=\"flex items-center gap-2\">
                          <Calendar className=\"w-4 h-4 text-slate-400\" />
                          <span className=\"text-sm text-slate-300\">
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
                          <p className=\"font-semibold text-white\">vs {game.opponent}</p>\n                          <div className=\"flex items-center gap-1 text-xs text-slate-400 mt-1\">\n                            <MapPin className=\"w-3 h-3\" />\n                            {game.location}\n                          </div>\n                        </div>\n                      ),\n                    },\n                    {\n                      key: 'finalScore',\n                      label: 'Final Score',\n                      render: (game: FinalizedGame) =>\n                        editingScoreId === game.id ? (\n                          <div className=\"flex items-center gap-2\">\n                            <input\n                              type=\"text\"\n                              value={editedScore}\n                              onChange={(e) => setEditedScore(e.target.value)}\n                              className=\"bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm text-white w-24\"\n                              placeholder=\"14-7\"\n                              autoFocus\n                            />\n                            <button\n                              onClick={() => handleSaveScore(game.id)}\n                              className=\"p-1 text-[#16a34a] hover:bg-slate-800 rounded transition-all\"\n                              title=\"Save\"\n                            >\n                              <Save className=\"w-4 h-4\" />\n                            </button>\n                            <button\n                              onClick={() => setEditingScoreId(null)}\n                              className=\"p-1 text-slate-400 hover:bg-slate-800 rounded transition-all\"\n                              title=\"Cancel\"\n                            >\n                              <X className=\"w-4 h-4\" />\n                            </button>\n                          </div>\n                        ) : (\n                          <div className=\"flex items-center gap-2\">\n                            <span className=\"text-sm text-white\">{game.finalScore || '—'}</span>\n                            {canEdit && (userTeamRole === 'OWNER' || userTeamRole === 'ADMIN' || userTeamRole === 'CO_COACH') && (\n                              <button\n                                onClick={() => handleEditScore(game.id, game.finalScore || '')}\n                                className=\"p-1 text-slate-400 hover:text-[#16a34a] transition-colors\"\n                                title=\"Edit score\"\n                              >\n                                <Edit2 className=\"w-3 h-3\" />\n                              </button>\n                            )}\n                          </div>\n                        ),\n                    },\n                    {\n                      key: 'actions',\n                      label: 'Actions',\n                      headerClassName: 'text-right',\n                      render: (game: FinalizedGame) => (\n                        <div className=\"flex items-center justify-end gap-2\">\n                          <button\n                            onClick={() => handleView(game)}\n                            className=\"flex items-center gap-1 bg-[#16a34a] text-white px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-[#22c55e] transition-all\"\n                            title=\"View card\"\n                          >\n                            <Eye className=\"w-4 h-4\" />\n                            View\n                          </button>\n                          {canEdit && (userTeamRole === 'OWNER' || userTeamRole === 'ADMIN' || userTeamRole === 'CO_COACH') && (\n                            <button\n                              onClick={() => handleUnlockRequest(game.id)}\n                              className=\"flex items-center gap-1 bg-slate-700 text-white px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-slate-600 transition-all\"\n                              title=\"Unlock card\"\n                            >\n                              <Unlock className=\"w-4 h-4\" />\n                              Unlock\n                            </button>\n                          )}\n                        </div>\n                      ),\n                    },\n                  ] as DataTableColumn<FinalizedGame>[]}\n                  data={finalizedGames}\n                  getRowKey={(game) => game.id}\n                />\n              )}\n            </>\n          ) : (\n            <>\n              {/* View Mode - Show Cards */}\n              <div className=\"print:hidden mb-8\">\n                <button\n                  onClick={() => setSelectedGame(null)}\n                  className=\"text-slate-400 hover:text-[#16a34a] transition-colors mb-4\"\n                >\n                  ← Back to Archive\n                </button>\n                <div className=\"flex items-center justify-between flex-wrap gap-4\">\n                  <div>\n                    <h1 className=\"font-[family-name:var(--font-playfair)] text-4xl font-bold mb-2\">\n                      vs {selectedGame.opponent}\n                    </h1>\n                    <p className=\"text-slate-400\">\n                      {new Date(selectedGame.date).toLocaleDateString()} • {selectedGame.location}\n                      {selectedGame.finalScore && <span className=\"ml-2 text-[#16a34a] font-semibold\">• {selectedGame.finalScore}</span>}\n                    </p>\n                  </div>\n                  <div className=\"flex gap-3\">\n                    <button\n                      onClick={handlePrint}\n                      className=\"flex items-center gap-2 bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(22,163,74,0.4)] transition-all\"\n                    >\n                      <Printer className=\"w-5 h-5\" />\n                      Print\n                    </button>\n                    {canEdit && (userTeamRole === 'OWNER' || userTeamRole === 'ADMIN' || userTeamRole === 'CO_COACH') && (\n                      <button\n                        onClick={() => handleUnlockRequest(selectedGame.id)}\n                        className=\"flex items-center gap-2 bg-slate-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-slate-600 transition-all\"\n                      >\n                        <Unlock className=\"w-5 h-5\" />\n                        Unlock Card\n                      </button>\n                    )}\n                  </div>\n                </div>\n              </div>\n\n              {/* Game Cards - Read Only */}\n              {selectedGame.cardData ? (\n                <div className=\"max-w-[8.5in] mx-auto\">\n                  <EditableGameCards\n                    players={selectedGame.cardData.gameRoster || []}\n                    gameInfo={selectedGame.cardData.gameInfo || {\n                      opponent: selectedGame.opponent,\n                      date: selectedGame.date,\n                      location: selectedGame.location,\n                      field: selectedGame.field,\n                      time: selectedGame.time,\n                    }}\n                    isPrintPreview={true}\n                    positions={positions}\n                    onGameInfoChange={() => {}}\n                    onPlayersChange={() => {}}\n                  />\n                </div>\n              ) : (\n                <div className=\"bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-12 text-center\">\n                  <p className=\"text-slate-400\">No card data available for this game.</p>\n                </div>\n              )}\n            </>\n          )}\n        </div>\n      </div>\n\n      {/* Login Prompt Modal */}\n      <LoginPromptModal\n        isOpen={showLoginPrompt}\n        onClose={() => setShowLoginPrompt(false)}\n      />\n\n      {/* Unlock Modal */}\n      {showUnlockModal && (\n        <div className=\"fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4\">\n          <div className=\"bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-md w-full shadow-2xl\">\n            <h3 className=\"text-2xl font-bold text-white mb-4\">Unlock Game Card?</h3>\n            <p className=\"text-slate-300 mb-4\">\n              Unlocking this card will allow you to edit it again, but this will:\n            </p>\n            <ul className=\"list-disc list-inside text-slate-400 mb-6 space-y-2\">\n              <li>Reset the finalization status</li>\n              <li>Delete all associated award records</li>\n              <li>Delete all quarters played data</li>\n            </ul>\n            <p className=\"text-yellow-400 text-sm mb-6\">\n              ⚠️ This action will remove historical data. Proceed with caution.\n            </p>\n            <div className=\"flex gap-3\">\n              <button\n                onClick={() => {\n                  setShowUnlockModal(false);\n                  setUnlockingGameId(null);\n                }}\n                disabled={isUnlocking}\n                className=\"flex-1 px-6 py-3 bg-slate-700 text-white rounded-lg font-semibold hover:bg-slate-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed\"\n              >\n                Cancel\n              </button>\n              <button\n                onClick={handleUnlockConfirm}\n                disabled={isUnlocking}\n                className=\"flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed\"\n              >\n                {isUnlocking ? 'Unlocking...' : 'Unlock Card'}\n              </button>\n            </div>\n          </div>\n        </div>\n      )}\n\n      {/* Footer */}\n      <footer className=\"py-12 px-4 border-t border-slate-800/50 print:hidden\">\n        <div className=\"max-w-7xl mx-auto text-center\">\n          <h3 className=\"font-[family-name:var(--font-playfair)] text-2xl font-bold mb-2 bg-gradient-to-r from-[#16a34a] to-[#22c55e] bg-clip-text text-transparent\">\n            FlagFooty\n          </h3>\n          <p className=\"text-slate-500 text-sm mb-4\">\n            &copy; {new Date().getFullYear()} FlagFooty. All rights reserved.\n          </p>\n          <div className=\"flex justify-center\">\n            <ShareButton variant=\"link\" />\n          </div>\n        </div>\n      </footer>\n\n      {/* Print Styles */}\n      <style jsx global>{`\n        @media print {\n          @page {\n            size: letter portrait;\n            margin: 0.25in;\n          }\n          body {\n            background: white;\n            margin: 0;\n            padding: 0;\n          }\n          .print\\\\:hidden {\n            display: none !important;\n          }\n          .print\\\\:pt-0 {\n            padding-top: 0 !important;\n          }\n        }\n      `}</style>\n    </div>\n  );\n}\n\nexport default function ArchivePage() {\n  return (\n    <Suspense fallback={<div className=\"min-h-screen bg-[#1e293b] text-slate-100 flex items-center justify-center\">Loading...</div>}>\n      <ArchiveContent />\n    </Suspense>\n  );\n}\n