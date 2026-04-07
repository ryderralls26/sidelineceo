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
      <div className=\"min-h-screen bg-[#1e293b] text-slate-100\">
        <Navigation />
        <div className=\"pt-24 px-4 pb-12\">
          <div className=\"max-w-7xl mx-auto text-center\">
            <p className=\"text-slate-400\">Please select a team to view awards.</p>\n          </div>
        </div>
      </div>\n    );\n  }\n\n  return (\n    <div className=\"min-h-screen bg-[#1e293b] text-slate-100 font-[family-name:var(--font-inter)]\">\n      <Navigation />\n\n      {/* Main Content */}\n      <div className=\"pt-24 px-4 pb-12 animate-in fade-in duration-200\">\n        <div className=\"max-w-7xl mx-auto\">\n          {/* Header */}\n          <div className=\"mb-8\">\n            <div className=\"flex items-center gap-3 mb-4\">\n              <Trophy className=\"w-10 h-10 text-[#16a34a]\" />\n              <h1 className=\"font-[family-name:var(--font-playfair)] text-4xl md:text-5xl font-bold\">\n                Awards <span className=\"text-[#16a34a]\">System</span>\n              </h1>\n            </div>\n            <p className=\"text-slate-400 text-lg\">\n              Track player achievements and manage custom award types.\n            </p>\n          </div>\n\n          {/* Motivation Alerts */}\n          {motivationAlerts.length > 0 && (\n            <div className=\"mb-6 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4\">\n              <div className=\"flex items-start gap-3\">\n                <AlertCircle className=\"w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0\" />\n                <div className=\"flex-1\">\n                  <h3 className=\"font-semibold text-yellow-500 mb-2\">Motivation Reminder</h3>\n                  {motivationAlerts.map((alert, idx) => (\n                    <p key={idx} className=\"text-yellow-200/90 text-sm mb-1\">\n                      Great choice! Just a heads-up — <strong>{alert.playerName}</strong> has received the <strong>{alert.awardName}</strong> award {alert.consecutiveCount} times in a row.\n                      Consider spreading the recognition to keep all players motivated.\n                    </p>\n                  ))}\n                </div>\n              </div>\n            </div>\n          )}\n\n          {/* Manage Award Types Section */}\n          <div className=\"mb-8 bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6\">\n            <button\n              onClick={() => setShowManageTypes(!showManageTypes)}\n              className=\"flex items-center gap-2 text-lg font-semibold text-[#22c55e] hover:text-[#16a34a] transition-colors\"\n            >\n              <Star className=\"w-5 h-5\" />\n              Manage Award Types\n              <span className=\"text-sm text-slate-400 ml-2\">({awardTypes.length} types)</span>\n            </button>\n\n            {showManageTypes && (\n              <div className=\"mt-6 space-y-4\">\n                {/* Existing Award Types */}\n                <div className=\"grid grid-cols-1 md:grid-cols-2 gap-3\">\n                  {awardTypes.map((type) => (\n                    <div\n                      key={type.id}\n                      className=\"flex items-center justify-between bg-slate-900/40 rounded-lg p-3 border border-slate-700/30\"\n                    >\n                      <div className=\"flex-1\">\n                        <p className=\"font-semibold text-white\">{type.name}</p>\n                        {type.description && (\n                          <p className=\"text-sm text-slate-400\">{type.description}</p>\n                        )}\n                      </div>\n                      <button\n                        onClick={() => handleDeleteAwardType(type.id)}\n                        className=\"text-red-400 hover:text-red-300 transition-colors p-2\"\n                        title=\"Delete award type\"\n                      >\n                        <Trash2 className=\"w-4 h-4\" />\n                      </button>\n                    </div>\n                  ))}\n                </div>\n\n                {/* Add New Award Type */}\n                <div className=\"border-t border-slate-700/50 pt-4\">\n                  <h4 className=\"font-semibold text-slate-300 mb-3\">Add New Award Type</h4>\n                  <div className=\"flex flex-col md:flex-row gap-3\">\n                    <input\n                      type=\"text\"\n                      placeholder=\"Award name (e.g., Hustle Award)\"\n                      value={newAwardName}\n                      onChange={(e) => setNewAwardName(e.target.value)}\n                      className=\"flex-1 px-4 py-2 bg-slate-900/50 border border-slate-700/50 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-[#16a34a] transition-colors\"\n                    />\n                    <input\n                      type=\"text\"\n                      placeholder=\"Description (optional)\"\n                      value={newAwardDescription}\n                      onChange={(e) => setNewAwardDescription(e.target.value)}\n                      className=\"flex-1 px-4 py-2 bg-slate-900/50 border border-slate-700/50 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-[#16a34a] transition-colors\"\n                    />\n                    <button\n                      onClick={handleCreateAwardType}\n                      disabled={!newAwardName.trim()}\n                      className=\"px-6 py-2 bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2\"\n                    >\n                      <Plus className=\"w-4 h-4\" />\n                      Add\n                    </button>\n                  </div>\n                </div>\n              </div>\n            )}\n          </div>\n\n          {/* Awards Table */}\n          {loading ? (\n            <LoadingSkeleton rows={5} type=\"table\" />\n          ) : error ? (\n            <ErrorState message={error} onRetry={loadData} />\n          ) : playerSummaries.length === 0 ? (\n            <EmptyState\n              icon=\"🏆\"\n              message=\"No awards yet — finalize your first game card to start recognizing your players.\"\n              buttonLabel=\"View Schedule\"\n              buttonHref=\"/schedule\"\n            />\n          ) : (\n            <DataTable\n              columns={[\n                {\n                  key: 'playerName',\n                  label: 'Player Name',\n                  width: 'min-w-[200px]',\n                  render: (award: AwardWithDetails) => (\n                    <div className=\"flex items-center gap-3\">\n                      <Star className=\"w-5 h-5 text-[#16a34a]\" />\n                      <span className=\"font-semibold text-white\">\n                        {award.player.firstName} {award.player.lastName}\n                      </span>\n                      <span className=\"inline-flex items-center justify-center px-2 py-1 text-xs font-bold bg-[#16a34a]/20 text-[#22c55e] rounded-full\">\n                        {playerSummaries.find(p => p.playerId === award.player.id)?.totalAwards || 0}\n                      </span>\n                    </div>\n                  ),\n                },\n                {\n                  key: 'awardName',\n                  label: 'Award Type',\n                  width: 'min-w-[150px]',\n                  className: 'text-slate-300',\n                },\n                {\n                  key: 'gameDate',\n                  label: 'Game Date',\n                  width: 'min-w-[120px]',\n                  className: 'text-slate-400',\n                  render: (award: AwardWithDetails) => award.game.date,\n                },\n                {\n                  key: 'opponent',\n                  label: 'Opponent',\n                  width: 'min-w-[150px]',\n                  className: 'text-slate-400',\n                  render: (award: AwardWithDetails) => award.game.opponent,\n                },\n              ] as DataTableColumn<AwardWithDetails>[]}\n              data={awards}\n              getRowKey={(award) => award.id}\n            />\n          )}\n\n          {/* Info Box */}\n          <div className=\"mt-8 bg-slate-800/20 border border-slate-700/50 rounded-xl p-6\">\n            <h3 className=\"font-semibold text-lg mb-3 text-[#22c55e]\">\n              Awards System Guide\n            </h3>\n            <ul className=\"space-y-2 text-slate-400\">\n              <li className=\"flex items-start gap-2\">\n                <span className=\"text-[#16a34a] mt-1\">•</span>\n                <span>\n                  <strong className=\"text-slate-300\">Badge Count:</strong> The badge next to each player's name shows their total awards.\n                </span>\n              </li>\n              <li className=\"flex items-start gap-2\">\n                <span className=\"text-[#16a34a] mt-1\">•</span>\n                <span>\n                  <strong className=\"text-slate-300\">Award Types:</strong> Manage custom award types using the \"Manage Award Types\" section above.\n                </span>\n              </li>\n              <li className=\"flex items-start gap-2\">\n                <span className=\"text-[#16a34a] mt-1\">•</span>\n                <span>\n                  <strong className=\"text-slate-300\">Motivation Alert:</strong> You'll see a yellow banner if a player receives the same award 3+ times consecutively.\n                </span>\n              </li>\n              <li className=\"flex items-start gap-2\">\n                <span className=\"text-[#16a34a] mt-1\">•</span>\n                <span>\n                  <strong className=\"text-slate-300\">Game Awards:</strong> Awards are given when finalizing game cards on the Schedule page.\n                </span>\n              </li>\n            </ul>\n          </div>\n        </div>\n      </div>\n\n      {/* Footer */}\n      <footer className=\"py-12 px-4 border-t border-slate-800/50\">\n        <div className=\"max-w-7xl mx-auto text-center\">\n          <h3 className=\"font-[family-name:var(--font-playfair)] text-2xl font-bold mb-2 bg-gradient-to-r from-[#16a34a] to-[#22c55e] bg-clip-text text-transparent\">\n            FlagFooty\n          </h3>\n          <p className=\"text-slate-500 text-sm\">\n            &copy; {new Date().getFullYear()} FlagFooty. All rights reserved.\n          </p>\n        </div>\n      </footer>\n    </div>\n  );\n}\n