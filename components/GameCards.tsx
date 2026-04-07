'use client';

import { useState, useCallback } from 'react';
import { Player } from '@/lib/lineupGenerator';
import { LineupGenerator, GeneratedLineup } from '@/lib/lineupGenerator';

interface GameCardsProps {
  players: Player[];
  gameInfo: {
    opponent: string;
    date: string;
    location: string;
    field?: string;
    time?: string;
  };
  isPrintPreview?: boolean;
  positions?: string[];
  coachName?: string;
}

// Shared state interface
interface SharedCardState {
  teamName: string;
  editableCoachName: string;
  opponent: string;
  field: string;
  time: string;
  division: string;
}

// Wrapper component to manage shared state
export function GameCardsWithSharedState({ players, gameInfo, isPrintPreview, positions, coachName }: GameCardsProps) {
  // SINGLE SOURCE OF TRUTH: Shared state for both cards
  const [sharedState, setSharedState] = useState<SharedCardState>({
    teamName: 'FlagFooty',
    editableCoachName: coachName || 'Coach',
    opponent: gameInfo.opponent || '',
    field: gameInfo.field || 'TBD',
    time: gameInfo.time || 'TBD',
    division: 'FR'
  });

  // Generate lineup using the engine - shared across both cards
  const generator = new LineupGenerator(players, positions);
  const lineup: GeneratedLineup = generator.generate();

  // Memorized update function to ensure consistent reference
  const updateField = useCallback((field: keyof SharedCardState, value: string) => {
    setSharedState(prev => ({ ...prev, [field]: value }));
  }, []);

  // Create a key that changes whenever sharedState changes to force re-render
  const stateKey = JSON.stringify(sharedState);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
      <CoachCard
        key={`coach-${stateKey}`}
        players={players}
        gameInfo={gameInfo}
        isPrintPreview={isPrintPreview}
        positions={positions}
        lineup={lineup}
        sharedState={sharedState}
        updateField={updateField}
      />
      <RefereeCard
        key={`referee-${stateKey}`}
        players={players}
        gameInfo={gameInfo}
        isPrintPreview={isPrintPreview}
        positions={positions}
        lineup={lineup}
        sharedState={sharedState}
      />
    </div>
  );
}

interface CoachCardInternalProps extends GameCardsProps {
  lineup: GeneratedLineup;
  sharedState: SharedCardState;
  updateField: (field: keyof SharedCardState, value: string) => void;
}

export function CoachCard({
  players,
  gameInfo,
  isPrintPreview,
  positions,
  lineup,
  sharedState,
  updateField
}: CoachCardInternalProps) {

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Division options
  const divisions = ['KIND', 'FR', 'SOPH', 'JR', 'SR'];

  return (
    <div
      className={`bg-white text-slate-900 rounded-xl shadow-2xl overflow-hidden border-4 border-slate-900 ${
        isPrintPreview ? 'print:shadow-none' : ''
      }`}
      id="coach-card"
    >
      {/* Header - Friday Night Lights Style */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white px-6 py-5 text-center border-b-4 border-[#16a34a] shadow-lg">
        <div className="flex justify-end mb-2 print:hidden">
          <button onClick={() => window.print()} className="bg-[#16a34a] hover:bg-[#15803d] text-white text-xs font-bold py-1 px-3 rounded shadow transition-colors">
            Print Card
          </button>
        </div>
        <h3 className="font-[family-name:var(--font-playfair)] text-3xl font-bold tracking-wider uppercase">
          FlagFooty
        </h3>
        <p className="text-sm text-slate-300 mt-2 font-semibold tracking-wide">Coach&apos;s Card</p>
      </div>

      <div className="p-4 sm:p-6">
        {/* Game Info Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5 mb-6 text-sm border-b-4 border-slate-900 pb-5">
          <div className="space-y-1">
            <span className="font-bold uppercase text-xs text-slate-600 tracking-wide">Date:</span>
            <p className="text-lg font-bold text-slate-900">{formatDate(gameInfo.date)}</p>
          </div>
          <div className="space-y-1">
            <span className="font-bold uppercase text-xs text-slate-600 tracking-wide">Field:</span>
            <input
              type="text"
              value={sharedState.field}
              onChange={(e) => updateField('field', e.target.value)}
              className="text-base sm:text-lg font-bold text-slate-900 bg-transparent border-b border-slate-300 focus:border-[#16a34a] focus:outline-none w-full print:border-none min-h-[44px]"
            />
          </div>
          <div className="space-y-1">
            <span className="font-bold uppercase text-xs text-slate-600 tracking-wide">Game Time:</span>
            <input
              type="text"
              value={sharedState.time}
              onChange={(e) => updateField('time', e.target.value)}
              className="text-base sm:text-lg font-bold text-slate-900 bg-transparent border-b border-slate-300 focus:border-[#16a34a] focus:outline-none w-full print:border-none min-h-[44px]"
            />
          </div>
          <div className="space-y-1">
            <span className="font-bold uppercase text-xs text-slate-600 tracking-wide">Team Name:</span>
            <input
              type="text"
              value={sharedState.teamName}
              onChange={(e) => updateField('teamName', e.target.value)}
              className="text-base sm:text-lg font-bold text-slate-900 bg-transparent border-b border-slate-300 focus:border-[#16a34a] focus:outline-none w-full print:border-none min-h-[44px]"
            />
          </div>
          <div className="space-y-1">
            <span className="font-bold uppercase text-xs text-slate-600 tracking-wide">Coach&apos;s Name:</span>
            <input
              type="text"
              value={sharedState.editableCoachName}
              onChange={(e) => updateField('editableCoachName', e.target.value)}
              className="text-base sm:text-lg font-bold text-[#16a34a] bg-transparent border-b border-slate-300 focus:border-[#16a34a] focus:outline-none w-full print:border-none min-h-[44px]"
            />
          </div>
          <div className="space-y-1">
            <span className="font-bold uppercase text-xs text-slate-600 tracking-wide">Opponent:</span>
            <input
              type="text"
              value={sharedState.opponent}
              onChange={(e) => updateField('opponent', e.target.value)}
              className="text-base sm:text-lg font-bold text-slate-900 bg-transparent border-b border-slate-300 focus:border-[#16a34a] focus:outline-none w-full print:border-none min-h-[44px]"
            />
          </div>
          <div className="col-span-1 sm:col-span-2 space-y-1">
            <span className="font-bold uppercase text-xs text-slate-600 tracking-wide">Division:</span>
            <div className="flex gap-2 print:gap-1 flex-wrap">
              {divisions.map((div) => (
                <button
                  key={div}
                  type="button"
                  onClick={() => updateField('division', div)}
                  className={`px-3 py-1 min-h-[44px] min-w-[44px] rounded border-2 font-bold text-sm transition-all print:border ${
                    sharedState.division === div
                      ? 'bg-[#16a34a] text-white border-[#16a34a]'
                      : 'bg-white text-slate-700 border-slate-300'
                  }`}
                >
                  {div}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Quarters Table */}
        {lineup.quarters.length === 0 ? (
          <p className="text-slate-500 italic text-center py-8">
            No active players available
          </p>
        ) : (
          <div className="overflow-x-auto mb-6 -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full min-w-[640px] text-sm border-collapse border-3 border-slate-900 shadow-md">
              <thead>
                <tr className="bg-gradient-to-r from-slate-900 to-slate-800 text-white">
                  <th className="text-left py-4 px-4 font-bold border-r-2 border-slate-700 tracking-wide">#</th>
                  <th className="text-left py-4 px-4 font-bold border-r-2 border-slate-700 tracking-wide">Name</th>
                  <th className="text-center py-4 px-4 font-bold border-r-2 border-slate-700 tracking-wide">Q1</th>
                  <th className="text-center py-4 px-4 font-bold border-r-2 border-slate-700 tracking-wide">Q2</th>
                  <th className="text-center py-4 px-4 font-bold border-r-2 border-slate-700 tracking-wide">Q3</th>
                  <th className="text-center py-4 px-4 font-bold border-r-2 border-slate-700 tracking-wide">Q4</th>
                  <th className="text-center py-4 px-4 font-bold tracking-wide">Total</th>
                </tr>
              </thead>
              <tbody>
                {players.filter(p => p.play).map((player) => {
                  const quarterPositions = lineup.quarters.map(q => {
                    for (const [pos, p] of Object.entries(q.positions)) {
                      if (p?.id === player.id) return pos;
                    }
                    return null;
                  });
                  const quartersPlayed = quarterPositions.filter(p => p !== null).length;

                  return (
                    <tr key={player.id} className="border-b-2 border-slate-300 hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900 border-r-2 border-slate-300 bg-slate-100 text-base">{player.jerseyNumber || "—"}</td>
                      <td className="py-3 px-4 border-r-2 border-slate-300">
                        <div className="font-semibold text-slate-900">{player.nickname || `${player.firstName} ${player.lastName}`.trim() || "Unnamed"}</div>
                      </td>
                      {[0, 1, 2, 3].map((qIndex) => (
                        <td key={qIndex} className="text-center py-3 px-4 border-r-2 border-slate-300 bg-slate-50">
                          {quarterPositions[qIndex] ? (
                            <div className="font-bold text-slate-900 text-sm">{quarterPositions[qIndex]}</div>
                          ) : (
                            <div className="w-7 h-7 mx-auto"></div>
                          )}
                        </td>
                      ))}
                      <td className="text-center py-3 px-4 font-bold bg-slate-100 text-base">{quartersPlayed}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Score Section */}
        <div className="mb-5 border-3 border-slate-900 rounded-lg p-5 shadow-md bg-slate-50">
          <div className="grid grid-cols-5 gap-4 text-center">
            {[1, 2, 3, 4, "Total"].map((q) => (
              <div key={q} className="space-y-2">
                <span className="font-bold uppercase text-xs text-slate-600 block tracking-wide">{typeof q === "number" ? `Q${q}` : q}</span>
                <div className="border-b-3 border-slate-400 pb-2 font-bold text-xl">__</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer - FlagFooty Branding with QR Code */}
        <div className="flex items-center justify-between pt-4 border-t-2 border-slate-300" style={{ printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact' } as React.CSSProperties}>
          <span className="text-xs font-semibold text-slate-700">FlagFooty</span>
          <img
            src="https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=https://flagfooty.app"
            alt="FlagFooty QR Code"
            width={60}
            height={60}
          />
        </div>
      </div>
    </div>
  );
}

interface RefereeCardInternalProps extends GameCardsProps {
  lineup: GeneratedLineup;
  sharedState: SharedCardState;
}

export function RefereeCard({ players, gameInfo, isPrintPreview, positions, lineup, sharedState }: RefereeCardInternalProps) {
  const playerQuarterMap = new Map<number, number[]>();
  lineup.quarters.forEach((quarter) => {
    Object.values(quarter.positions).forEach((player) => {
      if (player) {
        const quarters = playerQuarterMap.get(player.id) || [];
        quarters.push(quarter.quarter);
        playerQuarterMap.set(player.id, quarters);
      }
    });
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const divisions = ['KIND', 'FR', 'SOPH', 'JR', 'SR'];

  return (
    <div className={`bg-white text-slate-900 rounded-xl shadow-2xl overflow-hidden border-4 border-slate-900 ${isPrintPreview ? 'print:shadow-none' : ''}`} id="referee-card">
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white px-6 py-5 text-center border-b-4 border-[#16a34a] shadow-lg">
        <div className="flex justify-end mb-2 print:hidden">
          <button onClick={() => window.print()} className="bg-[#16a34a] hover:bg-[#15803d] text-white text-xs font-bold py-1 px-3 rounded shadow transition-colors">
            Print Card
          </button>
        </div>
        <h3 className="font-[family-name:var(--font-playfair)] text-3xl font-bold tracking-wider uppercase">FlagFooty</h3>
        <p className="text-sm text-slate-300 mt-2 font-semibold tracking-wide">Official Game Card</p>
      </div>
      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5 mb-6 text-sm border-b-4 border-slate-900 pb-5">
          <div className="space-y-1">
            <span className="font-bold uppercase text-xs text-slate-600 tracking-wide">Date:</span>
            <p className="text-lg font-bold text-slate-900">{formatDate(gameInfo.date)}</p>
          </div>
          <div className="space-y-1">
            <span className="font-bold uppercase text-xs text-slate-600 tracking-wide">Field:</span>
            <p className="text-lg font-bold text-slate-900">{sharedState.field}</p>
          </div>
          <div className="space-y-1">
            <span className="font-bold uppercase text-xs text-slate-600 tracking-wide">Game Time:</span>
            <p className="text-lg font-bold text-slate-900">{sharedState.time}</p>
          </div>
          <div className="space-y-1">
            <span className="font-bold uppercase text-xs text-slate-600 tracking-wide">Team Name:</span>
            <p className="text-lg font-bold text-slate-900">{sharedState.teamName}</p>
          </div>
          <div className="space-y-1">
            <span className="font-bold uppercase text-xs text-slate-600 tracking-wide">Coach&apos;s Name:</span>
            <p className="text-lg font-bold text-[#16a34a]">{sharedState.editableCoachName}</p>
          </div>
          <div className="space-y-1">
            <span className="font-bold uppercase text-xs text-slate-600 tracking-wide">Opponent:</span>
            <p className="text-lg font-bold text-slate-900">{sharedState.opponent}</p>
          </div>
          <div className="col-span-1 sm:col-span-2 space-y-1">
            <span className="font-bold uppercase text-xs text-slate-600 tracking-wide">Division:</span>
            <div className="flex gap-2 flex-wrap">
              {divisions.map((div) => (
                <div key={div} className={`px-3 py-1 min-h-[44px] min-w-[44px] flex items-center justify-center rounded border-2 font-bold text-sm ${sharedState.division === div ? 'bg-[#16a34a] text-white border-[#16a34a]' : 'bg-white text-slate-300 border-slate-300'}`}>{div}</div>
              ))}
            </div>
          </div>
        </div>
        {players.filter(p => p.play).length === 0 ? (
          <p className="text-slate-500 italic text-center py-8">No active players</p>
        ) : (
          <div className="overflow-x-auto mb-6 -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full min-w-[640px] text-sm border-collapse border-3 border-slate-900 shadow-md">
              <thead>
                <tr className="bg-gradient-to-r from-slate-900 to-slate-800 text-white">
                  <th className="text-left py-4 px-4 font-bold border-r-2 border-slate-700 tracking-wide">#</th>
                  <th className="text-left py-4 px-4 font-bold border-r-2 border-slate-700 tracking-wide">Name</th>
                  <th className="text-center py-4 px-4 font-bold border-r-2 border-slate-700 tracking-wide">Q1</th>
                  <th className="text-center py-4 px-4 font-bold border-r-2 border-slate-700 tracking-wide">Q2</th>
                  <th className="text-center py-4 px-4 font-bold border-r-2 border-slate-700 tracking-wide">Q3</th>
                  <th className="text-center py-4 px-4 font-bold border-r-2 border-slate-700 tracking-wide">Q4</th>
                  <th className="text-center py-4 px-4 font-bold tracking-wide">Total</th>
                </tr>
              </thead>
              <tbody>
                {players.filter(p => p.play).map((player) => {
                  const quartersPlayed = playerQuarterMap.get(player.id) || [];
                  return (
                    <tr key={player.id} className="border-b-2 border-slate-300 hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900 border-r-2 border-slate-300 bg-slate-100 text-base">{player.jerseyNumber || "—"}</td>
                      <td className="py-3 px-4 border-r-2 border-slate-300">
                        <div className="font-semibold text-slate-900">{player.nickname || `${player.firstName} ${player.lastName}`.trim() || "Unnamed"}</div>
                      </td>
                      {[1, 2, 3, 4].map((q) => (
                        <td key={q} className="text-center py-3 px-4 border-r-2 border-slate-300 bg-slate-50">
                          {quartersPlayed.includes(q) ? <div className="w-7 h-7 mx-auto flex items-center justify-center font-bold text-slate-900 text-xl">X</div> : <div className="w-7 h-7 mx-auto"></div>}
                        </td>
                      ))}
                      <td className="text-center py-3 px-4 font-bold bg-slate-100 text-base">{quartersPlayed.length}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <div className="mb-5 border-3 border-slate-900 rounded-lg p-5 shadow-md bg-slate-50">
          <div className="grid grid-cols-5 gap-4 text-center">
            {[1, 2, 3, 4, "Total"].map((q) => (
              <div key={q} className="space-y-2">
                <span className="font-bold uppercase text-xs text-slate-600 block tracking-wide">{typeof q === "number" ? `Q${q}` : q}</span>
                <div className="border-b-3 border-slate-400 pb-2 font-bold text-xl">__</div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between pt-4 border-t-2 border-slate-300" style={{ printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact' } as React.CSSProperties}>
          <span className="text-xs font-semibold text-slate-700">FlagFooty</span>
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=https://flagfooty.app" alt="FlagFooty QR Code" width={60} height={60} />
        </div>
      </div>
    </div>
  );
}