'use client';

import { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { useAuth } from '@/lib/AuthContext';
import { useAuthGuard } from '@/lib/useAuthGuard';
import { ScoutModePopup } from '@/components/ScoutModePopup';
import { ScoutModeBanner } from '@/components/ScoutModeBanner';
import { Save, Settings } from 'lucide-react';

export default function MgmtPage() {
  const { isAuthenticated, activeTeamName } = useAuth();
  const {
    isScoutMode,
    showScoutPopup,
    showScoutBanner,
    handleInteraction,
    dismissScoutPopup,
    enterScoutMode,
    handleSaveAction
  } = useAuthGuard();

  // Team Settings
  const [teamName, setTeamName] = useState('');
  const [division, setDivision] = useState('');
  const [season, setSeason] = useState('');
  const [orgName, setOrgName] = useState('');

  // Positions
  const [positions, setPositions] = useState<string[]>([]);
  const [newPosition, setNewPosition] = useState('');

  // Award Types
  const [awardTypes, setAwardTypes] = useState<string[]>([]);
  const [newAward, setNewAward] = useState('');

  useEffect(() => {
    // Set page title
    document.title = 'Team MGMT — SidelineCEO';

    if (!isAuthenticated) {
      // Default values for unauthenticated users
      setTeamName('Team Name');
      setDivision('FR');
      setSeason('Fall 2026');
      setOrgName('Youth Football League');
      setPositions(['QB', 'C', 'WR', 'RB', 'DL', 'LB', 'CB', 'S']);
      setAwardTypes(['MVP', 'Offensive Player', 'Defensive Player']);
    } else {
      // Load from localStorage for authenticated users
      const savedTeamName = localStorage.getItem('teamName') || '';
      const savedDivision = localStorage.getItem('division') || '';
      const savedSeason = localStorage.getItem('season') || '';
      const savedOrgName = localStorage.getItem('orgName') || '';
      const savedPositions = JSON.parse(localStorage.getItem('positions') || '["QB", "C", "WR", "RB", "DL", "LB", "CB", "S"]');
      const savedAwards = JSON.parse(localStorage.getItem('awardTypes') || '["MVP", "Offensive Player", "Defensive Player"]');

      setTeamName(savedTeamName);
      setDivision(savedDivision);
      setSeason(savedSeason);
      setOrgName(savedOrgName);
      setPositions(savedPositions);
      setAwardTypes(savedAwards);
    }
  }, [isAuthenticated]);

  const handleSaveSettings = () => {
    // Show scout banner if not authenticated
    if (!handleSaveAction()) {
      return;
    }

    // Save to localStorage
    localStorage.setItem('teamName', teamName);
    localStorage.setItem('division', division);
    localStorage.setItem('season', season);
    localStorage.setItem('orgName', orgName);
    localStorage.setItem('positions', JSON.stringify(positions));
    localStorage.setItem('awardTypes', JSON.stringify(awardTypes));

    alert('Settings saved successfully!');
  };

  const handleAddPosition = () => {
    if (!isAuthenticated && !isScoutMode) {
      handleInteraction();
      return;
    }

    if (newPosition.trim() && !positions.includes(newPosition.trim())) {
      setPositions([...positions, newPosition.trim()]);
      setNewPosition('');
    }
  };

  const handleRemovePosition = (pos: string) => {
    if (!isAuthenticated && !isScoutMode) {
      handleInteraction();
      return;
    }

    setPositions(positions.filter(p => p !== pos));
  };

  const handleAddAward = () => {
    if (!isAuthenticated && !isScoutMode) {
      handleInteraction();
      return;
    }

    if (newAward.trim() && !awardTypes.includes(newAward.trim())) {
      setAwardTypes([...awardTypes, newAward.trim()]);
      setNewAward('');
    }
  };

  const handleRemoveAward = (award: string) => {
    if (!isAuthenticated && !isScoutMode) {
      handleInteraction();
      return;
    }

    setAwardTypes(awardTypes.filter(a => a !== award));
  };

  const handleFieldFocus = () => {
    if (!isAuthenticated && !isScoutMode) {
      handleInteraction();
    }
  };

  return (
    <div className="min-h-screen bg-[#1e293b] text-slate-100 font-[family-name:var(--font-inter)]">
      <Navigation />

      {/* Main Content */}
      <div className="pt-24 px-4 pb-12 animate-in fade-in duration-200">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Settings className="w-10 h-10 text-[#16a34a]" />
              <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl font-bold">
                Team <span className="text-[#16a34a]">MGMT</span>
              </h1>
            </div>
            <p className="text-slate-400 text-lg">
              Configure your team settings, positions, and awards.
            </p>
          </div>

          {/* Team Settings Section */}
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 mb-6">
            <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold mb-6">
              Team <span className="text-[#16a34a]">Settings</span>
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Team Name
                </label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  onFocus={handleFieldFocus}
                  readOnly={!isAuthenticated && !isScoutMode}
                  className={`w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a]/20 transition-all ${!isAuthenticated && !isScoutMode ? 'cursor-pointer' : ''}`}
                  placeholder="Enter team name"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Division
                  </label>
                  <input
                    type="text"
                    value={division}
                    onChange={(e) => setDivision(e.target.value)}
                    onFocus={handleFieldFocus}
                    readOnly={!isAuthenticated && !isScoutMode}
                    className={`w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a]/20 transition-all ${!isAuthenticated && !isScoutMode ? 'cursor-pointer' : ''}`}
                    placeholder="e.g., FR, U12"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Season
                  </label>
                  <input
                    type="text"
                    value={season}
                    onChange={(e) => setSeason(e.target.value)}
                    onFocus={handleFieldFocus}
                    readOnly={!isAuthenticated && !isScoutMode}
                    className={`w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a]/20 transition-all ${!isAuthenticated && !isScoutMode ? 'cursor-pointer' : ''}`}
                    placeholder="e.g., Fall 2026"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Organization Name
                </label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  onFocus={handleFieldFocus}
                  readOnly={!isAuthenticated && !isScoutMode}
                  className={`w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a]/20 transition-all ${!isAuthenticated && !isScoutMode ? 'cursor-pointer' : ''}`}
                  placeholder="Enter organization name"
                />
              </div>
            </div>
          </div>

          {/* Positions Section */}
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 mb-6">
            <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold mb-6">
              <span className="text-[#16a34a]">Positions</span>
            </h2>

            <div className="mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newPosition}
                  onChange={(e) => setNewPosition(e.target.value)}
                  onFocus={handleFieldFocus}
                  readOnly={!isAuthenticated && !isScoutMode}
                  className={`flex-1 px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a]/20 transition-all ${!isAuthenticated && !isScoutMode ? 'cursor-pointer' : ''}`}
                  placeholder="Add new position (e.g., QB, WR)"
                />
                <button
                  onClick={handleAddPosition}
                  className="px-6 py-3 bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(22,163,74,0.4)] transition-all duration-300"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {positions.map((pos) => (
                <div
                  key={pos}
                  className="flex items-center gap-2 bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2"
                >
                  <span className="text-white font-semibold">{pos}</span>
                  <button
                    onClick={() => handleRemovePosition(pos)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Award Types Section */}
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 mb-6">
            <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold mb-6">
              <span className="text-[#16a34a]">Award Types</span>
            </h2>

            <div className="mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newAward}
                  onChange={(e) => setNewAward(e.target.value)}
                  onFocus={handleFieldFocus}
                  readOnly={!isAuthenticated && !isScoutMode}
                  className={`flex-1 px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a]/20 transition-all ${!isAuthenticated && !isScoutMode ? 'cursor-pointer' : ''}`}
                  placeholder="Add new award type (e.g., MVP, Player of the Game)"
                />
                <button
                  onClick={handleAddAward}
                  className="px-6 py-3 bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(22,163,74,0.4)] transition-all duration-300"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {awardTypes.map((award) => (
                <div
                  key={award}
                  className="flex items-center gap-2 bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2"
                >
                  <span className="text-white font-semibold">{award}</span>
                  <button
                    onClick={() => handleRemoveAward(award)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSaveSettings}
              className="flex items-center gap-2 bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white px-8 py-4 rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(22,163,74,0.4)] transition-all duration-300"
            >
              <Save className="w-5 h-5" />
              Save Settings
            </button>
          </div>

          {/* Info Box */}
          {!isAuthenticated && (
            <div className="mt-8 bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
              <h3 className="font-semibold text-lg mb-3 text-blue-400">
                Preview Mode
              </h3>
              <p className="text-slate-300">
                You're viewing default team management settings. Sign up to save your custom configurations and manage your team's positions, awards, and more!
              </p>
            </div>
          )}
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

      {/* Scout Mode Popup */}
      <ScoutModePopup
        isOpen={showScoutPopup}
        onDismiss={dismissScoutPopup}
        onScoutMode={enterScoutMode}
      />

      {/* Scout Mode Banner */}
      <ScoutModeBanner isVisible={showScoutBanner} />
    </div>
  );
}
