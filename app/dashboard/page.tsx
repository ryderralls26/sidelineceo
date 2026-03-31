'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Menu, X, LogOut, Mail, Plus, Trash2, UserPlus, Shield, Trophy, Users } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { StorageManager, Invite, AwardType } from '@/lib/storage';

export default function DashboardPage() {
  const router = useRouter();
  const { session, isAuthenticated, isCoach, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [awardTypes, setAwardTypes] = useState<AwardType[]>([]);

  // Invite form
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'parent' | 'player'>('parent');
  const [inviteAdmin, setInviteAdmin] = useState(false);

  // Award type form
  const [showAwardModal, setShowAwardModal] = useState(false);
  const [awardName, setAwardName] = useState('');
  const [awardDescription, setAwardDescription] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    loadInvites();
    loadAwardTypes();
  }, [isAuthenticated, router]);

  const loadInvites = () => {
    const allInvites = StorageManager.getAllInvites();
    setInvites(allInvites);
  };

  const loadAwardTypes = () => {
    const types = StorageManager.getAwardTypes();
    setAwardTypes(types);
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();

    if (!session) return;

    const invite: Invite = {
      id: Date.now().toString(),
      email: inviteEmail,
      role: inviteRole,
      isAdmin: inviteRole === 'parent' ? inviteAdmin : false,
      sentBy: session.userId,
      sentAt: new Date().toISOString(),
      status: 'pending',
    };

    StorageManager.createInvite(invite);
    loadInvites();

    // Reset form
    setInviteEmail('');
    setInviteRole('parent');
    setInviteAdmin(false);
    setShowInviteModal(false);

    alert(`Invite sent to ${inviteEmail}!`);
  };

  const deleteInvite = (id: string) => {
    if (confirm('Are you sure you want to delete this invite?')) {
      StorageManager.deleteInvite(id);
      loadInvites();
    }
  };

  const handleAddAwardType = (e: React.FormEvent) => {
    e.preventDefault();

    const newAward: AwardType = {
      id: Date.now().toString(),
      name: awardName,
      description: awardDescription,
    };

    const updated = [...awardTypes, newAward];
    StorageManager.saveAwardTypes(updated);
    loadAwardTypes();

    // Reset form
    setAwardName('');
    setAwardDescription('');
    setShowAwardModal(false);

    alert('Award type added successfully!');
  };

  const deleteAwardType = (id: string) => {
    if (confirm('Are you sure you want to delete this award type?')) {
      const updated = awardTypes.filter(a => a.id !== id);
      StorageManager.saveAwardTypes(updated);
      loadAwardTypes();
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
                FlagFooty
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-slate-300 hover:text-[#16a34a] transition-colors duration-200">Home</Link>
              <Link href="/roster" className="text-slate-300 hover:text-[#16a34a] transition-colors duration-200">Roster</Link>
              <Link href="/schedule" className="text-slate-300 hover:text-[#16a34a] transition-colors duration-200">Schedule</Link>
              <Link href="/positions" className="text-slate-300 hover:text-[#16a34a] transition-colors duration-200">Positions</Link>
              <Link href="/awards" className="text-slate-300 hover:text-[#16a34a] transition-colors duration-200">Awards</Link>
              <Link href="/archive" className="text-slate-300 hover:text-[#16a34a] transition-colors duration-200">Archive</Link>
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
              <Link href="/" className="block px-3 py-2 text-slate-300 hover:text-[#16a34a] hover:bg-slate-800/50 rounded-lg transition-all" onClick={() => setMobileMenuOpen(false)}>Home</Link>
              <Link href="/roster" className="block px-3 py-2 text-slate-300 hover:text-[#16a34a] hover:bg-slate-800/50 rounded-lg transition-all" onClick={() => setMobileMenuOpen(false)}>Roster</Link>
              <Link href="/schedule" className="block px-3 py-2 text-slate-300 hover:text-[#16a34a] hover:bg-slate-800/50 rounded-lg transition-all" onClick={() => setMobileMenuOpen(false)}>Schedule</Link>
              <Link href="/positions" className="block px-3 py-2 text-slate-300 hover:text-[#16a34a] hover:bg-slate-800/50 rounded-lg transition-all" onClick={() => setMobileMenuOpen(false)}>Positions</Link>
              <Link href="/awards" className="block px-3 py-2 text-slate-300 hover:text-[#16a34a] hover:bg-slate-800/50 rounded-lg transition-all" onClick={() => setMobileMenuOpen(false)}>Awards</Link>
              <Link href="/archive" className="block px-3 py-2 text-slate-300 hover:text-[#16a34a] hover:bg-slate-800/50 rounded-lg transition-all" onClick={() => setMobileMenuOpen(false)}>Archive</Link>
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
            <div className="flex items-center gap-2 text-slate-400">
              <Shield className="w-5 h-5" />
              <span className="capitalize">{session.role}</span>
              {session.isAdmin && <span className="text-[#16a34a]">(Admin)</span>}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Link href="/roster" className="bg-slate-800/30 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50 hover:border-[#16a34a]/50 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#16a34a] to-[#22c55e] rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">{StorageManager.getAllUsers().length}</h3>
                  <p className="text-slate-400 text-sm">Team Members</p>
                </div>
              </div>
            </Link>

            <Link href="/schedule" className="bg-slate-800/30 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50 hover:border-[#16a34a]/50 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#16a34a] to-[#22c55e] rounded-lg flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">{StorageManager.getAllGames().length}</h3>
                  <p className="text-slate-400 text-sm">Games</p>
                </div>
              </div>
            </Link>

            <Link href="/awards" className="bg-slate-800/30 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50 hover:border-[#16a34a]/50 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-600 to-yellow-400 rounded-lg flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">{StorageManager.getAllAwards().length}</h3>
                  <p className="text-slate-400 text-sm">Awards Given</p>
                </div>
              </div>
            </Link>
          </div>

          {/* Coach-Only Features */}
          {isCoach && (
            <>
              {/* Team Invites Section */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold">
                    Team <span className="text-[#16a34a]">Invites</span>
                  </h2>
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="flex items-center gap-2 bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white px-4 py-2 rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(22,163,74,0.4)] transition-all duration-300"
                  >
                    <UserPlus className="w-5 h-5" />
                    Invite Member
                  </button>
                </div>

                <div className="space-y-3">
                  {invites.length === 0 ? (
                    <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-8 text-center">
                      <Mail className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                      <p className="text-slate-400">No invites sent yet</p>
                    </div>
                  ) : (
                    invites.map(invite => (
                      <div key={invite.id} className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-4 flex items-center justify-between">
                        <div>
                          <p className="text-white font-semibold">{invite.email}</p>
                          <p className="text-sm text-slate-400">
                            {invite.role} {invite.isAdmin && '(Admin)'} • {invite.status}
                          </p>
                        </div>
                        <button
                          onClick={() => deleteInvite(invite.id)}
                          className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800/50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Award Types Management */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold">
                    Awards <span className="text-[#16a34a]">Management</span>
                  </h2>
                  <button
                    onClick={() => setShowAwardModal(true)}
                    className="flex items-center gap-2 bg-gradient-to-r from-yellow-600 to-yellow-500 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(234,179,8,0.4)] transition-all duration-300"
                  >
                    <Plus className="w-5 h-5" />
                    Add Award Type
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {awardTypes.map(award => (
                    <div key={award.id} className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-4 flex items-start justify-between">
                      <div>
                        <h3 className="text-white font-bold">{award.name}</h3>
                        {award.description && <p className="text-sm text-slate-400 mt-1">{award.description}</p>}
                      </div>
                      <button
                        onClick={() => deleteAwardType(award.id)}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800/50 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && setShowInviteModal(false)}>
          <div className="bg-slate-800 rounded-2xl border border-slate-700 max-w-md w-full p-8">
            <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold mb-6">Invite Team Member</h2>
            <form onSubmit={handleSendInvite} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Email</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/20 transition-all"
                  placeholder="member@email.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as 'parent' | 'player')}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/20 transition-all cursor-pointer"
                >
                  <option value="parent">Parent</option>
                  <option value="player">Player</option>
                </select>
              </div>
              {inviteRole === 'parent' && (
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="inviteAdmin"
                    checked={inviteAdmin}
                    onChange={(e) => setInviteAdmin(e.target.checked)}
                    className="mt-1 w-5 h-5 rounded border-slate-600 bg-slate-800 text-[#16a34a] focus:ring-[#16a34a] focus:ring-offset-0 cursor-pointer"
                  />
                  <label htmlFor="inviteAdmin" className="text-sm text-slate-300 cursor-pointer">
                    Grant admin access (can edit team data)
                  </label>
                </div>
              )}
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowInviteModal(false)} className="flex-1 px-6 py-3 bg-slate-700 text-white rounded-lg font-semibold hover:bg-slate-600 transition-all duration-300">
                  Cancel
                </button>
                <button type="submit" className="flex-1 px-6 py-3 bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(22,163,74,0.4)] transition-all duration-300">
                  Send Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Award Type Modal */}
      {showAwardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && setShowAwardModal(false)}>
          <div className="bg-slate-800 rounded-2xl border border-slate-700 max-w-md w-full p-8">
            <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold mb-6">Add Award Type</h2>
            <form onSubmit={handleAddAwardType} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Award Name</label>
                <input
                  type="text"
                  value={awardName}
                  onChange={(e) => setAwardName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/20 transition-all"
                  placeholder="e.g., Best Defender"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Description (Optional)</label>
                <textarea
                  value={awardDescription}
                  onChange={(e) => setAwardDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/20 transition-all resize-none"
                  placeholder="Brief description..."
                  rows={3}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowAwardModal(false)} className="flex-1 px-6 py-3 bg-slate-700 text-white rounded-lg font-semibold hover:bg-slate-600 transition-all duration-300">
                  Cancel
                </button>
                <button type="submit" className="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-600 to-yellow-500 text-white rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(234,179,8,0.4)] transition-all duration-300">
                  Add Award
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
