'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Menu, X, LogOut, Plus, Trash2, Upload } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { StorageManager, Team } from '@/lib/storage';

export default function CoachDashboardPage() {
  const router = useRouter();
  const { session, isAuthenticated, isCoach, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [showTeamSetupModal, setShowTeamSetupModal] = useState(false);

  // Team Setup Form State
  const [teamName, setTeamName] = useState('');
  const [sport, setSport] = useState<'flag-football' | 'soccer'>('flag-football');
  const [division, setDivision] = useState<'KIND' | 'FR' | 'SO' | 'JR' | 'SR'>('FR');
  const [season, setSeason] = useState<'fall' | 'spring' | 'summer'>('fall');
  const [year, setYear] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');

  useEffect(() => {
    if (!isAuthenticated || !isCoach) {
      router.push('/login');
      return;
    }

    loadTeams();
  }, [isAuthenticated, isCoach, router]);

  const loadTeams = () => {
    if (!session) return;
    const coachTeams = StorageManager.getTeamsByCoach(session.userId);
    setTeams(coachTeams);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateTeam = (e: React.FormEvent) => {
    e.preventDefault();

    if (!session) return;

    const newTeam: Team = {
      id: Date.now().toString(),
      name: teamName,
      sport,
      division: sport === 'flag-football' ? division : undefined,
      season,
      year,
      logoUrl: logoPreview || undefined,
      coachId: session.userId,
      createdAt: new Date().toISOString(),
    };

    StorageManager.createTeam(newTeam);
    loadTeams();

    // Reset form
    setTeamName('');
    setSport('flag-football');
    setDivision('FR');
    setSeason('fall');
    setYear('');
    setLogoFile(null);
    setLogoPreview('');
    setShowTeamSetupModal(false);

    alert('Team created successfully!');
  };

  const handleDeleteTeam = (teamId: string) => {
    if (confirm('Are you sure you want to delete this team?')) {
      StorageManager.deleteTeam(teamId);
      loadTeams();
    }
  };

  const handleTeamClick = (teamId: string) => {
    // Navigate to roster page with team context
    router.push(`/roster?teamId=${teamId}`);
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!isAuthenticated || !session) {
    return null;
  }

  return (
    <div className=\"min-h-screen bg-[#1e293b] text-slate-100 font-[family-name:var(--font-inter)]\">
      {/* Navigation */}
      <nav className=\"fixed top-0 left-0 right-0 z-50 bg-[#1e293b]/95 backdrop-blur-sm border-b border-slate-700/50\">
        <div className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8\">\n          <div className=\"flex items-center justify-between h-16\">\n            <div className=\"flex items-center\">\n              <Link\n                href=\"/\"\n                className=\"font-[family-name:var(--font-playfair)] text-2xl font-bold bg-gradient-to-r from-[#16a34a] to-[#22c55e] bg-clip-text text-transparent\"\n              >\n                FlagFooty\n              </Link>\n            </div>\n\n            {/* Desktop Navigation */}\n            <div className=\"hidden md:flex items-center space-x-8\">\n              <Link href=\"/coach-dashboard\" className=\"text-[#16a34a] font-semibold transition-colors duration-200\">Dashboard</Link>\n              <button\n                onClick={handleLogout}\n                className=\"flex items-center gap-2 text-slate-300 hover:text-red-400 transition-colors duration-200\"\n              >\n                <LogOut className=\"w-4 h-4\" />\n                Logout\n              </button>\n            </div>\n\n            {/* Mobile menu button */}\n            <div className=\"md:hidden\">\n              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className=\"text-slate-300 hover:text-white\">\n                {mobileMenuOpen ? <X className=\"w-6 h-6\" /> : <Menu className=\"w-6 h-6\" />}\n              </button>\n            </div>\n          </div>\n        </div>\n\n        {/* Mobile Navigation */}\n        {mobileMenuOpen && (\n          <div className=\"md:hidden border-t border-slate-700/50\">\n            <div className=\"px-4 pt-2 pb-4 space-y-2\">\n              <Link href=\"/coach-dashboard\" className=\"block px-3 py-2 text-[#16a34a] font-semibold hover:bg-slate-800/50 rounded-lg transition-all\" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>\n              <button onClick={handleLogout} className=\"w-full text-left px-3 py-2 text-red-400 hover:bg-slate-800/50 rounded-lg transition-all\">\n                Logout\n              </button>\n            </div>\n          </div>\n        )}\n      </nav>\n\n      {/* Main Content */}\n      <div className=\"pt-24 px-4 pb-12\">\n        <div className=\"max-w-7xl mx-auto\">\n          {/* Header */}\n          <div className=\"mb-8\">\n            <h1 className=\"font-[family-name:var(--font-playfair)] text-4xl md:text-5xl font-bold mb-2\">\n              Welcome, <span className=\"text-[#16a34a]\">{session.firstName}</span>\n            </h1>\n            <p className=\"text-slate-400 text-lg\">Manage your teams and rosters</p>\n          </div>\n\n          {/* Teams Section */}\n          <div className=\"mb-8\">\n            <div className=\"flex items-center justify-between mb-6\">\n              <h2 className=\"font-[family-name:var(--font-playfair)] text-3xl font-bold\">\n                Your <span className=\"text-[#16a34a]\">Teams</span>\n              </h2>\n              <button\n                onClick={() => setShowTeamSetupModal(true)}\n                className=\"flex items-center gap-2 bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(22,163,74,0.4)] transition-all duration-300\"\n              >\n                <Plus className=\"w-5 h-5\" />\n                Set Up a Team\n              </button>\n            </div>\n\n            {/* Teams Grid or Empty State */}\n            {teams.length === 0 ? (\n              <div className=\"bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-16 text-center\">\n                <div className=\"max-w-md mx-auto\">\n                  <div className=\"w-20 h-20 bg-gradient-to-br from-[#16a34a] to-[#22c55e] rounded-full flex items-center justify-center mx-auto mb-6\">\n                    <Plus className=\"w-10 h-10 text-white\" />\n                  </div>\n                  <h3 className=\"font-[family-name:var(--font-playfair)] text-2xl font-bold mb-3\">\n                    No Teams Yet\n                  </h3>\n                  <p className=\"text-slate-400 mb-6\">\n                    Get started by setting up your first team. Add team details, logo, and start managing your roster.\n                  </p>\n                  <button\n                    onClick={() => setShowTeamSetupModal(true)}\n                    className=\"bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white px-8 py-3 rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(22,163,74,0.4)] transition-all duration-300\"\n                  >\n                    Set Up a Team\n                  </button>\n                </div>\n              </div>\n            ) : (\n              <div className=\"grid md:grid-cols-2 lg:grid-cols-3 gap-6\">\n                {teams.map(team => (\n                  <div\n                    key={team.id}\n                    className=\"bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden hover:border-[#16a34a]/50 transition-all duration-300 cursor-pointer group\"\n                    onClick={() => handleTeamClick(team.id)}\n                  >\n                    {/* Team Logo */}\n                    <div className=\"h-40 bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center p-6\">\n                      {team.logoUrl ? (\n                        <img src={team.logoUrl} alt={team.name} className=\"max-h-full max-w-full object-contain\" />\n                      ) : (\n                        <div className=\"text-6xl font-[family-name:var(--font-playfair)] font-bold text-slate-600\">\n                          {team.name.charAt(0).toUpperCase()}\n                        </div>\n                      )}\n                    </div>\n\n                    {/* Team Info */}\n                    <div className=\"p-6\">\n                      <h3 className=\"font-[family-name:var(--font-playfair)] text-2xl font-bold mb-2 text-white group-hover:text-[#16a34a] transition-colors\">\n                        {team.name}\n                      </h3>\n\n                      <div className=\"space-y-2 text-sm text-slate-400 mb-4\">\n                        <p>\n                          <span className=\"font-semibold text-slate-300\">Sport:</span>{' '}\n                          {team.sport === 'flag-football' ? 'Flag Football' : 'Soccer'}\n                        </p>\n                        {team.division && (\n                          <p>\n                            <span className=\"font-semibold text-slate-300\">Division:</span>{' '}\n                            {team.division}\n                          </p>\n                        )}\n                        <p>\n                          <span className=\"font-semibold text-slate-300\">Season:</span>{' '}\n                          {team.season.charAt(0).toUpperCase() + team.season.slice(1)} {team.year}\n                        </p>\n                      </div>\n\n                      <div className=\"flex gap-2\">\n                        <button\n                          onClick={(e) => {\n                            e.stopPropagation();\n                            handleTeamClick(team.id);\n                          }}\n                          className=\"flex-1 bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white px-4 py-2 rounded-lg font-semibold hover:shadow-[0_0_15px_rgba(22,163,74,0.3)] transition-all duration-300\"\n                        >\n                          View Roster\n                        </button>\n                        <button\n                          onClick={(e) => {\n                            e.stopPropagation();\n                            handleDeleteTeam(team.id);\n                          }}\n                          className=\"p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800/50 rounded-lg transition-all\"\n                        >\n                          <Trash2 className=\"w-5 h-5\" />\n                        </button>\n                      </div>\n                    </div>\n                  </div>\n                ))}\n              </div>\n            )}\n          </div>\n        </div>\n      </div>\n\n      {/* Team Setup Modal */}\n      {showTeamSetupModal && (\n        <div className=\"fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm\" onClick={(e) => e.target === e.currentTarget && setShowTeamSetupModal(false)}>\n          <div className=\"bg-slate-800 rounded-2xl border border-slate-700 max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto\">\n            <h2 className=\"font-[family-name:var(--font-playfair)] text-3xl font-bold mb-6\">Set Up a Team</h2>\n            <form onSubmit={handleCreateTeam} className=\"space-y-6\">\n              {/* Team Name */}\n              <div>\n                <label className=\"block text-sm font-semibold text-slate-300 mb-2\">Team Name *</label>\n                <input\n                  type=\"text\"\n                  value={teamName}\n                  onChange={(e) => setTeamName(e.target.value)}\n                  className=\"w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/20 transition-all\"\n                  placeholder=\"e.g., Thunder Bolts\"\n                  required\n                />\n              </div>\n\n              {/* Sport */}\n              <div>\n                <label className=\"block text-sm font-semibold text-slate-300 mb-2\">Sport *</label>\n                <select\n                  value={sport}\n                  onChange={(e) => setSport(e.target.value as 'flag-football' | 'soccer')}\n                  className=\"w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/20 transition-all cursor-pointer\"\n                >\n                  <option value=\"flag-football\">Flag Football</option>\n                  <option value=\"soccer\">Soccer</option>\n                </select>\n              </div>\n\n              {/* Division (Flag Football only) */}\n              {sport === 'flag-football' && (\n                <div>\n                  <label className=\"block text-sm font-semibold text-slate-300 mb-2\">Division *</label>\n                  <select\n                    value={division}\n                    onChange={(e) => setDivision(e.target.value as 'KIND' | 'FR' | 'SO' | 'JR' | 'SR')}\n                    className=\"w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/20 transition-all cursor-pointer\"\n                  >\n                    <option value=\"KIND\">KIND - Kindergarten</option>\n                    <option value=\"FR\">FR - Freshman</option>\n                    <option value=\"SO\">SO - Sophomore</option>\n                    <option value=\"JR\">JR - Junior</option>\n                    <option value=\"SR\">SR - Senior</option>\n                  </select>\n                </div>\n              )}\n\n              {/* Season */}\n              <div>\n                <label className=\"block text-sm font-semibold text-slate-300 mb-2\">Season *</label>\n                <select\n                  value={season}\n                  onChange={(e) => setSeason(e.target.value as 'fall' | 'spring' | 'summer')}\n                  className=\"w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/20 transition-all cursor-pointer\"\n                >\n                  <option value=\"fall\">Fall</option>\n                  <option value=\"spring\">Spring</option>\n                  <option value=\"summer\">Summer</option>\n                </select>\n              </div>\n\n              {/* Year */}\n              <div>\n                <label className=\"block text-sm font-semibold text-slate-300 mb-2\">Year *</label>\n                <input\n                  type=\"text\"\n                  value={year}\n                  onChange={(e) => setYear(e.target.value)}\n                  className=\"w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/20 transition-all\"\n                  placeholder=\"XXXX\"\n                  required\n                />\n              </div>\n\n              {/* Logo Upload */}\n              <div>\n                <label className=\"block text-sm font-semibold text-slate-300 mb-2\">Team Logo (Optional)</label>\n                <div className=\"flex items-center gap-4\">\n                  {logoPreview && (\n                    <div className=\"w-24 h-24 rounded-lg bg-slate-900/50 border border-slate-700 flex items-center justify-center overflow-hidden\">\n                      <img src={logoPreview} alt=\"Logo preview\" className=\"max-w-full max-h-full object-contain\" />\n                    </div>\n                  )}\n                  <label className=\"flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-slate-300 hover:text-white hover:border-[#16a34a] cursor-pointer transition-all\">\n                    <Upload className=\"w-5 h-5\" />\n                    <span>{logoFile ? logoFile.name : 'Upload Logo'}</span>\n                    <input\n                      type=\"file\"\n                      accept=\"image/*\"\n                      onChange={handleLogoChange}\n                      className=\"hidden\"\n                    />\n                  </label>\n                </div>\n              </div>\n\n              {/* Buttons */}\n              <div className=\"flex gap-3 pt-4\">\n                <button type=\"button\" onClick={() => setShowTeamSetupModal(false)} className=\"flex-1 px-6 py-3 bg-slate-700 text-white rounded-lg font-semibold hover:bg-slate-600 transition-all duration-300\">\n                  Cancel\n                </button>\n                <button type=\"submit\" className=\"flex-1 px-6 py-3 bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(22,163,74,0.4)] transition-all duration-300\">\n                  Create Team\n                </button>\n              </div>\n            </form>\n          </div>\n        </div>\n      )}\n\n      {/* Footer */}\n      <footer className=\"py-12 px-4 border-t border-slate-800/50\">\n        <div className=\"max-w-7xl mx-auto text-center\">\n          <h3 className=\"font-[family-name:var(--font-playfair)] text-2xl font-bold mb-2 bg-gradient-to-r from-[#16a34a] to-[#22c55e] bg-clip-text text-transparent\">\n            FlagFooty\n          </h3>\n          <p className=\"text-slate-500 text-sm\">\n            &copy; {new Date().getFullYear()} FlagFooty. All rights reserved.\n          </p>\n        </div>\n      </footer>\n    </div>\n  );\n}\n