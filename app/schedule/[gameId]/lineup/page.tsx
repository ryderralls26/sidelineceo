'use client';

import { useState, use, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Menu, X, RefreshCw, ArrowLeft, AlertTriangle, Printer, Check, Eye, Save, Share2, Download, Mail } from 'lucide-react';
import { LineupGenerator, Player, GeneratedLineup } from '@/lib/lineupGenerator';
import { LineupValidator } from '@/lib/validation';
import { StorageManager, CoachData, Team } from '@/lib/storage';
import { EditableGameCards } from '@/components/EditableGameCards';
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
  const [gameRoster, setGameRoster] = useState<Player[]>(DEFAULT_PLAYERS); // Game-specific roster (separate from master)
  const [positions, setPositions] = useState<string[]>([]);
  const [gameInfo, setGameInfo] = useState<{ opponent: string; date: string; location: string; field?: string; time?: string; fdl?: string; teamName?: string; division?: string; coachName?: string } | null>(null);
  const [coaches, setCoaches] = useState<CoachData>({
    coach1Name: 'Coach 1',
    coach2Name: 'Coach 2',
    selectedCoachIndex: 0,
  });
  const [team, setTeam] = useState<Team | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

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
        fdl: game.fdl || `FDL-${gameId}`, // Auto-generate if not set
        teamName: 'SidelineCEO', // Will be replaced with actual team data
        division: 'FR', // Will be replaced with actual team division
        coachName: '', // Will be replaced with coach name
      });
    }

    // Load master roster from localStorage
    const savedRoster = getRosterFromStorage();
    if (savedRoster.length > 0) {
      setPlayers(savedRoster);
      // Initialize game roster as a copy of master roster
      setGameRoster(JSON.parse(JSON.stringify(savedRoster)));
    }

    const savedPositions = getPositionAbbreviations();
    setPositions(savedPositions);

    // Load coach data
    const savedCoaches = StorageManager.getCoachData();
    setCoaches(savedCoaches);

    // Load team data for auto-population
    const teams = StorageManager.getAllTeams();
    if (teams.length > 0) {
      const activeTeam = teams[0]; // Get first team (in future, filter by user's team)
      setTeam(activeTeam);

      // Auto-populate team info
      setGameInfo(prev => prev ? {
        ...prev,
        teamName: activeTeam.name,
        division: activeTeam.division || 'FR',
        coachName: savedCoaches.selectedCoachIndex === 0 ? savedCoaches.coach1Name : savedCoaches.coach2Name,
        fdl: prev.fdl, // Preserve FDL#
      } : null);
    } else {
      // No team found, use coach data
      setGameInfo(prev => prev ? {
        ...prev,
        coachName: savedCoaches.selectedCoachIndex === 0 ? savedCoaches.coach1Name : savedCoaches.coach2Name,
        fdl: prev.fdl, // Preserve FDL#
      } : null);
    }

    // Check if this game is already finalized and load game-specific roster if it exists
    const finalized = StorageManager.getFinalizedGame(gameId);
    if (finalized) {
      setIsFinalized(true);
      // Load the finalized game roster
      if (finalized.roster) {
        setGameRoster(finalized.roster);
      }
      // Load the finalized lineup
      if (finalized.lineup) {
        setLineup(finalized.lineup);
      }
    }
  }, [gameId]);

  const generateLineup = () => {
    // Use game roster (not master roster) for lineup generation
    const generator = new LineupGenerator(gameRoster, positions);
    const result = generator.generate();
    setLineup(result);
  };

  // Save game-specific roster and lineup to database
  const saveGameRoster = useCallback(async () => {
    if (!lineup || !gameInfo) return;

    try {
      // Prepare data for API
      const gameLineupData = {
        gameId: gameId,
        teamId: team?.id || 'default-team',
        lineup: lineup,
        roster: gameRoster,
      };

      // Call upsert API
      const response = await fetch('/api/lineups/upsert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(gameLineupData),
      });

      if (!response.ok) {
        throw new Error('Failed to save game roster');
      }

      // Also save to localStorage as backup
      const existingData = localStorage.getItem('game_lineups');
      const allGameLineups = existingData ? JSON.parse(existingData) : {};
      allGameLineups[gameId] = { ...gameLineupData, gameInfo };
      localStorage.setItem('game_lineups', JSON.stringify(allGameLineups));

      setHasUnsavedChanges(false);
      alert('Game roster and lineup saved successfully!');
    } catch (error) {
      console.error('Failed to save game roster:', error);
      alert('Failed to save game roster. Please try again.');
    }
  }, [gameId, lineup, gameRoster, gameInfo, team]);

  // Load game-specific roster on mount from API
  useEffect(() => {
    const loadGameLineup = async () => {
      try {
        // Try loading from API first
        const response = await fetch(`/api/lineups/${gameId}`);
        if (response.ok) {
          const { data } = await response.json();
          if (data) {
            setGameRoster(data.roster);
            setLineup(data.lineup);
          }
        }
      } catch (error) {
        console.error('Failed to load game lineup from API:', error);
      }

      // Fallback to localStorage
      const existingData = localStorage.getItem('game_lineups');
      if (existingData) {
        const allGameLineups = JSON.parse(existingData);
        const savedGameLineup = allGameLineups[gameId];
        if (savedGameLineup && !lineup) {
          setGameRoster(savedGameLineup.roster);
          setLineup(savedGameLineup.lineup);
          if (savedGameLineup.gameInfo) {
            setGameInfo(prev => ({ ...prev, ...savedGameLineup.gameInfo }));
          }
        }
      }
    };

    loadGameLineup();
  }, [gameId]);

  const validation = lineup ? LineupValidator.validate(gameRoster, lineup) : null;

  // Handle game info changes from editable cards
  const handleGameInfoChange = useCallback((updatedGameInfo: any) => {
    setGameInfo(prev => ({ ...prev, ...updatedGameInfo }));
    setHasUnsavedChanges(true);
  }, []);

  // Handle player roster changes from editable cards
  const handlePlayersChange = useCallback((updatedPlayers: Player[]) => {
    setGameRoster(updatedPlayers);
    setHasUnsavedChanges(true);
  }, []);

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

  const handleDownloadPDF = () => {
    // Trigger browser print to PDF
    window.print();
    setShowShareMenu(false);
  };

  const handleEmailShare = () => {
    // Create referral mailto link (will be from Prompt 16, placeholder for now)
    const subject = encodeURIComponent(`SidelineCEO Game Card - ${gameInfo?.opponent || 'Game'}`);
    const body = encodeURIComponent(
      `Check out SidelineCEO - the smart way to manage youth flag football!\n\n` +
      `I'm using it for our team and thought you might be interested.\n\n` +
      `Visit: https://www.sidelinemgmt.space\n\n` +
      `Game Details:\n` +
      `- Date: ${gameInfo?.date ? new Date(gameInfo.date).toLocaleDateString() : 'TBD'}\n` +
      `- Opponent: ${gameInfo?.opponent || 'TBD'}\n` +
      `- Team: ${gameInfo?.teamName || 'SidelineCEO'}\n`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    setShowShareMenu(false);
  };

  const [showFinalizeModal, setShowFinalizeModal] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);

  const handleFinalize = async () => {
    if (!canFinalize || !lineup || !gameInfo || !team) {
      return;
    }

    setIsFinalizing(true);

    try {
      // Prepare card data snapshot
      const cardData = {
        lineup,
        gameRoster,
        gameInfo,
        positions,
      };

      // Prepare awards data (if any awards were configured - for now empty)
      const awards: Array<{
        playerId: number;
        awardName: string;
        notes?: string;
        awardedBy: string;
      }> = [];

      // Call finalization API
      const response = await fetch(`/api/games/${gameId}/finalize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cardData,
          finalScore: undefined, // Will be editable in archive
          awards,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to finalize game');
      }

      const result = await response.json();

      if (result.success) {
        setIsFinalized(true);
        setShowFinalizeModal(false);
        alert('Game card finalized successfully! Redirecting to Archive...');

        // Redirect to archive
        window.location.href = '/archive';
      } else {
        throw new Error(result.error || 'Failed to finalize game');
      }
    } catch (error) {
      console.error('Failed to finalize game:', error);
      alert('Failed to finalize game. Please try again.');
    } finally {
      setIsFinalizing(false);
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
            <h2 className="text-xl font-bold">Print Preview - Edit & Print Game Cards</h2>
            <div className="flex gap-3">
              {hasUnsavedChanges && (
                <button
                  onClick={saveGameRoster}
                  className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-500 transition-all duration-300"
                >
                  <Save className="w-5 h-5" />
                  Save Changes
                </button>
              )}

              {/* Share Button with Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="flex items-center gap-2 bg-slate-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-slate-600 transition-all duration-300"
                >
                  <Share2 className="w-5 h-5" />
                  Share
                </button>

                {showShareMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50">
                    <button
                      onClick={handleDownloadPDF}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left text-white hover:bg-slate-700 transition-colors rounded-t-lg"
                    >
                      <Download className="w-5 h-5" />
                      <span>Download PDF</span>
                    </button>
                    <button
                      onClick={handleEmailShare}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left text-white hover:bg-slate-700 transition-colors rounded-b-lg border-t border-slate-700"
                    >
                      <Mail className="w-5 h-5" />
                      <span>Email Referral</span>
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={handlePrint}
                className="flex items-center gap-2 bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(22,163,74,0.4)] transition-all duration-300"
              >
                <Printer className="w-5 h-5" />
                Print
              </button>
            </div>
          </div>
        </div>

        {/* Print Preview Content - 4 cards per page (2x2 grid) */}
        <div className="p-8 print:p-0">
          <div className="max-w-[8.5in] mx-auto">
            <EditableGameCards
              players={gameRoster}
              gameInfo={gameInfo}
              isPrintPreview={true}
              positions={positions}
              onGameInfoChange={handleGameInfoChange}
              onPlayersChange={handlePlayersChange}
            />
          </div>
        </div>

        {/* Print Styles for 8.5" x 11" Portrait */}
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
            .print\\:p-0 {
              padding: 0 !important;
            }
            .print\\:grid-cols-2 {
              grid-template-columns: repeat(2, 1fr) !important;
            }
            .print\\:gap-2 {
              gap: 0.125in !important;
            }
            /* Perforation lines between cards */
            .grid > div:nth-child(2) {
              border-left: 2px dashed #ccc !important;
            }
            .grid > div:nth-child(3),
            .grid > div:nth-child(4) {
              border-top: 2px dashed #ccc !important;
            }
            .grid > div:nth-child(4) {
              border-left: 2px dashed #ccc !important;
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
                SidelineCEO
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
                href="/mgmt"
                className="text-slate-300 hover:text-[#16a34a] transition-colors duration-200"
              >
                MGMT
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
                href="/mgmt"
                className="block px-3 py-2 text-slate-300 hover:text-[#16a34a] hover:bg-slate-800/50 rounded-lg transition-all"
                onClick={() => setMobileMenuOpen(false)}
              >
                MGMT
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

            {hasUnsavedChanges && lineup && (
              <button
                onClick={saveGameRoster}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-500 transition-all duration-300"
              >
                <Save className="w-5 h-5" />
                Save Game Roster
              </button>
            )}

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
              Edit & Print Cards
            </button>

            {canEdit && (
              <button
                onClick={() => setShowFinalizeModal(true)}
                disabled={!canFinalize}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  canFinalize
                    ? 'bg-blue-600 text-white hover:bg-blue-500'
                    : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                }`}
              >
                <Check className="w-5 h-5" />
                Finalize Card
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
                  <strong className="text-slate-300">Generate Lineup:</strong> Creates a fair-play lineup using the master roster. The lineup is saved separately for this game.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#16a34a] mt-1">•</span>
                <span>
                  <strong className="text-slate-300">Edit & Print Cards:</strong> Opens the editable Coach's Card preview. Edit game details (Team Name, Division, Coach, Opponent, etc.) and the Referee Card updates automatically. Print 4 cards on one 8.5" x 11" sheet.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#16a34a] mt-1">•</span>
                <span>
                  <strong className="text-slate-300">Save Game Roster:</strong> Saves your edits to this game's roster. Changes do NOT affect the master roster.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#16a34a] mt-1">•</span>
                <span>
                  <strong className="text-slate-300">Finalize Lineup:</strong> Archives the game with the current lineup and roster. View finalized games in the Archive.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#16a34a] mt-1">•</span>
                <span>
                  <strong className="text-slate-300">Auto-Population:</strong> Team Name, Division, and Coach Name are auto-filled from your Team setup and Coach settings.
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
            SidelineCEO
          </h3>
          <p className="text-slate-500 text-sm">
            &copy; {new Date().getFullYear()} SidelineCEO. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Finalize Modal */}
      {showFinalizeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-4">Finalize Game Card?</h3>
            <p className="text-slate-300 mb-6">
              Once finalized, this card will be locked and moved to the Archive. You can still reopen it to view and print, but editing will require unlocking.
            </p>
            <p className="text-slate-400 text-sm mb-6">
              Finalization will save the current lineup, roster, and all game data. Awards and quarters played will be recorded.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowFinalizeModal(false)}
                disabled={isFinalizing}
                className="flex-1 px-6 py-3 bg-slate-700 text-white rounded-lg font-semibold hover:bg-slate-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleFinalize}
                disabled={isFinalizing}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(22,163,74,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isFinalizing ? 'Finalizing...' : 'Finalize Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
