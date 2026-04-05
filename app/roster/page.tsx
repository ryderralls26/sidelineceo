'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Plus, Save, AlertTriangle } from 'lucide-react';
import { Player, getRosterFromStorage, saveRosterToStorage, getPositionAbbreviations } from '@/lib/types';
import { GameCardsWithSharedState } from '@/components/GameCards';
import { Navigation } from '@/components/Navigation';
import { StorageManager, CoachData, Game } from '@/lib/storage';
import { useAuth } from '@/lib/AuthContext';
import { LoginPromptModal } from '@/components/LoginPromptModal';
import { LineupGenerator } from '@/lib/lineupGenerator';
import { generateLineup, LineupPlayer, LineupResult } from '@/lib/lineupEngine';
import { EmptyState } from '@/components/EmptyState';
import { useAuthGuard } from '@/lib/useAuthGuard';
import { ScoutModePopup } from '@/components/ScoutModePopup';
import { ScoutModeBanner } from '@/components/ScoutModeBanner';

const DEFAULT_PLAYERS: Player[] = [];

// Placeholder data for unauthenticated users
const PLACEHOLDER_PLAYERS: Player[] = [
  { id: 1, play: false, fourthQuarterLock: false, jerseyNumber: '1', firstName: 'Player', lastName: '1', nickname: '', position1: 'QB', position2: 'S', division: 'FR' },
  { id: 2, play: false, fourthQuarterLock: false, jerseyNumber: '2', firstName: 'Player', lastName: '2', nickname: '', position1: 'C', position2: 'DL', division: 'FR' },
  { id: 3, play: false, fourthQuarterLock: false, jerseyNumber: '3', firstName: 'Player', lastName: '3', nickname: '', position1: 'WR', position2: 'CB', division: 'FR' },
  { id: 4, play: false, fourthQuarterLock: false, jerseyNumber: '4', firstName: 'Player', lastName: '4', nickname: '', position1: 'RB', position2: 'LB', division: 'FR' },
  { id: 5, play: false, fourthQuarterLock: false, jerseyNumber: '5', firstName: 'Player', lastName: '5', nickname: '', position1: 'WR', position2: 'CB', division: 'FR' },
  { id: 6, play: false, fourthQuarterLock: false, jerseyNumber: '6', firstName: 'Player', lastName: '6', nickname: '', position1: 'RB', position2: 'LB', division: 'FR' },
  { id: 7, play: false, fourthQuarterLock: false, jerseyNumber: '7', firstName: 'Player', lastName: '7', nickname: '', position1: 'WR', position2: 'S', division: 'FR' },
  { id: 8, play: false, fourthQuarterLock: false, jerseyNumber: '8', firstName: 'Player', lastName: '8', nickname: '', position1: 'RB', position2: 'DL', division: 'FR' },
  { id: 9, play: false, fourthQuarterLock: false, jerseyNumber: '9', firstName: 'Coach', lastName: '1', nickname: '', position1: '', position2: '', division: '' },
  { id: 10, play: false, fourthQuarterLock: false, jerseyNumber: '10', firstName: 'Coach', lastName: '2', nickname: '', position1: '', position2: '', division: '' },
];

function RosterContent() {
  const { canEdit, session, isAuthenticated, logout, activeTeamName } = useAuth();
  const {
    isScoutMode,
    showScoutPopup,
    showScoutBanner,
    handleInteraction,
    dismissScoutPopup,
    enterScoutMode,
    handleSaveAction
  } = useAuthGuard();
  const searchParams = useSearchParams();
  const gameId = searchParams.get('gameId');
  const mode = searchParams.get('mode');

  const [players, setPlayers] = useState<Player[]>(DEFAULT_PLAYERS);
  const [positions, setPositions] = useState<string[]>([]);
  const [currentGame, setCurrentGame] = useState<Game | null>(null);
  const [divisions, setDivisions] = useState<string[]>([]);
  const [awardTypes, setAwardTypes] = useState<string[]>([]);
  const [selectedDivision, setSelectedDivision] = useState<string>('');

  // MVP/Award state (for finalize workflow)
  const [showMVPModal, setShowMVPModal] = useState(false);
  const [mvpPlayerId, setMVPPlayerId] = useState<number | null>(null);
  const [mvpAwardType, setMVPAwardType] = useState('');
  const [mvpReason, setMVPReason] = useState('');

  // Finalize modal state
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);

  // Coach State
  const [coaches, setCoaches] = useState<CoachData>({
    coach1Name: '',
    coach2Name: '',
    selectedCoachIndex: 0,
  });

  // Login Prompt Modal
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Lineup Mode State
  const isLineupMode = mode === 'lineup' && gameId;
  const [generatedLineup, setGeneratedLineup] = useState<LineupResult | null>(null);

  // Load roster, positions, coaches, game details, and invites from localStorage
  useEffect(() => {
    // If unauthenticated, use placeholder data
    if (!isAuthenticated) {
      setPlayers(PLACEHOLDER_PLAYERS);
      const savedPositions = getPositionAbbreviations();
      setPositions(savedPositions);
      return;
    }

    const savedRoster = getRosterFromStorage();
    if (savedRoster.length > 0) {
      setPlayers(savedRoster);
    }
    const savedPositions = getPositionAbbreviations();
    setPositions(savedPositions);

    // Load divisions
    const divs = StorageManager.getDivisions();
    setDivisions(divs.map(d => d.abbreviation));
    if (divs.length > 0) setSelectedDivision(divs[0].abbreviation);

    // Load award types
    const awards = StorageManager.getAwardTypes();
    setAwardTypes(awards.map(a => a.name));

    // Load coaches and auto-populate Coach 1 with session user's full name
    const savedCoaches = StorageManager.getCoachData();

    // If Coach 1 is empty and we have a session, auto-populate with user's full name
    if (!savedCoaches.coach1Name && session) {
      const fullName = `${session.firstName} ${session.lastName}`;
      setCoaches({...savedCoaches, coach1Name: fullName});
    } else {
      setCoaches(savedCoaches);
    }

    // Load game details if gameId is present
    if (gameId) {
      const game = StorageManager.getGame(parseInt(gameId));
      if (game) {
        setCurrentGame(game);
      }
    }
  }, [gameId, isAuthenticated]);

  const addPlayer = () => {
    const newPlayer: Player = {
      id: players.length > 0 ? Math.max(...players.map(p => p.id)) + 1 : 1,
      play: false,
      fourthQuarterLock: false,
      jerseyNumber: '',
      firstName: '',
      lastName: '',
      nickname: '',
      position1: '',
      position2: '',
      secondaryPosition: '',
      division: '',
    };
    setPlayers([...players, newPlayer]);
  };

  const updatePlayer = (id: number, field: keyof Player, value: string | boolean) => {
    // Trigger auth guard check on first interaction
    if (!isAuthenticated && !isScoutMode) {
      handleInteraction();
      return;
    }

    setPlayers(
      players.map((player) =>
        player.id === id ? { ...player, [field]: value } : player
      )
    );
  };

  const saveRoster = () => {
    // Show scout banner if not authenticated
    if (!handleSaveAction()) {
      return;
    }

    saveRosterToStorage(players);
    StorageManager.saveCoachData(coaches);
    alert('Roster and coaches saved successfully!');
  };

  const updateCoachName = (coachIndex: number, name: string) => {
    if (coachIndex === 0) {
      setCoaches({ ...coaches, coach1Name: name });
    } else {
      setCoaches({ ...coaches, coach2Name: name });
    }
  };

  const selectCoach = (coachIndex: number) => {
    setCoaches({ ...coaches, selectedCoachIndex: coachIndex });
  };

  // Generate Lineup (for lineup mode)
  const handleGenerateLineup = () => {
    // Show scout banner if not authenticated
    if (!handleSaveAction()) {
      return;
    }

    const selectedPlayers: LineupPlayer[] = players
      .filter(p => p.play)
      .map(p => ({
        id: p.id,
        jerseyNumber: p.jerseyNumber,
        firstName: p.firstName,
        lastName: p.lastName,
        nickname: p.nickname,
        primaryPosition: p.position1,
        secondaryPosition: p.position2,
        fourthQuarterLock: p.fourthQuarterLock,
      }));

    const lineup = generateLineup(selectedPlayers, positions);
    setGeneratedLineup(lineup);
  };

  // Check for duplicate jersey numbers
  const getDuplicateJerseyNumbers = (): string[] => {
    const jerseyNumbers = players
      .map(p => p.jerseyNumber)
      .filter(n => n.trim() !== '');
    const duplicates = jerseyNumbers.filter(
      (num, idx, arr) => arr.indexOf(num) !== idx
    );
    return [...new Set(duplicates)];
  };

  const duplicateJerseys = getDuplicateJerseyNumbers();
  const playerCount = players.length;
  const hasMaxWarning = playerCount >= 9;

  const deletePlayer = (id: number) => {
    setPlayers(players.filter((player) => player.id !== id));
  };

  // Handle finalize card workflow
  const handleFinalizeCard = async () => {
    if (!gameId || !currentGame || !session?.activeTeamId) {
      alert('No game selected for finalization or no active team.');
      return;
    }

    setIsFinalizing(true);

    try {
      // Generate lineup
      const generator = new LineupGenerator(players.filter(p => p.play), positions);
      const lineup = generator.generate();

      // First, save the lineup using the upsert API
      const upsertResponse = await fetch('/api/lineups/upsert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gameId: parseInt(gameId),
          teamId: session.activeTeamId,
          lineup: lineup,
          roster: players,
        }),
      });

      if (!upsertResponse.ok) {
        throw new Error('Failed to save lineup before finalization');
      }

      // Prepare card data snapshot
      const cardData = {
        lineup,
        gameRoster: players,
        gameInfo: {
          opponent: currentGame.opponent,
          date: currentGame.date,
          location: currentGame.location,
          field: currentGame.field,
          time: currentGame.time,
          teamName: activeTeamName || 'FlagFooty',
          division: selectedDivision,
          coachName: coaches.selectedCoachIndex === 0 ? coaches.coach1Name : coaches.coach2Name,
        },
        positions,
      };

      // Call server action to finalize game
      const { finalizeGame } = await import('@/lib/actions/games');
      const result = await finalizeGame({
        gameId: parseInt(gameId),
        cardData,
        finalScore: undefined,
        awards: [],
      });

      if (result.success) {
        setShowFinalizeModal(false);
        alert('Game card finalized successfully! Redirecting to Archive...');
        window.location.href = '/archive';
      } else {
        throw new Error(result.error || 'Failed to finalize game');
      }
    } catch (error) {
      console.error('Failed to finalize game:', error);
      alert('Failed to finalize game card. Please try again.');
    } finally {
      setIsFinalizing(false);
    }
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
              {!isAuthenticated ? (
                <>Team Name <span className="text-[#16a34a]">Roster</span> <span className="text-slate-400">FR Fall {new Date().getFullYear()}</span></>
              ) : activeTeamName ? (
                <>{activeTeamName} <span className="text-[#16a34a]">{isLineupMode ? 'Lineup' : 'Roster'}</span> {selectedDivision && <span className="text-slate-400">{selectedDivision}</span>} <span className="text-slate-400">{currentGame?.date ? new Date(currentGame.date).getFullYear() : new Date().getFullYear()}</span></>
              ) : (
                <>My <span className="text-[#16a34a]">{isLineupMode ? 'Lineup' : 'Roster'}</span></>
              )}
            </h1>
            {isLineupMode && currentGame ? (
              <p className="text-slate-400 text-lg">
                Select 6-10 players for lineup generation vs {currentGame.opponent}
              </p>
            ) : (
              <p className="text-slate-400 text-lg">
                Manage your players, positions, and game-day availability.
              </p>
            )}
          </div>

          {/* Warnings */}
          {(duplicateJerseys.length > 0 || hasMaxWarning) && (
            <div className="mb-6 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-yellow-400 mb-2">Warnings:</h3>
                  <ul className="space-y-1">
                    {duplicateJerseys.length > 0 && (
                      <li className="text-yellow-300 text-sm">
                        Duplicate jersey numbers found: {duplicateJerseys.join(', ')}
                      </li>
                    )}
                    {hasMaxWarning && (
                      <li className="text-yellow-300 text-sm">
                        You have {playerCount} players. Recommended maximum is 8 players for optimal fair play.
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Lineup Mode: Player Selection Counter */}
          {isLineupMode && (
            <div className="mb-6 bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    Player Selection
                  </h3>
                  <p className="text-slate-400">
                    <span className={`font-bold text-2xl ${
                      players.filter(p => p.play).length >= 6 && players.filter(p => p.play).length <= 10
                        ? 'text-[#16a34a]'
                        : 'text-yellow-400'
                    }`}>
                      {players.filter(p => p.play).length}
                    </span>
                    <span className="text-slate-500"> of 10 players selected</span>
                  </p>
                </div>
                <button
                  onClick={handleGenerateLineup}
                  disabled={players.filter(p => p.play).length < 6 || players.filter(p => p.play).length > 10}
                  className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 w-full sm:w-auto min-h-[44px] ${
                    players.filter(p => p.play).length >= 6 && players.filter(p => p.play).length <= 10
                      ? 'bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white hover:shadow-[0_0_20px_rgba(22,163,74,0.4)]'
                      : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  Generate Lineup
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons - Coach Only */}
          {canEdit && !isLineupMode && (
            <div className="mb-6 flex flex-col sm:flex-row flex-wrap gap-4">
              <button
                onClick={addPlayer}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(22,163,74,0.4)] transition-all duration-300 min-h-[44px]"
              >
                <Plus className="w-5 h-5" />
                Add Player
              </button>
              <button
                onClick={saveRoster}
                className="flex items-center justify-center gap-2 bg-slate-800/50 border border-slate-700 text-slate-300 px-6 py-3 rounded-lg font-semibold hover:bg-slate-800 hover:text-white transition-all duration-300 min-h-[44px]"
              >
                <Save className="w-5 h-5" />
                Save Changes
              </button>
            </div>
          )}

          {/* Roster Table - Desktop view */}
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-800/50 border-b border-slate-700">
                    <th className="px-4 py-4 text-left text-sm font-semibold text-slate-300 min-w-[60px]">
                      Play
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold text-slate-300 min-w-[80px]">
                      4Q Lock
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold text-slate-300 min-w-[80px]">
                      #
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold text-slate-300 min-w-[120px]">
                      First Name
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold text-slate-300 min-w-[120px]">
                      Last Name
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold text-slate-300 min-w-[120px]">
                      Nickname
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold text-slate-300 min-w-[140px]">
                      Offensive Position
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold text-slate-300 min-w-[140px]">
                      Defensive Position
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold text-slate-300 min-w-[140px]">
                      Secondary Position
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold text-slate-300 min-w-[120px]">
                      Division
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold text-slate-300 min-w-[100px]">
                      Actions
                    </th>
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
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={player.play}
                          onChange={(e) =>
                            updatePlayer(player.id, 'play', e.target.checked)
                          }
                          disabled={!canEdit}
                          className="w-5 h-5 rounded border-slate-600 bg-slate-800 text-[#16a34a] focus:ring-[#16a34a] focus:ring-offset-0 cursor-pointer disabled:opacity-50"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={player.fourthQuarterLock}
                          onChange={(e) =>
                            updatePlayer(player.id, 'fourthQuarterLock', e.target.checked)
                          }
                          disabled={!canEdit}
                          className="w-5 h-5 rounded border-slate-600 bg-slate-800 text-[#16a34a] focus:ring-[#16a34a] focus:ring-offset-0 cursor-pointer disabled:opacity-50"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <input
                          type="text"
                          value={player.jerseyNumber}
                          onChange={(e) =>
                            updatePlayer(player.id, 'jerseyNumber', e.target.value)
                          }
                          disabled={!canEdit}
                          className={`w-full px-3 py-2 bg-slate-900/50 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a]/20 transition-all ${
                            duplicateJerseys.includes(player.jerseyNumber)
                              ? 'border-yellow-500'
                              : 'border-slate-700'
                          }`}
                          placeholder="##"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <input
                          type="text"
                          value={player.firstName}
                          onChange={(e) =>
                            updatePlayer(player.id, 'firstName', e.target.value)
                          }
                          disabled={!canEdit}
                          className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a]/20 transition-all"
                          placeholder="First"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <input
                          type="text"
                          value={player.lastName}
                          onChange={(e) =>
                            updatePlayer(player.id, 'lastName', e.target.value)
                          }
                          disabled={!canEdit}
                          className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a]/20 transition-all"
                          placeholder="Last"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <input
                          type="text"
                          value={player.nickname}
                          onChange={(e) =>
                            updatePlayer(player.id, 'nickname', e.target.value)
                          }
                          disabled={!canEdit}
                          className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a]/20 transition-all"
                          placeholder="Nickname"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <select
                          value={player.position1}
                          onChange={(e) =>
                            updatePlayer(player.id, 'position1', e.target.value)
                          }
                          disabled={!canEdit}
                          className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a]/20 transition-all cursor-pointer"
                        >
                          <option value="">Select</option>
                          {positions.map((pos) => (
                            <option key={pos} value={pos}>
                              {pos}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-4">
                        <select
                          value={player.position2}
                          onChange={(e) =>
                            updatePlayer(player.id, 'position2', e.target.value)
                          }
                          disabled={!canEdit}
                          className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a]/20 transition-all cursor-pointer"
                        >
                          <option value="">Select</option>
                          {positions.map((pos) => (
                            <option key={pos} value={pos}>
                              {pos}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-4">
                        <select
                          value={player.secondaryPosition || ''}
                          onChange={(e) =>
                            updatePlayer(player.id, 'secondaryPosition', e.target.value)
                          }
                          disabled={!canEdit}
                          className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a]/20 transition-all cursor-pointer"
                        >
                          <option value="">Select</option>
                          {positions.map((pos) => (
                            <option key={pos} value={pos}>
                              {pos}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-4">
                        <select
                          value={player.division || ''}
                          onChange={(e) =>
                            updatePlayer(player.id, 'division', e.target.value)
                          }
                          disabled={!canEdit}
                          className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a]/20 transition-all cursor-pointer"
                        >
                          <option value="">Select</option>
                          {divisions.map((div) => (
                            <option key={div} value={div}>
                              {div}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => deletePlayer(player.id)}
                          disabled={!canEdit}
                          className="text-red-400 hover:text-red-300 font-semibold transition-colors disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Coaches Section */}
          <div className="mt-12">
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold mb-6">
              Team <span className="text-[#16a34a]">Coaches</span>
            </h2>
            <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-slate-900/20 rounded-lg border border-slate-700/30">
                  <input
                    type="radio"
                    name="selectedCoach"
                    checked={coaches.selectedCoachIndex === 0}
                    onChange={() => selectCoach(0)}
                    disabled={!canEdit}
                    className="w-5 h-5 text-[#16a34a] focus:ring-[#16a34a] focus:ring-offset-0 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={coaches.coach1Name}
                    onChange={(e) => updateCoachName(0, e.target.value)}
                    disabled={!canEdit}
                    className="flex-1 px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a]/20 transition-all"
                    placeholder="Coach 1 Name"
                  />
                </div>
                <div className="flex items-center gap-4 p-4 bg-slate-900/20 rounded-lg border border-slate-700/30">
                  <input
                    type="radio"
                    name="selectedCoach"
                    checked={coaches.selectedCoachIndex === 1}
                    onChange={() => selectCoach(1)}
                    disabled={!canEdit}
                    className="w-5 h-5 text-[#16a34a] focus:ring-[#16a34a] focus:ring-offset-0 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={coaches.coach2Name}
                    onChange={(e) => updateCoachName(1, e.target.value)}
                    disabled={!canEdit}
                    className="flex-1 px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a]/20 transition-all"
                    placeholder="Coach 2 Name"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="py-12 px-4 border-t border-slate-800/50 mt-12">
            <div className="max-w-7xl mx-auto text-center">
              <h3 className="font-[family-name:var(--font-playfair)] text-2xl font-bold mb-2 bg-gradient-to-r from-[#16a34a] to-[#22c55e] bg-clip-text text-transparent">
                FlagFooty
              </h3>
              <p className="text-slate-500 text-sm">
                &copy; {new Date().getFullYear()} FlagFooty. All rights reserved.
              </p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

export default function RosterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#1e293b] text-slate-100 flex items-center justify-center">Loading...</div>}>
      <RosterContent />
    </Suspense>
  );
}
