'use client';

import { useState, useEffect } from 'react';
import { Save, RotateCcw, Award, Plus, Edit2, Trash2, GraduationCap } from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { StorageManager, AwardType, Division } from '@/lib/storage';
import { useAuth } from '@/lib/AuthContext';

interface Position {
  id: number;
  name: string;
  abbreviation: string;
  rank: 1 | 2;
}

const DEFAULT_POSITIONS: Position[] = [
  { id: 1, name: 'Quarterback', abbreviation: 'QB', rank: 1 },
  { id: 2, name: 'Running Back', abbreviation: 'RB', rank: 1 },
  { id: 3, name: 'Wide Receiver', abbreviation: 'WR', rank: 1 },
  { id: 4, name: 'Tight End', abbreviation: 'TE', rank: 1 },
  { id: 5, name: 'Defensive Line', abbreviation: 'DL', rank: 1 },
  { id: 6, name: 'Linebacker', abbreviation: 'LB', rank: 1 },
  { id: 7, name: 'Cornerback', abbreviation: 'CB', rank: 1 },
  { id: 8, name: 'Safety', abbreviation: 'S', rank: 1 },
  { id: 9, name: 'Quarterback #2', abbreviation: 'QB2', rank: 2 },
  { id: 10, name: 'Center #2', abbreviation: 'C2', rank: 2 },
];

export default function PositionsPage() {
  const { canEdit } = useAuth();
  const [positions, setPositions] = useState<Position[]>(DEFAULT_POSITIONS);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalPositions, setOriginalPositions] = useState<Position[]>(DEFAULT_POSITIONS);

  // Division Management
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [showDivisionModal, setShowDivisionModal] = useState(false);
  const [editingDivision, setEditingDivision] = useState<Division | null>(null);
  const [divisionName, setDivisionName] = useState('');
  const [divisionAbbr, setDivisionAbbr] = useState('');

  // Awards Management
  const [awardTypes, setAwardTypes] = useState<AwardType[]>([]);
  const [showAwardModal, setShowAwardModal] = useState(false);
  const [editingAward, setEditingAward] = useState<AwardType | null>(null);
  const [awardName, setAwardName] = useState('');
  const [awardDescription, setAwardDescription] = useState('');

  // Load positions and award types from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('positions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPositions(parsed);
        setOriginalPositions(parsed);
      } catch (e) {
        console.error('Failed to load positions:', e);
      }
    }

    // Load divisions
    const divs = StorageManager.getDivisions();
    setDivisions(divs);

    // Load award types
    const types = StorageManager.getAwardTypes();
    setAwardTypes(types);
  }, []);

  const updatePosition = (id: number, field: keyof Position, value: string | number) => {
    setPositions(prev =>
      prev.map(pos =>
        pos.id === id ? { ...pos, [field]: value } : pos
      )
    );
    setHasChanges(true);
  };

  const handleSave = () => {
    localStorage.setItem('positions', JSON.stringify(positions));
    setOriginalPositions(positions);
    setHasChanges(false);
    alert('Positions saved successfully!');
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset to default positions? This will discard all changes.')) {
      setPositions(DEFAULT_POSITIONS);
      setOriginalPositions(DEFAULT_POSITIONS);
      localStorage.removeItem('positions');
      setHasChanges(false);
    }
  };

  const handleDiscard = () => {
    setPositions(originalPositions);
    setHasChanges(false);
  };

  // Division Management Functions
  const openAddDivisionModal = () => {
    setEditingDivision(null);
    setDivisionName('');
    setDivisionAbbr('');
    setShowDivisionModal(true);
  };

  const openEditDivisionModal = (division: Division) => {
    setEditingDivision(division);
    setDivisionName(division.name);
    setDivisionAbbr(division.abbreviation);
    setShowDivisionModal(true);
  };

  const closeDivisionModal = () => {
    setShowDivisionModal(false);
    setEditingDivision(null);
    setDivisionName('');
    setDivisionAbbr('');
  };

  const handleSaveDivision = (e: React.FormEvent) => {
    e.preventDefault();

    if (!divisionName.trim() || !divisionAbbr.trim()) {
      alert('Please enter both division name and abbreviation');
      return;
    }

    let updatedDivisions: Division[];

    if (editingDivision) {
      updatedDivisions = divisions.map(d =>
        d.id === editingDivision.id
          ? { ...d, name: divisionName, abbreviation: divisionAbbr.toUpperCase() }
          : d
      );
    } else {
      const newDivision: Division = {
        id: Date.now().toString(),
        name: divisionName,
        abbreviation: divisionAbbr.toUpperCase(),
      };
      updatedDivisions = [...divisions, newDivision];
    }

    StorageManager.saveDivisions(updatedDivisions);
    setDivisions(updatedDivisions);
    closeDivisionModal();
  };

  const handleDeleteDivision = (divisionId: string) => {
    if (confirm('Are you sure you want to delete this division?')) {
      const updatedDivisions = divisions.filter(d => d.id !== divisionId);
      StorageManager.saveDivisions(updatedDivisions);
      setDivisions(updatedDivisions);
    }
  };

  // Award Management Functions
  const openAddAwardModal = () => {
    setEditingAward(null);
    setAwardName('');
    setAwardDescription('');
    setShowAwardModal(true);
  };

  const openEditAwardModal = (award: AwardType) => {
    setEditingAward(award);
    setAwardName(award.name);
    setAwardDescription(award.description || '');
    setShowAwardModal(true);
  };

  const closeAwardModal = () => {
    setShowAwardModal(false);
    setEditingAward(null);
    setAwardName('');
    setAwardDescription('');
  };

  const handleSaveAward = (e: React.FormEvent) => {
    e.preventDefault();

    if (!awardName.trim()) {
      alert('Please enter an award name');
      return;
    }

    let updatedTypes: AwardType[];

    if (editingAward) {
      // Update existing award
      updatedTypes = awardTypes.map(t =>
        t.id === editingAward.id
          ? { ...t, name: awardName, description: awardDescription }
          : t
      );
    } else {
      // Add new award
      const newAward: AwardType = {
        id: Date.now().toString(),
        name: awardName,
        description: awardDescription,
      };
      updatedTypes = [...awardTypes, newAward];
    }

    StorageManager.saveAwardTypes(updatedTypes);
    setAwardTypes(updatedTypes);
    closeAwardModal();
  };

  const handleDeleteAward = (awardId: string) => {
    if (confirm('Are you sure you want to delete this award type?')) {
      const updatedTypes = awardTypes.filter(t => t.id !== awardId);
      StorageManager.saveAwardTypes(updatedTypes);
      setAwardTypes(updatedTypes);
    }
  };

  return (
    <div className="min-h-screen bg-[#1e293b] text-slate-100 font-[family-name:var(--font-inter)]">
      <Navigation />

      {/* Main Content */}
      <div className="pt-24 px-4 pb-12">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl font-bold mb-4">
              Team <span className="text-[#16a34a]">Management</span>
            </h1>
            <p className="text-slate-400 text-lg">
              Customize positions, divisions, and awards for your team.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="mb-6 flex flex-wrap gap-4">
            <button
              onClick={handleSave}
              disabled={!hasChanges}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                hasChanges
                  ? 'bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white hover:shadow-[0_0_20px_rgba(22,163,74,0.4)]'
                  : 'bg-slate-700 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Save className="w-5 h-5" />
              Save Changes
            </button>
            {hasChanges && (
              <button
                onClick={handleDiscard}
                className="flex items-center gap-2 bg-slate-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-slate-600 transition-all duration-300"
              >
                Discard Changes
              </button>
            )}
            <button
              onClick={handleReset}
              className="flex items-center gap-2 bg-red-500/20 border border-red-500/50 text-red-400 px-6 py-3 rounded-lg font-semibold hover:bg-red-500/30 transition-all duration-300"
            >
              <RotateCcw className="w-5 h-5" />
              Reset to Default
            </button>
          </div>

          {/* Positions Table */}
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-800/50 border-b border-slate-700">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300 w-16">
                      #
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                      Position Name
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300 w-40">
                      Abbreviation
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300 w-32">
                      Rank
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {positions.map((position, index) => (
                    <tr
                      key={position.id}
                      className={`border-b border-slate-700/30 hover:bg-slate-800/30 transition-colors ${
                        index % 2 === 0 ? 'bg-slate-900/20' : ''
                      }`}
                    >
                      <td className="px-6 py-4 text-slate-400 font-medium">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          value={position.name}
                          onChange={(e) =>
                            updatePosition(position.id, 'name', e.target.value)
                          }
                          disabled={!canEdit}
                          className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          placeholder="Position name"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          value={position.abbreviation}
                          onChange={(e) =>
                            updatePosition(position.id, 'abbreviation', e.target.value.toUpperCase())
                          }
                          disabled={!canEdit}
                          className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a]/20 transition-all uppercase disabled:opacity-50 disabled:cursor-not-allowed"
                          placeholder="POS"
                          maxLength={4}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={position.rank}
                          onChange={(e) =>
                            updatePosition(position.id, 'rank', parseInt(e.target.value) as 1 | 2)
                          }
                          disabled={!canEdit}
                          className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a]/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <option value={1}>1 - Primary</option>
                          <option value={2}>2 - Secondary</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-8 bg-slate-800/20 border border-slate-700/50 rounded-xl p-6">
            <h3 className="font-semibold text-lg mb-3 text-[#22c55e]">
              Position Configuration Guide
            </h3>
            <ul className="space-y-2 text-slate-400">
              <li className="flex items-start gap-2">
                <span className="text-[#16a34a] mt-1">•</span>
                <span>
                  <strong className="text-slate-300">Position Name:</strong> Full name of the position (e.g., "Quarterback").
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#16a34a] mt-1">•</span>
                <span>
                  <strong className="text-slate-300">Abbreviation:</strong> Short code used in lineups and cards (e.g., "QB"). Maximum 4 characters.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#16a34a] mt-1">•</span>
                <span>
                  <strong className="text-slate-300">Rank:</strong> Position priority. Rank 1 (Primary) positions are filled first, Rank 2 (Secondary) positions are used as needed.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#16a34a] mt-1">•</span>
                <span>
                  <strong className="text-slate-300">Save Changes:</strong> Button activates only when you've made modifications. Changes persist across sessions.
                </span>
              </li>
            </ul>
          </div>

          {/* Division Management Section - Coach Only */}
          {canEdit && (
            <div className="mt-12">
              <div className="mb-6">
                <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold mb-4 flex items-center gap-3">
                  <GraduationCap className="w-8 h-8 text-[#16a34a]" />
                  Division <span className="text-[#16a34a]">Management</span>
                </h2>
                <p className="text-slate-400 text-lg">
                  Configure division names and abbreviations (e.g., KIND, FR, SOPH, JR, SR)
                </p>
              </div>

              <div className="mb-6">
                <button
                  onClick={openAddDivisionModal}
                  className="flex items-center gap-2 bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(22,163,74,0.4)] transition-all duration-300"
                >
                  <Plus className="w-5 h-5" />
                  Add Division
                </button>
              </div>

              <div className="space-y-4 mb-12">
                {divisions.map((division) => (
                  <div
                    key={division.id}
                    className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6 hover:border-[#16a34a]/50 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <GraduationCap className="w-5 h-5 text-[#16a34a]" />
                          <h3 className="text-xl font-bold text-white">{division.name}</h3>
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#16a34a]/20 text-[#22c55e]">
                            {division.abbreviation}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditDivisionModal(division)}
                          className="p-2 text-slate-400 hover:text-[#16a34a] hover:bg-slate-800/50 rounded-lg transition-all"
                          title="Edit division"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteDivision(division.id)}
                          className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800/50 rounded-lg transition-all"
                          title="Delete division"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {divisions.length === 0 && (
                  <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-12 text-center">
                    <GraduationCap className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-400 mb-2">
                      No Divisions Yet
                    </h3>
                    <p className="text-slate-500">
                      Add your first division to get started.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Awards Management Section - Coach Only */}
          {canEdit && (
            <div className="mt-0">
              <div className="mb-6">
                <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold mb-4 flex items-center gap-3">
                  <Award className="w-8 h-8 text-yellow-400" />
                  Awards <span className="text-[#16a34a]">Management</span>
                </h2>
                <p className="text-slate-400 text-lg">
                  Customize award types for your team (MVP, Player of the Game, etc.)
                </p>
              </div>

              <div className="mb-6">
                <button
                  onClick={openAddAwardModal}
                  className="flex items-center gap-2 bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(22,163,74,0.4)] transition-all duration-300"
                >
                  <Plus className="w-5 h-5" />
                  Add Award Type
                </button>
              </div>

              <div className="space-y-4">
                {awardTypes.map((award) => (
                  <div
                    key={award.id}
                    className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6 hover:border-yellow-400/50 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Award className="w-5 h-5 text-yellow-400" />
                          <h3 className="text-xl font-bold text-white">{award.name}</h3>
                        </div>
                        {award.description && (
                          <p className="text-slate-400 text-sm">{award.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditAwardModal(award)}
                          className="p-2 text-slate-400 hover:text-[#16a34a] hover:bg-slate-800/50 rounded-lg transition-all"
                          title="Edit award"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteAward(award.id)}
                          className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800/50 rounded-lg transition-all"
                          title="Delete award"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {awardTypes.length === 0 && (
                  <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-12 text-center">
                    <Award className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-400 mb-2">
                      No Award Types Yet
                    </h3>
                    <p className="text-slate-500">
                      Add your first award type to get started.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Division Modal */}
      {showDivisionModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeDivisionModal();
            }
          }}
        >
          <div
            className="bg-slate-800 rounded-2xl border border-slate-700 max-w-md w-full p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold mb-6">
              {editingDivision ? 'Edit Division' : 'Add Division'}
            </h2>

            <form onSubmit={handleSaveDivision} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Division Name
                </label>
                <input
                  type="text"
                  value={divisionName}
                  onChange={(e) => setDivisionName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/20 transition-all"
                  placeholder="e.g. Kindergarten, Freshman"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Abbreviation
                </label>
                <input
                  type="text"
                  value={divisionAbbr}
                  onChange={(e) => setDivisionAbbr(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/20 transition-all uppercase"
                  placeholder="e.g. KIND, FR"
                  maxLength={5}
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeDivisionModal}
                  className="flex-1 px-6 py-3 bg-slate-700 text-white rounded-lg font-semibold hover:bg-slate-600 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(22,163,74,0.4)] transition-all duration-300"
                >
                  {editingDivision ? 'Update' : 'Add'} Division
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Award Modal */}
      {showAwardModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeAwardModal();
            }
          }}
        >
          <div
            className="bg-slate-800 rounded-2xl border border-slate-700 max-w-md w-full p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold mb-6">
              {editingAward ? 'Edit Award Type' : 'Add Award Type'}
            </h2>

            <form onSubmit={handleSaveAward} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Award Name
                </label>
                <input
                  type="text"
                  value={awardName}
                  onChange={(e) => setAwardName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/20 transition-all"
                  placeholder="e.g. MVP, Defensive POYG"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={awardDescription}
                  onChange={(e) => setAwardDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/20 transition-all resize-none"
                  placeholder="Brief description..."
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeAwardModal}
                  className="flex-1 px-6 py-3 bg-slate-700 text-white rounded-lg font-semibold hover:bg-slate-600 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(22,163,74,0.4)] transition-all duration-300"
                >
                  {editingAward ? 'Update' : 'Add'} Award
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
