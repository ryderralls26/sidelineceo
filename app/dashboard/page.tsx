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
    <div className=\"min-h-screen bg-[#1e293b] text-slate-100 font-[family-name:var(--font-inter)]\">
      {/* Navigation */}
      <nav className=\"fixed top-0 left-0 right-0 z-50 bg-[#1e293b]/95 backdrop-blur-sm border-b border-slate-700/50\">
        <div className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8\">\n          <div className=\"flex items-center justify-between h-16\">\n            <div className=\"flex items-center\">\n              <Link\n                href=\"/\"\n                className=\"font-[family-name:var(--font-playfair)] text-2xl font-bold bg-gradient-to-r from-[#16a34a] to-[#22c55e] bg-clip-text text-transparent\"\n              >\n                FlagFooty\n              </Link>\n            </div>\n\n            {/* Desktop Navigation */}\n            <div className=\"hidden md:flex items-center space-x-8\">\n              <Link href=\"/dashboard\" className=\"text-[#16a34a] font-semibold transition-colors duration-200\">\n                Dashboard\n              </Link>\n              {isCoach && (\n                <Link href=\"/coach-dashboard\" className=\"text-slate-300 hover:text-[#16a34a] transition-colors duration-200\">\n                  Coach Tools\n                </Link>\n              )}\n              <button\n                onClick={handleLogout}\n                className=\"flex items-center gap-2 text-slate-300 hover:text-red-400 transition-colors duration-200\"\n              >\n                <LogOut className=\"w-4 h-4\" />\n                Logout\n              </button>\n            </div>\n\n            {/* Mobile menu button */}\n            <div className=\"md:hidden\">\n              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className=\"text-slate-300 hover:text-white\">\n                {mobileMenuOpen ? <X className=\"w-6 h-6\" /> : <Menu className=\"w-6 h-6\" />}\n              </button>\n            </div>\n          </div>\n        </div>\n\n        {/* Mobile Navigation */}\n        {mobileMenuOpen && (\n          <div className=\"md:hidden border-t border-slate-700/50\">\n            <div className=\"px-4 pt-2 pb-4 space-y-2\">\n              <Link href=\"/dashboard\" className=\"block px-3 py-2 text-[#16a34a] font-semibold bg-slate-800/50 rounded-lg transition-all\" onClick={() => setMobileMenuOpen(false)}>\n                Dashboard\n              </Link>\n              {isCoach && (\n                <Link href=\"/coach-dashboard\" className=\"block px-3 py-2 text-slate-300 hover:text-[#16a34a] hover:bg-slate-800/50 rounded-lg transition-all\" onClick={() => setMobileMenuOpen(false)}>\n                  Coach Tools\n                </Link>\n              )}\n              <button onClick={handleLogout} className=\"w-full text-left px-3 py-2 text-red-400 hover:bg-slate-800/50 rounded-lg transition-all\">\n                Logout\n              </button>\n            </div>\n          </div>\n        )}\n      </nav>\n\n      {/* Main Content */}\n      <div className=\"pt-24 px-4 pb-12 animate-in fade-in duration-200\">\n        <div className=\"max-w-7xl mx-auto\">\n          {/* Header */}\n          <div className=\"mb-8\">\n            <div className=\"flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4\">\n              <div>\n                <h1 className=\"font-[family-name:var(--font-playfair)] text-4xl md:text-5xl font-bold mb-2\">\n                  Welcome, <span className=\"text-[#16a34a]\">{session.firstName}</span>\n                </h1>\n                <p className=\"text-slate-400\">\n                  {isCoach ? 'Manage your teams and view parent access' : 'View your linked teams'}\n                </p>\n              </div>\n              <ShareButton>Recruit Your Crew</ShareButton>\n            </div>\n          </div>\n\n          {/* Loading State */}\n          {loading ? (\n            <LoadingSkeleton rows={3} type=\"card\" />\n          ) : error ? (\n            <ErrorState message={error} onRetry={loadTeams} />\n          ) : teams.length === 0 ? (\n            /* Empty State */\n            <div className=\"bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-16 text-center\">\n              <div className=\"max-w-md mx-auto\">\n                <Users className=\"w-20 h-20 text-slate-600 mx-auto mb-6\" />\n                <h3 className=\"font-[family-name:var(--font-playfair)] text-2xl font-bold mb-3\">\n                  No Teams Yet\n                </h3>\n                <p className=\"text-slate-400 mb-6\">\n                  {isCoach\n                    ? 'Get started by creating your first team in Coach Dashboard.'\n                    : \"You haven't been invited to any teams yet. Ask your coach to send you an invite!\"}\n                </p>\n                {isCoach && (\n                  <Link\n                    href=\"/coach-dashboard\"\n                    className=\"inline-block bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white px-8 py-3 rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(22,163,74,0.4)] transition-all duration-300\"\n                  >\n                    Go to Coach Dashboard\n                  </Link>\n                )}\n              </div>\n            </div>\n          ) : (\n            <div className=\"space-y-8\">\n              {/* Pending Team Invites */}\n              {pendingInvites.length > 0 && (\n                <div className=\"bg-gradient-to-r from-[#16a34a]/10 to-[#22c55e]/10 backdrop-blur-sm rounded-xl border border-[#16a34a]/30 p-6\">\n                  <div className=\"flex items-start gap-4\">\n                    <div className=\"bg-[#16a34a]/20 p-3 rounded-lg\">\n                      <Mail className=\"w-6 h-6 text-[#16a34a]\" />\n                    </div>\n                    <div className=\"flex-1\">\n                      <h3 className=\"font-[family-name:var(--font-playfair)] text-xl font-bold text-white mb-2\">\n                        Pending Team Invites\n                      </h3>\n                      <div className=\"space-y-2\">\n                        {pendingInvites.map(invite => (\n                          <div key={invite.id} className=\"flex items-center justify-between bg-slate-800/40 rounded-lg p-3 border border-slate-700/50\">\n                            <p className=\"text-sm text-slate-200\">{invite.message}</p>\n                            <Link\n                              href=\"/dashboard\"\n                              className=\"text-xs bg-[#16a34a] hover:bg-[#22c55e] text-white px-4 py-2 rounded-lg font-semibold transition-colors ml-4\"\n                            >\n                              View Invite\n                            </Link>\n                          </div>\n                        ))}\n                      </div>\n                    </div>\n                  </div>\n                </div>\n              )}\n\n              {/* Coach Teams */}\n              {coachTeams.length > 0 && (\n                <div>\n                  <h2 className=\"font-[family-name:var(--font-playfair)] text-3xl font-bold mb-4\">\n                    My <span className=\"text-[#16a34a]\">Teams</span>\n                  </h2>\n                  <div className=\"grid md:grid-cols-2 lg:grid-cols-3 gap-6\">\n                    {coachTeams.map(team => (\n                      <div\n                        key={team.id}\n                        className=\"bg-[#0a192f] backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden hover:border-[#16a34a]/50 transition-all duration-300 cursor-pointer group\"\n                        onClick={() => handleTeamClick(team.id, team.userRole)}\n                      >\n                        {/* Team Logo */}\n                        <div className=\"h-40 bg-gradient-to-br from-[#0a192f] to-slate-800 flex items-center justify-center p-6 border-b border-slate-700/50\">\n                          {team.logoUrl ? (\n                            <img src={team.logoUrl} alt={team.name} className=\"max-h-full max-w-full object-contain\" />\n                          ) : (\n                            <div className=\"text-6xl font-[family-name:var(--font-playfair)] font-bold text-slate-700\">\n                              {team.name.charAt(0).toUpperCase()}\n                            </div>\n                          )}\n                        </div>\n\n                        {/* Team Info */}\n                        <div className=\"p-6 bg-slate-800/30\">\n                          <div className=\"flex items-start justify-between mb-2\">\n                            <h3 className=\"font-[family-name:var(--font-playfair)] text-2xl font-bold text-white group-hover:text-[#16a34a] transition-colors\">\n                              {team.name}\n                            </h3>\n                            <span className=\"px-2 py-1 bg-[#16a34a]/20 text-[#16a34a] text-xs font-semibold rounded border border-[#16a34a]/30\">\n                              COACH\n                            </span>\n                          </div>\n\n                          <div className=\"space-y-2 text-sm text-slate-400 mb-4\">\n                            <p>\n                              <span className=\"font-semibold text-slate-300\">Sport:</span>{' '}\n                              {team.sport === 'flag_football' ? 'Flag Football' : 'Soccer'}\n                            </p>\n                            {team.division && (\n                              <p>\n                                <span className=\"font-semibold text-slate-300\">Division:</span>{' '}\n                                {team.division}\n                              </p>\n                            )}\n                            <p>\n                              <span className=\"font-semibold text-slate-300\">Season:</span>{' '}\n                              {team.season.charAt(0).toUpperCase() + team.season.slice(1)} {team.year}\n                            </p>\n                          </div>\n\n                          <div className=\"flex gap-4 text-sm border-t border-slate-700/30 pt-3\">\n                            <div className=\"flex items-center gap-1 text-slate-400\">\n                              <Users className=\"w-4 h-4 text-[#16a34a]\" />\n                              <span className=\"text-white font-medium\">{team._count.players}</span> players\n                            </div>\n                            <div className=\"flex items-center gap-1 text-slate-400\">\n                              <Calendar className=\"w-4 h-4 text-[#16a34a]\" />\n                              <span className=\"text-white font-medium\">{team._count.games}</span> games\n                            </div>\n                          </div>\n                        </div>\n                      </div>\n                    ))}\n                  </div>\n                </div>\n              )}\n\n              {/* Viewer Teams (Parent Access) */}\n              {viewerTeams.length > 0 && (\n                <div>\n                  <h2 className=\"font-[family-name:var(--font-playfair)] text-3xl font-bold mb-4\">\n                    Teams I&apos;m <span className=\"text-[#16a34a]\">Viewing</span>\n                  </h2>\n                  <div className=\"grid md:grid-cols-2 lg:grid-cols-3 gap-6\">\n                    {viewerTeams.map(team => (\n                      <div\n                        key={team.id}\n                        className=\"bg-[#0a192f] backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden hover:border-[#16a34a]/50 transition-all duration-300 cursor-pointer group\"\n                        onClick={() => handleTeamClick(team.id, team.userRole)}\n                      >\n                        {/* Team Logo */}\n                        <div className=\"h-40 bg-gradient-to-br from-[#0a192f] to-slate-800 flex items-center justify-center p-6 border-b border-slate-700/50\">\n                          {team.logoUrl ? (\n                            <img src={team.logoUrl} alt={team.name} className=\"max-h-full max-w-full object-contain\" />\n                          ) : (\n                            <div className=\"text-6xl font-[family-name:var(--font-playfair)] font-bold text-slate-700\">\n                              {team.name.charAt(0).toUpperCase()}\n                            </div>\n                          )}\n                        </div>\n\n                        {/* Team Info */}\n                        <div className=\"p-6 bg-slate-800/30\">\n                          <div className=\"flex items-start justify-between mb-2\">\n                            <h3 className=\"font-[family-name:var(--font-playfair)] text-2xl font-bold text-white group-hover:text-[#16a34a] transition-colors\">\n                              {team.name}\n                            </h3>\n                            <span className=\"px-2 py-1 bg-slate-700/50 text-slate-300 text-xs font-semibold rounded flex items-center gap-1 border border-slate-600\">\n                              <Eye className=\"w-3 h-3\" />\n                              VIEWER\n                            </span>\n                          </div>\n\n                          <div className=\"space-y-2 text-sm text-slate-400 mb-4\">\n                            <p>\n                              <span className=\"font-semibold text-slate-300\">Coach:</span>{' '}\n                              {team.coach.firstName} {team.coach.lastName}\n                            </p>\n                            <p>\n                              <span className=\"font-semibold text-slate-300\">Sport:</span>{' '}\n                              {team.sport === 'flag_football' ? 'Flag Football' : 'Soccer'}\n                            </p>\n                            {team.division && (\n                              <p>\n                                <span className=\"font-semibold text-slate-300\">Division:</span>{' '}\n                                {team.division}\n                              </p>\n                            )}\n                          </div>\n\n                          <div className=\"flex gap-4 text-sm border-t border-slate-700/30 pt-3\">\n                            <div className=\"flex items-center gap-1 text-slate-400\">\n                              <Users className=\"w-4 h-4 text-[#16a34a]\" />\n                              <span className=\"text-white font-medium\">{team._count.players}</span> players\n                            </div>\n                            <div className=\"flex items-center gap-1 text-slate-400\">\n                              <Calendar className=\"w-4 h-4 text-[#16a34a]\" />\n                              <span className=\"text-white font-medium\">{team._count.games}</span> games\n                            </div>\n                          </div>\n                        </div>\n                      </div>\n                    ))}\n                  </div>\n                </div>\n              )}\n            </div>\n          )}\n        </div>\n      </div>\n\n      {/* Footer */}\n      <footer className=\"py-12 px-4 border-t border-slate-800/50\">\n        <div className=\"max-w-7xl mx-auto text-center\">\n          <h3 className=\"font-[family-name:var(--font-playfair)] text-2xl font-bold mb-2 bg-gradient-to-r from-[#16a34a] to-[#22c55e] bg-clip-text text-transparent\">\n            FlagFooty\n          </h3>\n          <p className=\"text-slate-500 text-sm\">\n            &copy; {new Date().getFullYear()} FlagFooty. All rights reserved.\n          </p>\n        </div>\n      </footer>\n    </div>\n  );\n}\n