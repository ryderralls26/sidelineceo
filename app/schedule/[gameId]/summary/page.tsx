'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar, MapPin, Trophy, ArrowLeft, Star } from 'lucide-react';
import { StorageManager } from '@/lib/storage';
import { getRosterFromStorage } from '@/lib/types';
import { Navigation } from '@/components/Navigation';
import { useAuth } from '@/lib/AuthContext';
import { GameCardsWithSharedState } from '@/components/GameCards';

interface Game {
  id: number;
  date: string;
  opponent: string;
  location: string;
  field?: string;
  time?: string;
  status: 'scheduled' | 'completed';
  result?: string;
}

export default function GameSummaryPage() {
  const params = useParams();
  const router = useRouter();
  const { session } = useAuth();
  const gameId = parseInt(params.gameId as string);

  const [game, setGame] = useState<Game | null>(null);
  const [finalScore, setFinalScore] = useState('');
  const [awards, setAwards] = useState<any[]>([]);
  const [gameNotes, setGameNotes] = useState('');
  const [players, setPlayers] = useState<any[]>([]);

  useEffect(() => {
    // Load game data
    const loadedGame = StorageManager.getGame(gameId);
    if (loadedGame) {
      setGame(loadedGame);
      setFinalScore(loadedGame.result || '');
    }

    // Load awards
    const loadedAwards = StorageManager.getAwardsByGameId(gameId);
    setAwards(loadedAwards);

    // Load game notes
    const loadedNotes = StorageManager.getGameNotes(gameId);
    setGameNotes(loadedNotes);

    // Load roster
    const roster = getRosterFromStorage();
    setPlayers(roster);
  }, [gameId]);

  const getPlayerById = (playerId: number) => {
    return players.find(p => p.id === playerId);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (!game) {
    return (
      <div className="min-h-screen bg-[#1e293b] text-slate-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-slate-400">Game not found</p>
          <Link href="/schedule" className="text-[#16a34a] hover:underline mt-4 inline-block">
            Back to Schedule
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1e293b] text-slate-100 font-[family-name:var(--font-inter)]">
      <Navigation />

      {/* Main Content */}
      <div className="pt-24 px-4 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <Link
            href="/schedule"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-[#16a34a] mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Schedule
          </Link>

          {/* Game Header */}
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8 mb-8">
            <div className="text-center mb-6">
              <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl font-bold mb-2">
                vs <span className="text-[#16a34a]">{game.opponent}</span>
              </h1>
              <p className="text-slate-400 text-lg">Game Summary</p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div className="bg-slate-900/30 rounded-xl p-4">
                <Calendar className="w-6 h-6 text-[#16a34a] mx-auto mb-2" />
                <p className="text-sm text-slate-400">Date</p>
                <p className="text-white font-semibold">{formatDate(game.date)}</p>
              </div>
              <div className="bg-slate-900/30 rounded-xl p-4">
                <MapPin className="w-6 h-6 text-[#16a34a] mx-auto mb-2" />
                <p className="text-sm text-slate-400">Location</p>
                <p className="text-white font-semibold">{game.location}</p>
              </div>
              <div className="bg-slate-900/30 rounded-xl p-4">
                <Trophy className="w-6 h-6 text-[#16a34a] mx-auto mb-2" />
                <p className="text-sm text-slate-400">Time</p>
                <p className="text-white font-semibold">{game.time || '5:00 PM'}</p>
              </div>
            </div>

            {game.field && (
              <div className="mt-4 text-center">
                <p className="text-slate-400 text-sm">Field: <span className="text-white font-semibold">{game.field}</span></p>
              </div>
            )}
          </div>

          {/* Final Score - Bold & Centered */}
          {finalScore && (
            <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8 mb-8">
              <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-bold mb-4 text-center">
                Final <span className="text-[#16a34a]">Score</span>
              </h2>
              <p className="text-4xl md:text-6xl font-bold text-center text-white">
                {finalScore}
              </p>
            </div>
          )}

          {/* Award Winners List */}
          {awards.length > 0 && (
            <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8 mb-8">
              <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-bold mb-6 text-center">
                <span className="text-[#16a34a]">Award</span> Winners
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {awards.map(award => {
                  const player = getPlayerById(award.playerId);
                  return (
                    <div key={award.id} className="bg-slate-900/30 rounded-xl p-6 border border-slate-700/30">
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
                          <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-slate-400 mb-1">{award.awardType}</p>
                          <p className="text-lg font-bold text-white">
                            {player ? (
                              <>
                                #{player.jerseyNumber} {player.firstName} {player.lastName}
                                {player.nickname && (
                                  <span className="text-sm text-slate-400 ml-2">"{player.nickname}"</span>
                                )}
                              </>
                            ) : (
                              'Unknown Player'
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Game Notes */}
          {gameNotes && (
            <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8 mb-8">
              <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-bold mb-6 text-center">
                Game <span className="text-[#16a34a]">Notes</span>
              </h2>
              <div className="bg-slate-900/30 rounded-xl p-6 border border-slate-700/30">
                <p className="text-slate-300 whitespace-pre-wrap">{gameNotes}</p>
              </div>
            </div>
          )}

          {/* Game Card Preview */}
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8">
            <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-bold mb-6 text-center">
              Game <span className="text-[#16a34a]">Cards</span>
            </h2>
            <p className="text-slate-400 text-center mb-6">
              Preview of the game cards used for this matchup
            </p>
            <GameCardsWithSharedState
              players={players}
              gameInfo={{
                opponent: game.opponent,
                date: game.date,
                location: game.location,
                field: game.field,
                time: game.time,
              }}
              positions={[]}
              coachName={session ? `${session.firstName} ${session.lastName}` : 'Coach'}
            />
          </div>
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
