import { Users, TrendingUp, FileText, Calendar, UserCircle, Trophy } from 'lucide-react';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { ShareButton } from '@/components/ShareButton';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SidelineCEO — Free Flag Football Team Management',
};

export default function Home() {
  return (
    <div className="min-h-screen bg-[#1e293b] text-slate-100 font-[family-name:var(--font-inter)]">
      <Navigation />

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-4 py-20 pt-32">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="font-[family-name:var(--font-playfair)] text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
            SidelineCEO: The Coach&apos;s <br />
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
              Your Roster — <span className="text-[#22c55e]">Organized & Ready</span>
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
                  <tr className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono text-[#22c55e]">33</td>
                    <td className="px-6 py-4 text-sm font-medium">Player 3</td>
                    <td className="px-6 py-4 text-sm text-slate-400">RB</td>
                    <td className="px-6 py-4 text-sm text-slate-400">LB</td>
                    <td className="px-6 py-4"><span className="inline-block px-3 py-1 bg-[#16a34a]/20 text-[#22c55e] rounded-full text-xs font-medium">Active</span></td>
                  </tr>
                  <tr className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono text-[#22c55e]">21</td>
                    <td className="px-6 py-4 text-sm font-medium">Player 4</td>
                    <td className="px-6 py-4 text-sm text-slate-400">DB</td>
                    <td className="px-6 py-4 text-sm text-slate-400">WR</td>
                    <td className="px-6 py-4"><span className="inline-block px-3 py-1 bg-[#16a34a]/20 text-[#22c55e] rounded-full text-xs font-medium">Active</span></td>
                  </tr>
                  <tr className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono text-[#22c55e]">88</td>
                    <td className="px-6 py-4 text-sm font-medium">Player 5</td>
                    <td className="px-6 py-4 text-sm text-slate-400">C</td>
                    <td className="px-6 py-4 text-sm text-slate-400">DL</td>
                    <td className="px-6 py-4"><span className="inline-block px-3 py-1 bg-[#16a34a]/20 text-[#22c55e] rounded-full text-xs font-medium">Active</span></td>
                  </tr>
                  <tr className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono text-[#22c55e]">5</td>
                    <td className="px-6 py-4 text-sm font-medium">Player 6</td>
                    <td className="px-6 py-4 text-sm text-slate-400">LB</td>
                    <td className="px-6 py-4 text-sm text-slate-400">RB</td>
                    <td className="px-6 py-4"><span className="inline-block px-3 py-1 bg-[#16a34a]/20 text-[#22c55e] rounded-full text-xs font-medium">Active</span></td>
                  </tr>
                  <tr className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono text-[#22c55e]">14</td>
                    <td className="px-6 py-4 text-sm font-medium">Player 7</td>
                    <td className="px-6 py-4 text-sm text-slate-400">DL</td>
                    <td className="px-6 py-4 text-sm text-slate-400">C</td>
                    <td className="px-6 py-4"><span className="inline-block px-3 py-1 bg-[#16a34a]/20 text-[#22c55e] rounded-full text-xs font-medium">Active</span></td>
                  </tr>
                  <tr className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono text-[#22c55e]">3</td>
                    <td className="px-6 py-4 text-sm font-medium">Player 8</td>
                    <td className="px-6 py-4 text-sm text-slate-400">WR</td>
                    <td className="px-6 py-4 text-sm text-slate-400">QB</td>
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

            {/* Game 2 */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6 hover:border-[#16a34a]/50 transition-all duration-300">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#16a34a] to-[#22c55e] rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-400 mb-1">April 18, 2026</div>
                    <div className="text-lg font-semibold">Team Name vs Opponent Name</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm text-slate-400">Field 2</div>
                    <div className="text-lg font-mono text-[#22c55e]">2:30 PM</div>
                  </div>
                  <div className="px-4 py-2 bg-[#16a34a]/20 text-[#22c55e] rounded-lg text-sm font-medium">
                    Scheduled
                  </div>
                </div>
              </div>
            </div>

            {/* Game 3 */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6 hover:border-[#16a34a]/50 transition-all duration-300">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#16a34a] to-[#22c55e] rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-400 mb-1">April 30, 2026</div>
                    <div className="text-lg font-semibold">Team Name vs Opponent Name</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm text-slate-400">Field 3</div>
                    <div className="text-lg font-mono text-[#22c55e]">11:45 AM</div>
                  </div>
                  <div className="px-4 py-2 bg-[#16a34a]/20 text-[#22c55e] rounded-lg text-sm font-medium">
                    Scheduled
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Invite Section & Tips */}
          <div className="mt-12 grid md:grid-cols-2 gap-6">
            <div className="bg-slate-800/30 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50">
              <h3 className="text-lg font-semibold text-slate-100 mb-2">Invite Your Team</h3>
              <p className="text-sm text-slate-400">Share access with parents and players to keep everyone in the loop.</p>
            </div>
            <div className="bg-slate-800/30 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50">
              <h3 className="text-lg font-semibold text-slate-100 mb-2">Pro Tips</h3>
              <p className="text-sm text-slate-400">Generate lineups before each game to ensure fair play time for all players.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Game Card Preview Section */}
      <section className="py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl font-bold mb-4">
              Pro Game Cards — <span className="text-[#22c55e]">Ready to Print</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Generate, edit, and print professional game cards in minutes — right from your phone or laptop.
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

              {/* Card Body */}
              <div className="px-6 py-5 space-y-4">
                {/* Fields Row 1 */}
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="font-semibold text-xs mb-1">Date</div>
                    <div className="border-b border-black pb-1">April 5, 2026</div>
                  </div>
                  <div>
                    <div className="font-semibold text-xs mb-1">FDL#</div>
                    <div className="border-b border-black pb-1">12345</div>
                  </div>
                  <div>
                    <div className="font-semibold text-xs mb-1">Game Time</div>
                    <div className="border-b border-black pb-1">10:00 AM</div>
                  </div>
                </div>

                {/* Fields Row 2 */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-semibold text-xs mb-1">Team Name</div>
                    <div className="border-b border-black pb-1">Team Name</div>
                  </div>
                  <div>
                    <div className="font-semibold text-xs mb-1">Coach&apos;s Name</div>
                    <div className="border-b border-black pb-1">Coach 1</div>
                  </div>
                </div>

                {/* Opponent */}
                <div className="text-sm">
                  <div className="font-semibold text-xs mb-1">Opponent</div>
                  <div className="border-b border-black pb-1">Opponent Name</div>
                </div>

                {/* Division Row */}
                <div className="flex items-center gap-3 text-sm">
                  <span className="font-semibold">KIND</span>
                  <span className="px-3 py-1 border-2 border-black font-semibold">FR</span>
                  <span className="px-3 py-1 border border-black">SOPH</span>
                  <span className="px-3 py-1 border border-black">JR</span>
                  <span className="px-3 py-1 border border-black">SR</span>
                </div>

                {/* Quarter Grid */}
                <div className="border-2 border-black">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b-2 border-black bg-gray-100">
                        <th className="border-r border-black px-2 py-2 text-left font-bold">Player</th>
                        <th className="border-r border-black px-2 py-2 text-center font-bold">Pos</th>
                        <th className="border-r border-black px-2 py-2 text-center font-bold">Q1</th>
                        <th className="border-r border-black px-2 py-2 text-center font-bold">Q2</th>
                        <th className="border-r border-black px-2 py-2 text-center font-bold">Q3</th>
                        <th className="border-r border-black px-2 py-2 text-center font-bold">Q4</th>
                        <th className="px-2 py-2 text-center font-bold">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-black">
                        <td className="border-r border-black px-2 py-1.5">First Name Last Name</td>
                        <td className="border-r border-black px-2 py-1.5 text-center">QB</td>
                        <td className="border-r border-black px-2 py-1.5 text-center"></td>
                        <td className="border-r border-black px-2 py-1.5 text-center"></td>
                        <td className="border-r border-black px-2 py-1.5 text-center"></td>
                        <td className="border-r border-black px-2 py-1.5 text-center"></td>
                        <td className="px-2 py-1.5 text-center"></td>
                      </tr>
                      <tr className="border-b border-black">
                        <td className="border-r border-black px-2 py-1.5">Nickname</td>
                        <td className="border-r border-black px-2 py-1.5 text-center">WR</td>
                        <td className="border-r border-black px-2 py-1.5 text-center"></td>
                        <td className="border-r border-black px-2 py-1.5 text-center"></td>
                        <td className="border-r border-black px-2 py-1.5 text-center"></td>
                        <td className="border-r border-black px-2 py-1.5 text-center"></td>
                        <td className="px-2 py-1.5 text-center"></td>
                      </tr>
                      <tr className="border-b border-black">
                        <td className="border-r border-black px-2 py-1.5">Player 1</td>
                        <td className="border-r border-black px-2 py-1.5 text-center">RB</td>
                        <td className="border-r border-black px-2 py-1.5 text-center"></td>
                        <td className="border-r border-black px-2 py-1.5 text-center"></td>
                        <td className="border-r border-black px-2 py-1.5 text-center"></td>
                        <td className="border-r border-black px-2 py-1.5 text-center"></td>
                        <td className="px-2 py-1.5 text-center"></td>
                      </tr>
                      <tr className="border-b border-black">
                        <td className="border-r border-black px-2 py-1.5">Player 2</td>
                        <td className="border-r border-black px-2 py-1.5 text-center">DB</td>
                        <td className="border-r border-black px-2 py-1.5 text-center"></td>
                        <td className="border-r border-black px-2 py-1.5 text-center"></td>
                        <td className="border-r border-black px-2 py-1.5 text-center"></td>
                        <td className="border-r border-black px-2 py-1.5 text-center"></td>
                        <td className="px-2 py-1.5 text-center"></td>
                      </tr>
                      <tr>
                        <td className="border-r border-black px-2 py-1.5">Player 3</td>
                        <td className="border-r border-black px-2 py-1.5 text-center">C</td>
                        <td className="border-r border-black px-2 py-1.5 text-center"></td>
                        <td className="border-r border-black px-2 py-1.5 text-center"></td>
                        <td className="border-r border-black px-2 py-1.5 text-center"></td>
                        <td className="border-r border-black px-2 py-1.5 text-center"></td>
                        <td className="px-2 py-1.5 text-center"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Footer - Score and Timeouts */}
                <div className="space-y-2 text-sm mb-3">
                  <div className="grid grid-cols-5 gap-2">
                    <div className="font-semibold">Score:</div>
                    <div className="border-b border-black"></div>
                    <div className="border-b border-black"></div>
                    <div className="border-b border-black"></div>
                    <div className="border-b border-black"></div>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    <div className="font-semibold">Time Outs:</div>
                    <div className="border-b border-black"></div>
                    <div className="border-b border-black"></div>
                    <div className="border-b border-black"></div>
                    <div className="border-b border-black"></div>
                  </div>
                </div>

                {/* Footer - SidelineCEO Branding with QR Code */}
                <div className="flex items-center justify-between pt-3 border-t-2 border-gray-300">
                  <span className="text-xs font-semibold text-gray-700">SidelineCEO</span>
                  <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=https://www.sidelinemgmt.space"
                    alt="SidelineCEO QR Code"
                    width={60}
                    height={60}
                  />
                </div>
              </div>
            </div>

            {/* Referee/Line-Up Card */}
            <div className="bg-white text-black rounded-lg overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
              {/* Header */}
              <div className="border-b-4 border-black px-6 py-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="font-bold text-lg">Friday Night Lights</div>
                  <div className="font-bold text-lg">Line-Up Card</div>
                </div>
              </div>

              {/* Card Body */}
              <div className="px-6 py-5 space-y-4">
                {/* Fields Row 1 */}
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="font-semibold text-xs mb-1">Date</div>
                    <div className="border-b border-black pb-1">April 5, 2026</div>
                  </div>
                  <div>
                    <div className="font-semibold text-xs mb-1">FDL#</div>
                    <div className="border-b border-black pb-1">12345</div>
                  </div>
                  <div>
                    <div className="font-semibold text-xs mb-1">Game Time</div>
                    <div className="border-b border-black pb-1">10:00 AM</div>
                  </div>
                </div>

                {/* Fields Row 2 */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-semibold text-xs mb-1">Team Name</div>
                    <div className="border-b border-black pb-1">Team Name</div>
                  </div>
                  <div>
                    <div className="font-semibold text-xs mb-1">Coach&apos;s Name</div>
                    <div className="border-b border-black pb-1">Coach 1</div>
                  </div>
                </div>

                {/* Opponent */}
                <div className="text-sm">
                  <div className="font-semibold text-xs mb-1">Opponent</div>
                  <div className="border-b border-black pb-1">Opponent Name</div>
                </div>

                {/* Division Row */}
                <div className="flex items-center gap-3 text-sm">
                  <span className="font-semibold">KIND</span>
                  <span className="px-3 py-1 border-2 border-black font-semibold">FR</span>
                  <span className="px-3 py-1 border border-black">SOPH</span>
                  <span className="px-3 py-1 border border-black">JR</span>
                  <span className="px-3 py-1 border border-black">SR</span>
                </div>

                {/* Quarter Grid - with X marks instead of positions */}
                <div className="border-2 border-black">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b-2 border-black bg-gray-100">
                        <th className="border-r border-black px-2 py-2 text-left font-bold">Player</th>
                        <th className="border-r border-black px-2 py-2 text-center font-bold">Pos</th>
                        <th className="border-r border-black px-2 py-2 text-center font-bold">Q1</th>
                        <th className="border-r border-black px-2 py-2 text-center font-bold">Q2</th>
                        <th className="border-r border-black px-2 py-2 text-center font-bold">Q3</th>
                        <th className="border-r border-black px-2 py-2 text-center font-bold">Q4</th>
                        <th className="px-2 py-2 text-center font-bold">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-black">
                        <td className="border-r border-black px-2 py-1.5">First Name Last Name</td>
                        <td className="border-r border-black px-2 py-1.5 text-center"></td>
                        <td className="border-r border-black px-2 py-1.5 text-center font-bold">X</td>
                        <td className="border-r border-black px-2 py-1.5 text-center"></td>
                        <td className="border-r border-black px-2 py-1.5 text-center font-bold">X</td>
                        <td className="border-r border-black px-2 py-1.5 text-center"></td>
                        <td className="px-2 py-1.5 text-center"></td>
                      </tr>
                      <tr className="border-b border-black">
                        <td className="border-r border-black px-2 py-1.5">Nickname</td>
                        <td className="border-r border-black px-2 py-1.5 text-center"></td>
                        <td className="border-r border-black px-2 py-1.5 text-center"></td>
                        <td className="border-r border-black px-2 py-1.5 text-center font-bold">X</td>
                        <td className="border-r border-black px-2 py-1.5 text-center"></td>
                        <td className="border-r border-black px-2 py-1.5 text-center font-bold">X</td>
                        <td className="px-2 py-1.5 text-center"></td>
                      </tr>
                      <tr className="border-b border-black">
                        <td className="border-r border-black px-2 py-1.5">Player 1</td>
                        <td className="border-r border-black px-2 py-1.5 text-center"></td>
                        <td className="border-r border-black px-2 py-1.5 text-center font-bold">X</td>
                        <td className="border-r border-black px-2 py-1.5 text-center"></td>
                        <td className="border-r border-black px-2 py-1.5 text-center font-bold">X</td>
                        <td className="border-r border-black px-2 py-1.5 text-center"></td>
                        <td className="px-2 py-1.5 text-center"></td>
                      </tr>
                      <tr className="border-b border-black">
                        <td className="border-r border-black px-2 py-1.5">Player 2</td>
                        <td className="border-r border-black px-2 py-1.5 text-center"></td>
                        <td className="border-r border-black px-2 py-1.5 text-center"></td>
                        <td className="border-r border-black px-2 py-1.5 text-center font-bold">X</td>
                        <td className="border-r border-black px-2 py-1.5 text-center"></td>
                        <td className="border-r border-black px-2 py-1.5 text-center font-bold">X</td>
                        <td className="px-2 py-1.5 text-center"></td>
                      </tr>
                      <tr>
                        <td className="border-r border-black px-2 py-1.5">Player 3</td>
                        <td className="border-r border-black px-2 py-1.5 text-center"></td>
                        <td className="border-r border-black px-2 py-1.5 text-center font-bold">X</td>
                        <td className="border-r border-black px-2 py-1.5 text-center"></td>
                        <td className="border-r border-black px-2 py-1.5 text-center font-bold">X</td>
                        <td className="border-r border-black px-2 py-1.5 text-center"></td>
                        <td className="px-2 py-1.5 text-center"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Footer - Score and Timeouts */}
                <div className="space-y-2 text-sm mb-3">
                  <div className="grid grid-cols-5 gap-2">
                    <div className="font-semibold">Score:</div>
                    <div className="border-b border-black"></div>
                    <div className="border-b border-black"></div>
                    <div className="border-b border-black"></div>
                    <div className="border-b border-black"></div>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    <div className="font-semibold">Time Outs:</div>
                    <div className="border-b border-black"></div>
                    <div className="border-b border-black"></div>
                    <div className="border-b border-black"></div>
                    <div className="border-b border-black"></div>
                  </div>
                </div>

                {/* Footer - SidelineCEO Branding with QR Code */}
                <div className="flex items-center justify-between pt-3 border-t-2 border-gray-300">
                  <span className="text-xs font-semibold text-gray-700">SidelineCEO</span>
                  <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=https://www.sidelinemgmt.space"
                    alt="SidelineCEO QR Code"
                    width={60}
                    height={60}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Awards/Leaderboard Preview Section */}
      <section className="py-32 px-4 bg-slate-900/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl font-bold mb-4">
              Player Awards — <span className="text-[#22c55e]">Celebrate Success</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Track player achievements and recognize outstanding performances throughout the season.
            </p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Rank</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Player Name</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-300">Total Awards</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-300">MVP</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-300">Hustle</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-300">Leadership</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  <tr className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 text-sm text-center">
                      <span className="text-2xl">🥇</span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">Player 1</td>
                    <td className="px-6 py-4 text-center text-sm font-semibold text-[#22c55e]">12</td>
                    <td className="px-6 py-4 text-center text-sm text-slate-400">5</td>
                    <td className="px-6 py-4 text-center text-sm text-slate-400">4</td>
                    <td className="px-6 py-4 text-center text-sm text-slate-400">3</td>
                  </tr>
                  <tr className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 text-sm text-center">
                      <span className="text-2xl">🥈</span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">Player 2</td>
                    <td className="px-6 py-4 text-center text-sm font-semibold text-[#22c55e]">10</td>
                    <td className="px-6 py-4 text-center text-sm text-slate-400">3</td>
                    <td className="px-6 py-4 text-center text-sm text-slate-400">4</td>
                    <td className="px-6 py-4 text-center text-sm text-slate-400">3</td>
                  </tr>
                  <tr className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 text-sm text-center">
                      <span className="text-2xl">🥉</span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">Player 3</td>
                    <td className="px-6 py-4 text-center text-sm font-semibold text-[#22c55e]">8</td>
                    <td className="px-6 py-4 text-center text-sm text-slate-400">2</td>
                    <td className="px-6 py-4 text-center text-sm text-slate-400">3</td>
                    <td className="px-6 py-4 text-center text-sm text-slate-400">3</td>
                  </tr>
                  <tr className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 text-sm text-center text-slate-500">4</td>
                    <td className="px-6 py-4 text-sm font-medium">Player 4</td>
                    <td className="px-6 py-4 text-center text-sm font-semibold text-[#22c55e]">7</td>
                    <td className="px-6 py-4 text-center text-sm text-slate-400">2</td>
                    <td className="px-6 py-4 text-center text-sm text-slate-400">3</td>
                    <td className="px-6 py-4 text-center text-sm text-slate-400">2</td>
                  </tr>
                  <tr className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 text-sm text-center text-slate-500">5</td>
                    <td className="px-6 py-4 text-sm font-medium">Player 5</td>
                    <td className="px-6 py-4 text-center text-sm font-semibold text-[#22c55e]">6</td>
                    <td className="px-6 py-4 text-center text-sm text-slate-400">1</td>
                    <td className="px-6 py-4 text-center text-sm text-slate-400">3</td>
                    <td className="px-6 py-4 text-center text-sm text-slate-400">2</td>
                  </tr>
                  <tr className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 text-sm text-center text-slate-500">6</td>
                    <td className="px-6 py-4 text-sm font-medium">Player 6</td>
                    <td className="px-6 py-4 text-center text-sm font-semibold text-[#22c55e]">5</td>
                    <td className="px-6 py-4 text-center text-sm text-slate-400">1</td>
                    <td className="px-6 py-4 text-center text-sm text-slate-400">2</td>
                    <td className="px-6 py-4 text-center text-sm text-slate-400">2</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-32 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl font-bold mb-4">
              How It <span className="text-[#16a34a]">Works</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Three simple steps to transform your team management
            </p>
          </div>

          <div className="relative">
            {/* Timeline connector line */}
            <div className="hidden md:block absolute top-24 left-0 right-0 h-1 bg-gradient-to-r from-[#16a34a] via-[#22c55e] to-[#16a34a] opacity-30"></div>

            <div className="grid md:grid-cols-3 gap-12 relative">
              {/* Step 1 */}
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-[#16a34a] to-[#22c55e] rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(22,163,74,0.4)] relative z-10">
                  <UserCircle className="w-10 h-10 text-white" />
                </div>
                <div className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 h-full">
                  <div className="text-4xl font-bold text-[#22c55e] mb-3">01</div>
                  <h3 className="font-[family-name:var(--font-playfair)] text-2xl font-bold mb-4">
                    Create Team & Roster
                  </h3>
                  <p className="text-slate-400 leading-relaxed">
                    Sign up, create your team, and add your players with jersey numbers and positions. Get organized in minutes.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-[#22c55e] to-[#16a34a] rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(34,197,94,0.4)] relative z-10">
                  <Calendar className="w-10 h-10 text-white" />
                </div>
                <div className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 h-full">
                  <div className="text-4xl font-bold text-[#22c55e] mb-3">02</div>
                  <h3 className="font-[family-name:var(--font-playfair)] text-2xl font-bold mb-4">
                    Build Schedule & Lineups
                  </h3>
                  <p className="text-slate-400 leading-relaxed">
                    Add your games to the schedule, then auto-generate fair lineups that ensure every player gets equal playing time.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-[#16a34a] to-[#22c55e] rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(22,163,74,0.4)] relative z-10">
                  <Trophy className="w-10 h-10 text-white" />
                </div>
                <div className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 h-full">
                  <div className="text-4xl font-bold text-[#22c55e] mb-3">03</div>
                  <h3 className="font-[family-name:var(--font-playfair)] text-2xl font-bold mb-4">
                    Print Cards & Track Time
                  </h3>
                  <p className="text-slate-400 leading-relaxed">
                    Generate professional game cards for coaches and referees. Print them out and track playing time throughout the season.
                  </p>
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
                SidelineCEO is <span className="font-semibold text-[#22c55e]">free</span> while we build out the full suite.
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
