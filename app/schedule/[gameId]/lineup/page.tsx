'use client';

import { useState, use, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, RefreshCw, ArrowLeft, AlertTriangle, Printer, Check, Eye } from 'lucide-react';
import { LineupGenerator, Player, GeneratedLineup } from '@/lib/lineupGenerator';
import { LineupValidator } from '@/lib/validation';
import { StorageManager, CoachData } from '@/lib/storage';
import { CoachCard, RefereeCard } from '@/components/GameCards';
import { getRosterFromStorage, getPositionAbbreviations } from '@/lib/types';
import { useAuth } from '@/lib/AuthContext';

const DEFAULT_PLAYERS: Player[] = [
  {
    id: 1,
    play: true,
    fourthQuarterLock: false,
    jerseyNumber: '12',
    firstName: 'Alex',
    lastName: 'Johnson',
    nickname: 'AJ',
    position1: 'QB',
    position2: 'WR',
  },
  {
    id: 2,
    play: true,
    fourthQuarterLock: false,
    jerseyNumber: '7',
    firstName: 'Sam',
    lastName: 'Williams',
    nickname: 'Sammy',
    position1: 'WR',
    position2: 'CB',
  },
  {
    id: 3,
    play: true,
    fourthQuarterLock: true,
    jerseyNumber: '24',
    firstName: 'Jordan',
    lastName: 'Davis',
    nickname: 'J-Dog',
    position1: 'RB',
    position2: 'LB',
  },
  {
    id: 4,
    play: true,
    fourthQuarterLock: false,
    jerseyNumber: '88',
    firstName: 'Taylor',
    lastName: 'Brown',
    nickname: 'T-Brown',
    position1: 'TE',
    position2: 'DL',
  },
  {
    id: 5,
    play: true,
    fourthQuarterLock: false,
    jerseyNumber: '32',
    firstName: 'Morgan',
    lastName: 'Garcia',
    nickname: 'Mo',
    position1: 'CB',
    position2: 'S',
  },
  {
    id: 6,
    play: true,
    fourthQuarterLock: false,
    jerseyNumber: '45',
    firstName: 'Casey',
    lastName: 'Martinez',
    nickname: 'Case',
    position1: 'LB',
    position2: 'RB',
  },
  {
    id: 7,
    play: true,
    fourthQuarterLock: false,
    jerseyNumber: '19',
    firstName: 'Riley',
    lastName: 'Wilson',
    nickname: 'Riles',
    position1: 'S',
    position2: 'WR',
  },
  {
    id: 8,
    play: false,
    fourthQuarterLock: false,
    jerseyNumber: '3',
    firstName: 'Jamie',
    lastName: 'Lee',
    nickname: 'J-Lee',
    position1: 'K',
    position2: 'OL',
  },
];

export default function LineupPage({ params }: { params: Promise<{ gameId: string }> }) {
  const resolvedParams = use(params);
  const gameId = parseInt(resolvedParams.gameId);
  const { canEdit } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lineup, setLineup] = useState<GeneratedLineup | null>(null);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [isFinalized, setIsFinalized] = useState(false);
  const [players, setPlayers] = useState<Player[]>(DEFAULT_PLAYERS);
  const [positions, setPositions] = useState<string[]>([]);
  const [gameInfo, setGameInfo] = useState<{ opponent: string; date: string; location: string; field?: string; time?: string } | null>(null);
  const [coaches, setCoaches] = useState<CoachData>({
    coach1Name: 'Coach 1',
    coach2Name: 'Coach 2',
    selectedCoachIndex: 0,
  });

  useEffect(() => {
    // Load game info
    const game = StorageManager.getGame(gameId);
    if (game) {
      setGameInfo({
        opponent: game.opponent,
        date: game.date,
        location: game.location,
        field: game.field,
        time: game.time,
      });
    }

    // Load roster and positions from localStorage
    const savedRoster = getRosterFromStorage();
    if (savedRoster.length > 0) {
      setPlayers(savedRoster);
    }

    const savedPositions = getPositionAbbreviations();
    setPositions(savedPositions);

    // Load coach data
    const savedCoaches = StorageManager.getCoachData();
    setCoaches(savedCoaches);

    // Check if this game is already finalized
    const finalized = StorageManager.isGameFinalized(gameId);
    setIsFinalized(finalized);
  }, [gameId]);

  const generateLineup = () => {
    const generator = new LineupGenerator(players, positions);
    const result = generator.generate();
    setLineup(result);
  };

  const validation = lineup ? LineupValidator.validate(players, lineup) : null;

  const canPrintOrExport = validation && validation.valid && lineup !== null;
  const canFinalize = canPrintOrExport && !isFinalized && canEdit;

  const handlePrintPreview = () => {
    if (!canPrintOrExport) {
      alert('Cannot print/export. Please fix all errors first.');
      return;
    }
    setShowPrintPreview(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleFinalize = () => {
    if (!canFinalize || !lineup || !gameInfo) {
      return;
    }

    if (confirm(`Finalize lineup for ${gameInfo.opponent}? This will archive the current lineup and cards.`)) {
      StorageManager.finalizeGame({
        gameId: gameId,
        gameDate: gameInfo.date,
        opponent: gameInfo.opponent,
        location: gameInfo.location,
        field: gameInfo.field,
        time: gameInfo.time,
        finalizedAt: new Date().toISOString(),
        lineup: lineup,
        roster: players,
      });

      setIsFinalized(true);
      alert('Lineup finalized successfully! You can view it in the Archive.');
    }
  };

  const getPlayerName = (player: Player | null): string => {
    if (!player) return '';
    return player.nickname || `${player.firstName} ${player.lastName}`.trim() || `#${player.jerseyNumber}`;
  };

  const getPlayerNumber = (player: Player | null): string => {
    if (!player) return '';
    return player.jerseyNumber;
  };

  if (showPrintPreview && gameInfo) {
    return (
      <div className="min-h-screen bg-[#1e293b] text-slate-100 font-[family-name:var(--font-inter)]">
        {/* Print Preview Header */}
        <div className="bg-slate-800/50 border-b border-slate-700 p-4 print:hidden">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <button
              onClick={() => setShowPrintPreview(false)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              ← Back to Lineup
            </button>
            <h2 className="text-xl font-bold">Print Preview</h2>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(22,163,74,0.4)] transition-all duration-300"
            >
              <Printer className="w-5 h-5" />
              Print
            </button>
          </div>
        </div>

        {/* Print Preview Content - 4 cards per page (2x2 grid) */}
        <div className="p-8 print:p-0">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8 print:grid-cols-2 print:gap-2">
            {/* First Coach Card */}
            <CoachCard
              players={players}
              gameInfo={gameInfo}
              isPrintPreview={true}
              positions={positions}
              coachName={coaches.selectedCoachIndex === 0 ? coaches.coach1Name : coaches.coach2Name}
            />
            {/* Second Coach Card (duplicate) */}
            <CoachCard
              players={players}
              gameInfo={gameInfo}
              isPrintPreview={true}
              positions={positions}
              coachName={coaches.selectedCoachIndex === 0 ? coaches.coach1Name : coaches.coach2Name}
            />
            {/* First Referee Card */}
            <RefereeCard
              players={players}
              gameInfo={gameInfo}
              isPrintPreview={true}
              positions={positions}
              coachName={coaches.selectedCoachIndex === 0 ? coaches.coach1Name : coaches.coach2Name}
            />
            {/* Second Referee Card (duplicate) */}
            <RefereeCard
              players={players}
              gameInfo={gameInfo}
              isPrintPreview={true}
              positions={positions}
              coachName={coaches.selectedCoachIndex === 0 ? coaches.coach1Name : coaches.coach2Name}
            />
          </div>
        </div>

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

  if (!gameInfo) {
    return (
      <div className="min-h-screen bg-[#1e293b] text-slate-100 font-[family-name:var(--font-inter)] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Game not found</h2>
          <Link
            href="/schedule"
            className="text-[#16a34a] hover:underline"
          >
            ← Back to Schedule
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1e293b] text-slate-100 font-[family-name:var(--font-inter)]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#1e293b]/95 backdrop-blur-sm border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link
                href="/"
                className="font-[family-name:var(--font-playfair)] text-2xl font-bold bg-gradient-to-r from-[#16a34a] to-[#22c55e] bg-clip-text text-transparent"
              >
                FlagFooty
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link
                href="/"
                className="text-slate-300 hover:text-[#16a34a] transition-colors duration-200"
              >
                Home
              </Link>
              <Link
                href="/roster"
                className="text-slate-300 hover:text-[#16a34a] transition-colors duration-200"
              >
                Roster
              </Link>
              <Link
                href="/schedule"
                className="text-slate-300 hover:text-[#16a34a] transition-colors duration-200"
              >
                Schedule
              </Link>
              <Link
                href="/positions"
                className="text-slate-300 hover:text-[#16a34a] transition-colors duration-200"
              >
                Positions
              </Link>
              <Link
                href="/archive"
                className="text-slate-300 hover:text-[#16a34a] transition-colors duration-200"
              >
                Archive
              </Link>
              <a
                href="/#signup"
                className="bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white px-6 py-2 rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(22,163,74,0.4)] transition-all duration-300"
              >
                Get Early Access
              </a>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-slate-300 hover:text-white"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-700/50">
            <div className="px-4 pt-2 pb-4 space-y-2">
              <Link
                href="/"
                className="block px-3 py-2 text-slate-300 hover:text-[#16a34a] hover:bg-slate-800/50 rounded-lg transition-all"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/roster"
                className="block px-3 py-2 text-slate-300 hover:text-[#16a34a] hover:bg-slate-800/50 rounded-lg transition-all"
                onClick={() => setMobileMenuOpen(false)}
              >
                Roster
              </Link>
              <Link
                href="/schedule"
                className="block px-3 py-2 text-slate-300 hover:text-[#16a34a] hover:bg-slate-800/50 rounded-lg transition-all"
                onClick={() => setMobileMenuOpen(false)}
              >
                Schedule
              </Link>
              <Link
                href="/positions"
                className="block px-3 py-2 text-slate-300 hover:text-[#16a34a] hover:bg-slate-800/50 rounded-lg transition-all"
                onClick={() => setMobileMenuOpen(false)}
              >
                Positions
              </Link>
              <Link
                href="/archive"
                className="block px-3 py-2 text-slate-300 hover:text-[#16a34a] hover:bg-slate-800/50 rounded-lg transition-all"
                onClick={() => setMobileMenuOpen(false)}
              >
                Archive
              </Link>
              <a
                href="/#signup"
                className="block px-3 py-2 text-center bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white rounded-lg font-semibold"
                onClick={() => setMobileMenuOpen(false)}
              >
                Get Early Access
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <div className="pt-24 px-4 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/schedule"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-[#16a34a] transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Schedule
            </Link>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl font-bold mb-4">
                  Game <span className="text-[#16a34a]">Lineup</span>
                </h1>
                <p className="text-slate-400 text-lg">
                  vs {gameInfo.opponent} • {new Date(gameInfo.date).toLocaleDateString()}
                  {gameInfo.time && ` • ${gameInfo.time}`}
                </p>
              </div>
              {isFinalized && (
                <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/50 rounded-lg">
                  <Check className="w-5 h-5 text-green-400" />
                  <span className="text-green-400 font-semibold">Finalized</span>
                </div>
              )}
            </div>
          </div>

          {/* Validation Errors */}
          {validation && validation.errors.length > 0 && (
            <div className="mb-8 bg-red-500/10 border border-red-500/30 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-red-400 mb-2">Errors - Must Fix Before Print/Export:</h3>
                  <ul className="space-y-1">
                    {validation.errors.map((error, idx) => (
                      <li key={idx} className="text-red-300 text-sm">
                        • {error}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Validation Warnings */}
          {validation && validation.warnings.length > 0 && (
            <div className="mb-8 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-yellow-400 mb-2">Warnings:</h3>
                  <ul className="space-y-1">
                    {validation.warnings.map((warning, idx) => (
                      <li key={idx} className="text-yellow-300 text-sm">
                        • {warning}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Lineup Warnings */}
          {lineup && lineup.warnings.length > 0 && (
            <div className="mb-8 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-yellow-400 mb-2">Lineup Warnings:</h3>
                  <ul className="space-y-1">
                    {lineup.warnings.map((warning, idx) => (
                      <li key={idx} className="text-yellow-300 text-sm">
                        • {warning}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mb-8 flex flex-wrap gap-4">
            <button
              onClick={generateLineup}
              className="flex items-center gap-2 bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(22,163,74,0.4)] transition-all duration-300"
            >
              <RefreshCw className="w-5 h-5" />
              {lineup ? 'Regenerate Lineup' : 'Generate Lineup'}
            </button>

            <button
              onClick={handlePrintPreview}
              disabled={!canPrintOrExport}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                canPrintOrExport
                  ? 'bg-slate-700 text-white hover:bg-slate-600'
                  : 'bg-slate-800 text-slate-600 cursor-not-allowed'
              }`}
            >
              <Eye className="w-5 h-5" />
              Print Preview
            </button>

            {canEdit && (
              <button
                onClick={handleFinalize}
                disabled={!canFinalize}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  canFinalize
                    ? 'bg-blue-600 text-white hover:bg-blue-500'
                    : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                }`}
              >
                <Check className="w-5 h-5" />
                Finalize Lineup
              </button>
            )}
          </div>

          {/* Lineup Display */}
          {!lineup ? (
            <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-12 text-center">
              <RefreshCw className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-400 mb-2">
                No Lineup Generated
              </h3>
              <p className="text-slate-500 mb-6">
                Click the button above to generate a fair-play lineup for this game.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {lineup.quarters.map((quarter) => (
                <div
                  key={quarter.quarter}
                  className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6 hover:border-[#16a34a]/30 transition-all"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-[family-name:var(--font-playfair)] text-2xl font-bold">
                      Quarter {quarter.quarter}
                    </h3>
                    {quarter.quarter === 4 && (
                      <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-semibold">
                        4Q LOCKS
                      </span>
                    )}
                  </div>

                  <div className="space-y-3">
                    {positions.map((position) => {
                      const player = quarter.positions[position];
                      return (
                        <div
                          key={position}
                          className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                            player
                              ? 'bg-slate-900/50 border border-slate-700/50'
                              : 'bg-slate-900/20 border border-slate-700/20'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#16a34a] to-[#22c55e] rounded-lg flex items-center justify-center font-bold text-white">
                              {position}
                            </div>
                            <div>
                              {player ? (
                                <>
                                  <p className="font-semibold text-white">
                                    {getPlayerName(player)}
                                  </p>
                                  <p className="text-xs text-slate-400">
                                    #{getPlayerNumber(player)}
                                  </p>
                                </>
                              ) : (
                                <p className="text-slate-500 italic">Empty</p>
                              )}
                            </div>
                          </div>
                          {player && player.fourthQuarterLock && quarter.quarter === 4 && (
                            <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs font-semibold">
                              LOCK
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Player Summary */}
          {lineup && (
            <div className="mt-8 bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
              <h3 className="font-[family-name:var(--font-playfair)] text-xl font-bold mb-4">
                Playing Time Summary
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {players.filter(p => p.play).map((player) => {
                  const quartersPlayed = lineup.quarters.filter(q =>
                    Object.values(q.positions).some(p => p?.id === player.id)
                  ).length;

                  return (
                    <div
                      key={player.id}
                      className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/30"
                    >
                      <p className="font-semibold text-sm text-white">
                        {getPlayerName(player)}
                      </p>
                      <p className="text-xs text-slate-400">
                        #{getPlayerNumber(player)}
                      </p>
                      <p className="text-sm text-[#22c55e] mt-2">
                        {quartersPlayed}/4 quarters
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="mt-8 bg-slate-800/20 border border-slate-700/50 rounded-xl p-6">
            <h3 className="font-semibold text-lg mb-3 text-[#22c55e]">
              Lineup Management Guide
            </h3>
            <ul className="space-y-2 text-slate-400">
              <li className="flex items-start gap-2">
                <span className="text-[#16a34a] mt-1">•</span>
                <span>
                  <strong className="text-slate-300">Generate Lineup:</strong> Creates a fair-play lineup automatically. Regenerate as needed.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#16a34a] mt-1">•</span>
                <span>
                  <strong className="text-slate-300">Print Preview:</strong> View and print Coach & Referee cards. Only available when all errors are fixed.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#16a34a] mt-1">•</span>
                <span>
                  <strong className="text-slate-300">Finalize Lineup:</strong> Archives the current lineup. New finalizations overwrite previous ones for the same game.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#16a34a] mt-1">•</span>
                <span>
                  <strong className="text-slate-300">Validation:</strong> Checks for errors (missing QB/C, too many 4Q Locks, duplicate jerseys) before allowing print/finalize.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

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
