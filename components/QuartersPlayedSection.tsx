'use client';

import { useState, useEffect } from 'react';
import { Clock, Users } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { EmptyState } from '@/components/EmptyState';

interface QuartersPlayedPlayer {
  playerId: number;
  playerName: string;
  totalQuarters: number;
  gamesPlayed: number;
  avgQuartersPerGame: number;
}

interface QuartersPlayedData {
  players: QuartersPlayedPlayer[];
  teamAverage: number;
}

interface QuartersPlayedSectionProps {
  teamId: string;
}

export function QuartersPlayedSection({ teamId }: QuartersPlayedSectionProps) {
  const { isCoach, session } = useAuth();
  const [data, setData] = useState<QuartersPlayedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isCoach || !teamId) {
      setLoading(false);
      return;
    }

    async function fetchData() {
      try {
        const response = await fetch(`/api/quarters-played?teamId=${teamId}`);
        const result = await response.json();

        if (result.success) {
          setData(result.data);
        } else {
          setError(result.error || 'Failed to load quarters played data');
        }
      } catch (err) {
        console.error('Error fetching quarters played:', err);
        setError('Failed to load quarters played data');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [isCoach, teamId]);

  // Only show this section to coaches
  if (!isCoach) {
    return null;
  }

  if (loading) {
    return (
      <div className="mt-12">
        <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8 text-center">
          <div className="animate-pulse">
            <Clock className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">Loading quarters played data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-12">
        <div className="bg-red-900/20 backdrop-blur-sm rounded-2xl border border-red-700/50 p-8 text-center">
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!data || data.players.length === 0) {
    return (
      <div className="mt-12">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-8 h-8 text-[#16a34a]" />
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold">
              Quarters <span className="text-[#16a34a]">Played</span>
            </h2>
          </div>
          <p className="text-[#22c55e] text-base font-medium mb-2">
            Every player deserves to play. Use this tracker to keep playing time fair all season long.
          </p>
        </div>
        <EmptyState
          icon="⏱️"
          message="No playing time data yet — it will populate automatically when you finalize your first game card."
        />
      </div>
    );
  }

  return (
    <div className="mt-12">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Clock className="w-8 h-8 text-[#16a34a]" />
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold">
            Quarters <span className="text-[#16a34a]">Played</span>
          </h2>
        </div>
        <p className="text-[#22c55e] text-base font-medium mb-2">
          Every player deserves to play. Use this tracker to keep playing time fair all season long.
        </p>
        <p className="text-slate-400 text-sm">
          Team Average: <span className="font-semibold text-white">{data.teamAverage.toFixed(1)} quarters</span>
        </p>
      </div>

      {/* Table */}
      <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-800/50 border-b border-slate-700">
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                  Player Name
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-300">
                  Total Quarters Played
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-300">
                  Games Played
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-300">
                  Avg Quarters Per Game
                </th>
              </tr>
            </thead>
            <tbody>
              {data.players.map((player, index) => {
                // Highlight if player's total quarters is more than 2 below team average
                const isBelowAverage = player.totalQuarters < (data.teamAverage - 2);

                return (
                  <tr
                    key={player.playerId}
                    className={`border-b border-slate-700/30 hover:bg-slate-800/30 transition-colors ${
                      index % 2 === 0 ? 'bg-slate-900/20' : ''
                    } ${
                      isBelowAverage ? 'bg-yellow-100/10 hover:bg-yellow-100/15' : ''
                    }`}
                  >
                    <td className="px-6 py-4">
                      <span className={`font-semibold ${isBelowAverage ? 'text-yellow-200' : 'text-white'}`}>
                        {player.playerName}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center justify-center min-w-[40px] font-bold ${
                        isBelowAverage ? 'text-yellow-300' : 'text-slate-200'
                      }`}>
                        {player.totalQuarters}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-slate-300">{player.gamesPlayed}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-slate-300">{player.avgQuartersPerGame.toFixed(1)}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-slate-800/20 border border-slate-700/50 rounded-xl p-6">
        <h3 className="font-semibold text-lg mb-3 text-[#22c55e]">
          Playing Time Guide
        </h3>
        <ul className="space-y-2 text-slate-400">
          <li className="flex items-start gap-2">
            <span className="text-[#16a34a] mt-1">•</span>
            <span>
              <strong className="text-slate-300">Fair Play:</strong> Every player should get approximately equal playing time throughout the season.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#16a34a] mt-1">•</span>
            <span>
              <strong className="text-slate-300">Highlighted Rows:</strong> Players highlighted in yellow have played more than 2 quarters below the team average.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#16a34a] mt-1">•</span>
            <span>
              <strong className="text-slate-300">Action:</strong> Prioritize giving these players more playing time in upcoming games.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#16a34a] mt-1">•</span>
            <span>
              <strong className="text-slate-300">Data Source:</strong> This tracker automatically updates when you finalize games from the Schedule page.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
