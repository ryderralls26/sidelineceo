'use client';

import { useState } from 'react';
import { Users, TrendingUp, FileText, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#1e293b] text-slate-100 font-[family-name:var(--font-inter)]">
      <Navigation />

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-4 py-20 pt-32">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="font-[family-name:var(--font-playfair)] text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight animate-fade-in-up">
            FlagFooty: The Coach&apos;s <br />
            <span className="bg-gradient-to-r from-[#16a34a] to-[#22c55e] bg-clip-text text-transparent">
              Playbook for Team Success
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-400 mb-12 max-w-3xl mx-auto animate-fade-in-up-delay-1">
            Effortless rosters, fair-play lineups, and pro game cards for your flag football team.
          </p>
          <Link
            href="/signup"
            className="inline-block bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white px-10 py-5 rounded-full text-lg font-semibold hover:shadow-[0_0_30px_rgba(22,163,74,0.5)] transition-all duration-300 hover:scale-105 animate-fade-in-up-delay-2"
          >
            Sign Up Now
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl font-bold text-center mb-16">
            Everything You Need to <span className="text-[#16a34a]">Win</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-12 md:gap-16">
            {/* Feature 1: Roster Mastery */}
            <div className="group hover:transform hover:-translate-y-2 transition-all duration-300">
              <div className="bg-slate-800/30 backdrop-blur-sm p-10 rounded-2xl border border-slate-700/50 hover:border-[#16a34a]/50 transition-all duration-300">
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
              <div className="bg-slate-800/30 backdrop-blur-sm p-10 rounded-2xl border border-slate-700/50 hover:border-[#22c55e]/50 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-[#22c55e] to-[#16a34a] rounded-xl flex items-center justify-center mb-6 group-hover:shadow-[0_0_30px_rgba(34,197,94,0.4)] transition-all duration-300">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-[family-name:var(--font-playfair)] text-2xl font-bold mb-4">
                  Fair-Play Lineup Engine
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  Automatically generate lineups that give every player a seat. Includes smart QB logic and 4th quarter locks for clutch moments.
                </p>
              </div>
            </div>

            {/* Feature 3: Pro Game Cards */}
            <div className="group hover:transform hover:-translate-y-2 transition-all duration-300">
              <div className="bg-slate-800/30 backdrop-blur-sm p-10 rounded-2xl border border-slate-700/50 hover:border-[#16a34a]/50 transition-all duration-300">
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

      {/* Early Access Section */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl font-bold mb-6">
            Join the Huddle Today
          </h2>
          <p className="text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto">
            FlagFooty is currently <span className="text-[#22c55e] font-semibold">free</span> while we build out our full management suite. Be among the first coaches to experience streamlined team management.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section id="signup" className="py-24 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-slate-800/30 backdrop-blur-sm p-12 rounded-3xl border border-slate-700/50">
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-slate-400 text-lg mb-8">
              Join FlagFooty today and streamline your team management.
            </p>
            <Link
              href="/signup"
              className="inline-block w-full bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white px-8 py-5 rounded-xl text-lg font-semibold hover:shadow-[0_0_30px_rgba(22,163,74,0.5)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              Sign Up Now - It's Free
            </Link>
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

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            transform: scale(0);
          }
          to {
            transform: scale(1);
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }

        .animate-fade-in-up-delay-1 {
          opacity: 0;
          animation: fadeInUp 0.8s ease-out 0.2s forwards;
        }

        .animate-fade-in-up-delay-2 {
          opacity: 0;
          animation: fadeInUp 0.8s ease-out 0.4s forwards;
        }

        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }

        .animate-scale-in {
          animation: scaleIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
