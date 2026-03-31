'use client';

import { useState, useEffect } from 'react';
import { Trophy, Star, Medal } from 'lucide-react';
import { StorageManager, Award } from '@/lib/storage';
import { getRosterFromStorage, Player } from '@/lib/types';
import { Navigation } from '@/components/Navigation';
import { useAuth } from '@/lib/AuthContext';

interface PlayerAwardCount {
  playerId: number;
  playerName: string;
  awardCounts: { [awardType: string]: number };
  totalAwards: number;
}

export default function AwardsPage() {
  const { canEdit } = useAuth();
  const [leaderboard, setLeaderboard] = useState<PlayerAwardCount[]>([]);
  const [awardTypes, setAwardTypes] = useState<string[]>([]);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = () => {
    const allAwards = StorageManager.getAllAwards();
    const roster = getRosterFromStorage();

    // Get unique award types
    const types = [...new Set(allAwards.map(a => a.awardType))];
    setAwardTypes(types);

    // Build leaderboard data
    const playerMap = new Map<number, PlayerAwardCount>();

    roster.forEach(player => {
      playerMap.set(player.id, {
        playerId: player.id,
        playerName: `${player.firstName} ${player.lastName}`,
        awardCounts: {},
        totalAwards: 0,
      });
    });

    // Count awards for each player
    allAwards.forEach(award => {
      const playerData = playerMap.get(award.playerId);
      if (playerData) {
        if (!playerData.awardCounts[award.awardType]) {
          playerData.awardCounts[award.awardType] = 0;
        }
        playerData.awardCounts[award.awardType]++;
        playerData.totalAwards++;
      }
    });

    // Convert to array and sort by total awards descending
    const leaderboardData = Array.from(playerMap.values())
      .filter(p => p.totalAwards > 0) // Only show players with awards
      .sort((a, b) => b.totalAwards - a.totalAwards);

    setLeaderboard(leaderboardData);
  };

  return (
    <div className="min-h-screen bg-[#1e293b] text-slate-100 font-[family-name:var(--font-inter)]">
      <Navigation />

      {/* Main Content */}
      <div className="pt-24 px-4 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Trophy className="w-10 h-10 text-[#16a34a]" />
              <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl font-bold">
                MVP Awards <span className="text-[#16a34a]">Leaderboard</span>
              </h1>
            </div>
            <p className="text-slate-400 text-lg">
              Track player achievements and awards throughout the season.
            </p>
          </div>

          {/* Leaderboard Table */}
          {leaderboard.length === 0 ? (
            <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-12 text-center">
              <Trophy className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-400 mb-2">
                No Awards Yet
              </h3>
              <p className="text-slate-500">
                Start awarding your players from the Schedule page.
              </p>
            </div>
          ) : (
            <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-800/50 border-b border-slate-700">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300 min-w-[60px] sticky left-0 bg-slate-800/50 z-10">
                        Rank
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300 min-w-[180px] sticky left-[60px] bg-slate-800/50 z-10">
                        Player Name
                      </th>
                      {awardTypes.map((type) => (
                        <th key={type} className="px-6 py-4 text-center text-sm font-semibold text-slate-300 min-w-[120px]">
                          {type}
                        </th>
                      ))}
                      <th className="px-6 py-4 text-center text-sm font-semibold text-[#16a34a] min-w-[100px]">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((player, index) => (
                      <tr
                        key={player.playerId}
                        className={`border-b border-slate-700/30 hover:bg-slate-800/30 transition-colors ${
                          index % 2 === 0 ? 'bg-slate-900/20' : ''
                        }`}
                      >
                        <td className="px-6 py-4 sticky left-0 bg-slate-900/40 z-10">
                          <div className="flex items-center justify-center">
                            {index === 0 && (
                              <Medal className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                            )}
                            {index === 1 && (
                              <Medal className="w-6 h-6 text-slate-300 fill-slate-300" />
                            )}
                            {index === 2 && (
                              <Medal className="w-6 h-6 text-orange-400 fill-orange-400" />
                            )}
                            {index > 2 && (
                              <span className="text-slate-400 font-semibold">{index + 1}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 sticky left-[60px] bg-slate-900/40 z-10">
                          <div className="flex items-center gap-2">
                            <Star className="w-5 h-5 text-[#16a34a]" />
                            <span className="font-semibold text-white">{player.playerName}</span>
                          </div>
                        </td>
                        {awardTypes.map((type) => (
                          <td key={type} className="px-6 py-4 text-center">
                            <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-bold ${
                              player.awardCounts[type] > 0
                                ? 'bg-[#16a34a]/20 text-[#22c55e]'
                                : 'bg-slate-800/50 text-slate-600'
                            }`}>
                              {player.awardCounts[type] || 0}
                            </span>
                          </td>
                        ))}
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center justify-center w-12 h-12 rounded-full font-bold text-lg bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white">
                            {player.totalAwards}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="mt-8 bg-slate-800/20 border border-slate-700/50 rounded-xl p-6">
            <h3 className="font-semibold text-lg mb-3 text-[#22c55e]">
              Leaderboard Guide
            </h3>
            <ul className="space-y-2 text-slate-400">
              <li className="flex items-start gap-2">
                <span className="text-[#16a34a] mt-1">•</span>
                <span>
                  <strong className="text-slate-300">Ranking:</strong> Players are sorted by total awards won (descending order).
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#16a34a] mt-1">•</span>
                <span>
                  <strong className="text-slate-300">Award Columns:</strong> Each column shows the count of a specific award type.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#16a34a] mt-1">•</span>
                <span>
                  <strong className="text-slate-300">Total:</strong> The total number of awards won by each player.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#16a34a] mt-1">•</span>
                <span>
                  <strong className="text-slate-300">Medals:</strong> Top 3 players receive gold, silver, and bronze medals.
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
