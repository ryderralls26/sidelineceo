'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Menu, X, LogOut, Plus, Trash2, Upload, UserPlus, MoreVertical, Copy, Edit2 } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useTeam } from '@/lib/TeamContext';
import { getTeamsByCoach, createTeam, deleteTeam, updateTeam, duplicateTeam } from '@/app/api/actions/teams';
import InviteParentModal from '@/components/InviteParentModal';

interface Team {
  id: string;
  name: string;
  sport: 'flag_football' | 'soccer';
  division?: 'KIND' | 'FR' | 'SO' | 'JR' | 'SR' | null;
  season: 'fall' | 'spring' | 'summer';
  year: string;
  logoUrl?: string | null;
  coachId: string;
  createdAt: Date;
}

export default function CoachDashboardClient() {
  const router = useRouter();
  const { session, isAuthenticated, isCoach, logout } = useAuth();
  const { setActiveTeam } = useTeam();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [showTeamSetupModal, setShowTeamSetupModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [selectedTeamForInvite, setSelectedTeamForInvite] = useState<{ id: string; name: string } | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [isDuplicating, setIsDuplicating] = useState(false);

  // Team Setup Form State
  const [teamName, setTeamName] = useState('');
  const [sport, setSport] = useState<'flag_football' | 'soccer'>('flag_football');
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

  const loadTeams = async () => {
    if (!session) return;

    setLoading(true);
    const result = await getTeamsByCoach(session.userId);
    if (result.success && result.data) {
      setTeams(result.data);
    }
    setLoading(false);
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

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session) return;

    // If editing, update instead
    if (editingTeam) {
      return handleUpdateTeam(e);
    }

    const result = await createTeam({
      name: teamName,
      sport,
      division: sport === 'flag_football' ? division : undefined,
      season,
      year,
      logoUrl: logoPreview || undefined,
      coachId: session.userId,
    });

    if (result.success) {
      await loadTeams();

      // Reset form
      setTeamName('');
      setSport('flag_football');
      setDivision('FR');
      setSeason('fall');
      setYear('');
      setLogoFile(null);
      setLogoPreview('');
      setShowTeamSetupModal(false);

      alert('Team created successfully!');
    } else {
      alert(result.error || 'Failed to create team');
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (confirm('Are you sure you want to delete this team?')) {
      const result = await deleteTeam(teamId);
      if (result.success) {
        await loadTeams();
      } else {
        alert(result.error || 'Failed to delete team');
      }
    }
  };

  const handleTeamClick = (teamId: string, teamName: string) => {
    // Set active team and navigate to schedule
    setActiveTeam(teamId, teamName);
    router.push('/schedule');
  };

  const handleDuplicateTeam = async (teamId: string) => {
    if (!session) return;

    setIsDuplicating(true);
    const result = await duplicateTeam(teamId, session.userId);

    if (result.success) {
      await loadTeams();
      setOpenMenuId(null);
      alert('Team duplicated successfully!');
    } else {
      alert(result.error || 'Failed to duplicate team');
    }
    setIsDuplicating(false);
  };

  const handleEditTeam = (team: Team) => {
    setEditingTeam(team);
    setTeamName(team.name);
    setSport(team.sport);
    setDivision(team.division || 'FR');
    setSeason(team.season);
    setYear(team.year);
    setLogoPreview(team.logoUrl || '');
    setShowTeamSetupModal(true);
    setOpenMenuId(null);
  };

  const handleUpdateTeam = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session || !editingTeam) return;

    const result = await updateTeam(editingTeam.id, {
      name: teamName,
      sport,
      division: sport === 'flag_football' ? division : undefined,
      season,
      year,
      logoUrl: logoPreview || undefined,
    });

    if (result.success) {
      await loadTeams();

      // Reset form
      setTeamName('');
      setSport('flag_football');
      setDivision('FR');
      setSeason('fall');
      setYear('');
      setLogoFile(null);
      setLogoPreview('');
      setShowTeamSetupModal(false);
      setEditingTeam(null);

      alert('Team updated successfully!');
    } else {
      alert(result.error || 'Failed to update team');
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!isAuthenticated || !session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#1e293b] text-slate-100 font-[family-name:var(--font-inter)]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#1e293b]/95 backdrop-blur-sm border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link
                href="/"
                className="font-[family-name:var(--font-playfair)] text-2xl font-bold bg-gradient-to-r from-[#16a34a] to-[#22c55e] bg-clip-text text-transparent"
              >
                SidelineCEO
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/coach-dashboard" className="text-[#16a34a] font-semibold transition-colors duration-200">Dashboard</Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-slate-300 hover:text-red-400 transition-colors duration-200"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-slate-300 hover:text-white">
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-700/50">
            <div className="px-4 pt-2 pb-4 space-y-2">
              <Link href="/coach-dashboard" className="block px-3 py-2 text-[#16a34a] font-semibold hover:bg-slate-800/50 rounded-lg transition-all" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
              <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-red-400 hover:bg-slate-800/50 rounded-lg transition-all">
                Logout
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <div className="pt-24 px-4 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl font-bold mb-2">
              Welcome, <span className="text-[#16a34a]">{session.firstName}</span>
            </h1>
            <p className="text-slate-400 text-lg">Manage your teams and rosters</p>
          </div>

          {/* Teams Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold">
                Your <span className="text-[#16a34a]">Teams</span>
              </h2>
              <button
                onClick={() => setShowTeamSetupModal(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(22,163,74,0.4)] transition-all duration-300"
              >
                <Plus className="w-5 h-5" />
                Set Up a Team
              </button>
            </div>

            {/* Teams Grid or Empty State */}
            {loading ? (
              <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-16 text-center">
                <p className="text-slate-400">Loading teams...</p>
              </div>
            ) : teams.length === 0 ? (
              <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-16 text-center">
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#16a34a] to-[#22c55e] rounded-full flex items-center justify-center mx-auto mb-6">
                    <Plus className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="font-[family-name:var(--font-playfair)] text-2xl font-bold mb-3">
                    No Teams Yet
                  </h3>
                  <p className="text-slate-400 mb-6">
                    Get started by setting up your first team. Add team details, logo, and start managing your roster.
                  </p>
                  <button
                    onClick={() => setShowTeamSetupModal(true)}
                    className="bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white px-8 py-3 rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(22,163,74,0.4)] transition-all duration-300"
                  >
                    Set Up a Team
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teams.map(team => (
                  <div
                    key={team.id}
                    className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden hover:border-[#16a34a]/50 transition-all duration-300 cursor-pointer group relative"
                    onClick={() => handleTeamClick(team.id, team.name)}
                  >
                    {/* Team Logo */}
                    <div className="h-40 bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center p-6 relative">
                      {/* Menu Button */}
                      <div className="absolute top-2 right-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(openMenuId === team.id ? null : team.id);
                          }}
                          className="p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-all"
                          title="Team options"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>

                        {/* Dropdown Menu */}
                        {openMenuId === team.id && (
                          <div className="absolute top-full right-0 mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-10 min-w-[160px]">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDuplicateTeam(team.id);
                              }}
                              disabled={isDuplicating}
                              className="w-full flex items-center gap-2 px-4 py-2 text-left text-slate-300 hover:bg-slate-700 hover:text-white transition-all disabled:opacity-50"
                            >
                              <Copy className="w-4 h-4" />
                              {isDuplicating ? 'Duplicating...' : 'Duplicate'}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditTeam(team);
                              }}
                              className="w-full flex items-center gap-2 px-4 py-2 text-left text-slate-300 hover:bg-slate-700 hover:text-white transition-all"
                            >
                              <Edit2 className="w-4 h-4" />
                              Edit
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuId(null);
                                handleDeleteTeam(team.id);
                              }}
                              className="w-full flex items-center gap-2 px-4 py-2 text-left text-red-400 hover:bg-slate-700 hover:text-red-300 transition-all rounded-b-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>

                      {team.logoUrl ? (
                        <img src={team.logoUrl} alt={team.name} className="max-h-full max-w-full object-contain" />
                      ) : (
                        <div className="text-6xl font-[family-name:var(--font-playfair)] font-bold text-slate-600">
                          {team.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Team Info */}
                    <div className="p-6">
                      <h3 className="font-[family-name:var(--font-playfair)] text-2xl font-bold mb-2 text-white group-hover:text-[#16a34a] transition-colors">
                        {team.name}
                      </h3>

                      <div className="space-y-2 text-sm text-slate-400 mb-4">
                        <p>
                          <span className="font-semibold text-slate-300">Sport:</span>{' '}
                          {team.sport === 'flag_football' ? 'Flag Football' : 'Soccer'}
                        </p>
                        {team.division && (
                          <p>
                            <span className="font-semibold text-slate-300">Division:</span>{' '}
                            {team.division}
                          </p>
                        )}
                        <p>
                          <span className="font-semibold text-slate-300">Season:</span>{' '}
                          {team.season.charAt(0).toUpperCase() + team.season.slice(1)} {team.year}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTeamClick(team.id, team.name);
                          }}
                          className="flex-1 bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white px-4 py-2 rounded-lg font-semibold hover:shadow-[0_0_15px_rgba(22,163,74,0.3)] transition-all duration-300"
                        >
                          View Schedule
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTeamForInvite({ id: team.id, name: team.name });
                            setInviteModalOpen(true);
                          }}
                          className="p-2 text-slate-400 hover:text-[#16a34a] hover:bg-slate-800/50 rounded-lg transition-all"
                          title="Invite Parent/Viewer"
                        >
                          <UserPlus className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Team Setup Modal */}
      {showTeamSetupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && setShowTeamSetupModal(false)}>
          <div className="bg-slate-800 rounded-2xl border border-slate-700 max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold mb-6">
              {editingTeam ? 'Edit Team' : 'Set Up a Team'}
            </h2>
            <form onSubmit={handleCreateTeam} className="space-y-6">
              {/* Team Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Team Name *</label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/20 transition-all"
                  placeholder="e.g., Thunder Bolts"
                  required
                />
              </div>

              {/* Sport */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Sport *</label>
                <select
                  value={sport}
                  onChange={(e) => setSport(e.target.value as 'flag_football' | 'soccer')}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/20 transition-all cursor-pointer"
                >
                  <option value="flag_football">Flag Football</option>
                  <option value="soccer">Soccer</option>
                </select>
              </div>

              {/* Division (Flag Football only) */}
              {sport === 'flag_football' && (
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Division *</label>
                  <select
                    value={division}
                    onChange={(e) => setDivision(e.target.value as 'KIND' | 'FR' | 'SO' | 'JR' | 'SR')}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/20 transition-all cursor-pointer"
                  >
                    <option value="KIND">KIND - Kindergarten</option>
                    <option value="FR">FR - Freshman</option>
                    <option value="SO">SO - Sophomore</option>
                    <option value="JR">JR - Junior</option>
                    <option value="SR">SR - Senior</option>
                  </select>
                </div>
              )}

              {/* Season */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Season *</label>
                <select
                  value={season}
                  onChange={(e) => setSeason(e.target.value as 'fall' | 'spring' | 'summer')}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/20 transition-all cursor-pointer"
                >
                  <option value="fall">Fall</option>
                  <option value="spring">Spring</option>
                  <option value="summer">Summer</option>
                </select>
              </div>

              {/* Year */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Year *</label>
                <input
                  type="text"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/20 transition-all"
                  placeholder="XXXX"
                  required
                />
              </div>

              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Team Logo (Optional)</label>
                <div className="flex items-center gap-4">
                  {logoPreview && (
                    <div className="w-24 h-24 rounded-lg bg-slate-900/50 border border-slate-700 flex items-center justify-center overflow-hidden">
                      <img src={logoPreview} alt="Logo preview" className="max-w-full max-h-full object-contain" />
                    </div>
                  )}
                  <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-slate-300 hover:text-white hover:border-[#16a34a] cursor-pointer transition-all">
                    <Upload className="w-5 h-5" />
                    <span>{logoFile ? logoFile.name : 'Upload Logo'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowTeamSetupModal(false);
                    setEditingTeam(null);
                  }}
                  className="flex-1 px-6 py-3 bg-slate-700 text-white rounded-lg font-semibold hover:bg-slate-600 transition-all duration-300"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 px-6 py-3 bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(22,163,74,0.4)] transition-all duration-300">
                  {editingTeam ? 'Update Team' : 'Create Team'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite Parent Modal */}
      {selectedTeamForInvite && session && (
        <InviteParentModal
          isOpen={inviteModalOpen}
          onClose={() => {
            setInviteModalOpen(false);
            setSelectedTeamForInvite(null);
          }}
          teamId={selectedTeamForInvite.id}
          teamName={selectedTeamForInvite.name}
          coachId={session.userId}
        />
      )}

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
    </div>
  );
}
