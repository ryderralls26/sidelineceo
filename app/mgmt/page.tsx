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
    document.title = 'Team MGMT — FlagFooty';

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
      const savedPositions = JSON.parse(localStorage.getItem('positions') || '[\"QB\", \"C\", \"WR\", \"RB\", \"DL\", \"LB\", \"CB\", \"S\"]');
      const savedAwards = JSON.parse(localStorage.getItem('awardTypes') || '[\"MVP\", \"Offensive Player\", \"Defensive Player\"]');

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
    <div className=\"min-h-screen bg-[#1e293b] text-slate-100 font-[family-name:var(--font-inter)]\">
      <Navigation />

      {/* Main Content */}
      <div className=\"pt-24 px-4 pb-12 animate-in fade-in duration-200\">
        <div className=\"max-w-4xl mx-auto\">\n          {/* Header */}\n          <div className=\"mb-8\">\n            <div className=\"flex items-center gap-3 mb-4\">\n              <Settings className=\"w-10 h-10 text-[#16a34a]\" />\n              <h1 className=\"font-[family-name:var(--font-playfair)] text-4xl md:text-5xl font-bold\">\n                Team <span className=\"text-[#16a34a]\">MGMT</span>\n              </h1>\n            </div>\n            <p className=\"text-slate-400 text-lg\">\n              Configure your team settings, positions, and awards.\n            </p>\n          </div>\n\n          {/* Team Settings Section */}\n          <div className=\"bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 mb-6\">\n            <h2 className=\"font-[family-name:var(--font-playfair)] text-2xl font-bold mb-6\">\n              Team <span className=\"text-[#16a34a]\">Settings</span>\n            </h2>\n\n            <div className=\"space-y-4\">\n              <div>\n                <label className=\"block text-sm font-semibold text-slate-300 mb-2\">\n                  Team Name\n                </label>\n                <input\n                  type=\"text\"\n                  value={teamName}\n                  onChange={(e) => setTeamName(e.target.value)}\n                  onFocus={handleFieldFocus}\n                  readOnly={!isAuthenticated && !isScoutMode}\n                  className={`w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a]/20 transition-all ${!isAuthenticated && !isScoutMode ? 'cursor-pointer' : ''}`}\n                  placeholder=\"Enter team name\"\n                />\n              </div>\n\n              <div className=\"grid md:grid-cols-2 gap-4\">\n                <div>\n                  <label className=\"block text-sm font-semibold text-slate-300 mb-2\">\n                    Division\n                  </label>\n                  <input\n                    type=\"text\"\n                    value={division}\n                    onChange={(e) => setDivision(e.target.value)}\n                    onFocus={handleFieldFocus}\n                    readOnly={!isAuthenticated && !isScoutMode}\n                    className={`w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a]/20 transition-all ${!isAuthenticated && !isScoutMode ? 'cursor-pointer' : ''}`}\n                    placeholder=\"e.g., FR, U12\"\n                  />\n                </div>\n\n                <div>\n                  <label className=\"block text-sm font-semibold text-slate-300 mb-2\">\n                    Season\n                  </label>\n                  <input\n                    type=\"text\"\n                    value={season}\n                    onChange={(e) => setSeason(e.target.value)}\n                    onFocus={handleFieldFocus}\n                    readOnly={!isAuthenticated && !isScoutMode}\n                    className={`w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a]/20 transition-all ${!isAuthenticated && !isScoutMode ? 'cursor-pointer' : ''}`}\n                    placeholder=\"e.g., Fall 2026\"\n                  />\n                </div>\n              </div>\n\n              <div>\n                <label className=\"block text-sm font-semibold text-slate-300 mb-2\">\n                  Organization Name\n                </label>\n                <input\n                  type=\"text\"\n                  value={orgName}\n                  onChange={(e) => setOrgName(e.target.value)}\n                  onFocus={handleFieldFocus}\n                  readOnly={!isAuthenticated && !isScoutMode}\n                  className={`w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a]/20 transition-all ${!isAuthenticated && !isScoutMode ? 'cursor-pointer' : ''}`}\n                  placeholder=\"Enter organization name\"\n                />\n              </div>\n            </div>\n          </div>\n\n          {/* Positions Section */}\n          <div className=\"bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 mb-6\">\n            <h2 className=\"font-[family-name:var(--font-playfair)] text-2xl font-bold mb-6\">\n              <span className=\"text-[#16a34a]\">Positions</span>\n            </h2>\n\n            <div className=\"mb-4\">\n              <div className=\"flex gap-2\">\n                <input\n                  type=\"text\"\n                  value={newPosition}\n                  onChange={(e) => setNewPosition(e.target.value)}\n                  onFocus={handleFieldFocus}\n                  readOnly={!isAuthenticated && !isScoutMode}\n                  className={`flex-1 px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a]/20 transition-all ${!isAuthenticated && !isScoutMode ? 'cursor-pointer' : ''}`}\n                  placeholder=\"Add new position (e.g., QB, WR)\"\n                />\n                <button\n                  onClick={handleAddPosition}\n                  className=\"px-6 py-3 bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(22,163,74,0.4)] transition-all duration-300\"\n                >\n                  Add\n                </button>\n              </div>\n            </div>\n\n            <div className=\"flex flex-wrap gap-2\">\n              {positions.map((pos) => (\n                <div\n                  key={pos}\n                  className=\"flex items-center gap-2 bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2\"\n                >\n                  <span className=\"text-white font-semibold\">{pos}</span>\n                  <button\n                    onClick={() => handleRemovePosition(pos)}\n                    className=\"text-red-400 hover:text-red-300 transition-colors\"\n                  >\n                    ×\n                  </button>\n                </div>\n              ))}\n            </div>\n          </div>\n\n          {/* Award Types Section */}\n          <div className=\"bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 mb-6\">\n            <h2 className=\"font-[family-name:var(--font-playfair)] text-2xl font-bold mb-6\">\n              <span className=\"text-[#16a34a]\">Award Types</span>\n            </h2>\n\n            <div className=\"mb-4\">\n              <div className=\"flex gap-2\">\n                <input\n                  type=\"text\"\n                  value={newAward}\n                  onChange={(e) => setNewAward(e.target.value)}\n                  onFocus={handleFieldFocus}\n                  readOnly={!isAuthenticated && !isScoutMode}\n                  className={`flex-1 px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a]/20 transition-all ${!isAuthenticated && !isScoutMode ? 'cursor-pointer' : ''}`}\n                  placeholder=\"Add new award type (e.g., MVP, Player of the Game)\"\n                />\n                <button\n                  onClick={handleAddAward}\n                  className=\"px-6 py-3 bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(22,163,74,0.4)] transition-all duration-300\"\n                >\n                  Add\n                </button>\n              </div>\n            </div>\n\n            <div className=\"flex flex-wrap gap-2\">\n              {awardTypes.map((award) => (\n                <div\n                  key={award}\n                  className=\"flex items-center gap-2 bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2\"\n                >\n                  <span className=\"text-white font-semibold\">{award}</span>\n                  <button\n                    onClick={() => handleRemoveAward(award)}\n                    className=\"text-red-400 hover:text-red-300 transition-colors\"\n                  >\n                    ×\n                  </button>\n                </div>\n              ))}\n            </div>\n          </div>\n\n          {/* Save Button */}\n          <div className=\"flex justify-end\">\n            <button\n              onClick={handleSaveSettings}\n              className=\"flex items-center gap-2 bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white px-8 py-4 rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(22,163,74,0.4)] transition-all duration-300\"\n            >\n              <Save className=\"w-5 h-5\" />\n              Save Settings\n            </button>\n          </div>\n\n          {/* Info Box */}\n          {!isAuthenticated && (\n            <div className=\"mt-8 bg-blue-500/10 border border-blue-500/30 rounded-xl p-6\">\n              <h3 className=\"font-semibold text-lg mb-3 text-blue-400\">\n                Preview Mode\n              </h3>\n              <p className=\"text-slate-300\">\n                You're viewing default team management settings. Sign up to save your custom configurations and manage your team's positions, awards, and more!\n              </p>\n            </div>\n          )}\n        </div>\n      </div>\n\n      {/* Footer */}\n      <footer className=\"py-12 px-4 border-t border-slate-800/50\">\n        <div className=\"max-w-7xl mx-auto text-center\">\n          <h3 className=\"font-[family-name:var(--font-playfair)] text-2xl font-bold mb-2 bg-gradient-to-r from-[#16a34a] to-[#22c55e] bg-clip-text text-transparent\">\n            FlagFooty\n          </h3>\n          <p className=\"text-slate-500 text-sm\">\n            &copy; {new Date().getFullYear()} FlagFooty. All rights reserved.\n          </p>\n        </div>\n      </footer>\n\n      {/* Scout Mode Popup */}\n      <ScoutModePopup\n        isOpen={showScoutPopup}\n        onDismiss={dismissScoutPopup}\n        onScoutMode={enterScoutMode}\n      />\n\n      {/* Scout Mode Banner */}\n      <ScoutModeBanner isVisible={showScoutBanner} />\n    </div>\n  );\n}\n