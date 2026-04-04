'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Menu, X, LogOut, Users, Calendar, Archive, Eye, Mail } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { getUserTeams } from '@/lib/actions/teams';
import { ShareButton } from '@/components/ShareButton';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ErrorState } from '@/components/ErrorState';
import { getPendingInviteNotifications } from '@/lib/actions/notifications';

interface TeamWithRole {
  id: string;
  name: string;
  sport: string;
  division?: string | null;
  season: string;
  year: string;
  logoUrl?: string | null;
  coach: {
    firstName: string;
    lastName: string;
  };
  _count: {
    players: number;
    games: number;
  };
  userRole: 'OWNER' | 'ADMIN' | 'CO_COACH' | 'VIEWER';
}

interface PendingInvite {
  id: string;
  message: string;
  teamId: string | null;
  createdAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { session, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [teams, setTeams] = useState<TeamWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);

  useEffect(() => {
    if (!isAuthenticated || !session) {
      router.push('/login');
      return;
    }

    loadTeams();
  }, [isAuthenticated, session, router]);

  const loadTeams = async () => {
    if (!session) return;

    setLoading(true);
    setError(null);
    try {
      const result = await getUserTeams(session.userId);
      if (result.success && result.teams) {
        setTeams(result.teams);
      } else {
        setError(result.error || 'Failed to load teams');
      }

      // Load pending invites
      const invitesResult = await getPendingInviteNotifications(session.userId);
      if (invitesResult.success && invitesResult.notifications) {
        setPendingInvites(invitesResult.notifications.map(n => ({
          ...n,
          createdAt: n.createdAt.toString(),
        })));
      }
    } catch (err) {
      console.error('Error loading teams:', err);
      setError('An unexpected error occurred while loading teams');
    } finally {
      setLoading(false);
    }
  };

  const handleTeamClick = (teamId: string, userRole: string) => {
    // Navigate based on role
    if (userRole === 'COACH') {
      router.push(`/roster?teamId=${teamId}`);
    } else {
      // VIEWER - go to read-only roster
      router.push(`/teams/${teamId}/roster`);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!isAuthenticated || !session) {
    return null;
  }

  const isCoach = session.role === 'coach';
  const coachTeams = teams.filter(t => t.userRole === 'OWNER' || t.userRole === 'ADMIN' || t.userRole === 'CO_COACH');
  const viewerTeams = teams.filter(t => t.userRole === 'VIEWER');

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
              <Link href="/dashboard" className="text-[#16a34a] font-semibold transition-colors duration-200">
                Dashboard
              </Link>
              {isCoach && (
                <Link href="/coach-dashboard" className="text-slate-300 hover:text-[#16a34a] transition-colors duration-200">
                  Coach Tools
                </Link>
              )}
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
              <Link href="/dashboard" className="block px-3 py-2 text-[#16a34a] font-semibold bg-slate-800/50 rounded-lg transition-all" onClick={() => setMobileMenuOpen(false)}>
                Dashboard
              </Link>
              {isCoach && (
                <Link href="/coach-dashboard" className="block px-3 py-2 text-slate-300 hover:text-[#16a34a] hover:bg-slate-800/50 rounded-lg transition-all" onClick={() => setMobileMenuOpen(false)}>
                  Coach Tools
                </Link>
              )}
              <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-red-400 hover:bg-slate-800/50 rounded-lg transition-all">
                Logout
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <div className="pt-24 px-4 pb-12 animate-in fade-in duration-200">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl font-bold mb-2">
                  Welcome, <span className="text-[#16a34a]">{session.firstName}</span>
                </h1>
                <p className="text-slate-400">
                  {isCoach ? 'Manage your teams and view parent access' : 'View your linked teams'}
                </p>
              </div>
              <ShareButton>Recruit Your Crew</ShareButton>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <LoadingSkeleton rows={3} type="card" />
          ) : error ? (
            <ErrorState message={error} onRetry={loadTeams} />
          ) : teams.length === 0 ? (
            /* Empty State */
            <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-16 text-center">
              <div className="max-w-md mx-auto">
                <Users className="w-20 h-20 text-slate-600 mx-auto mb-6" />
                <h3 className="font-[family-name:var(--font-playfair)] text-2xl font-bold mb-3">
                  No Teams Yet
                </h3>
                <p className="text-slate-400 mb-6">
                  {isCoach
                    ? 'Get started by creating your first team in Coach Dashboard.'
                    : "You haven't been invited to any teams yet. Ask your coach to send you an invite!"}
                </p>
                {isCoach && (
                  <Link
                    href="/coach-dashboard"
                    className="inline-block bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white px-8 py-3 rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(22,163,74,0.4)] transition-all duration-300"
                  >
                    Go to Coach Dashboard
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Pending Team Invites */}
              {pendingInvites.length > 0 && (
                <div className="bg-gradient-to-r from-[#16a34a]/10 to-[#22c55e]/10 backdrop-blur-sm rounded-xl border border-[#16a34a]/30 p-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-[#16a34a]/20 p-3 rounded-lg">
                      <Mail className="w-6 h-6 text-[#16a34a]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-white mb-2">
                        Pending Team Invites
                      </h3>
                      <div className="space-y-2">
                        {pendingInvites.map(invite => (
                          <div key={invite.id} className="flex items-center justify-between bg-slate-800/40 rounded-lg p-3 border border-slate-700/50">
                            <p className="text-sm text-slate-200">{invite.message}</p>
                            <Link
                              href="/dashboard"
                              className="text-xs bg-[#16a34a] hover:bg-[#22c55e] text-white px-4 py-2 rounded-lg font-semibold transition-colors ml-4"
                            >
                              View Invite
                            </Link>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Coach Teams */}
              {coachTeams.length > 0 && (
                <div>
                  <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold mb-4">
                    My <span className="text-[#16a34a]">Teams</span>
                  </h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {coachTeams.map(team => (
                      <div
                        key={team.id}
                        className="bg-[#0a192f] backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden hover:border-[#16a34a]/50 transition-all duration-300 cursor-pointer group"
                        onClick={() => handleTeamClick(team.id, team.userRole)}
                      >
                        {/* Team Logo */}
                        <div className="h-40 bg-gradient-to-br from-[#0a192f] to-slate-800 flex items-center justify-center p-6 border-b border-slate-700/50">
                          {team.logoUrl ? (
                            <img src={team.logoUrl} alt={team.name} className="max-h-full max-w-full object-contain" />
                          ) : (
                            <div className="text-6xl font-[family-name:var(--font-playfair)] font-bold text-slate-700">
                              {team.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>

                        {/* Team Info */}
                        <div className="p-6 bg-slate-800/30">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-white group-hover:text-[#16a34a] transition-colors">
                              {team.name}
                            </h3>
                            <span className="px-2 py-1 bg-[#16a34a]/20 text-[#16a34a] text-xs font-semibold rounded border border-[#16a34a]/30">
                              COACH
                            </span>
                          </div>

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

                          <div className="flex gap-4 text-sm border-t border-slate-700/30 pt-3">
                            <div className="flex items-center gap-1 text-slate-400">
                              <Users className="w-4 h-4 text-[#16a34a]" />
                              <span className="text-white font-medium">{team._count.players}</span> players
                            </div>
                            <div className="flex items-center gap-1 text-slate-400">
                              <Calendar className="w-4 h-4 text-[#16a34a]" />
                              <span className="text-white font-medium">{team._count.games}</span> games
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Viewer Teams (Parent Access) */}
              {viewerTeams.length > 0 && (
                <div>
                  <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold mb-4">
                    Teams I&apos;m <span className="text-[#16a34a]">Viewing</span>
                  </h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {viewerTeams.map(team => (
                      <div
                        key={team.id}
                        className="bg-[#0a192f] backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden hover:border-[#16a34a]/50 transition-all duration-300 cursor-pointer group"
                        onClick={() => handleTeamClick(team.id, team.userRole)}
                      >
                        {/* Team Logo */}
                        <div className="h-40 bg-gradient-to-br from-[#0a192f] to-slate-800 flex items-center justify-center p-6 border-b border-slate-700/50">
                          {team.logoUrl ? (
                            <img src={team.logoUrl} alt={team.name} className="max-h-full max-w-full object-contain" />
                          ) : (
                            <div className="text-6xl font-[family-name:var(--font-playfair)] font-bold text-slate-700">
                              {team.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>

                        {/* Team Info */}
                        <div className="p-6 bg-slate-800/30">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-white group-hover:text-[#16a34a] transition-colors">
                              {team.name}
                            </h3>
                            <span className="px-2 py-1 bg-slate-700/50 text-slate-300 text-xs font-semibold rounded flex items-center gap-1 border border-slate-600">
                              <Eye className="w-3 h-3" />
                              VIEWER
                            </span>
                          </div>

                          <div className="space-y-2 text-sm text-slate-400 mb-4">
                            <p>
                              <span className="font-semibold text-slate-300">Coach:</span>{' '}
                              {team.coach.firstName} {team.coach.lastName}
                            </p>
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
                          </div>

                          <div className="flex gap-4 text-sm border-t border-slate-700/30 pt-3">
                            <div className="flex items-center gap-1 text-slate-400">
                              <Users className="w-4 h-4 text-[#16a34a]" />
                              <span className="text-white font-medium">{team._count.players}</span> players
                            </div>
                            <div className="flex items-center gap-1 text-slate-400">
                              <Calendar className="w-4 h-4 text-[#16a34a]" />
                              <span className="text-white font-medium">{team._count.games}</span> games
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
    </div>
  );
}
