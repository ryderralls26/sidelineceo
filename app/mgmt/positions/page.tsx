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
    <div className=\"min-h-screen bg-[#1e293b] text-slate-100 font-[family-name:var(--font-inter)]\">
      <Navigation />

      {/* Main Content */}
      <div className=\"pt-24 px-4 pb-12 animate-in fade-in duration-200\">
        <div className=\"max-w-5xl mx-auto\">\n          {/* Header */}\n          <div className=\"mb-8\">\n            <h1 className=\"font-[family-name:var(--font-playfair)] text-4xl md:text-5xl font-bold mb-4\">\n              Team <span className=\"text-[#16a34a]\">Management</span>\n            </h1>\n            <p className=\"text-slate-400 text-lg\">\n              Customize positions, divisions, and awards for your team.\n            </p>\n          </div>\n\n          {/* Action Buttons */}\n          <div className=\"mb-6 flex flex-wrap gap-4\">\n            <button\n              onClick={handleSave}\n              disabled={!hasChanges}\n              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${\n                hasChanges\n                  ? 'bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white hover:shadow-[0_0_20px_rgba(22,163,74,0.4)]'\n                  : 'bg-slate-700 text-slate-500 cursor-not-allowed'\n              }`}\n            >\n              <Save className=\"w-5 h-5\" />\n              Save Changes\n            </button>\n            {hasChanges && (\n              <button\n                onClick={handleDiscard}\n                className=\"flex items-center gap-2 bg-slate-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-slate-600 transition-all duration-300\"\n              >\n                Discard Changes\n              </button>\n            )}\n            <button\n              onClick={handleReset}\n              className=\"flex items-center gap-2 bg-red-500/20 border border-red-500/50 text-red-400 px-6 py-3 rounded-lg font-semibold hover:bg-red-500/30 transition-all duration-300\"\n            >\n              <RotateCcw className=\"w-5 h-5\" />\n              Reset to Default\n            </button>\n          </div>\n\n          {/* Positions Table */}\n          <div className=\"bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden\">\n            <div className=\"overflow-x-auto\">\n              <table className=\"w-full\">\n                <thead>\n                  <tr className=\"bg-slate-800/50 border-b border-slate-700\">\n                    <th className=\"px-6 py-4 text-left text-sm font-semibold text-slate-300 w-16\">\n                      #\n                    </th>\n                    <th className=\"px-6 py-4 text-left text-sm font-semibold text-slate-300\">\n                      Position Name\n                    </th>\n                    <th className=\"px-6 py-4 text-left text-sm font-semibold text-slate-300 w-40\">\n                      Abbreviation\n                    </th>\n                    <th className=\"px-6 py-4 text-left text-sm font-semibold text-slate-300 w-32\">\n                      Rank\n                    </th>\n                  </tr>\n                </thead>\n                <tbody>\n                  {positions.map((position, index) => (\n                    <tr\n                      key={position.id}\n                      className={`border-b border-slate-700/30 hover:bg-slate-800/30 transition-colors ${\n                        index % 2 === 0 ? 'bg-slate-900/20' : ''\n                      }`}\n                    >\n                      <td className=\"px-6 py-4 text-slate-400 font-medium\">\n                        {index + 1}\n                      </td>\n                      <td className=\"px-6 py-4\">\n                        <input\n                          type=\"text\"\n                          value={position.name}\n                          onChange={(e) =>\n                            updatePosition(position.id, 'name', e.target.value)\n                          }\n                          disabled={!canEdit}\n                          className=\"w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed\"\n                          placeholder=\"Position name\"\n                        />\n                      </td>\n                      <td className=\"px-6 py-4\">\n                        <input\n                          type=\"text\"\n                          value={position.abbreviation}\n                          onChange={(e) =>\n                            updatePosition(position.id, 'abbreviation', e.target.value.toUpperCase())\n                          }\n                          disabled={!canEdit}\n                          className=\"w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a]/20 transition-all uppercase disabled:opacity-50 disabled:cursor-not-allowed\"\n                          placeholder=\"POS\"\n                          maxLength={4}\n                        />\n                      </td>\n                      <td className=\"px-6 py-4\">\n                        <select\n                          value={position.rank}\n                          onChange={(e) =>\n                            updatePosition(position.id, 'rank', parseInt(e.target.value) as 1 | 2)\n                          }\n                          disabled={!canEdit}\n                          className=\"w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a]/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed\"\n                        >\n                          <option value={1}>1 - Primary</option>\n                          <option value={2}>2 - Secondary</option>\n                        </select>\n                      </td>\n                    </tr>\n                  ))}\n                </tbody>\n              </table>\n            </div>\n          </div>\n\n          {/* Info Box */}\n          <div className=\"mt-8 bg-slate-800/20 border border-slate-700/50 rounded-xl p-6\">\n            <h3 className=\"font-semibold text-lg mb-3 text-[#22c55e]\">\n              Position Configuration Guide\n            </h3>\n            <ul className=\"space-y-2 text-slate-400\">\n              <li className=\"flex items-start gap-2\">\n                <span className=\"text-[#16a34a] mt-1\">•</span>\n                <span>\n                  <strong className=\"text-slate-300\">Position Name:</strong> Full name of the position (e.g., \"Quarterback\").\n                </span>\n              </li>\n              <li className=\"flex items-start gap-2\">\n                <span className=\"text-[#16a34a] mt-1\">•</span>\n                <span>\n                  <strong className=\"text-slate-300\">Abbreviation:</strong> Short code used in lineups and cards (e.g., \"QB\"). Maximum 4 characters.\n                </span>\n              </li>\n              <li className=\"flex items-start gap-2\">\n                <span className=\"text-[#16a34a] mt-1\">•</span>\n                <span>\n                  <strong className=\"text-slate-300\">Rank:</strong> Position priority. Rank 1 (Primary) positions are filled first, Rank 2 (Secondary) positions are used as needed.\n                </span>\n              </li>\n              <li className=\"flex items-start gap-2\">\n                <span className=\"text-[#16a34a] mt-1\">•</span>\n                <span>\n                  <strong className=\"text-slate-300\">Save Changes:</strong> Button activates only when you've made modifications. Changes persist across sessions.\n                </span>\n              </li>\n            </ul>\n          </div>\n\n          {/* Division Management Section - Coach Only */}\n          {canEdit && (\n            <div className=\"mt-12\">\n              <div className=\"mb-6\">\n                <h2 className=\"font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold mb-4 flex items-center gap-3\">\n                  <GraduationCap className=\"w-8 h-8 text-[#16a34a]\" />\n                  Division <span className=\"text-[#16a34a]\">Management</span>\n                </h2>\n                <p className=\"text-slate-400 text-lg\">\n                  Configure division names and abbreviations (e.g., KIND, FR, SOPH, JR, SR)\n                </p>\n              </div>\n\n              <div className=\"mb-6\">\n                <button\n                  onClick={openAddDivisionModal}\n                  className=\"flex items-center gap-2 bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(22,163,74,0.4)] transition-all duration-300\"\n                >\n                  <span className=\"w-5 h-5\">\n                    <Plus className=\"w-5 h-5\" />\n                  </span>\n                  Add Division\n                </button>\n              </div>\n\n              <div className=\"space-y-4 mb-12\">\n                {divisions.map((division) => (\n                  <div\n                    key={division.id}\n                    className=\"bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6 hover:border-[#16a34a]/50 transition-all duration-300\"\n                  >\n                    <div className=\"flex items-center justify-between\">\n                      <div className=\"flex-1\">\n                        <div className=\"flex items-center gap-3 mb-2\">\n                          <GraduationCap className=\"w-5 h-5 text-[#16a34a]\" />\n                          <h3 className=\"text-xl font-bold text-white\">{division.name}</h3>\n                          <span className=\"px-3 py-1 rounded-full text-xs font-semibold bg-[#16a34a]/20 text-[#22c55e]\">\n                            {division.abbreviation}\n                          </span>\n                        </div>\n                      </div>\n                      <div className=\"flex items-center gap-2\">\n                        <button\n                          onClick={() => openEditDivisionModal(division)}\n                          className=\"p-2 text-slate-400 hover:text-[#16a34a] hover:bg-slate-800/50 rounded-lg transition-all\"\n                          title=\"Edit division\"\n                        >\n                          <Edit2 className=\"w-5 h-5\" />\n                        </button>\n                        <button\n                          onClick={() => handleDeleteDivision(division.id)}\n                          className=\"p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800/50 rounded-lg transition-all\"\n                          title=\"Delete division\"\n                        >\n                          <Trash2 className=\"w-5 h-5\" />\n                        </button>\n                      </div>\n                    </div>\n                  </div>\n                ))}\n\n                {divisions.length === 0 && (\n                  <div className=\"bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-12 text-center\">\n                    <GraduationCap className=\"w-16 h-16 text-slate-600 mx-auto mb-4\" />\n                    <h3 className=\"text-xl font-semibold text-slate-400 mb-2\">\n                      No Divisions Yet\n                    </h3>\n                    <p className=\"text-slate-500\">\n                      Add your first division to get started.\n                    </p>\n                  </div>\n                )}\n              </div>\n            </div>\n          )}\n\n          {/* Awards Management Section - Coach Only */}\n          {canEdit && (\n            <div className=\"mt-0\">\n              <div className=\"mb-6\">\n                <h2 className=\"font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold mb-4 flex items-center gap-3\">\n                  <Award className=\"w-8 h-8 text-yellow-400\" />\n                  Awards <span className=\"text-[#16a34a]\">Management</span>\n                </h2>\n                <p className=\"text-slate-400 text-lg\">\n                  Customize award types for your team (MVP, Player of the Game, etc.)\n                </p>\n              </div>\n\n              <div className=\"mb-6\">\n                <button\n                  onClick={openAddAwardModal}\n                  className=\"flex items-center gap-2 bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(22,163,74,0.4)] transition-all duration-300\"\n                >\n                  <Plus className=\"w-5 h-5\" />\n                  Add Award Type\n                </button>\n              </div>\n\n              <div className=\"space-y-4\">\n                {awardTypes.map((award) => (\n                  <div\n                    key={award.id}\n                    className=\"bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6 hover:border-yellow-400/50 transition-all duration-300\"\n                  >\n                    <div className=\"flex items-center justify-between\">\n                      <div className=\"flex-1\">\n                        <div className=\"flex items-center gap-3 mb-2\">\n                          <Award className=\"w-5 h-5 text-yellow-400\" />\n                          <h3 className=\"text-xl font-bold text-white\">{award.name}</h3>\n                        </div>\n                        {award.description && (\n                          <p className=\"text-slate-400 text-sm\">{award.description}</p>\n                        )}\n                      </div>\n                      <div className=\"flex items-center gap-2\">\n                        <button\n                          onClick={() => openEditAwardModal(award)}\n                          className=\"p-2 text-slate-400 hover:text-[#16a34a] hover:bg-slate-800/50 rounded-lg transition-all\"\n                          title=\"Edit award\"\n                        >\n                          <Edit2 className=\"w-5 h-5\" />\n                        </button>\n                        <button\n                          onClick={() => handleDeleteAward(award.id)}\n                          className=\"p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800/50 rounded-lg transition-all\"\n                          title=\"Delete award\"\n                        >\n                          <Trash2 className=\"w-5 h-5\" />\n                        </button>\n                      </div>\n                    </div>\n                  </div>\n                ))}\n\n                {awardTypes.length === 0 && (\n                  <div className=\"bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-12 text-center\">\n                    <Award className=\"w-16 h-16 text-slate-600 mx-auto mb-4\" />\n                    <h3 className=\"text-xl font-semibold text-slate-400 mb-2\">\n                      No Award Types Yet\n                    </h3>\n                    <p className=\"text-slate-500\">\n                      Add your first award type to get started.\n                    </p>\n                  </div>\n                )}\n              </div>\n            </div>\n          )}\n        </div>\n      </div>\n\n      {/* Division Modal */}\n      {showDivisionModal && (\n        <div\n          className=\"fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm\"\n          onClick={(e) => {\n            if (e.target === e.currentTarget) {\n              closeDivisionModal();\n            }\n          }}\n        >\n          <div\n            className=\"bg-slate-800 rounded-2xl border border-slate-700 max-w-md w-full p-8\"\n            onClick={(e) => e.stopPropagation()}\n          >\n            <h2 className=\"font-[family-name:var(--font-playfair)] text-2xl font-bold mb-6\">\n              {editingDivision ? 'Edit Division' : 'Add Division'}\n            </h2>\n\n            <form onSubmit={handleSaveDivision} className=\"space-y-4\">\n              <div>\n                <label className=\"block text-sm font-semibold text-slate-300 mb-2\">\n                  Division Name\n                </label>\n                <input\n                  type=\"text\"\n                  value={divisionName}\n                  onChange={(e) => setDivisionName(e.target.value)}\n                  className=\"w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/20 transition-all\"\n                  placeholder=\"e.g. Kindergarten, Freshman\"\n                  required\n                />\n              </div>\n\n              <div>\n                <label className=\"block text-sm font-semibold text-slate-300 mb-2\">\n                  Abbreviation\n                </label>\n                <input\n                  type=\"text\"\n                  value={divisionAbbr}\n                  onChange={(e) => setDivisionAbbr(e.target.value.toUpperCase())}\n                  className=\"w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/20 transition-all uppercase\"\n                  placeholder=\"e.g. KIND, FR\"\n                  maxLength={5}\n                  required\n                />\n              </div>\n\n              <div className=\"flex gap-3 pt-4\">\n                <button\n                  type=\"button\"\n                  onClick={closeDivisionModal}\n                  className=\"flex-1 px-6 py-3 bg-slate-700 text-white rounded-lg font-semibold hover:bg-slate-600 transition-all duration-300\"\n                >\n                  Cancel\n                </button>\n                <button\n                  type=\"submit\"\n                  className=\"flex-1 px-6 py-3 bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(22,163,74,0.4)] transition-all duration-300\"\n                >\n                  {editingDivision ? 'Update' : 'Add'} Division\n                </button>\n              </div>\n            </form>\n          </div>\n        </div>\n      )}\n\n      {/* Award Modal */}\n      {showAwardModal && (\n        <div\n          className=\"fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm\"\n          onClick={(e) => {\n            if (e.target === e.currentTarget) {\n              closeAwardModal();\n            }\n          }}\n        >\n          <div\n            className=\"bg-slate-800 rounded-2xl border border-slate-700 max-w-md w-full p-8\"\n            onClick={(e) => e.stopPropagation()}\n          >\n            <h2 className=\"font-[family-name:var(--font-playfair)] text-2xl font-bold mb-6\">\n              {editingAward ? 'Edit Award Type' : 'Add Award Type'}\n            </h2>\n\n            <form onSubmit={handleSaveAward} className=\"space-y-4\">\n              <div>\n                <label className=\"block text-sm font-semibold text-slate-300 mb-2\">\n                  Award Name\n                </label>\n                <input\n                  type=\"text\"\n                  value={awardName}\n                  onChange={(e) => setAwardName(e.target.value)}\n                  className=\"w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/20 transition-all\"\n                  placeholder=\"e.g. MVP, Defensive POYG\"\n                  required\n                />\n              </div>\n\n              <div>\n                <label className=\"block text-sm font-semibold text-slate-300 mb-2\">\n                  Description (Optional)\n                </label>\n                <textarea\n                  value={awardDescription}\n                  onChange={(e) => setAwardDescription(e.target.value)}\n                  className=\"w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/20 transition-all resize-none\"\n                  placeholder=\"Brief description...\"\n                  rows={3}\n                />\n              </div>\n\n              <div className=\"flex gap-3 pt-4\">\n                <button\n                  type=\"button\"\n                  onClick={closeAwardModal}\n                  className=\"flex-1 px-6 py-3 bg-slate-700 text-white rounded-lg font-semibold hover:bg-slate-600 transition-all duration-300\"\n                >\n                  Cancel\n                </button>\n                <button\n                  type=\"submit\"\n                  className=\"flex-1 px-6 py-3 bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(22,163,74,0.4)] transition-all duration-300\"\n                >\n                  {editingAward ? 'Update' : 'Add'} Award\n                </button>\n              </div>\n            </form>\n          </div>\n        </div>\n      )}\n\n      {/* Footer */}\n      <footer className=\"py-12 px-4 border-t border-slate-800/50\">\n        <div className=\"max-w-7xl mx-auto text-center\">\n          <h3 className=\"font-[family-name:var(--font-playfair)] text-2xl font-bold mb-2 bg-gradient-to-r from-[#16a34a] to-[#22c55e] bg-clip-text text-transparent\">\n            FlagFooty\n          </h3>\n          <p className=\"text-slate-500 text-sm\">\n            &copy; {new Date().getFullYear()} FlagFooty. All rights reserved.\n          </p>\n        </div>\n      </footer>\n    </div>\n  );\n}\n