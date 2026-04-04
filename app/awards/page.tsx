'use client';

import { useState, useEffect } from 'react';
import { Trophy, Star, Plus, Trash2, AlertCircle } from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { useAuth } from '@/lib/AuthContext';
import { getAwardsByTeam, getAwardTypes, createAwardType, deleteAwardType } from '@/lib/actions/awards';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ErrorState } from '@/components/ErrorState';
import { DataTable, DataTableColumn } from '@/components/DataTable';

interface AwardWithDetails {
  id: string;
  awardName: string;
  createdAt: Date;
  player: {
    id: number;
    firstName: string;
    lastName: string;
  };
  game: {
    id: number;
    date: string;
    opponent: string;
  };
}

interface PlayerAwardSummary {
  playerId: number;
  playerName: string;
  awards: {
    id: string;
    awardName: string;
    gameDate: string;
    opponent: string;
  }[];
  totalAwards: number;
  awardTypeCounts: Record<string, number>;
}

interface AwardType {
  id: string;
  name: string;
  description?: string | null;
}

interface MotivationAlert {
  playerId: number;
  playerName: string;
  awardName: string;
  consecutiveCount: number;
}

export default function AwardsPage() {
  const { session } = useAuth();
  const [awards, setAwards] = useState<AwardWithDetails[]>([]);
  const [playerSummaries, setPlayerSummaries] = useState<PlayerAwardSummary[]>([]);
  const [awardTypes, setAwardTypes] = useState<AwardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showManageTypes, setShowManageTypes] = useState(false);
  const [newAwardName, setNewAwardName] = useState('');
  const [newAwardDescription, setNewAwardDescription] = useState('');
  const [motivationAlerts, setMotivationAlerts] = useState<MotivationAlert[]>([]);

  useEffect(() => {
    if (session?.activeTeamId) {
      loadData();
    }
  }, [session?.activeTeamId]);

  const loadData = async () => {
    if (!session?.activeTeamId) return;

    setLoading(true);
    setError(null);
    try {
      // Load awards
      const awardsResult = await getAwardsByTeam(session.activeTeamId, session.userId);
      if (awardsResult.success && awardsResult.awards) {
        const awardsData = awardsResult.awards.map((award: any) => ({
          id: award.id,
          awardName: award.awardName,
          createdAt: new Date(award.createdAt),
          player: {
            id: award.player.id,
            firstName: award.player.firstName,
            lastName: award.player.lastName,
          },
          game: {
            id: award.game.id,
            date: award.game.date,
            opponent: award.game.opponent,
          },
        }));
        setAwards(awardsData);
        processAwardsData(awardsData);
      } else {
        setError(awardsResult.error || 'Failed to load awards');
      }

      // Load award types
      const typesResult = await getAwardTypes(session.activeTeamId, session.userId);
      if (typesResult.success && typesResult.awardTypes) {
        setAwardTypes(typesResult.awardTypes);
      } else {
        setError(typesResult.error || 'Failed to load award types');
      }
    } catch (err) {
      console.error('Failed to load awards data:', err);
      setError('An unexpected error occurred while loading awards');
    } finally {
      setLoading(false);
    }
  };

  const processAwardsData = (awardsData: AwardWithDetails[]) => {
    // Group awards by player
    const playerMap = new Map<number, PlayerAwardSummary>();

    awardsData.forEach((award) => {
      const playerId = award.player.id;
      if (!playerMap.has(playerId)) {
        playerMap.set(playerId, {
          playerId,
          playerName: `${award.player.firstName} ${award.player.lastName}`,
          awards: [],
          totalAwards: 0,
          awardTypeCounts: {},
        });
      }

      const summary = playerMap.get(playerId)!;
      summary.awards.push({
        id: award.id,
        awardName: award.awardName,
        gameDate: award.game.date,
        opponent: award.game.opponent,
      });
      summary.totalAwards++;
      summary.awardTypeCounts[award.awardName] = (summary.awardTypeCounts[award.awardName] || 0) + 1;
    });

    // Sort awards by date for each player to detect consecutive awards
    playerMap.forEach((summary) => {
      summary.awards.sort((a, b) => new Date(b.gameDate).getTime() - new Date(a.gameDate).getTime());
    });

    // Detect consecutive awards (3+)
    const alerts: MotivationAlert[] = [];
    playerMap.forEach((summary) => {
      Object.entries(summary.awardTypeCounts).forEach(([awardName, count]) => {
        // Check if this player has 3+ consecutive awards of the same type
        const consecutiveCount = checkConsecutiveAwards(summary.awards, awardName);
        if (consecutiveCount >= 3) {
          alerts.push({
            playerId: summary.playerId,
            playerName: summary.playerName,
            awardName,
            consecutiveCount,
          });
        }
      });
    });

    setPlayerSummaries(Array.from(playerMap.values()));
    setMotivationAlerts(alerts);
  };

  const checkConsecutiveAwards = (awards: any[], awardName: string): number => {
    let consecutive = 0;
    for (let i = 0; i < awards.length; i++) {
      if (awards[i].awardName === awardName) {
        consecutive++;
        // Check if the next award is also the same type
        if (i + 1 < awards.length && awards[i + 1].awardName !== awardName) {
          break;
        }
      } else {
        break;
      }
    }
    return consecutive;
  };

  const handleCreateAwardType = async () => {
    if (!session?.activeTeamId || !newAwardName.trim()) return;

    try {
      const result = await createAwardType(session.activeTeamId, newAwardName.trim(), newAwardDescription.trim() || undefined, session.userId);
      if (result.success) {
        setNewAwardName('');
        setNewAwardDescription('');
        loadData();
      }
    } catch (error) {
      console.error('Failed to create award type:', error);
    }
  };

  const handleDeleteAwardType = async (id: string) => {
    if (!session?.userId) return;

    try {
      const result = await deleteAwardType(id, session.userId);
      if (result.success) {
        loadData();
      }
    } catch (error) {
      console.error('Failed to delete award type:', error);
    }
  };

  if (!session?.activeTeamId) {
    return (
      <div className="min-h-screen bg-[#1e293b] text-slate-100">
        <Navigation />
        <div className="pt-24 px-4 pb-12">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-slate-400">Please select a team to view awards.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1e293b] text-slate-100 font-[family-name:var(--font-inter)]">
      <Navigation />

      {/* Main Content */}
      <div className="pt-24 px-4 pb-12 animate-in fade-in duration-200">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Trophy className="w-10 h-10 text-[#16a34a]" />
              <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl font-bold">
                Awards <span className="text-[#16a34a]">System</span>
              </h1>
            </div>
            <p className="text-slate-400 text-lg">
              Track player achievements and manage custom award types.
            </p>
          </div>

          {/* Motivation Alerts */}
          {motivationAlerts.length > 0 && (
            <div className="mb-6 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-yellow-500 mb-2">Motivation Reminder</h3>
                  {motivationAlerts.map((alert, idx) => (
                    <p key={idx} className="text-yellow-200/90 text-sm mb-1">
                      Great choice! Just a heads-up — <strong>{alert.playerName}</strong> has received the <strong>{alert.awardName}</strong> award {alert.consecutiveCount} times in a row.
                      Consider spreading the recognition to keep all players motivated.
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Manage Award Types Section */}
          <div className="mb-8 bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
            <button
              onClick={() => setShowManageTypes(!showManageTypes)}
              className="flex items-center gap-2 text-lg font-semibold text-[#22c55e] hover:text-[#16a34a] transition-colors"
            >
              <Star className="w-5 h-5" />
              Manage Award Types
              <span className="text-sm text-slate-400 ml-2">({awardTypes.length} types)</span>
            </button>

            {showManageTypes && (
              <div className="mt-6 space-y-4">
                {/* Existing Award Types */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {awardTypes.map((type) => (
                    <div
                      key={type.id}
                      className="flex items-center justify-between bg-slate-900/40 rounded-lg p-3 border border-slate-700/30"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-white">{type.name}</p>
                        {type.description && (
                          <p className="text-sm text-slate-400">{type.description}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteAwardType(type.id)}
                        className="text-red-400 hover:text-red-300 transition-colors p-2"
                        title="Delete award type"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add New Award Type */}
                <div className="border-t border-slate-700/50 pt-4">
                  <h4 className="font-semibold text-slate-300 mb-3">Add New Award Type</h4>
                  <div className="flex flex-col md:flex-row gap-3">
                    <input
                      type="text"
                      placeholder="Award name (e.g., Hustle Award)"
                      value={newAwardName}
                      onChange={(e) => setNewAwardName(e.target.value)}
                      className="flex-1 px-4 py-2 bg-slate-900/50 border border-slate-700/50 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-[#16a34a] transition-colors"
                    />
                    <input
                      type="text"
                      placeholder="Description (optional)"
                      value={newAwardDescription}
                      onChange={(e) => setNewAwardDescription(e.target.value)}
                      className="flex-1 px-4 py-2 bg-slate-900/50 border border-slate-700/50 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-[#16a34a] transition-colors"
                    />
                    <button
                      onClick={handleCreateAwardType}
                      disabled={!newAwardName.trim()}
                      className="px-6 py-2 bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Awards Table */}
          {loading ? (
            <LoadingSkeleton rows={5} type="table" />
          ) : error ? (
            <ErrorState message={error} onRetry={loadData} />
          ) : playerSummaries.length === 0 ? (
            <EmptyState
              icon="🏆"
              message="No awards yet — finalize your first game card to start recognizing your players."
              buttonLabel="View Schedule"
              buttonHref="/schedule"
            />
          ) : (
            <DataTable
              columns={[
                {
                  key: 'playerName',
                  label: 'Player Name',
                  width: 'min-w-[200px]',
                  render: (award: AwardWithDetails) => (
                    <div className="flex items-center gap-3">
                      <Star className="w-5 h-5 text-[#16a34a]" />
                      <span className="font-semibold text-white">
                        {award.player.firstName} {award.player.lastName}
                      </span>
                      <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold bg-[#16a34a]/20 text-[#22c55e] rounded-full">
                        {playerSummaries.find(p => p.playerId === award.player.id)?.totalAwards || 0}
                      </span>
                    </div>
                  ),
                },
                {
                  key: 'awardName',
                  label: 'Award Type',
                  width: 'min-w-[150px]',
                  className: 'text-slate-300',
                },
                {
                  key: 'gameDate',
                  label: 'Game Date',
                  width: 'min-w-[120px]',
                  className: 'text-slate-400',
                  render: (award: AwardWithDetails) => award.game.date,
                },
                {
                  key: 'opponent',
                  label: 'Opponent',
                  width: 'min-w-[150px]',
                  className: 'text-slate-400',
                  render: (award: AwardWithDetails) => award.game.opponent,
                },
              ] as DataTableColumn<AwardWithDetails>[]}
              data={awards}
              getRowKey={(award) => award.id}
            />
          )}

          {/* Info Box */}
          <div className="mt-8 bg-slate-800/20 border border-slate-700/50 rounded-xl p-6">
            <h3 className="font-semibold text-lg mb-3 text-[#22c55e]">
              Awards System Guide
            </h3>
            <ul className="space-y-2 text-slate-400">
              <li className="flex items-start gap-2">
                <span className="text-[#16a34a] mt-1">•</span>
                <span>
                  <strong className="text-slate-300">Badge Count:</strong> The badge next to each player's name shows their total awards.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#16a34a] mt-1">•</span>
                <span>
                  <strong className="text-slate-300">Award Types:</strong> Manage custom award types using the "Manage Award Types" section above.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#16a34a] mt-1">•</span>
                <span>
                  <strong className="text-slate-300">Motivation Alert:</strong> You'll see a yellow banner if a player receives the same award 3+ times consecutively.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#16a34a] mt-1">•</span>
                <span>
                  <strong className="text-slate-300">Game Awards:</strong> Awards are given when finalizing game cards on the Schedule page.
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
    </div>
  );
}
