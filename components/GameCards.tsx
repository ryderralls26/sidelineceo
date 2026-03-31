'use client';

import { useState } from 'react';
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

export function CoachCard({ players, gameInfo, isPrintPreview, positions, coachName }: GameCardsProps) {
  // Generate lineup using the engine
  const generator = new LineupGenerator(players, positions);
  const lineup: GeneratedLineup = generator.generate();

  // Editable fields state
  const [teamName, setTeamName] = useState('FlagFooty');
  const [editableCoachName, setEditableCoachName] = useState(coachName || 'Coach');
  const [opponent, setOpponent] = useState(gameInfo.opponent);
  const [field, setField] = useState(gameInfo.field || 'TBD');
  const [time, setTime] = useState(gameInfo.time || 'TBD');
  const [division, setDivision] = useState('FR');

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div
      className={`bg-white text-slate-900 rounded-xl shadow-2xl overflow-hidden border-4 border-slate-900 ${
        isPrintPreview ? 'print:shadow-none' : ''
      }`}
      id="coach-card"
    >
      {/* Header - Friday Night Lights Style */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white px-6 py-5 text-center border-b-4 border-[#16a34a] shadow-lg">
        <h3 className="font-[family-name:var(--font-playfair)] text-3xl font-bold tracking-wider uppercase">
          Friday Night Lights
        </h3>
        <p className="text-sm text-slate-300 mt-2 font-semibold tracking-wide">Coach's Card</p>
      </div>

      <div className="p-6">
        {/* Game Info Section */}
        <div className="grid grid-cols-2 gap-5 mb-6 text-sm border-b-4 border-slate-900 pb-5">
          <div className="space-y-1">
            <span className="font-bold uppercase text-xs text-slate-600 tracking-wide">Date:</span>
            <p className="text-lg font-bold text-slate-900">{formatDate(gameInfo.date)}</p>
          </div>
          <div className="space-y-1">
            <span className="font-bold uppercase text-xs text-slate-600 tracking-wide">Field:</span>
            <input
              type="text"
              value={field}
              onChange={(e) => setField(e.target.value)}
              className="text-lg font-bold text-slate-900 bg-transparent border-b border-slate-300 focus:border-[#16a34a] focus:outline-none w-full print:border-none"
            />
          </div>
          <div className="space-y-1">
            <span className="font-bold uppercase text-xs text-slate-600 tracking-wide">Game Time:</span>
            <input
              type="text"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="text-lg font-bold text-slate-900 bg-transparent border-b border-slate-300 focus:border-[#16a34a] focus:outline-none w-full print:border-none"
            />
          </div>
          <div className="space-y-1">
            <span className="font-bold uppercase text-xs text-slate-600 tracking-wide">Team Name:</span>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="text-lg font-bold text-slate-900 bg-transparent border-b border-slate-300 focus:border-[#16a34a] focus:outline-none w-full print:border-none"
            />
          </div>
          <div className="space-y-1">
            <span className="font-bold uppercase text-xs text-slate-600 tracking-wide">Coach's Name:</span>
            <input
              type="text"
              value={editableCoachName}
              onChange={(e) => setEditableCoachName(e.target.value)}
              className="text-lg font-bold text-[#16a34a] bg-transparent border-b border-slate-300 focus:border-[#16a34a] focus:outline-none w-full print:border-none"
            />
          </div>
          <div className="space-y-1">
            <span className="font-bold uppercase text-xs text-slate-600 tracking-wide">Opponent:</span>
            <input
              type="text"
              value={opponent}
              onChange={(e) => setOpponent(e.target.value)}
              className="text-lg font-bold text-slate-900 bg-transparent border-b border-slate-300 focus:border-[#16a34a] focus:outline-none w-full print:border-none"
            />
          </div>
          <div className="col-span-2 space-y-1">
            <span className="font-bold uppercase text-xs text-slate-600 tracking-wide">Division:</span>
            <input
              type="text"
              value={division}
              onChange={(e) => setDivision(e.target.value)}
              className="text-lg font-bold text-slate-900 bg-transparent border-b border-slate-300 focus:border-[#16a34a] focus:outline-none w-full print:border-none"
            />
          </div>
        </div>

        {/* Quarters Table - Show positions in columns like referee card */}
        {lineup.quarters.length === 0 ? (
          <p className="text-slate-500 italic text-center py-8">
            No active players available
          </p>
        ) : (
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm border-collapse border-3 border-slate-900 shadow-md">
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
                  // Find which position this player plays in each quarter
                  const quarterPositions = lineup.quarters.map(q => {
                    for (const [pos, p] of Object.entries(q.positions)) {
                      if (p?.id === player.id) return pos;
                    }
                    return null;
                  });

                  const quartersPlayed = quarterPositions.filter(p => p !== null).length;

                  return (
                    <tr
                      key={player.id}
                      className="border-b-2 border-slate-300 hover:bg-slate-50 transition-colors"
                    >
                      <td className="py-3 px-4 font-bold text-slate-900 border-r-2 border-slate-300 bg-slate-100 text-base">
                        {player.jerseyNumber || '—'}
                      </td>
                      <td className="py-3 px-4 border-r-2 border-slate-300">
                        <div className="font-semibold text-slate-900">
                          {player.nickname || `${player.firstName} ${player.lastName}`.trim() || 'Unnamed'}
                        </div>
                      </td>
                      {[0, 1, 2, 3].map((qIndex) => (
                        <td key={qIndex} className="text-center py-3 px-4 border-r-2 border-slate-300 bg-slate-50">
                          {quarterPositions[qIndex] ? (
                            <div className="font-bold text-slate-900 text-sm">
                              {quarterPositions[qIndex]}
                            </div>
                          ) : (
                            <div className="w-7 h-7 mx-auto"></div>
                          )}
                        </td>
                      ))}
                      <td className="text-center py-3 px-4 font-bold bg-slate-100 text-base">
                        {quartersPlayed}
                      </td>
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
            <div className="space-y-2">
              <span className="font-bold uppercase text-xs text-slate-600 block tracking-wide">Q1</span>
              <div className="border-b-3 border-slate-400 pb-2 font-bold text-xl">__</div>
            </div>
            <div className="space-y-2">
              <span className="font-bold uppercase text-xs text-slate-600 block tracking-wide">Q2</span>
              <div className="border-b-3 border-slate-400 pb-2 font-bold text-xl">__</div>
            </div>
            <div className="space-y-2">
              <span className="font-bold uppercase text-xs text-slate-600 block tracking-wide">Q3</span>
              <div className="border-b-3 border-slate-400 pb-2 font-bold text-xl">__</div>
            </div>
            <div className="space-y-2">
              <span className="font-bold uppercase text-xs text-slate-600 block tracking-wide">Q4</span>
              <div className="border-b-3 border-slate-400 pb-2 font-bold text-xl">__</div>
            </div>
            <div className="space-y-2">
              <span className="font-bold uppercase text-xs text-slate-600 block tracking-wide">Total</span>
              <div className="border-b-3 border-slate-900 pb-2 font-bold text-xl">__</div>
            </div>
          </div>
        </div>

        {/* Time Outs */}
        <div className="mb-5">
          <span className="font-bold uppercase text-xs text-slate-600 tracking-wide">Time Outs:</span>
          <p className="text-2xl font-bold mt-2">☐ ☐ ☐</p>
        </div>

        {/* Ref Name */}
        <div className="pt-5 border-t-4 border-slate-900">
          <span className="font-bold uppercase text-xs text-slate-600 tracking-wide">Ref Name:</span>
          <p className="text-base font-semibold border-b-2 border-slate-400 pb-2 mt-2">_______________________</p>
        </div>
      </div>
    </div>
  );
}

export function RefereeCard({ players, gameInfo, isPrintPreview, positions, coachName }: GameCardsProps) {
  // Generate lineup using the engine
  const generator = new LineupGenerator(players, positions);
  const lineup: GeneratedLineup = generator.generate();

  // Create a map of which players play in which quarters
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

  // Editable fields state
  const [teamName, setTeamName] = useState('FlagFooty');
  const [editableCoachName, setEditableCoachName] = useState(coachName || 'Coach');
  const [opponent, setOpponent] = useState(gameInfo.opponent);
  const [field, setField] = useState(gameInfo.field || 'TBD');
  const [time, setTime] = useState(gameInfo.time || 'TBD');
  const [division, setDivision] = useState('FR');

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div
      className={`bg-white text-slate-900 rounded-xl shadow-2xl overflow-hidden border-4 border-slate-900 ${
        isPrintPreview ? 'print:shadow-none' : ''
      }`}
      id="referee-card"
    >
      {/* Header - Friday Night Lights Style */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white px-6 py-5 text-center border-b-4 border-[#16a34a] shadow-lg">
        <h3 className="font-[family-name:var(--font-playfair)] text-3xl font-bold tracking-wider uppercase">
          Friday Night Lights
        </h3>
        <p className="text-sm text-slate-300 mt-2 font-semibold tracking-wide">Official Game Card</p>
      </div>

      <div className="p-6">
        {/* Game Info Section */}
        <div className="grid grid-cols-2 gap-5 mb-6 text-sm border-b-4 border-slate-900 pb-5">
          <div className="space-y-1">
            <span className="font-bold uppercase text-xs text-slate-600 tracking-wide">Date:</span>
            <p className="text-lg font-bold text-slate-900">{formatDate(gameInfo.date)}</p>
          </div>
          <div className="space-y-1">
            <span className="font-bold uppercase text-xs text-slate-600 tracking-wide">Field:</span>
            <input
              type="text"
              value={field}
              onChange={(e) => setField(e.target.value)}
              className="text-lg font-bold text-slate-900 bg-transparent border-b border-slate-300 focus:border-[#16a34a] focus:outline-none w-full print:border-none"
            />
          </div>
          <div className="space-y-1">
            <span className="font-bold uppercase text-xs text-slate-600 tracking-wide">Game Time:</span>
            <input
              type="text"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="text-lg font-bold text-slate-900 bg-transparent border-b border-slate-300 focus:border-[#16a34a] focus:outline-none w-full print:border-none"
            />
          </div>
          <div className="space-y-1">
            <span className="font-bold uppercase text-xs text-slate-600 tracking-wide">Team Name:</span>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="text-lg font-bold text-slate-900 bg-transparent border-b border-slate-300 focus:border-[#16a34a] focus:outline-none w-full print:border-none"
            />
          </div>
          <div className="space-y-1">
            <span className="font-bold uppercase text-xs text-slate-600 tracking-wide">Coach's Name:</span>
            <input
              type="text"
              value={editableCoachName}
              onChange={(e) => setEditableCoachName(e.target.value)}
              className="text-lg font-bold text-[#16a34a] bg-transparent border-b border-slate-300 focus:border-[#16a34a] focus:outline-none w-full print:border-none"
            />
          </div>
          <div className="space-y-1">
            <span className="font-bold uppercase text-xs text-slate-600 tracking-wide">Opponent:</span>
            <input
              type="text"
              value={opponent}
              onChange={(e) => setOpponent(e.target.value)}
              className="text-lg font-bold text-slate-900 bg-transparent border-b border-slate-300 focus:border-[#16a34a] focus:outline-none w-full print:border-none"
            />
          </div>
          <div className="col-span-2 space-y-1">
            <span className="font-bold uppercase text-xs text-slate-600 tracking-wide">Division:</span>
            <input
              type="text"
              value={division}
              onChange={(e) => setDivision(e.target.value)}
              className="text-lg font-bold text-slate-900 bg-transparent border-b border-slate-300 focus:border-[#16a34a] focus:outline-none w-full print:border-none"
            />
          </div>
        </div>

        {/* Quarters Table */}
        {players.filter(p => p.play).length === 0 ? (
          <p className="text-slate-500 italic text-center py-8">
            No active players
          </p>
        ) : (
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm border-collapse border-3 border-slate-900 shadow-md">
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
                    <tr
                      key={player.id}
                      className="border-b-2 border-slate-300 hover:bg-slate-50 transition-colors"
                    >
                      <td className="py-3 px-4 font-bold text-slate-900 border-r-2 border-slate-300 bg-slate-100 text-base">
                        {player.jerseyNumber || '—'}
                      </td>
                      <td className="py-3 px-4 border-r-2 border-slate-300">
                        <div className="font-semibold text-slate-900">
                          {player.nickname || `${player.firstName} ${player.lastName}`.trim() || 'Unnamed'}
                        </div>
                      </td>
                      <td className="text-center py-3 px-4 border-r-2 border-slate-300 bg-slate-50">
                        {quartersPlayed.includes(1) ? (
                          <div className="w-7 h-7 mx-auto flex items-center justify-center font-bold text-slate-900 text-xl">
                            X
                          </div>
                        ) : (
                          <div className="w-7 h-7 mx-auto"></div>
                        )}
                      </td>
                      <td className="text-center py-3 px-4 border-r-2 border-slate-300 bg-slate-50">
                        {quartersPlayed.includes(2) ? (
                          <div className="w-7 h-7 mx-auto flex items-center justify-center font-bold text-slate-900 text-xl">
                            X
                          </div>
                        ) : (
                          <div className="w-7 h-7 mx-auto"></div>
                        )}
                      </td>
                      <td className="text-center py-3 px-4 border-r-2 border-slate-300 bg-slate-50">
                        {quartersPlayed.includes(3) ? (
                          <div className="w-7 h-7 mx-auto flex items-center justify-center font-bold text-slate-900 text-xl">
                            X
                          </div>
                        ) : (
                          <div className="w-7 h-7 mx-auto"></div>
                        )}
                      </td>
                      <td className="text-center py-3 px-4 border-r-2 border-slate-300 bg-slate-50">
                        {quartersPlayed.includes(4) ? (
                          <div className="w-7 h-7 mx-auto flex items-center justify-center font-bold text-slate-900 text-xl">
                            X
                          </div>
                        ) : (
                          <div className="w-7 h-7 mx-auto"></div>
                        )}
                      </td>
                      <td className="text-center py-3 px-4 font-bold bg-slate-100 text-base">
                        {quartersPlayed.length}
                      </td>
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
            <div className="space-y-2">
              <span className="font-bold uppercase text-xs text-slate-600 block tracking-wide">Q1</span>
              <div className="border-b-3 border-slate-400 pb-2 font-bold text-xl">__</div>
            </div>
            <div className="space-y-2">
              <span className="font-bold uppercase text-xs text-slate-600 block tracking-wide">Q2</span>
              <div className="border-b-3 border-slate-400 pb-2 font-bold text-xl">__</div>
            </div>
            <div className="space-y-2">
              <span className="font-bold uppercase text-xs text-slate-600 block tracking-wide">Q3</span>
              <div className="border-b-3 border-slate-400 pb-2 font-bold text-xl">__</div>
            </div>
            <div className="space-y-2">
              <span className="font-bold uppercase text-xs text-slate-600 block tracking-wide">Q4</span>
              <div className="border-b-3 border-slate-400 pb-2 font-bold text-xl">__</div>
            </div>
            <div className="space-y-2">
              <span className="font-bold uppercase text-xs text-slate-600 block tracking-wide">Total</span>
              <div className="border-b-3 border-slate-900 pb-2 font-bold text-xl">__</div>
            </div>
          </div>
        </div>

        {/* Time Outs */}
        <div className="mb-5">
          <span className="font-bold uppercase text-xs text-slate-600 tracking-wide">Time Outs:</span>
          <p className="text-2xl font-bold mt-2">☐ ☐ ☐</p>
        </div>

        {/* Ref Name */}
        <div className="pt-5 border-t-4 border-slate-900">
          <span className="font-bold uppercase text-xs text-slate-600 tracking-wide">Ref Name:</span>
          <p className="text-base font-semibold border-b-2 border-slate-400 pb-2 mt-2">_______________________</p>
        </div>
      </div>
    </div>
  );
}
