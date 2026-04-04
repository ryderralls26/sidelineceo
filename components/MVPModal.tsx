'use client';

import { useState, useEffect } from 'react';
import { Star, X } from 'lucide-react';
import { StorageManager, Award } from '@/lib/storage';
import { getRosterFromStorage, Player } from '@/lib/types';
import { useAuth } from '@/lib/AuthContext';

interface MVPModalProps {
  gameId: number;
  gameName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function MVPModal({ gameId, gameName, onClose, onSuccess }: MVPModalProps) {
  const { session } = useAuth();
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);
  const [awardType, setAwardType] = useState('');
  const [notes, setNotes] = useState('');
  const [awardTypes, setAwardTypes] = useState<string[]>([]);

  useEffect(() => {
    // Load roster
    const roster = getRosterFromStorage();
    setPlayers(roster);

    // Load award types
    const types = StorageManager.getAwardTypes();
    setAwardTypes(types.map(t => t.name));
    if (types.length > 0) {
      setAwardType(types[0].name);
    }

    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPlayerId) {
      alert('Please select a player');
      return;
    }

    if (!awardType) {
      alert('Please select an award type');
      return;
    }

    const award: Award = {
      id: Date.now().toString(),
      gameId,
      playerId: selectedPlayerId,
      awardType,
      notes,
      awardedBy: session?.userId || 'unknown',
      awardedAt: new Date().toISOString(),
    };

    StorageManager.createAward(award);
    onSuccess();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-slate-800 rounded-2xl border border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6 flex items-center justify-between">
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold flex items-center gap-2">
            <Star className="w-6 h-6 text-yellow-400" />
            Award Player
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <p className="text-slate-400 mb-4">
              Select a player for <span className="text-white font-semibold">{gameName}</span>
            </p>
          </div>

          {/* Player Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-3">
              Select Player
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {players.map((player) => (
                <button
                  key={player.id}
                  type="button"
                  onClick={() => setSelectedPlayerId(player.id)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    selectedPlayerId === player.id
                      ? 'border-yellow-400 bg-yellow-400/10'
                      : 'border-slate-700 bg-slate-900/50 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Star
                      className={`w-5 h-5 transition-all ${
                        selectedPlayerId === player.id
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-slate-600'
                      }`}
                    />
                    <span className="font-semibold text-white">#{player.jerseyNumber}</span>
                  </div>
                  <div className="text-sm text-slate-300">
                    {player.firstName} {player.lastName}
                  </div>
                </button>
              ))}
            </div>
            {players.length === 0 && (
              <p className="text-slate-500 text-sm">No players in roster. Add players first.</p>
            )}
          </div>

          {/* Award Type */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Award Type
            </label>
            <select
              value={awardType}
              onChange={(e) => setAwardType(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/20 transition-all cursor-pointer"
              required
            >
              {awardTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/20 transition-all resize-none"
              placeholder="Reason for award... (e.g., Great sportsmanship)"
              rows={4}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-slate-700 text-white rounded-lg font-semibold hover:bg-slate-600 transition-all duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedPlayerId}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(22,163,74,0.4)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Award Player
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
