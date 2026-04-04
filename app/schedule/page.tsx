'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Calendar, MapPin, Trophy, Edit, Trash2, Check, Archive, Star, Mail, UserPlus, FileText } from 'lucide-react';
import { StorageManager, Invite, UserRole } from '@/lib/storage';
import { getRosterFromStorage } from '@/lib/types';
import { MVPModal } from '@/components/MVPModal';
import { LoginPromptModal } from '@/components/LoginPromptModal';
import { Navigation } from '@/components/Navigation';
import { useAuth } from '@/lib/AuthContext';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ErrorState } from '@/components/ErrorState';
import { useAuthGuard } from '@/lib/useAuthGuard';
import { ScoutModePopup } from '@/components/ScoutModePopup';
import { ScoutModeBanner } from '@/components/ScoutModeBanner';

export interface Game {
  id: number;
  date: string;
  opponent: string;
  location: string;
  field?: string;
  time?: string;
  status: 'scheduled' | 'completed';
  result?: string;
}

// Sample games for unauthenticated users
const SAMPLE_GAMES: Game[] = [
  {
    id: 1,
    date: '2026-04-11',
    opponent: 'Thunder Wolves',
    location: 'Home Field',
    field: 'Field 1',
    time: '3:00 PM',
    status: 'completed',
    result: 'W 14-7',
  },
  {
    id: 2,
    date: '2026-04-18',
    opponent: 'Lightning Strikes',
    location: 'Away',
    field: 'Field 2',
    time: '4:00 PM',
    status: 'scheduled',
  },
  {
    id: 3,
    date: '2026-04-30',
    opponent: 'Storm Chasers',
    location: 'Home Field',
    field: 'Field 1',
    time: '3:30 PM',
    status: 'scheduled',
  },
];

export default function SchedulePage() {
  const { canEdit, isCoach, isAuthenticated, session, activeTeamName } = useAuth();
  const {
    isScoutMode,
    showScoutPopup,
    showScoutBanner,
    handleInteraction,
    dismissScoutPopup,
    enterScoutMode,
    handleSaveAction
  } = useAuthGuard();
  const [finalizedGames, setFinalizedGames] = useState<Set<number>>(new Set());
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [formData, setFormData] = useState<Partial<Game>>({
    date: '',
    opponent: '',
    location: '',
    field: '',
    time: '',
    status: 'scheduled',
    result: '',
  });

  // Enhanced edit modal state
  const [finalScore, setFinalScore] = useState('');
  const [selectedAwards, setSelectedAwards] = useState<Record<string, number>>({});
  const [modalGameNotes, setModalGameNotes] = useState('');
  const MAX_NOTES_LENGTH = 250;

  const [showMVPModal, setShowMVPModal] = useState(false);
  const [mvpGame, setMVPGame] = useState<Game | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Game Notes
  const [showGameNotesModal, setShowGameNotesModal] = useState(false);
  const [gameNotesGameId, setGameNotesGameId] = useState<number | null>(null);
  const [gameNotes, setGameNotes] = useState('');

  // Invite Team State
  const [invites, setInvites] = useState<Invite[]>([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('parent');
  const [inviteIsAdmin, setInviteIsAdmin] = useState(false);

  const openAddModal = () => {
    // Trigger auth guard check on first interaction
    if (!isAuthenticated && !isScoutMode) {
      handleInteraction();
      return;
    }

    // Reset form state first, then open modal
    setEditingGame(null);
    setFormData({
      date: '',
      opponent: '',
      location: '',
      field: '',
      time: '',
      status: 'scheduled',
      result: '',
    });
    // Use setTimeout to ensure state updates are processed
    setTimeout(() => {
      setShowModal(true);
    }, 0);
  };

  const openEditModal = (game: Game) => {
    setEditingGame(game);
    setFormData(game);

    // Load existing game data
    setFinalScore(game.result || '');
    setModalGameNotes(StorageManager.getGameNotes(game.id));

    // Load existing awards for this game
    const existingAwards = StorageManager.getAwardsByGameId(game.id);
    const awardsMap: Record<string, number> = {};
    existingAwards.forEach(award => {
      awardsMap[award.awardType] = award.playerId;
    });
    setSelectedAwards(awardsMap);

    // Use setTimeout to ensure state updates are processed
    setTimeout(() => {
      setShowModal(true);
    }, 0);
  };

  const closeModal = () => {
    setShowModal(false);
    // Reset form after modal closes
    setTimeout(() => {
      setEditingGame(null);
      setFormData({
        date: '',
        opponent: '',
        location: '',
        field: '',
        time: '',
        status: 'scheduled',
        result: '',
      });
      setFinalScore('');
      setSelectedAwards({});
      setModalGameNotes('');
    }, 300);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    let updatedGames: Game[];
    let gameId: number;

    if (editingGame) {
      // Update existing game
      gameId = editingGame.id;
      const updatedFormData = { ...formData };
      if (formData.status === 'completed' && finalScore) {
        updatedFormData.result = finalScore;
      }
      updatedGames = games.map((g) =>
        g.id === editingGame.id ? { ...g, ...updatedFormData } as Game : g
      );
    } else {
      // Add new game
      gameId = games.length > 0 ? Math.max(...games.map(g => g.id)) + 1 : 1;
      const newGame: Game = {
        id: gameId,
        date: formData.date || '',
        opponent: formData.opponent || '',
        location: formData.location || '',
        field: formData.field || '',
        time: formData.time || '',
        status: formData.status || 'scheduled',
        result: formData.status === 'completed' && finalScore ? finalScore : formData.result,
      };
      updatedGames = [...games, newGame];
    }

    setGames(updatedGames);
    StorageManager.saveGames(updatedGames);

    // Save game notes if any
    if (modalGameNotes) {
      StorageManager.saveGameNotes(gameId, modalGameNotes);
    }

    // Save awards if any selected
    if (session && Object.keys(selectedAwards).length > 0) {
      Object.entries(selectedAwards).forEach(([awardType, playerId]) => {
        if (playerId) {
          const award = {
            id: `award-${Date.now()}-${Math.random()}`,
            gameId: gameId,
            playerId: playerId,
            awardType: awardType,
            notes: '',
            awardedBy: session.userId,
            awardedAt: new Date().toISOString(),
          };
          StorageManager.createAward(award);
        }
      });
    }

    closeModal();
  };

  const deleteGame = (id: number) => {
    if (confirm('Are you sure you want to delete this game?')) {
      const updatedGames = games.filter((g) => g.id !== id);
      setGames(updatedGames);
      StorageManager.saveGames(updatedGames);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Load games and finalized status on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        // If unauthenticated, use sample games
        if (!isAuthenticated) {
          setGames(SAMPLE_GAMES);
          setLoading(false);
          return;
        }

        // Load games from localStorage or use defaults
        const savedGames = StorageManager.getAllGames();
        if (savedGames.length > 0) {
          setGames(savedGames);
        } else {
          // Set default games if none exist
          const defaultGames: Game[] = [
            {
              id: 1,
              date: '2026-04-05',
              opponent: 'Thunder Wolves',
              location: 'Home',
              status: 'completed',
              result: 'W 28-21',
            },
            {
              id: 2,
              date: '2026-04-12',
              opponent: 'Lightning Bolts',
              location: 'Away',
              status: 'completed',
              result: 'L 14-24',
            },
            {
              id: 3,
              date: '2026-04-19',
              opponent: 'Storm Chasers',
              location: 'Home',
              status: 'scheduled',
            },
          ];
          setGames(defaultGames);
          StorageManager.saveGames(defaultGames);
        }

        // Load finalized games status
        const finalized = StorageManager.getAllFinalizedGames();
        const finalizedIds = new Set(finalized.map(g => g.gameId));
        setFinalizedGames(finalizedIds);

        // Load invites
        const allInvites = StorageManager.getAllInvites();
        setInvites(allInvites);
      } catch (err) {
        console.error('Error loading schedule data:', err);
        setError('Failed to load schedule data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isAuthenticated]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showModal) {
        closeModal();
      }
    };

    if (showModal) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [showModal]);

  const isFinalized = (gameId: number) => finalizedGames.has(gameId);

  const handleFinalizeGame = (game: Game) => {
    if (isFinalized(game.id)) {
      alert('This game is already finalized.');
      return;
    }

    // Get the saved lineup for this game (if exists)
    const existingFinalized = StorageManager.getFinalizedGame(game.id);

    if (confirm(`Finalize game vs ${game.opponent}? This will archive the game with the current roster snapshot.${existingFinalized ? ' This will overwrite the previous finalization.' : ''}`)) {
      const roster = getRosterFromStorage();

      StorageManager.finalizeGame({
        gameId: game.id,
        gameDate: game.date,
        opponent: game.opponent,
        location: game.location,
        field: game.field,
        time: game.time,
        finalizedAt: new Date().toISOString(),
        lineup: null, // No lineup data from schedule page
        roster: roster,
      });

      // Update state to reflect finalization
      const finalized = StorageManager.getAllFinalizedGames();
      const finalizedIds = new Set(finalized.map(g => g.gameId));
      setFinalizedGames(finalizedIds);

      alert('Game finalized successfully! You can view it in the Archive.');
    }
  };

  const openMVPModal = (game: Game) => {
    setMVPGame(game);
    setShowMVPModal(true);
  };

  const closeMVPModal = () => {
    setShowMVPModal(false);
    setMVPGame(null);
  };

  // Game Notes Functions
  const openGameNotesModal = (gameId: number) => {
    setGameNotesGameId(gameId);
    const notes = StorageManager.getGameNotes(gameId);
    setGameNotes(notes);
    setShowGameNotesModal(true);
  };

  const closeGameNotesModal = () => {
    setShowGameNotesModal(false);
    setGameNotesGameId(null);
    setGameNotes('');
  };

  const handleSaveGameNotes = () => {
    if (gameNotesGameId !== null) {
      StorageManager.saveGameNotes(gameNotesGameId, gameNotes);
      alert('Game notes saved successfully!');
      closeGameNotesModal();
    }
  };

  // Invite Team Functions
  const openInviteModal = () => {
    setInviteEmail('');
    setInviteRole('parent');
    setInviteIsAdmin(false);
    setShowInviteModal(true);
  };

  const closeInviteModal = () => {
    setShowInviteModal(false);
    setInviteEmail('');
    setInviteRole('parent');
    setInviteIsAdmin(false);
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();

    if (!inviteEmail.trim()) {
      alert('Please enter an email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail)) {
      alert('Please enter a valid email address');
      return;
    }

    const newInvite: Invite = {
      id: Date.now().toString(),
      email: inviteEmail,
      role: inviteRole,
      isAdmin: inviteRole === 'parent' ? inviteIsAdmin : false,
      sentBy: session?.userId || 'unknown',
      sentAt: new Date().toISOString(),
      status: 'pending',
    };

    StorageManager.createInvite(newInvite);
    const updatedInvites = [...invites, newInvite];
    setInvites(updatedInvites);

    alert(`Invite sent to ${inviteEmail}! (This is a simulation - in production, an actual email would be sent.)`);
    closeInviteModal();
  };

  const handleDeleteInvite = (inviteId: string) => {
    if (confirm('Are you sure you want to delete this invite?')) {
      StorageManager.deleteInvite(inviteId);
      setInvites(invites.filter(i => i.id !== inviteId));
    }
  };

  // Get awards for a game
  const getGameAwards = (gameId: number) => {
    return StorageManager.getAwardsByGameId(gameId);
  };

  return (
    <div className="min-h-screen bg-[#1e293b] text-slate-100 font-[family-name:var(--font-inter)]">
      <Navigation />

      {/* Main Content */}
      <div className="pt-24 px-4 pb-12 animate-in fade-in duration-200">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl font-bold mb-4">
              {activeTeamName ? (
                <>{activeTeamName} <span className="text-[#16a34a]">Schedule</span></>
              ) : (
                <>My <span className="text-[#16a34a]">Schedule</span></>
              )}
            </h1>
            <p className="text-slate-400 text-lg">
              Manage your season schedule and game lineups.
            </p>
          </div>

          {/* Action Button - Coach/Admin Only */}
          {(isCoach || canEdit) && (
            <div className="mb-6">
              <button
                onClick={openAddModal}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(22,163,74,0.4)] transition-all duration-300 min-h-[44px] w-full sm:w-auto"
              >
                <Plus className="w-5 h-5" />
                Add Game
              </button>
            </div>
          )}

          {/* Games List */}
          <div className="space-y-4">
            {loading ? (
              <LoadingSkeleton rows={4} type="list" />
            ) : error ? (
              <ErrorState message={error} onRetry={() => window.location.reload()} />
            ) : games.length === 0 ? (
              <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-12 text-center">
                <div className="text-7xl mb-6">📅</div>
                <h3 className="font-[family-name:var(--font-playfair)] text-2xl font-bold mb-3 text-white">
                  No games on the board yet!
                </h3>
                <p className="text-slate-400 text-lg mb-8 max-w-md mx-auto">
                  Add your first game and start building your season. Your players are ready to take the field.
                </p>
                {(isCoach || canEdit) && (
                  <button
                    onClick={openAddModal}
                    className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white px-8 py-4 rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(22,163,74,0.4)] transition-all duration-300 min-h-[44px]"
                  >
                    Add Game
                  </button>
                )}
              </div>
            ) : (
              games
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map((game) => (
                  <div
                    key={game.id}
                    className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-4 sm:p-6 hover:border-[#16a34a]/50 transition-all duration-300"
                    onClick={() => {
                      if (!isAuthenticated) {
                        setShowLoginPrompt(true);
                      }
                    }}
                    style={{ cursor: !isAuthenticated ? 'pointer' : 'default' }}
                  >
                    <div className="flex flex-col gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="text-lg sm:text-xl font-bold text-white">
                            vs {game.opponent}
                          </h3>
                          {game.status === 'completed' && game.result && (
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                game.result.startsWith('W')
                                  ? 'bg-green-500/20 text-green-400'
                                  : 'bg-red-500/20 text-red-400'
                              }`}
                            >
                              {game.result}
                            </span>
                          )}
                          {game.status === 'scheduled' && !isFinalized(game.id) && (
                            <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-500/20 text-blue-400">
                              Scheduled
                            </span>
                          )}
                          {isFinalized(game.id) && (
                            <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-500/20 text-green-400 flex items-center gap-1">
                              <Check className="w-4 h-4" />
                              Finalized
                            </span>
                          )}
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-slate-400 text-sm">
                          <div className="flex items-center gap-2 min-h-[32px]">
                            <Calendar className="w-4 h-4 flex-shrink-0" />
                            <span>{formatDate(game.date)}</span>
                          </div>
                          {game.location && (
                            <div className="flex items-center gap-2 min-h-[32px]">
                              <MapPin className="w-4 h-4 flex-shrink-0" />
                              <span>{game.location}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 min-h-[32px]">
                            <span className="hidden sm:inline text-slate-500">•</span>
                            <span>{game.time || '5:00 PM'}</span>
                          </div>
                          <div className="flex items-center gap-2 min-h-[32px]">
                            <span className="hidden sm:inline text-slate-500">•</span>
                            <span>Field: {game.field || 'TBD'}</span>
                          </div>
                        </div>

                        {/* Show award winners if game is finalized */}
                        {isFinalized(game.id) && (() => {
                          const awards = getGameAwards(game.id);
                          if (awards.length > 0) {
                            const roster = getRosterFromStorage();
                            return (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {awards.map(award => {
                                  const player = roster.find(p => p.id === award.playerId);
                                  return (
                                    <div key={award.id} className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-3 py-1.5">
                                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                      <span className="text-sm text-yellow-200">
                                        {award.awardType}: {player ? `${player.firstName} ${player.lastName}` : 'Unknown'}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                        {isFinalized(game.id) ? (
                          <>
                            {/* Show "Final Roster" for coaches/admins, "View in Archive" for parents/players */}
                            {(isCoach || canEdit) ? (
                              <>
                                <Link
                                  href={`/archive?gameId=${game.id}`}
                                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white px-4 py-2 rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(22,163,74,0.4)] transition-all duration-300 min-h-[44px] w-full sm:w-auto"
                                >
                                  <Archive className="w-4 h-4" />
                                  Final Roster
                                </Link>
                                {game.status === 'completed' && (
                                  <Link
                                    href={`/schedule/${game.id}/summary`}
                                    className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-500 transition-all duration-300 min-h-[44px] w-full sm:w-auto"
                                  >
                                    <FileText className="w-4 h-4" />
                                    View Summary
                                  </Link>
                                )}
                              </>
                            ) : (
                              <>
                                <Link
                                  href={`/archive?gameId=${game.id}`}
                                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white px-4 py-2 rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(22,163,74,0.4)] transition-all duration-300 min-h-[44px] w-full sm:w-auto"
                                >
                                  <Archive className="w-4 h-4" />
                                  View in Archive
                                </Link>
                                {game.status === 'completed' && (
                                  <Link
                                    href={`/schedule/${game.id}/summary`}
                                    className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-500 transition-all duration-300 min-h-[44px] w-full sm:w-auto"
                                  >
                                    <FileText className="w-4 h-4" />
                                    View Summary
                                  </Link>
                                )}
                              </>
                            )}
                          </>
                        ) : (
                          <>
                            {/* Generate Lineup - Coach Only (hidden from parents and players) */}
                            {isCoach && (
                              <Link
                                href={`/roster?gameId=${game.id}&mode=lineup`}
                                className="flex items-center justify-center gap-2 bg-[#16a34a] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#22c55e] transition-all duration-300 min-h-[44px] w-full sm:w-auto"
                              >
                                <Trophy className="w-4 h-4" />
                                Generate Lineup
                              </Link>
                            )}
                            {/* Additional buttons in a row on mobile */}
                            <div className="flex gap-2">
                              {/* MVP - Coach Only (hidden from parents and players) */}
                              {isCoach && (
                                <button
                                  onClick={() => openMVPModal(game)}
                                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-yellow-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-yellow-500 transition-all duration-300 min-h-[44px]"
                                  title="Award MVP or Player of the Game"
                                >
                                  <Star className="w-4 h-4" />
                                  <span className="sm:inline">MVP</span>
                                </button>
                              )}
                              {/* Game Notes - Coach/Admin Only */}
                              {(isCoach || canEdit) && (
                                <button
                                  onClick={() => openGameNotesModal(game.id)}
                                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-slate-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-slate-500 transition-all duration-300 min-h-[44px]"
                                  title="Add or edit game notes"
                                >
                                  <FileText className="w-4 h-4" />
                                  <span className="hidden sm:inline">Notes</span>
                                </button>
                              )}
                              {canEdit && (
                                <>
                                  <button
                                    onClick={() => openEditModal(game)}
                                    className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-[#16a34a] hover:bg-slate-800/50 rounded-lg transition-all"
                                    title="Edit game details"
                                  >
                                    <Edit className="w-5 h-5" />
                                  </button>
                                  {!isFinalized(game.id) && (
                                    <button
                                      onClick={() => deleteGame(game.id)}
                                      className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-red-400 hover:bg-slate-800/50 rounded-lg transition-all"
                                      title="Delete game"
                                    >
                                      <Trash2 className="w-5 h-5" />
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={(e) => {
            // Close modal when clicking backdrop
            if (e.target === e.currentTarget) {
              closeModal();
            }
          }}
        >
          <div
            className="bg-slate-800 rounded-2xl border border-slate-700 max-w-md w-full p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold mb-6">
              {editingGame ? 'Edit Game' : 'Add New Game'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-3 min-h-[44px] bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/20 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Opponent
                </label>
                <input
                  type="text"
                  value={formData.opponent}
                  onChange={(e) => setFormData({ ...formData, opponent: e.target.value })}
                  className="w-full px-4 py-3 min-h-[44px] bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/20 transition-all"
                  placeholder="Team name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-3 min-h-[44px] bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/20 transition-all"
                  placeholder="e.g. Memorial Field, Home, Away"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Field
                </label>
                <input
                  type="text"
                  value={formData.field || ''}
                  onChange={(e) => setFormData({ ...formData, field: e.target.value })}
                  className="w-full px-4 py-3 min-h-[44px] bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/20 transition-all"
                  placeholder="e.g. Field 1, Field A"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Time
                </label>
                <input
                  type="text"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full px-4 py-3 min-h-[44px] bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/20 transition-all"
                  placeholder="e.g. 3:00 PM, 15:00"
                />
              </div>

              {/* Game Status Toggle */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Game Status
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, status: 'scheduled' })}
                    className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
                      formData.status === 'scheduled'
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    Scheduled
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, status: 'completed' })}
                    className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
                      formData.status === 'completed'
                        ? 'bg-[#16a34a] text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    Completed
                  </button>
                </div>
              </div>

              {/* Final Score - Only for Completed Games */}
              {formData.status === 'completed' && (
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Final Score
                  </label>
                  <input
                    type="text"
                    value={finalScore}
                    onChange={(e) => setFinalScore(e.target.value)}
                    className="w-full px-4 py-3 min-h-[44px] bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/20 transition-all"
                    placeholder="e.g. W 28-21, 14-7"
                  />
                </div>
              )}

              {/* Award Dropdowns - Only for Completed Games */}
              {formData.status === 'completed' && (() => {
                const players = getRosterFromStorage();
                const awardTypes = StorageManager.getAwardTypes();

                return awardTypes.length > 0 ? (
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-slate-300">
                      Award Winners
                    </label>
                    {awardTypes.map((awardType) => (
                      <div key={awardType.id}>
                        <label className="block text-xs text-slate-400 mb-1">
                          {awardType.name}
                        </label>
                        <select
                          value={selectedAwards[awardType.name] || ''}
                          onChange={(e) => setSelectedAwards({
                            ...selectedAwards,
                            [awardType.name]: parseInt(e.target.value) || 0
                          })}
                          className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/20 transition-all cursor-pointer"
                        >
                          <option value="">Select Player</option>
                          {players.map((player) => (
                            <option key={player.id} value={player.id}>
                              #{player.jerseyNumber} {player.firstName} {player.lastName}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                ) : null;
              })()}

              {/* Game Notes */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Game Notes
                  <span className="ml-2 text-xs text-slate-500">
                    ({modalGameNotes.length}/{MAX_NOTES_LENGTH} characters)
                  </span>
                </label>
                <textarea
                  value={modalGameNotes}
                  onChange={(e) => {
                    if (e.target.value.length <= MAX_NOTES_LENGTH) {
                      setModalGameNotes(e.target.value);
                    }
                  }}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/20 transition-all resize-none"
                  placeholder="Add notes about the game..."
                  rows={4}
                  maxLength={MAX_NOTES_LENGTH}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-6 py-3 min-h-[44px] bg-slate-700 text-white rounded-lg font-semibold hover:bg-slate-600 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 min-h-[44px] bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(22,163,74,0.4)] transition-all duration-300"
                >
                  {editingGame ? 'Update' : 'Add'} Game
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MVP Modal */}
      {showMVPModal && mvpGame && (
        <MVPModal
          gameId={mvpGame.id}
          gameName={`vs ${mvpGame.opponent}`}
          onClose={closeMVPModal}
          onSuccess={() => {
            closeMVPModal();
            // Reload games to show updated awards
            const savedGames = StorageManager.getAllGames();
            setGames(savedGames);
            alert('Award successfully given!');
          }}
        />
      )}

      {/* Game Notes Modal */}
      {showGameNotesModal && gameNotesGameId !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeGameNotesModal();
            }
          }}
        >
          <div
            className="bg-slate-800 rounded-2xl border border-slate-700 max-w-2xl w-full p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold mb-6 flex items-center gap-2">
              <FileText className="w-6 h-6 text-[#16a34a]" />
              Game Notes
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Coach Notes (Visible to coaches only)
                </label>
                <textarea
                  value={gameNotes}
                  onChange={(e) => setGameNotes(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/20 transition-all resize-none"
                  placeholder="Enter notes about game strategy, player performance, observations..."
                  rows={8}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeGameNotesModal}
                  className="flex-1 px-6 py-3 bg-slate-700 text-white rounded-lg font-semibold hover:bg-slate-600 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveGameNotes}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(22,163,74,0.4)] transition-all duration-300"
                >
                  Save Notes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Login Prompt Modal */}
      <LoginPromptModal
        isOpen={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
      />

      {/* Invite Team Section - Coach Only */}
      {canEdit && (
        <div className="px-4 pb-12">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold mb-4 flex items-center gap-3">
                <UserPlus className="w-8 h-8 text-[#16a34a]" />
                Invite <span className="text-[#16a34a]">Team Members</span>
              </h2>
              <p className="text-slate-400 text-lg">
                Send invitations to parents and players to join your team.
              </p>
            </div>

            <div className="mb-6">
              <button
                onClick={openInviteModal}
                className="flex items-center gap-2 bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(22,163,74,0.4)] transition-all duration-300"
              >
                <Mail className="w-5 h-5" />
                Send Invite
              </button>
            </div>

            <div className="space-y-4">
              {invites.map((invite) => (
                <div
                  key={invite.id}
                  className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6 hover:border-[#16a34a]/50 transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Mail className="w-5 h-5 text-[#16a34a]" />
                        <h3 className="text-lg font-bold text-white">{invite.email}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          invite.status === 'pending'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : invite.status === 'accepted'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {invite.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-slate-400 text-sm">
                        <span>Role: <strong className="text-slate-300">{invite.role}</strong></span>
                        {invite.isAdmin && (
                          <span className="text-[#16a34a]">• Admin Access</span>
                        )}
                        <span>• Sent {new Date(invite.sentAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDeleteInvite(invite.id)}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800/50 rounded-lg transition-all"
                        title="Delete invite"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {invites.length === 0 && (
                <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-12 text-center">
                  <Mail className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-400 mb-2">
                    No Invites Sent Yet
                  </h3>
                  <p className="text-slate-500">
                    Send your first invite to get team members onboard.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeInviteModal();
            }
          }}
        >
          <div
            className="bg-slate-800 rounded-2xl border border-slate-700 max-w-md w-full p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold mb-6 flex items-center gap-2">
              <Mail className="w-6 h-6 text-[#16a34a]" />
              Send Team Invite
            </h2>

            <form onSubmit={handleSendInvite} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/20 transition-all"
                  placeholder="teammate@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as UserRole)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/20 transition-all cursor-pointer"
                  required
                >
                  <option value="parent">Parent</option>
                  <option value="player">Player</option>
                </select>
                <p className="mt-2 text-xs text-slate-500">
                  {inviteRole === 'parent' && 'Parents can view team data and optionally have admin access.'}
                  {inviteRole === 'player' && 'Players have view-only access to their stats and team info.'}
                </p>
              </div>

              {inviteRole === 'parent' && (
                <div className="flex items-start gap-3 p-4 bg-slate-900/30 rounded-lg border border-slate-700/50">
                  <input
                    type="checkbox"
                    id="inviteIsAdmin"
                    checked={inviteIsAdmin}
                    onChange={(e) => setInviteIsAdmin(e.target.checked)}
                    className="mt-1 w-5 h-5 rounded border-slate-600 bg-slate-800 text-[#16a34a] focus:ring-[#16a34a] focus:ring-offset-0 cursor-pointer"
                  />
                  <div>
                    <label htmlFor="inviteIsAdmin" className="text-sm font-semibold text-slate-300 cursor-pointer">
                      Grant Admin Access
                    </label>
                    <p className="text-xs text-slate-500 mt-1">
                      Allow editing and managing team data
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeInviteModal}
                  className="flex-1 px-6 py-3 bg-slate-700 text-white rounded-lg font-semibold hover:bg-slate-600 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(22,163,74,0.4)] transition-all duration-300"
                >
                  Send Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tips Section */}
      <div className="px-4 pb-12">
        <div className="max-w-7xl mx-auto">
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8">
            <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-bold mb-6 text-center">
              <span className="text-[#16a34a]">Quick Tips</span> for Managing Your Schedule
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {/* Tip 1 */}
              <div className="bg-slate-900/30 rounded-xl p-6 border border-slate-700/30">
                <div className="flex items-center justify-center w-12 h-12 bg-[#16a34a]/20 rounded-full mb-4">
                  <span className="text-[#16a34a] text-2xl font-bold">1</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Add Your Games
                </h3>
                <p className="text-slate-400 text-sm">
                  Click "Add Game" to create a new game entry. Fill in the opponent, date, time, and location details.
                </p>
              </div>

              {/* Tip 2 */}
              <div className="bg-slate-900/30 rounded-xl p-6 border border-slate-700/30">
                <div className="flex items-center justify-center w-12 h-12 bg-[#16a34a]/20 rounded-full mb-4">
                  <span className="text-[#16a34a] text-2xl font-bold">2</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Generate Lineups
                </h3>
                <p className="text-slate-400 text-sm">
                  Click "Generate Lineup" on any scheduled game to create a balanced player rotation for that matchup.
                </p>
              </div>

              {/* Tip 3 */}
              <div className="bg-slate-900/30 rounded-xl p-6 border border-slate-700/30">
                <div className="flex items-center justify-center w-12 h-12 bg-[#16a34a]/20 rounded-full mb-4">
                  <span className="text-[#16a34a] text-2xl font-bold">3</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Track Results & Awards
                </h3>
                <p className="text-slate-400 text-sm">
                  After the game, edit the game details to mark it as "Completed", add the final score, select MVP/award winners, and save game notes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto text-center">
          <h3 className="font-[family-name:var(--font-playfair)] text-2xl font-bold mb-2 bg-gradient-to-r from-[#16a34a] to-[#22c55e] bg-clip-text text-transparent">
            SidelineCEO
          </h3>
          <p className="text-slate-500 text-sm">
            &copy; {new Date().getFullYear()} SidelineCEO. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Scout Mode Popup */}
      <ScoutModePopup
        isOpen={showScoutPopup}
        onDismiss={dismissScoutPopup}
        onScoutMode={enterScoutMode}
      />

      {/* Scout Mode Banner */}
      <ScoutModeBanner isVisible={showScoutBanner} />
    </div>
  );
}
