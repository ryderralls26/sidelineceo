'use client';

import React, { useState, useEffect } from 'react';
import { Player } from '@/lib/lineupGenerator';
import { LineupGenerator, GeneratedLineup } from '@/lib/lineupGenerator';

interface Award {
  id: string;
  name: string;
  player: string;
}

interface GameInfo {
  opponent: string;
  date: string;
  location: string;
  field?: string;
  time?: string;
  teamName?: string;
  division?: string;
  coachName?: string;
  fdl?: string; // FDL# from schedule
  awards?: Award[];
  notes?: string;
}

interface EditableGameCardsProps {
  players: Player[];
  gameInfo: GameInfo;
  isPrintPreview?: boolean;
  positions?: string[];
  onGameInfoChange?: (gameInfo: GameInfo) => void;
  onPlayersChange?: (players: Player[]) => void;
}

export function EditableGameCards({
  players,
  gameInfo: initialGameInfo,
  isPrintPreview,
  positions,
  onGameInfoChange,
  onPlayersChange
}: EditableGameCardsProps) {
  // Default awards
  const defaultAwards: Award[] = [
    { id: '1', name: 'MVP', player: '' },
    { id: '2', name: 'Defensive Player of the Game', player: '' },
    { id: '3', name: 'Offensive Player of the Game', player: '' },
  ];

  // CRITICAL: Shared state for real-time sync between Coach and Referee cards
  // This is the single source of truth for all metadata fields
  const [gameInfo, setGameInfo] = useState<GameInfo>({
    teamName: initialGameInfo.teamName || 'FlagFooty',
    coachName: initialGameInfo.coachName || 'Coach',
    opponent: initialGameInfo.opponent || '',
    field: initialGameInfo.field || 'TBD',
    time: initialGameInfo.time || 'TBD',
    division: initialGameInfo.division || 'FR',
    fdl: initialGameInfo.fdl || '',
    date: initialGameInfo.date,
    location: initialGameInfo.location,
    awards: initialGameInfo.awards || defaultAwards,
    notes: initialGameInfo.notes || '',
  });

  // Sync with parent props when they change (important for initial load)
  useEffect(() => {
    setGameInfo({
      teamName: initialGameInfo.teamName || 'FlagFooty',
      coachName: initialGameInfo.coachName || 'Coach',
      opponent: initialGameInfo.opponent || '',
      field: initialGameInfo.field || 'TBD',
      time: initialGameInfo.time || 'TBD',
      division: initialGameInfo.division || 'FR',
      fdl: initialGameInfo.fdl || '',
      date: initialGameInfo.date,
      location: initialGameInfo.location,
      awards: initialGameInfo.awards || defaultAwards,
      notes: initialGameInfo.notes || '',
    });
  }, [initialGameInfo.teamName, initialGameInfo.coachName, initialGameInfo.opponent, initialGameInfo.field, initialGameInfo.time, initialGameInfo.division, initialGameInfo.fdl, initialGameInfo.date, initialGameInfo.location, initialGameInfo.awards, initialGameInfo.notes]);

  // CRITICAL FIX: Generate lineup using the engine - shared across all cards
  // This will regenerate whenever players or positions change (using useMemo for performance)
  // This ensures that when positions are updated in Coach's Card, the Referee Card gets the updated lineup
  const lineup: GeneratedLineup = React.useMemo(() => {
    const generator = new LineupGenerator(players, positions);
    return generator.generate();
  }, [players, positions]);

  // Update shared state and notify parent
  const updateField = (field: keyof GameInfo, value: string) => {
    const updated = { ...gameInfo, [field]: value };
    setGameInfo(updated);
    // Immediately notify parent of the change
    if (onGameInfoChange) {
      onGameInfoChange(updated);
    }
  };

  const updatePlayerPosition = (playerId: number, field: 'position1' | 'position2', value: string) => {
    const updated = players.map(p =>
      p.id === playerId ? { ...p, [field]: value } : p
    );
    // Notify parent of the change - parent manages the players state
    if (onPlayersChange) {
      onPlayersChange(updated);
    }
  };

  const addAward = () => {
    const newAward: Award = {
      id: Date.now().toString(),
      name: '',
      player: ''
    };
    const updated = {
      ...gameInfo,
      awards: [...(gameInfo.awards || []), newAward]
    };
    setGameInfo(updated);
    if (onGameInfoChange) {
      onGameInfoChange(updated);
    }
  };

  const updateAward = (id: string, field: 'name' | 'player', value: string) => {
    const updated = {
      ...gameInfo,
      awards: (gameInfo.awards || []).map(a =>
        a.id === id ? { ...a, [field]: value } : a
      )
    };
    setGameInfo(updated);
    if (onGameInfoChange) {
      onGameInfoChange(updated);
    }
  };

  const removeAward = (id: string) => {
    const updated = {
      ...gameInfo,
      awards: (gameInfo.awards || []).filter(a => a.id !== id)
    };
    setGameInfo(updated);
    if (onGameInfoChange) {
      onGameInfoChange(updated);
    }
  };

  const updateNotes = (value: string) => {
    const updated = { ...gameInfo, notes: value };
    setGameInfo(updated);
    if (onGameInfoChange) {
      onGameInfoChange(updated);
    }
  };

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

  // Create a stable key that includes both gameInfo and lineup state
  // This ensures cards re-render when either metadata or lineup changes
  const cardsKey = React.useMemo(() => {
    const lineupKey = lineup.quarters.map(q =>
      Object.entries(q.positions).map(([pos, player]) => `${pos}:${player?.id || 'none'}`).join(',')
    ).join('|');
    return `${gameInfo.field}-${gameInfo.time}-${gameInfo.coachName}-${gameInfo.opponent}-${lineupKey}`;
  }, [gameInfo.field, gameInfo.time, gameInfo.coachName, gameInfo.opponent, lineup]);

  return (
    <div className="grid md:grid-cols-2 gap-8 print:grid-cols-2 print:gap-2">
      {/* Coach's Card */}
      <CoachCardView
        key={`coach-1-${cardsKey}`}
        players={players}
        gameInfo={gameInfo}
        lineup={lineup}
        divisions={divisions}
        formatDate={formatDate}
        updateField={updateField}
        updatePlayerPosition={updatePlayerPosition}
        isPrintPreview={isPrintPreview}
        addAward={addAward}
        updateAward={updateAward}
        removeAward={removeAward}
        updateNotes={updateNotes}
      />

      {/* Coach's Card (Duplicate) */}
      <CoachCardView
        key={`coach-2-${cardsKey}`}
        players={players}
        gameInfo={gameInfo}
        lineup={lineup}
        divisions={divisions}
        formatDate={formatDate}
        updateField={updateField}
        updatePlayerPosition={updatePlayerPosition}
        isPrintPreview={isPrintPreview}
        addAward={addAward}
        updateAward={updateAward}
        removeAward={removeAward}
        updateNotes={updateNotes}
      />

      {/* Referee Card */}
      <RefereeCardView
        key={`ref-1-${cardsKey}`}
        players={players}
        gameInfo={gameInfo}
        lineup={lineup}
        divisions={divisions}
        formatDate={formatDate}
        updateField={updateField}
        isPrintPreview={isPrintPreview}
      />

      {/* Referee Card (Duplicate) */}
      <RefereeCardView
        key={`ref-2-${cardsKey}`}
        players={players}
        gameInfo={gameInfo}
        lineup={lineup}
        divisions={divisions}
        formatDate={formatDate}
        updateField={updateField}
        isPrintPreview={isPrintPreview}
      />
    </div>
  );
}

interface CardViewProps {
  players: Player[];
  gameInfo: GameInfo;
  lineup: GeneratedLineup;
  divisions: string[];
  formatDate: (date: string) => string;
  updateField: (field: keyof GameInfo, value: string) => void;
  updatePlayerPosition?: (playerId: number, field: 'position1' | 'position2', value: string) => void;
  isPrintPreview?: boolean;
  addAward?: () => void;
  updateAward?: (id: string, field: 'name' | 'player', value: string) => void;
  removeAward?: (id: string) => void;
  updateNotes?: (value: string) => void;
}

function CoachCardView({
  players,
  gameInfo,
  lineup,
  divisions,
  formatDate,
  updateField,
  updatePlayerPosition,
  isPrintPreview,
  addAward,
  updateAward,
  removeAward,
  updateNotes
}: CardViewProps) {
  return (
    <div
      className={`bg-white text-slate-900 rounded-xl shadow-2xl overflow-hidden border-4 border-slate-900 ${
        isPrintPreview ? 'print:shadow-none' : ''
      }`}
      style={{
        breakInside: 'avoid',
        pageBreakInside: 'avoid',
      }}
    >
      {/* Header - Friday Night Lights Style */}
      <div className=\"bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white px-6 py-5 text-center border-b-4 border-[#16a34a] shadow-lg\">
        <h3 className=\"font-[family-name:var(--font-playfair)] text-3xl font-bold tracking-wider uppercase\">
          Friday Night Lights
        </h3>
        <p className=\"text-sm text-slate-300 mt-2 font-semibold tracking-wide\">Coach's Card</p>
      </div>

      <div className=\"p-6\">
        {/* Game Info Section - Row 1: Date | FDL# | Game Time */}
        <div className=\"grid grid-cols-3 gap-5 mb-4 text-sm border-b-4 border-slate-900 pb-5\">
          <div className=\"space-y-1\">
            <span className=\"font-bold uppercase text-xs text-slate-600 tracking-wide\">Date:</span>
            <p className=\"text-lg font-bold text-slate-900\">{formatDate(gameInfo.date)}</p>
          </div>
          <div className=\"space-y-1\">
            <span className=\"font-bold uppercase text-xs text-slate-600 tracking-wide\">FDL#:</span>
            <input
              type=\"text\"
              value={gameInfo.fdl || ''}
              onChange={(e) => updateField('fdl', e.target.value)}
              placeholder=\"FDL#\"
              className=\"text-lg font-bold text-slate-900 bg-transparent border-b border-slate-300 focus:border-[#16a34a] focus:outline-none w-full print:border-none\"
            />
          </div>
          <div className=\"space-y-1\">
            <span className=\"font-bold uppercase text-xs text-slate-600 tracking-wide\">Game Time:</span>
            <input
              type=\"text\"
              value={gameInfo.time || ''}
              onChange={(e) => updateField('time', e.target.value)}
              placeholder=\"Time\"
              className=\"text-lg font-bold text-slate-900 bg-transparent border-b border-slate-300 focus:border-[#16a34a] focus:outline-none w-full print:border-none\"
            />
          </div>
        </div>

        {/* Row 2: Team Name | Score Field */}
        <div className=\"grid grid-cols-2 gap-5 mb-4 text-sm border-b-4 border-slate-900 pb-5\">
          <div className=\"space-y-1\">
            <span className=\"font-bold uppercase text-xs text-slate-600 tracking-wide\">Team Name:</span>
            <input
              type=\"text\"
              value={gameInfo.teamName || ''}
              onChange={(e) => updateField('teamName', e.target.value)}
              placeholder=\"Team Name\"
              className=\"text-lg font-bold text-slate-900 bg-transparent border-b border-slate-300 focus:border-[#16a34a] focus:outline-none w-full print:border-none\"
            />
          </div>
          <div className=\"space-y-1\">
            <span className=\"font-bold uppercase text-xs text-slate-600 tracking-wide\">Score:</span>
            <div className=\"text-lg font-bold text-slate-900 border-b-2 border-slate-400 pb-1\">___</div>
          </div>
        </div>

        {/* Row 3: Coach's Name */}
        <div className=\"mb-4 text-sm border-b-4 border-slate-900 pb-5\">
          <div className=\"space-y-1\">
            <span className=\"font-bold uppercase text-xs text-slate-600 tracking-wide\">Coach's Name:</span>
            <input
              type=\"text\"
              value={gameInfo.coachName || ''}
              onChange={(e) => updateField('coachName', e.target.value)}
              placeholder=\"Coach Name\"
              className=\"text-lg font-bold text-[#16a34a] bg-transparent border-b border-slate-300 focus:border-[#16a34a] focus:outline-none w-full print:border-none\"
            />
          </div>
        </div>

        {/* Row 4: Opponent */}
        <div className=\"mb-4 text-sm border-b-4 border-slate-900 pb-5\">
          <div className=\"space-y-1\">
            <span className=\"font-bold uppercase text-xs text-slate-600 tracking-wide\">Opponent:</span>
            <input
              type=\"text\"
              value={gameInfo.opponent || ''}
              onChange={(e) => updateField('opponent', e.target.value)}
              placeholder=\"Opponent\"
              className=\"text-lg font-bold text-slate-900 bg-transparent border-b border-slate-300 focus:border-[#16a34a] focus:outline-none w-full print:border-none\"
            />
          </div>
        </div>

        {/* Row 5: Division - solid black box border around active division only */}
        <div className=\"mb-6 text-sm border-b-4 border-slate-900 pb-5\">
          <div className=\"space-y-1\">
            <span className=\"font-bold uppercase text-xs text-slate-600 tracking-wide\">Division:</span>
            <div className=\"flex gap-3 mt-2 print:gap-2\">
              {divisions.map((div) => (
                <button
                  key={div}
                  type=\"button\"
                  onClick={() => updateField('division', div)}
                  className={`px-4 py-2 font-bold text-sm transition-all ${
                    gameInfo.division === div
                      ? 'border-4 border-black bg-white text-slate-900'
                      : 'bg-white text-slate-400'
                  }`}
                >
                  {div}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Remove old combined section */}
        <div className=\"hidden\">
          <div className=\"space-y-1\">
            <span className=\"font-bold uppercase text-xs text-slate-600 tracking-wide\">Field:</span>
            <input
              type=\"text\"
              value={gameInfo.field || ''}
              onChange={(e) => updateField('field', e.target.value)}
              placeholder=\"Field\"
              className=\"text-lg font-bold text-slate-900 bg-transparent border-b border-slate-300 focus:border-[#16a34a] focus:outline-none w-full print:border-none\"
            />
          </div>
        </div>

        {/* Quarters Table - Show positions */}
        {lineup.quarters.length === 0 ? (
          <p className=\"text-slate-500 italic text-center py-8\">
            No active players available
          </p>
        ) : (
          <div className=\"overflow-x-auto mb-6\">
            <table className=\"w-full text-sm border-collapse border-3 border-slate-900 shadow-md\">
              <thead>
                <tr className=\"bg-gradient-to-r from-slate-900 to-slate-800 text-white\">
                  <th className=\"text-left py-4 px-4 font-bold border-r-2 border-slate-700 tracking-wide\">#</th>
                  <th className=\"text-left py-4 px-4 font-bold border-r-2 border-slate-700 tracking-wide\">Name</th>
                  <th className=\"text-center py-4 px-4 font-bold border-r-2 border-slate-700 tracking-wide\">Q1</th>
                  <th className=\"text-center py-4 px-4 font-bold border-r-2 border-slate-700 tracking-wide\">Q2</th>
                  <th className=\"text-center py-4 px-4 font-bold border-r-2 border-slate-700 tracking-wide\">Q3</th>
                  <th className=\"text-center py-4 px-4 font-bold border-r-2 border-slate-700 tracking-wide\">Q4</th>
                  <th className=\"text-center py-4 px-4 font-bold tracking-wide\">Total</th>
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
                      className=\"border-b-2 border-slate-300 hover:bg-slate-50 transition-colors\"
                    >
                      <td className=\"py-3 px-4 font-bold text-slate-900 border-r-2 border-slate-300 bg-slate-100 text-base\">
                        {player.jerseyNumber || '—'}
                      </td>
                      <td className=\"py-3 px-4 border-r-2 border-slate-300\">
                        <div className=\"font-semibold text-slate-900\">
                          {player.nickname || `${player.firstName} ${player.lastName}`.trim() || 'Unnamed'}
                        </div>
                      </td>
                      {[0, 1, 2, 3].map((qIndex) => (
                        <td key={qIndex} className=\"text-center py-3 px-4 border-r-2 border-slate-300 bg-slate-50\">
                          {quarterPositions[qIndex] ? (
                            <div className=\"font-bold text-slate-900 text-sm\">
                              {quarterPositions[qIndex]}
                            </div>
                          ) : (
                            <div className=\"w-7 h-7 mx-auto\"></div>
                          )}
                        </td>
                      ))}
                      <td className=\"text-center py-3 px-4 font-bold bg-slate-100 text-base\">
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
        <div className=\"mb-5 border-3 border-slate-900 rounded-lg p-5 shadow-md bg-slate-50\">
          <div className=\"grid grid-cols-5 gap-4 text-center\">
            <div className=\"space-y-2\">
              <span className=\"font-bold uppercase text-xs text-slate-600 block tracking-wide\">Q1</span>
              <div className=\"border-b-3 border-slate-400 pb-2 font-bold text-xl\">__</div>
            </div>
            <div className=\"space-y-2\">
              <span className=\"font-bold uppercase text-xs text-slate-600 block tracking-wide\">Q2</span>
              <div className=\"border-b-3 border-slate-400 pb-2 font-bold text-xl\">__</div>
            </div>
            <div className=\"space-y-2\">
              <span className=\"font-bold uppercase text-xs text-slate-600 block tracking-wide\">Q3</span>
              <div className=\"border-b-3 border-slate-400 pb-2 font-bold text-xl\">__</div>
            </div>
            <div className=\"space-y-2\">
              <span className=\"font-bold uppercase text-xs text-slate-600 block tracking-wide\">Q4</span>
              <div className=\"border-b-3 border-slate-400 pb-2 font-bold text-xl\">__</div>
            </div>
            <div className=\"space-y-2\">
              <span className=\"font-bold uppercase text-xs text-slate-600 block tracking-wide\">Total</span>
              <div className=\"border-b-3 border-slate-900 pb-2 font-bold text-xl\">__</div>
            </div>
          </div>
        </div>

        {/* Time Outs */}
        <div className=\"mb-5\">
          <span className=\"font-bold uppercase text-xs text-slate-600 tracking-wide\">Time Outs:</span>
          <p className=\"text-2xl font-bold mt-2\">☐ ☐ ☐</p>
        </div>

        {/* Ref Name */}
        <div className=\"pt-5 border-t-4 border-slate-900 mb-5\">
          <span className=\"font-bold uppercase text-xs text-slate-600 tracking-wide\">Ref Name:</span>
          <p className=\"text-base font-semibold border-b-2 border-slate-400 pb-2 mt-2\">_______________________</p>
        </div>

        {/* Awards Section */}
        <div className=\"border-t-4 border-slate-900 pt-5 mb-5\">
          <div className=\"flex justify-between items-center mb-3\">
            <span className=\"font-bold uppercase text-xs text-slate-600 tracking-wide\">Awards:</span>
            {addAward && (
              <button
                type=\"button\"
                onClick={addAward}
                className=\"print:hidden bg-[#16a34a] text-white font-bold text-xs px-3 py-1 rounded hover:bg-[#15803d] transition-colors\"
              >
                + Add Award
              </button>
            )}
          </div>
          <div className=\"space-y-2\">
            {(gameInfo.awards || []).map((award, index) => (
              <div key={award.id} className=\"grid grid-cols-[2fr_3fr_auto] gap-2 items-center\">
                <input
                  type=\"text\"
                  value={award.name}
                  onChange={(e) => updateAward && updateAward(award.id, 'name', e.target.value)}
                  placeholder=\"Award Name\"
                  className=\"text-sm font-semibold text-slate-900 bg-transparent border-b border-slate-300 focus:border-[#16a34a] focus:outline-none py-1 print:border-none\"
                />
                <input
                  type=\"text\"
                  value={award.player}
                  onChange={(e) => updateAward && updateAward(award.id, 'player', e.target.value)}
                  placeholder=\"Player Name\"
                  className=\"text-sm text-slate-900 bg-transparent border-b border-slate-300 focus:border-[#16a34a] focus:outline-none py-1 print:border-none\"
                />
                {index >= 3 && removeAward && (
                  <button
                    type=\"button\"
                    onClick={() => removeAward(award.id)}
                    className=\"print:hidden text-red-600 hover:text-red-800 font-bold text-xs px-2\"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
          <p className=\"text-xs italic text-slate-500 mt-3\">
            Be creative with your awards — recognize hustle, attitude, improvement, and leadership. Make every player feel seen!
          </p>
        </div>

        {/* Notes Section */}
        <div className=\"border-t-4 border-slate-900 pt-5 mb-5\">
          <span className=\"font-bold uppercase text-xs text-slate-600 tracking-wide\">Notes:</span>
          <textarea
            value={gameInfo.notes || ''}
            onChange={(e) => updateNotes && updateNotes(e.target.value)}
            placeholder=\"Add any additional notes here...\"
            rows={4}
            className=\"w-full text-sm text-slate-900 bg-transparent border border-slate-300 rounded focus:border-[#16a34a] focus:outline-none p-2 mt-2 print:border-none print:p-0\"
          />
        </div>

        {/* Footer - FlagFooty Branding with QR Code */}
        <div
          className=\"flex items-center justify-between pt-4 border-t-2 border-slate-300\"
          style={{ printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact' } as React.CSSProperties}
        >
          <span className=\"text-xs font-semibold text-slate-700\">FlagFooty</span>
          <img
            src=\"https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=https://www.flagfooty.app\"
            alt=\"FlagFooty QR Code\"
            width={60}
            height={60}
            style={{ printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact' }}
          />
        </div>
      </div>
    </div>
  );
}

function RefereeCardView({
  players,
  gameInfo,
  lineup,
  divisions,
  formatDate,
  updateField,
  isPrintPreview
}: CardViewProps) {
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

  return (
    <div
      className={`bg-white text-slate-900 rounded-xl shadow-2xl overflow-hidden border-4 border-slate-900 ${
        isPrintPreview ? 'print:shadow-none' : ''
      }`}
      style={{
        breakInside: 'avoid',
        pageBreakInside: 'avoid',
      }}
    >
      {/* Header - Friday Night Lights Style */}
      <div className=\"bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white px-6 py-5 text-center border-b-4 border-[#16a34a] shadow-lg\">
        <h3 className=\"font-[family-name:var(--font-playfair)] text-3xl font-bold tracking-wider uppercase\">
          Friday Night Lights
        </h3>
        <p className=\"text-sm text-slate-300 mt-2 font-semibold tracking-wide\">Line-Up Card</p>
      </div>

      <div className=\"p-6\">
        {/* Game Info Section - Row 1: Date | FDL# | Game Time */}
        <div className=\"grid grid-cols-3 gap-5 mb-4 text-sm border-b-4 border-slate-900 pb-5\">
          <div className=\"space-y-1\">
            <span className=\"font-bold uppercase text-xs text-slate-600 tracking-wide\">Date:</span>
            <p className=\"text-lg font-bold text-slate-900\">{formatDate(gameInfo.date)}</p>
          </div>
          <div className=\"space-y-1\">
            <span className=\"font-bold uppercase text-xs text-slate-600 tracking-wide\">FDL#:</span>
            <p className=\"text-lg font-bold text-slate-900\">{gameInfo.fdl || '—'}</p>
          </div>
          <div className=\"space-y-1\">
            <span className=\"font-bold uppercase text-xs text-slate-600 tracking-wide\">Game Time:</span>
            <p className=\"text-lg font-bold text-slate-900\">{gameInfo.time || 'TBD'}</p>
          </div>
        </div>

        {/* Row 2: Team Name | Score Field */}
        <div className=\"grid grid-cols-2 gap-5 mb-4 text-sm border-b-4 border-slate-900 pb-5\">
          <div className=\"space-y-1\">
            <span className=\"font-bold uppercase text-xs text-slate-600 tracking-wide\">Team Name:</span>
            <p className=\"text-lg font-bold text-slate-900\">{gameInfo.teamName || 'FlagFooty'}</p>
          </div>
          <div className=\"space-y-1\">
            <span className=\"font-bold uppercase text-xs text-slate-600 tracking-wide\">Score:</span>
            <div className=\"text-lg font-bold text-slate-900 border-b-2 border-slate-400 pb-1\">___</div>
          </div>
        </div>

        {/* Row 3: Coach's Name */}
        <div className=\"mb-4 text-sm border-b-4 border-slate-900 pb-5\">
          <div className=\"space-y-1\">
            <span className=\"font-bold uppercase text-xs text-slate-600 tracking-wide\">Coach's Name:</span>
            <p className=\"text-lg font-bold text-[#16a34a]\">{gameInfo.coachName || 'Coach'}</p>
          </div>
        </div>

        {/* Row 4: Opponent */}
        <div className=\"mb-4 text-sm border-b-4 border-slate-900 pb-5\">
          <div className=\"space-y-1\">
            <span className=\"font-bold uppercase text-xs text-slate-600 tracking-wide\">Opponent:</span>
            <p className=\"text-lg font-bold text-slate-900\">{gameInfo.opponent || 'TBD'}</p>
          </div>
        </div>

        {/* Row 5: Division - solid black box border around active division only */}
        <div className=\"mb-6 text-sm border-b-4 border-slate-900 pb-5\">
          <div className=\"space-y-1\">
            <span className=\"font-bold uppercase text-xs text-slate-600 tracking-wide\">Division:</span>
            <div className=\"flex gap-3 mt-2 print:gap-2\">
              {divisions.map((div) => (
                <div
                  key={div}
                  className={`px-4 py-2 font-bold text-sm ${
                    gameInfo.division === div
                      ? 'border-4 border-black bg-white text-slate-900'
                      : 'bg-white text-slate-400'
                  }`}
                >
                  {div}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quarters Table - Show X marks */}
        {players.filter(p => p.play).length === 0 ? (
          <p className=\"text-slate-500 italic text-center py-8\">
            No active players
          </p>
        ) : (
          <div className=\"overflow-x-auto mb-6\">
            <table className=\"w-full text-sm border-collapse border-3 border-slate-900 shadow-md\">
              <thead>
                <tr className=\"bg-gradient-to-r from-slate-900 to-slate-800 text-white\">
                  <th className=\"text-left py-4 px-4 font-bold border-r-2 border-slate-700 tracking-wide\">#</th>
                  <th className=\"text-left py-4 px-4 font-bold border-r-2 border-slate-700 tracking-wide\">Name</th>
                  <th className=\"text-center py-4 px-4 font-bold border-r-2 border-slate-700 tracking-wide\">Q1</th>
                  <th className=\"text-center py-4 px-4 font-bold border-r-2 border-slate-700 tracking-wide\">Q2</th>
                  <th className=\"text-center py-4 px-4 font-bold border-r-2 border-slate-700 tracking-wide\">Q3</th>
                  <th className=\"text-center py-4 px-4 font-bold border-r-2 border-slate-700 tracking-wide\">Q4</th>
                  <th className=\"text-center py-4 px-4 font-bold tracking-wide\">Total</th>
                </tr>
              </thead>
              <tbody>
                {players.filter(p => p.play).map((player) => {
                  const quartersPlayed = playerQuarterMap.get(player.id) || [];

                  return (
                    <tr
                      key={player.id}
                      className=\"border-b-2 border-slate-300 hover:bg-slate-50 transition-colors\"
                    >
                      <td className=\"py-3 px-4 font-bold text-slate-900 border-r-2 border-slate-300 bg-slate-100 text-base\">
                        {player.jerseyNumber || '—'}
                      </td>
                      <td className=\"py-3 px-4 border-r-2 border-slate-300\">
                        <div className=\"font-semibold text-slate-900\">
                          {player.nickname || `${player.firstName} ${player.lastName}`.trim() || 'Unnamed'}
                        </div>
                      </td>
                      <td className=\"text-center py-3 px-4 border-r-2 border-slate-300 bg-slate-50\">
                        {quartersPlayed.includes(1) ? (
                          <div className=\"w-7 h-7 mx-auto flex items-center justify-center font-bold text-slate-900 text-xl\">
                            X
                          </div>
                        ) : (
                          <div className=\"w-7 h-7 mx-auto\"></div>
                        )}
                      </td>
                      <td className=\"text-center py-3 px-4 border-r-2 border-slate-300 bg-slate-50\">
                        {quartersPlayed.includes(2) ? (
                          <div className=\"w-7 h-7 mx-auto flex items-center justify-center font-bold text-slate-900 text-xl\">
                            X
                          </div>
                        ) : (
                          <div className=\"w-7 h-7 mx-auto\"></div>
                        )}
                      </td>
                      <td className=\"text-center py-3 px-4 border-r-2 border-slate-300 bg-slate-50\">
                        {quartersPlayed.includes(3) ? (
                          <div className=\"w-7 h-7 mx-auto flex items-center justify-center font-bold text-slate-900 text-xl\">
                            X
                          </div>
                        ) : (
                          <div className=\"w-7 h-7 mx-auto\"></div>
                        )}
                      </td>
                      <td className=\"text-center py-3 px-4 border-r-2 border-slate-300 bg-slate-50\">
                        {quartersPlayed.includes(4) ? (
                          <div className=\"w-7 h-7 mx-auto flex items-center justify-center font-bold text-slate-900 text-xl\">
                            X
                          </div>
                        ) : (
                          <div className=\"w-7 h-7 mx-auto\"></div>
                        )}
                      </td>
                      <td className=\"text-center py-3 px-4 font-bold bg-slate-100 text-base\">
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
        <div className=\"mb-5 border-3 border-slate-900 rounded-lg p-5 shadow-md bg-slate-50\">
          <div className=\"grid grid-cols-5 gap-4 text-center\">
            <div className=\"space-y-2\">
              <span className=\"font-bold uppercase text-xs text-slate-600 block tracking-wide\">Q1</span>
              <div className=\"border-b-3 border-slate-400 pb-2 font-bold text-xl\">__</div>
            </div>
            <div className=\"space-y-2\">
              <span className=\"font-bold uppercase text-xs text-slate-600 block tracking-wide\">Q2</span>
              <div className=\"border-b-3 border-slate-400 pb-2 font-bold text-xl\">__</div>
            </div>
            <div className=\"space-y-2\">
              <span className=\"font-bold uppercase text-xs text-slate-600 block tracking-wide\">Q3</span>
              <div className=\"border-b-3 border-slate-400 pb-2 font-bold text-xl\">__</div>
            </div>
            <div className=\"space-y-2\">
              <span className=\"font-bold uppercase text-xs text-slate-600 block tracking-wide\">Q4</span>
              <div className=\"border-b-3 border-slate-400 pb-2 font-bold text-xl\">__</div>
            </div>
            <div className=\"space-y-2\">
              <span className=\"font-bold uppercase text-xs text-slate-600 block tracking-wide\">Total</span>
              <div className=\"border-b-3 border-slate-900 pb-2 font-bold text-xl\">__</div>
            </div>
          </div>
        </div>

        {/* Time Outs */}
        <div className=\"mb-5\">
          <span className=\"font-bold uppercase text-xs text-slate-600 tracking-wide\">Time Outs:</span>
          <p className=\"text-2xl font-bold mt-2\">☐ ☐ ☐</p>
        </div>

        {/* Ref Name */}
        <div className=\"pt-5 border-t-4 border-slate-900 mb-5\">
          <span className=\"font-bold uppercase text-xs text-slate-600 tracking-wide\">Ref Name:</span>
          <p className=\"text-base font-semibold border-b-2 border-slate-400 pb-2 mt-2\">_______________________</p>
        </div>

        {/* Footer - FlagFooty Branding with QR Code */}
        <div
          className=\"flex items-center justify-between pt-4 border-t-2 border-slate-300\"
          style={{ printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact' } as React.CSSProperties}
        >
          <span className=\"text-xs font-semibold text-slate-700\">FlagFooty</span>
          <img
            src=\"https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=https://www.flagfooty.app\"
            alt=\"FlagFooty QR Code\"
            width={60}
            height={60}
            style={{ printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact' }}
          />
        </div>
      </div>
    </div>
  );
}
