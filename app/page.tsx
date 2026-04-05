import { Users, TrendingUp, FileText, Calendar, UserCircle, Trophy } from 'lucide-react';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { ShareButton } from '@/components/ShareButton';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FlagFooty – Free Flag Football Team Management',
};

export default function Home() {
  return (
    <div className="min-h-screen bg-[#1e293b] text-slate-100 font-[family-name:var(--font-inter)]">
      <Navigation />

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-4 py-20 pt-32">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="font-[family-name:var(--font-playfair)] text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
            FlagFooty: The Coach&apos;s <br />
            <span className="bg-gradient-to-r from-[#16a34a] to-[#22c55e] bg-clip-text text-transparent">
              Playbook for Team Success
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-400 mb-12 max-w-3xl mx-auto">
            Effortless rosters, fair-play lineups, and pro game cards for your flag football team.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/signup"
              className="inline-block bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white px-10 py-5 rounded-full text-lg font-semibold hover:shadow-[0_0_30px_rgba(22,163,74,0.5)] transition-all duration-300 hover:scale-105"
            >
              Sign Up Free
            </Link>
            <ShareButton>Share</ShareButton>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-4 bg-slate-900/30">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl font-bold text-center mb-16">
            Everything You Need to <span className="text-[#16a34a]">Win</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-12 md:gap-16">
            {/* Feature 1: Roster Mastery */}
            <div className="group hover:transform hover:-translate-y-2 transition-all duration-300">
              <div className="bg-slate-800/50 backdrop-blur-sm p-10 rounded-2xl border border-slate-700/50 hover:border-[#16a34a]/50 transition-all duration-300 h-full">
                <div className="w-16 h-16 bg-gradient-to-br from-[#16a34a] to-[#22c55e] rounded-xl flex items-center justify-center mb-6 group-hover:shadow-[0_0_30px_rgba(22,163,74,0.4)] transition-all duration-300">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-[family-name:var(--font-playfair)] text-2xl font-bold mb-4">
                  Roster Mastery
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  Manage player details, jersey numbers, and primary/secondary positions with ease. Keep your team organized and ready to dominate.
                </p>
              </div>
            </div>

            {/* Feature 2: Fair-Play Lineup Engine */}
            <div className="group hover:transform hover:-translate-y-2 transition-all duration-300">
              <div className="bg-slate-800/50 backdrop-blur-sm p-10 rounded-2xl border border-slate-700/50 hover:border-[#22c55e]/50 transition-all duration-300 h-full">
                <div className="w-16 h-16 bg-gradient-to-br from-[#22c55e] to-[#16a34a] rounded-xl flex items-center justify-center mb-6 group-hover:shadow-[0_0_30px_rgba(34,197,94,0.4)] transition-all duration-300">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-[family-name:var(--font-playfair)] text-2xl font-bold mb-4">
                  Fair-Play Lineup Engine
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  Automatically generate lineups that give every player equal playing time. Includes smart QB logic and 4th quarter locks for clutch moments.
                </p>
              </div>
            </div>

            {/* Feature 3: Pro Game Cards */}
            <div className="group hover:transform hover:-translate-y-2 transition-all duration-300">
              <div className="bg-slate-800/50 backdrop-blur-sm p-10 rounded-2xl border border-slate-700/50 hover:border-[#16a34a]/50 transition-all duration-300 h-full">
                <div className="w-16 h-16 bg-gradient-to-br from-[#16a34a] to-[#22c55e] rounded-xl flex items-center justify-center mb-6 group-hover:shadow-[0_0_30px_rgba(22,163,74,0.4)] transition-all duration-300">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-[family-name:var(--font-playfair)] text-2xl font-bold mb-4">
                  Pro Game Cards
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  Generate and print Coach and Referee cards that match league standards exactly. Professional presentation, every game.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Roster Preview Section */}
      <section className="py-32 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl font-bold mb-4">
              Your Roster – <span className="text-[#22c55e]">Organized & Ready</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Add players, assign positions, and manage your full team in one place.
            </p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">#</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Player Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Primary Position</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Secondary Position</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  <tr className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono text-[#22c55e]">12</td>
                    <td className="px-6 py-4 text-sm font-medium">Player 1</td>
                    <td className="px-6 py-4 text-sm text-slate-400">QB</td>
                    <td className="px-6 py-4 text-sm text-slate-400">WR</td>
                    <td className="px-6 py-4"><span className="inline-block px-3 py-1 bg-[#16a34a]/20 text-[#22c55e] rounded-full text-xs font-medium">Active</span></td>
                  </tr>
                  <tr className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono text-[#22c55e]">7</td>
                    <td className="px-6 py-4 text-sm font-medium">Player 2</td>
                    <td className="px-6 py-4 text-sm text-slate-400">WR</td>
                    <td className="px-6 py-4 text-sm text-slate-400">DB</td>
                    <td className="px-6 py-4"><span className="inline-block px-3 py-1 bg-[#16a34a]/20 text-[#22c55e] rounded-full text-xs font-medium">Active</span></td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Coaches Section */}
            <div className="border-t border-slate-700/50 bg-slate-900/30 px-6 py-5">
              <h3 className="text-sm font-semibold text-slate-300 mb-3">Coaches</h3>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-400">Head Coach:</span>
                  <span className="text-sm font-medium text-slate-100">Coach 1</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Schedule Preview Section */}
      <section className="py-32 px-4 bg-slate-900/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl font-bold mb-4">
              Your Season <span className="text-[#16a34a]">at a Glance</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Track every game, generate lineups, and stay ahead of your season.
            </p>
          </div>

          <div className="grid gap-6">
            {/* Game 1 */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6 hover:border-[#16a34a]/50 transition-all duration-300">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#16a34a] to-[#22c55e] rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-400 mb-1">April 11, 2026</div>
                    <div className="text-lg font-semibold">Team Name vs Opponent Name</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm text-slate-400">Field 1</div>
                    <div className="text-lg font-mono text-[#22c55e]">10:00 AM</div>
                  </div>
                  <div className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg text-sm font-medium">
                    Completed
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Game Card Preview Section */}
      <section className="py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl font-bold mb-4">
              Pro Game Cards – <span className="text-[#22c55e]">Ready to Print</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Generate, edit, and print professional game cards in minutes – right from your phone or laptop.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Coach Card */}
            <div className="bg-white text-black rounded-lg overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
             {/* Header */}
              <div className="border-b-4 border-black px-6 py-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="font-bold text-lg">Friday Night Lights</div>
                  <div className="font-bold text-lg">Coach&apos;s Card</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-32 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm p-12 md:p-16 rounded-3xl border border-slate-700/50 text-center relative overflow-hidden">
            {/* Decorative gradient orbs */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-[#16a34a]/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#22c55e]/10 rounded-full blur-3xl"></div>

            <div className="relative z-10">
              <h2 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl font-bold mb-6">
                Ready to <span className="text-[#22c55e]">Elevate Your Game?</span>
              </h2>
              <p className="text-xl text-slate-300 mb-4 max-w-2xl mx-auto">
                FlagFooty is <span className="font-semibold text-[#22c55e]">free</span> while we build out the full suite.
              </p>
              <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto">
                Join today and be among the first coaches to experience the future of flag football team management.
              </p>
              <Link
                href="/signup"
                className="inline-block bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white px-12 py-6 rounded-full text-xl font-semibold hover:shadow-[0_0_40px_rgba(22,163,74,0.6)] transition-all duration-300 hover:scale-105"
              >
                Sign Up Free
              </Link>
              <p className="text-sm text-slate-500 mt-6">
                No credit card required • Start managing your team in minutes
              </p>
            </div>
          </div>
        </div>
      </section>

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