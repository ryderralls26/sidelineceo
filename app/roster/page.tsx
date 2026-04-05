import { Users, UserPlus, Search, Filter, MoreHorizontal, Shield, Mail } from 'lucide-react';
import Link from 'next/link';

export default function RosterPage() {
  const players = [
    { id: 12, name: 'Marcus Johnson', primary: 'QB', secondary: 'WR', status: 'Active', jersey: '12' },
    { id: 7, name: 'David Smith', primary: 'WR', secondary: 'DB', status: 'Active', jersey: '7' },
    { id: 33, name: 'Leo Garcia', primary: 'RB', secondary: 'LB', status: 'Active', jersey: '33' },
    { id: 21, name: 'Sarah Wilson', primary: 'DB', secondary: 'WR', status: 'Active', jersey: '21' },
    { id: 88, name: 'Tyler Ross', primary: 'C', secondary: 'DL', status: 'Active', jersey: '88' },
    { id: 5, name: 'Jackson Lee', primary: 'LB', secondary: 'RB', status: 'Active', jersey: '5' },
    { id: 14, name: 'Emma Thompson', primary: 'DL', secondary: 'C', status: 'Active', jersey: '14' },
    { id: 3, name: 'Noah Davis', primary: 'WR', secondary: 'QB', status: 'Active', jersey: '3' },
  ];

  return (
    <div className="min-h-screen bg-[#0f172a] pt-32 pb-20 px-4 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 font-display">Team <span className="text-emerald-400">Roster</span></h1>
            <p className="text-slate-400 text-lg max-w-2xl">Manage player details, positions, and contact info. Keep your team data accurate and accessible.</p>
          </div>
          <div className="flex gap-4">
            <button className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-5 py-3 rounded-xl border border-slate-700 transition-all flex items-center gap-2">
              <Mail className="w-5 h-5 text-slate-400" />
              Message All
            </button>
            <button className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Add Player
            </button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Players', value: '12', color: 'text-blue-400' },
            { label: 'Active', value: '10', color: 'text-emerald-400' },
            { label: 'Avg Attendance', value: '92%', color: 'text-purple-400' },
            { label: 'Awards Given', value: '24', color: 'text-amber-400' },
          ].map((stat, i) => (
            <div key={i} className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-2xl">
              <p className="text-slate-500 text-xs uppercase tracking-widest font-bold mb-1">{stat.label}</p>
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search players..." 
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-emerald-500/50 transition-colors"
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button className="flex-grow md:flex-grow-0 flex items-center justify-center gap-2 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 px-4 py-3 rounded-xl text-slate-300 transition-colors">
              <Filter className="w-4 h-4" />
              Filter
            </button>
            <button className="flex-grow md:flex-grow-0 flex items-center justify-center gap-2 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 px-4 py-3 rounded-xl text-slate-300 transition-colors">
              Sort by Number
            </button>
          </div>
        </div>

        {/* Roster Table */}
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden backdrop-blur-sm shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/50 border-b border-slate-700/50">
                  <th className="px-6 py-5 text-sm font-bold text-slate-500 uppercase tracking-widest">#</th>
                  <th className="px-6 py-5 text-sm font-bold text-slate-500 uppercase tracking-widest">Player</th>
                  <th className="px-6 py-5 text-sm font-bold text-slate-500 uppercase tracking-widest">Primary</th>
                  <th className="px-6 py-5 text-sm font-bold text-slate-500 uppercase tracking-widest">Secondary</th>
                  <th className="px-6 py-5 text-sm font-bold text-slate-500 uppercase tracking-widest text-center">Status</th>
                  <th className="px-6 py-5 text-sm font-bold text-slate-500 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {players.map((player) => (
                  <tr key={player.id} className="hover:bg-slate-700/20 transition-colors group">
                    <td className="px-6 py-5">
                      <span className="font-mono text-emerald-400 font-bold text-lg">#{player.jersey}</span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 flex items-center justify-center text-slate-400">
                          <Shield className="w-5 h-5 opacity-30" />
                        </div>
                        <span className="font-bold text-white text-lg">{player.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-lg text-sm font-bold border border-blue-500/20">
                        {player.primary}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="px-3 py-1 bg-slate-700/50 text-slate-400 rounded-lg text-sm font-bold border border-slate-600/30">
                        {player.secondary}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-xs font-bold uppercase tracking-wide">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        {player.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-500 hover:text-white">
                        <MoreHorizontal className="w-6 h-6" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Help Banner */}
        <div className="mt-8 text-center text-slate-500 text-sm italic">
          Tip: You can quickly import your roster from a CSV or Excel file by clicking the &quot;Add Player&quot; dropdown. FlagFooty makes team setup a breeze.
        </div>
      </div>
    </div>
  );
}
