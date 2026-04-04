'use client';

import { useState, useEffect } from 'react';
import { Star, Trophy, Calendar, Award, Trash2 } from 'lucide-react';
import { StorageManager, Award as AwardType } from '@/lib/storage';
import { getRosterFromStorage, Player } from '@/lib/types';
import { Navigation } from '@/components/Navigation';
import { useAuth } from '@/lib/AuthContext';

export default function MVPPage() {
  const { canEdit } = useAuth();
  const [awards, setAwards] = useState<AwardType[]>([]);
  const [roster, setRoster] = useState<Player[]>([]);
  const [games, setGames] = useState<Map<number, { opponent: string; date: string }>>(new Map());
  const [refreshKey, setRefreshKey] = useState(0);

  const loadData = () => {
    // Load all awards
    const allAwards = StorageManager.getAllAwards();
    setAwards(allAwards);

    // Load roster
    const rosterData = getRosterFromStorage();
    setRoster(rosterData);

    // Load game data
    const gamesList = StorageManager.getAllGames();
    const gamesMap = new Map(
      gamesList.map(g => [g.id, { opponent: g.opponent, date: g.date }])
    );
    setGames(gamesMap);
  };

  useEffect(() => {
    loadData();
  }, [refreshKey]);

  // Reload data when window gains focus (user navigates back to page)
  useEffect(() => {
    const handleFocus = () => {
      loadData();
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'player_awards') {
        loadData();
      }
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('storage', handleStorageChange);

    // Also poll periodically for local changes (storage events don't fire in same window)
    const interval = setInterval(() => {
      loadData();
    }, 2000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const getPlayerName = (playerId: number) => {
    const player = roster.find(p => p.id === playerId);
    if (player) {
      return `#${player.jerseyNumber} ${player.firstName} ${player.lastName}`;
    }
    return `Player #${playerId}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleDeleteAward = (awardId: string) => {
    if (confirm('Are you sure you want to delete this award?')) {
      StorageManager.deleteAward(awardId);
      setAwards(awards.filter(a => a.id !== awardId));
    }
  };

  // Group awards by player
  const awardsByPlayer = awards.reduce((acc, award) => {
    const playerName = getPlayerName(award.playerId);
    if (!acc[playerName]) {
      acc[playerName] = [];
    }
    acc[playerName].push(award);
    return acc;
  }, {} as Record<string, AwardType[]>);

  return (
    <div className="min-h-screen bg-[#1e293b] text-slate-100 font-[family-name:var(--font-inter)]">
      <Navigation />

      {/* Main Content */}
      <div className="pt-24 px-4 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl font-bold mb-4 flex items-center gap-3">
              <Star className="w-10 h-10 text-yellow-400" />
              MVP & <span className="text-[#16a34a]">Awards</span>
            </h1>
            <p className="text-slate-400 text-lg">
              All awarded players across all games.
            </p>
          </div>

          {/* Awards Summary */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-slate-800/30 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50">
              <div className="flex items-center gap-3 mb-2">
                <Trophy className="w-6 h-6 text-yellow-400" />
                <h3 className="text-lg font-semibold">Total Awards</h3>
              </div>
              <p className="text-3xl font-bold text-[#16a34a]">{awards.length}</p>
            </div>

            <div className="bg-slate-800/30 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50">
              <div className="flex items-center gap-3 mb-2">
                <Star className="w-6 h-6 text-yellow-400" />
                <h3 className="text-lg font-semibold">Players Awarded</h3>
              </div>
              <p className="text-3xl font-bold text-[#16a34a]">
                {Object.keys(awardsByPlayer).length}
              </p>
            </div>

            <div className="bg-slate-800/30 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-6 h-6 text-yellow-400" />
                <h3 className="text-lg font-semibold">Games with Awards</h3>
              </div>
              <p className="text-3xl font-bold text-[#16a34a]">
                {new Set(awards.map(a => a.gameId)).size}
              </p>
            </div>
          </div>

          {/* Awards List */}
          <div className="space-y-6">
            {awards.length === 0 ? (
              <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-12 text-center">
                <Award className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-400 mb-2">
                  No Awards Yet
                </h3>
                <p className="text-slate-500">
                  Awards will appear here when coaches award players from the Schedule page.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {awards
                  .sort((a, b) => new Date(b.awardedAt).getTime() - new Date(a.awardedAt).getTime())
                  .map((award) => {
                    const gameInfo = games.get(award.gameId);
                    return (
                      <div
                        key={award.id}
                        className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6 hover:border-yellow-400/50 transition-all duration-300"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-3 flex-wrap">
                              <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                              <h3 className="text-xl font-bold text-white">
                                {getPlayerName(award.playerId)}
                              </h3>
                              <span className="px-3 py-1 rounded-full text-sm font-semibold bg-yellow-500/20 text-yellow-400">
                                {award.awardType}
                              </span>
                            </div>

                            <div className="flex items-center gap-4 text-slate-400 text-sm flex-wrap">
                              <div className="flex items-center gap-2">
                                <Trophy className="w-4 h-4" />
                                <span>
                                  {gameInfo ? `vs ${gameInfo.opponent}` : `Game #${award.gameId}`}
                                </span>
                              </div>
                              {gameInfo && (
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4" />
                                  <span>{formatDate(gameInfo.date)}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-2">
                                <span className="text-slate-500">•</span>
                                <span>Awarded {formatDate(award.awardedAt)}</span>
                              </div>
                            </div>

                            {award.notes && (
                              <div className="mt-2 p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
                                <p className="text-slate-300 text-sm italic">&quot;{award.notes}&quot;</p>
                              </div>
                            )}
                          </div>

                          {canEdit && (
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => handleDeleteAward(award.id)}
                                className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800/50 rounded-lg transition-all"
                                title="Delete award"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
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
    </div>
  );
}
