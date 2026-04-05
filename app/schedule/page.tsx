import { Calendar, Clock, MapPin, ChevronRight, Plus, Trophy } from 'lucide-react';
import Link from 'next/link';

export default function SchedulePage() {
  const games = [
    {
      id: 1,
      date: 'April 11, 2026',
      opponent: 'Team Warriors',
      location: 'Oak Park',
      field: 'Field 1',
      time: '10:00 AM',
      status: 'Completed',
      result: 'W 14-7'
    },
    {
      id: 2,
      date: 'April 18, 2026',
      opponent: 'Elite Flag',
      location: 'Oak Park',
      field: 'Field 2',
      time: '2:30 PM',
      status: 'Scheduled'
    },
    {
      id: 3,
      date: 'April 30, 2026',
      opponent: 'City Rangers',
      location: 'Downtown Complex',
      field: 'Field 3',
      time: '11:45 AM',
      status: 'Scheduled'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0f172a] pt-32 pb-20 px-4 font-sans">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 font-display">Game <span className="text-emerald-400">Schedule</span></h1>
            <p className="text-slate-400 text-lg">Track every game, generate lineups, and stay ahead of your season.</p>
          </div>
          <button className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 w-fit">
            <Plus className="w-5 h-5" />
            Add New Game
          </button>
        </div>

        {/* Schedule List */}
        <div className="space-y-6">
          {games.map((game) => (
            <div 
              key={game.id}
              className="group bg-slate-800/40 border border-slate-700 p-6 md:p-8 rounded-2xl hover:border-emerald-500/50 transition-all relative overflow-hidden"
            >
              {/* Status Indicator */}
              <div className={`absolute top-0 right-0 px-6 py-1 text-xs font-bold uppercase tracking-widest rounded-bl-xl ${
                game.status === 'Completed' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'
              }`}>
                {game.status}
              </div>

              <div className="flex flex-col md:flex-row gap-8 items-center">
                {/* Date/Time Block */}
                <div className="flex flex-row md:flex-col items-center md:items-start gap-4 md:gap-1 min-w-[140px]">
                  <div className="p-3 rounded-xl bg-slate-700/50">
                    <Calendar className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-lg">{game.date}</p>
                    <div className="flex items-center gap-1 text-slate-400 text-sm">
                      <Clock className="w-3 h-3" />
                      {game.time}
                    </div>
                  </div>
                </div>

                {/* Matchup Information */}
                <div className="flex-grow text-center md:text-left">
                  <p className="text-slate-500 text-sm uppercase tracking-widest font-semibold mb-1">Matchup</p>
                  <h3 className="text-2xl font-bold text-white mb-2">Our Team <span className="text-slate-600 px-2">vs</span> {game.opponent}</h3>
                  <div className="flex flex-wrap justify-center md:justify-start gap-4 text-slate-400 text-sm">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-slate-500" />
                      {game.location}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1 h-1 rounded-full bg-slate-700"></div>
                      {game.field}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center gap-4 min-w-fit">
                  {game.status === 'Completed' ? (
                    <div className="flex items-center gap-3 bg-slate-900/50 px-5 py-3 rounded-xl border border-slate-700">
                      <Trophy className="w-5 h-5 text-amber-400" />
                      <span className="font-bold text-white text-lg">{game.result}</span>
                    </div>
                  ) : (
                    <button className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-colors">
                      Lineup
                    </button>
                  )}
                  <Link 
                    href={`/schedule/${game.id}`}
                    className="p-3 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors group"
                  >
                    <ChevronRight className="w-6 h-6 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pro Tip */}
        <div className="mt-12 p-8 rounded-3xl bg-gradient-to-r from-blue-500/10 to-emerald-500/10 border border-slate-700/50 flex flex-col md:flex-row items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center flex-shrink-0 border border-slate-700">
            <Trophy className="w-8 h-8 text-amber-400" />
          </div>
          <div>
            <h4 className="text-xl font-bold mb-1">Automate Your Game Day</h4>
            <p className="text-slate-400">FlagFooty can automatically generate a fair rotation schedule based on your current roster. Just click &quot;Lineup&quot; on any upcoming game to get started.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
