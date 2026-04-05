import { Users, TrendingUp, FileText, Calendar, UserCircle, Trophy, ArrowRight, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 font-sans">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/10 rounded-full blur-[120px]"></div>
        </div>
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700 mb-8 animate-fade-in">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 mr-2"></span>
            <span className="text-sm font-medium text-slate-300">Beta Access Now Open</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight font-display tracking-tight">
            FlagFooty: The Coach&apos;s <br />
            <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              Playbook for Team Success
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed">
            Effortless rosters, fair-play lineups, and pro game cards for your flag football team. 
            Spend less time on spreadsheets and more time coaching.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link 
              href="/signup" 
              className="group relative px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-1 flex items-center"
            >
              Start Coaching Free
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="#features" 
              className="px-8 py-4 bg-slate-800 hover:bg-slate-750 text-white font-bold rounded-xl transition-all duration-200 border border-slate-700"
            >
              See How It Works
            </Link>
          </div>

          {/* Trusted By Section (Social Proof) */}
          <div className="mt-20 pt-10 border-t border-slate-800/50">
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-8">Helping Coaches Win In Leagues Like</p>
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
              <span className="text-2xl font-bold tracking-tighter">NFL FLAG</span>
              <span className="text-2xl font-bold tracking-tighter">I9 SPORTS</span>
              <span className="text-2xl font-bold tracking-tighter">GRIDIRON</span>
              <span className="text-2xl font-bold tracking-tighter">UA FLAG</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 px-4 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 font-display">Everything You Need to <span className="text-emerald-400">Win</span></h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">Built by flag football coaches for flag football coaches. Simple tools that solve your biggest game-day headaches.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-slate-800/40 border border-slate-700 hover:border-emerald-500/50 transition-all group">
              <div className="w-14 h-14 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6 group-hover:bg-blue-500/20 transition-colors">
                <Users className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Roster Mastery</h3>
              <p className="text-slate-400 leading-relaxed">Manage player details, jersey numbers, and primary/secondary positions with ease. Keep your team organized and ready to dominate.</p>
            </div>
            
            <div className="p-8 rounded-2xl bg-slate-800/40 border border-slate-700 hover:border-emerald-500/50 transition-all group">
              <div className="w-14 h-14 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-6 group-hover:bg-emerald-500/20 transition-colors">
                <TrendingUp className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Fair-Play Engine</h3>
              <p className="text-slate-400 leading-relaxed">Automatically generate lineups that give every player equal playing time. Includes smart QB logic and 4th quarter locks for clutch moments.</p>
            </div>
            
            <div className="p-8 rounded-2xl bg-slate-800/40 border border-slate-700 hover:border-emerald-500/50 transition-all group">
              <div className="w-14 h-14 rounded-xl bg-purple-500/10 flex items-center justify-center mb-6 group-hover:bg-purple-500/20 transition-colors">
                <FileText className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Pro Game Cards</h3>
              <p className="text-slate-400 leading-relaxed">Generate and print Coach and Referee cards that match league standards exactly. Professional presentation, every game.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase (Visual) */}
      <section className="py-32 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <h2 className="text-4xl md:text-5xl font-bold mb-8 font-display">Stop Guessing, <span className="text-blue-400">Start Managing</span></h2>
              <div className="space-y-6">
                {[
                  "Visual depth charts for offense and defense",
                  "Automated rotation schedules for equal time",
                  "Printable referee cards with one click",
                  "Track player development and awards"
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                    </div>
                    <p className="text-lg text-slate-300">{item}</p>
                  </div>
                ))}
              </div>
              <div className="mt-12">
                <Link 
                  href="/signup" 
                  className="inline-flex items-center text-emerald-400 font-bold hover:text-emerald-300 transition-colors"
                >
                  Join the beta today <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </div>
            </div>
            <div className="lg:w-1/2 relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-blue-500/20 rounded-3xl blur-2xl"></div>
              <div className="relative bg-slate-800 border border-slate-700 rounded-3xl p-4 shadow-2xl overflow-hidden">
                <div className="bg-slate-900 rounded-2xl overflow-hidden aspect-[4/3] flex flex-col">
                  {/* Mock UI Header */}
                  <div className="h-12 bg-slate-800 border-b border-slate-700 flex items-center px-4 gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500/50"></div>
                    <div className="ml-4 h-4 w-32 bg-slate-700 rounded-full"></div>
                  </div>
                  {/* Mock UI Content */}
                  <div className="p-6 flex-grow flex flex-col gap-4">
                    <div className="h-8 w-48 bg-slate-800 rounded-lg"></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-24 bg-slate-800/50 rounded-xl border border-slate-700/50 p-4">
                        <div className="h-3 w-12 bg-slate-700 rounded-full mb-3"></div>
                        <div className="h-6 w-24 bg-emerald-500/20 rounded-md"></div>
                      </div>
                      <div className="h-24 bg-slate-800/50 rounded-xl border border-slate-700/50 p-4">
                        <div className="h-3 w-12 bg-slate-700 rounded-full mb-3"></div>
                        <div className="h-6 w-24 bg-blue-500/20 rounded-md"></div>
                      </div>
                    </div>
                    <div className="flex-grow bg-slate-800/50 rounded-xl border border-slate-700/50 p-4">
                      <div className="space-y-3">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-700"></div>
                            <div className="h-3 flex-grow bg-slate-700 rounded-full"></div>
                            <div className="w-12 h-3 bg-slate-700/50 rounded-full"></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4">
        <div className="max-w-4xl mx-auto text-center px-8 py-16 rounded-[40px] bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px]"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px]"></div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6 font-display relative z-10">Ready to Elevate Your Game?</h2>
          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto relative z-10">
            Join other flag football coaches who are reclaiming their game-day focus. 
            FlagFooty is currently in free public beta.
          </p>
          <Link 
            href="/signup" 
            className="inline-block px-12 py-5 bg-white text-slate-900 font-bold rounded-xl transition-all duration-200 hover:scale-105 shadow-xl relative z-10"
          >
            Get Started Free
          </Link>
          <p className="mt-6 text-sm text-slate-500 relative z-10">No credit card required • Unlimited teams • Unlimited players</p>
        </div>
      </section>

      {/* Basic Footer */}
      <footer className="py-12 border-t border-slate-800 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent font-display">
            FlagFooty
          </div>
          <p className="text-slate-500 text-sm">
            &copy; {new Date().getFullYear()} FlagFooty. All rights reserved. Professional tools for the recreational coach.
          </p>
          <div className="flex gap-8 text-sm text-slate-400">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <a href="mailto:hello@flagfooty.app" className="hover:text-white transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
