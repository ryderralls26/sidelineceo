'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Plus, Save, AlertTriangle } from 'lucide-react';
import { Player, getRosterFromStorage, saveRosterToStorage, getPositionAbbreviations } from '@/lib/types';
import { CoachCard, RefereeCard } from '@/components/GameCards';
import { Navigation } from '@/components/Navigation';
import { StorageManager, CoachData, Game } from '@/lib/storage';
import { useAuth } from '@/lib/AuthContext';
import { LoginPromptModal } from '@/components/LoginPromptModal';
import { LineupGenerator } from '@/lib/lineupGenerator';

const DEFAULT_PLAYERS: Player[] = [];

function RosterContent() {
  const { canEdit, session, isAuthenticated } = useAuth();
  const searchParams = useSearchParams();
  const gameId = searchParams.get('gameId');

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

  // Coach State
  const [coaches, setCoaches] = useState<CoachData>({
    coach1Name: '',
    coach2Name: '',
    selectedCoachIndex: 0,
  });

  // Login Prompt Modal
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Load roster, positions, coaches, game details, and invites from localStorage
  useEffect(() => {
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

    // Load coaches
    const savedCoaches = StorageManager.getCoachData();
    setCoaches(savedCoaches);

    // Load game details if gameId is present
    if (gameId) {
      const game = StorageManager.getGame(parseInt(gameId));
      if (game) {
        setCurrentGame(game);
      }
    }
  }, [gameId]);

  const addPlayer = () => {
    const newPlayer: Player = {
      id: players.length > 0 ? Math.max(...players.map(p => p.id)) + 1 : 1,
      play: false, // Changed from true to false (no pre-checked)
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
    setPlayers(
      players.map((player) =>
        player.id === id ? { ...player, [field]: value } : player
      )
    );
  };

  const saveRoster = () => {
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

  return (
    <div className="min-h-screen bg-[#1e293b] text-slate-100 font-[family-name:var(--font-inter)]">
      <Navigation />

      {/* Main Content */}
      <div className="pt-24 px-4 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl font-bold mb-4">
              Team <span className="text-[#16a34a]">Roster</span>
            </h1>
            <p className="text-slate-400 text-lg">
              Manage your players, positions, and game-day availability.
            </p>
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

          {/* Action Buttons - Coach Only */}
          {canEdit && (
            <div className="mb-6 flex flex-wrap gap-4">
              <button
                onClick={addPlayer}
                className="flex items-center gap-2 bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(22,163,74,0.4)] transition-all duration-300"
              >
                <Plus className="w-5 h-5" />
                Add Player
              </button>
              {gameId && currentGame && (
                <button
                  onClick={() => {
                    // Generate lineup and save to game
                    const generator = new LineupGenerator(players, positions);
                    const lineup = generator.generate();
                    alert('Lineup generated! You can now award MVPs and finalize the game.');
                  }}
                  className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-500 transition-all duration-300"
                >
                  Generate Lineup
                </button>
              )}
              <button
                onClick={saveRoster}
                className="flex items-center gap-2 bg-slate-800/50 border border-slate-700 text-slate-300 px-6 py-3 rounded-lg font-semibold hover:bg-slate-800 hover:text-white transition-all duration-300"
              >
                <Save className="w-5 h-5" />
                Save Changes
              </button>
              {gameId && currentGame && (
                <button
                  onClick={() => {
                    if (confirm(`Finalize game vs ${currentGame.opponent}? This will lock the roster and lineup.`)) {
                      // Generate lineup
                      const generator = new LineupGenerator(players, positions);
                      const lineup = generator.generate();

                      // Finalize the game
                      StorageManager.finalizeGame({
                        gameId: parseInt(gameId),
                        gameDate: currentGame.date,
                        opponent: currentGame.opponent,
                        location: currentGame.location,
                        field: currentGame.field,
                        time: currentGame.time,
                        finalizedAt: new Date().toISOString(),
                        lineup: lineup,
                        roster: players,
                      });

                      alert('Game finalized successfully!');
                    }
                  }}
                  className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-500 transition-all duration-300"
                >
                  Finalize
                </button>
              )}
            </div>
          )}

          {/* Roster Table */}
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
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
                          className="w-5 h-5 rounded border-slate-600 bg-slate-800 text-[#16a34a] focus:ring-[#16a34a] focus:ring-offset-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
                          className="w-5 h-5 rounded border-slate-600 bg-slate-800 text-[#16a34a] focus:ring-[#16a34a] focus:ring-offset-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
                          className={`w-full px-3 py-2 bg-slate-900/50 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
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
                          className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                          className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                          className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                          className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a]/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
                          className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a]/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
                          className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a]/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
                          className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a]/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <option value="">Select</option>
                          {divisions.map((div) => (
                            <option key={div} value={div}>
                              {div}
                            </option>
                          ))}
                        </select>
                      </td>
                      {canEdit ? (
                        <td className="px-4 py-4">
                          <button
                            onClick={() => deletePlayer(player.id)}
                            className="text-red-400 hover:text-red-300 font-semibold transition-colors"
                          >
                            Delete
                          </button>
                        </td>
                      ) : (
                        <td className="px-4 py-4">
                          <span className="text-slate-600 text-sm">View Only</span>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Horizontal Separator */}
          <hr className="mt-8 mb-8 border-t-2 border-slate-700/50" />

          {/* Coaches Section */}
          <div className="mt-0">
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold mb-6">
              Team <span className="text-[#16a34a]">Coaches</span>
            </h2>
            <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
              <div className="space-y-4">
                {/* Coach 1 */}
                <div className="flex items-center gap-4 p-4 bg-slate-900/20 rounded-lg border border-slate-700/30">
                  <input
                    type="radio"
                    name="selectedCoach"
                    checked={coaches.selectedCoachIndex === 0}
                    onChange={() => selectCoach(0)}
                    disabled={!canEdit}
                    className="w-5 h-5 text-[#16a34a] focus:ring-[#16a34a] focus:ring-offset-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <input
                    type="text"
                    value={coaches.coach1Name}
                    onChange={(e) => updateCoachName(0, e.target.value)}
                    disabled={!canEdit}
                    className="flex-1 px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Coach 1 Name"
                  />
                </div>

                {/* Coach 2 */}
                <div className="flex items-center gap-4 p-4 bg-slate-900/20 rounded-lg border border-slate-700/30">
                  <input
                    type="radio"
                    name="selectedCoach"
                    checked={coaches.selectedCoachIndex === 1}
                    onChange={() => selectCoach(1)}
                    disabled={!canEdit}
                    className="w-5 h-5 text-[#16a34a] focus:ring-[#16a34a] focus:ring-offset-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <input
                    type="text"
                    value={coaches.coach2Name}
                    onChange={(e) => updateCoachName(1, e.target.value)}
                    disabled={!canEdit}
                    className="flex-1 px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Coach 2 Name"
                  />
                </div>
              </div>

              <p className="text-slate-400 text-sm mt-4">
                Select the primary coach for the game. This coach's name will appear on the game cards.
              </p>
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-8 bg-slate-800/20 border border-slate-700/50 rounded-xl p-6">
            <h3 className="font-semibold text-lg mb-3 text-[#22c55e]">
              Roster Management Tips
            </h3>
            <ul className="space-y-2 text-slate-400">
              <li className="flex items-start gap-2">
                <span className="text-[#16a34a] mt-1">•</span>
                <span>
                  <strong className="text-slate-300">Play Checkbox:</strong> Toggle to mark if a player is available for the game.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#16a34a] mt-1">•</span>
                <span>
                  <strong className="text-slate-300">4Q Lock:</strong> Lock players into the 4th quarter lineup for clutch situations.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#16a34a] mt-1">•</span>
                <span>
                  <strong className="text-slate-300">Positions:</strong> Assign primary and secondary positions to maximize lineup flexibility.
                </span>
              </li>
            </ul>
          </div>

          {/* Live Game Card Previews */}
          <div className="mt-12">
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold mb-6">
              Live <span className="text-[#16a34a]">Game Card Previews</span>
            </h2>
            <p className="text-slate-400 text-lg mb-6">
              Preview how your roster will appear on game day cards. These update automatically as you edit the roster above.
            </p>

            {/* Print Button */}
            <div className="mb-6 print:hidden">
              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    setShowLoginPrompt(true);
                    return;
                  }

                  // If we have a gameId, finalize the game with the current roster and generated lineup
                  if (gameId && currentGame) {
                    // Generate the lineup using the LineupGenerator
                    const generator = new LineupGenerator(players, positions);
                    const lineup = generator.generate();

                    StorageManager.finalizeGame({
                      gameId: parseInt(gameId),
                      gameDate: currentGame.date,
                      opponent: currentGame.opponent,
                      location: currentGame.location,
                      field: currentGame.field,
                      time: currentGame.time,
                      finalizedAt: new Date().toISOString(),
                      lineup: lineup,
                      roster: players,
                    });
                  }

                  // Save snapshot to localStorage for print preview
                  const snapshot = {
                    timestamp: new Date().toISOString(),
                    players: players,
                    coaches: coaches,
                    gameInfo: currentGame ? {
                      opponent: currentGame.opponent,
                      date: currentGame.date,
                      location: currentGame.location,
                      field: currentGame.field,
                      time: currentGame.time,
                    } : {
                      opponent: 'Sample Opponent',
                      date: new Date().toISOString(),
                      location: 'Home Field',
                      time: '3:00 PM',
                    }
                  };
                  localStorage.setItem('last_game_card_snapshot', JSON.stringify(snapshot));
                  window.print();
                }}
                className="flex items-center gap-2 bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(22,163,74,0.4)] transition-all duration-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print Game Cards
              </button>
            </div>

            <div
              className="grid md:grid-cols-2 gap-8 print:grid-cols-2 print:gap-4"
              onClick={() => {
                if (!isAuthenticated) {
                  setShowLoginPrompt(true);
                }
              }}
            >
              <CoachCard
                players={players}
                gameInfo={currentGame ? {
                  opponent: currentGame.opponent,
                  date: currentGame.date,
                  location: currentGame.location,
                  field: currentGame.field,
                  time: currentGame.time,
                } : {
                  opponent: 'Sample Opponent',
                  date: new Date().toISOString(),
                  location: 'Home Field',
                  time: '3:00 PM',
                }}
                positions={positions}
                coachName={coaches.selectedCoachIndex === 0 ? coaches.coach1Name : coaches.coach2Name}
              />
              <RefereeCard
                players={players}
                gameInfo={currentGame ? {
                  opponent: currentGame.opponent,
                  date: currentGame.date,
                  location: currentGame.location,
                  field: currentGame.field,
                  time: currentGame.time,
                } : {
                  opponent: 'Sample Opponent',
                  date: new Date().toISOString(),
                  location: 'Home Field',
                  time: '3:00 PM',
                }}
                positions={positions}
                coachName={coaches.selectedCoachIndex === 0 ? coaches.coach1Name : coaches.coach2Name}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Login Prompt Modal */}
      <LoginPromptModal
        isOpen={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
      />

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-slate-800/50">
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
  );
}

export default function RosterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#1e293b] text-slate-100 flex items-center justify-center">Loading...</div>}>
      <RosterContent />
    </Suspense>
  );
}
