import Link from 'next/link';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 py-12 px-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex flex-col items-center md:items-start gap-2">
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent font-display">
            FlagFooty
          </div>
          <p className="text-slate-500 text-sm max-w-xs text-center md:text-left">
            Professional management tools for recreational flag football coaches and teams.
          </p>
        </div>
        
        <div className="flex flex-col items-center md:items-end gap-4">
          <div className="flex gap-8 text-sm font-semibold text-slate-400">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <a href="mailto:hello@flagfooty.app" className="hover:text-white transition-colors">Support</a>
          </div>
          <p className="text-slate-600 text-xs italic">
            &copy; {new Date().getFullYear()} FlagFooty. Built for the love of the game.
          </p>
        </div>
      </div>
    </footer>
  );
};
