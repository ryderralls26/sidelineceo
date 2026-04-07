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
      <div className=\"min-h-screen bg-[#1e293b] text-slate-100 flex items-center justify-center\">
        <div className=\"text-center\">
          <p className=\"text-xl text-slate-400\">Game not found</p>
          <Link href=\"/schedule\" className=\"text-[#16a34a] hover:underline mt-4 inline-block\">
            Back to Schedule
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className=\"min-h-screen bg-[#1e293b] text-slate-100 font-[family-name:var(--font-inter)]\">
      <Navigation />

      {/* Main Content */}
      <div className=\"pt-24 px-4 pb-12\">\n        <div className=\"max-w-7xl mx-auto\">\n          {/* Back Button */}\n          <Link\n            href=\"/schedule\"\n            className=\"inline-flex items-center gap-2 text-slate-400 hover:text-[#16a34a] mb-6 transition-colors\"\n          >\n            <ArrowLeft className=\"w-4 h-4\" />\n            Back to Schedule\n          </Link>\n\n          {/* Game Header */}\n          <div className=\"bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8 mb-8\">\n            <div className=\"text-center mb-6\">\n              <h1 className=\"font-[family-name:var(--font-playfair)] text-4xl md:text-5xl font-bold mb-2\">\n                vs <span className=\"text-[#16a34a]\">{game.opponent}</span>\n              </h1>\n              <p className=\"text-slate-400 text-lg\">Game Summary</p>\n            </div>\n\n            <div className=\"grid md:grid-cols-3 gap-4 text-center\">\n              <div className=\"bg-slate-900/30 rounded-xl p-4\">\n                <Calendar className=\"w-6 h-6 text-[#16a34a] mx-auto mb-2\" />\n                <p className=\"text-sm text-slate-400\">Date</p>\n                <p className=\"text-white font-semibold\">{formatDate(game.date)}</p>\n              </div>\n              <div className=\"bg-slate-900/30 rounded-xl p-4\">\n                <MapPin className=\"w-6 h-6 text-[#16a34a] mx-auto mb-2\" />\n                <p className=\"text-sm text-slate-400\">Location</p>\n                <p className=\"text-white font-semibold\">{game.location}</p>\n              </div>\n              <div className=\"bg-slate-900/30 rounded-xl p-4\">\n                <Trophy className=\"w-6 h-6 text-[#16a34a] mx-auto mb-2\" />\n                <p className=\"text-sm text-slate-400\">Time</p>\n                <p className=\"text-white font-semibold\">{game.time || '5:00 PM'}</p>\n              </div>\n            </div>\n\n            {game.field && (\n              <div className=\"mt-4 text-center\">\n                <p className=\"text-slate-400 text-sm\">Field: <span className=\"text-white font-semibold\">{game.field}</span></p>\n              </div>\n            )}\n          </div>\n\n          {/* Final Score - Bold & Centered */}\n          {finalScore && (\n            <div className=\"bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8 mb-8\">\n              <h2 className=\"font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-bold mb-4 text-center\">\n                Final <span className=\"text-[#16a34a]\">Score</span>\n              </h2>\n              <p className=\"text-4xl md:text-6xl font-bold text-center text-white\">\n                {finalScore}\n              </p>\n            </div>\n          )}\n\n          {/* Award Winners List */}\n          {awards.length > 0 && (\n            <div className=\"bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8 mb-8\">\n              <h2 className=\"font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-bold mb-6 text-center\">\n                <span className=\"text-[#16a34a]\">Award</span> Winners\n              </h2>\n              <div className=\"grid md:grid-cols-2 gap-4\">\n                {awards.map(award => {\n                  const player = getPlayerById(award.playerId);\n                  return (\n                    <div key={award.id} className=\"bg-slate-900/30 rounded-xl p-6 border border-slate-700/30\">\n                      <div className=\"flex items-center gap-4\">\n                        <div className=\"flex-shrink-0 w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center\">\n                          <Star className=\"w-6 h-6 text-yellow-400 fill-yellow-400\" />\n                        </div>\n                        <div className=\"flex-1\">\n                          <p className=\"text-sm text-slate-400 mb-1\">{award.awardType}</p>\n                          <p className=\"text-lg font-bold text-white\">\n                            {player ? (\n                              <>\n                                #{player.jerseyNumber} {player.firstName} {player.lastName}\n                                {player.nickname && (\n                                  <span className=\"text-sm text-slate-400 ml-2\">\"{player.nickname}\"</span>\n                                )}\n                              </>\n                            ) : (\n                              'Unknown Player'\n                            )}\n                          </p>\n                        </div>\n                      </div>\n                    </div>\n                  );\n                })}\n              </div>\n            </div>\n          )}\n\n          {/* Game Notes */}\n          {gameNotes && (\n            <div className=\"bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8 mb-8\">\n              <h2 className=\"font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-bold mb-6 text-center\">\n                Game <span className=\"text-[#16a34a]\">Notes</span>\n              </h2>\n              <div className=\"bg-slate-900/30 rounded-xl p-6 border border-slate-700/30\">\n                <p className=\"text-slate-300 whitespace-pre-wrap\">{gameNotes}</p>\n              </div>\n            </div>\n          )}\n\n          {/* Game Card Preview */}\n          <div className=\"bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8\">\n            <h2 className=\"font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-bold mb-6 text-center\">\n              Game <span className=\"text-[#16a34a]\">Cards</span>\n            </h2>\n            <p className=\"text-slate-400 text-center mb-6\">\n              Preview of the game cards used for this matchup\n            </p>\n            <GameCardsWithSharedState\n              players={players}\n              gameInfo={{\n                opponent: game.opponent,\n                date: game.date,\n                location: game.location,\n                field: game.field,\n                time: game.time,\n              }}\n              positions={[]}\n              coachName={session ? `${session.firstName} ${session.lastName}` : 'Coach'}\n            />\n          </div>\n        </div>\n      </div>\n\n      {/* Footer */}\n      <footer className=\"py-12 px-4 border-t border-slate-800/50\">\n        <div className=\"max-w-7xl mx-auto text-center\">\n          <h3 className=\"font-[family-name:var(--font-playfair)] text-2xl font-bold mb-2 bg-gradient-to-r from-[#16a34a] to-[#22c55e] bg-clip-text text-transparent\">\n            FlagFooty\n          </h3>\n          <p className=\"text-slate-500 text-sm\">\n            &copy; {new Date().getFullYear()} FlagFooty. All rights reserved.\n          </p>\n        </div>\n      </footer>\n    </div>\n  );\n}\n