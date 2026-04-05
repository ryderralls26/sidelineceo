import React from 'react';
import { QrCode } from 'lucide-react';

interface GameCardProps {
  type: 'Coach' | 'Referee';
  gameData: {
    date: string;
    gameTime: string;
    teamName: string;
    opponent: string;
    location: string;
    field: string;
    division: string;
  };
  players: Array<{
    name: string;
    jersey: string;
    position: string;
  }>;
}

export const GameCard: React.FC<GameCardProps> = ({ type, gameData, players }) => {
  return (
    <div className="bg-white text-black p-6 rounded-none border-2 border-black w-full max-w-2xl mx-auto font-sans mb-8">
      {/* Header */}
      <div className="border-b-4 border-black pb-4 mb-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-black uppercase italic">Friday Night Lights</h2>
          <div className="bg-black text-white px-4 py-1 text-xl font-bold uppercase">
            {type} Card
          </div>
        </div>
      </div>

      {/* Game Info Grid */}
      <div className="grid grid-cols-3 gap-4 mb-6 text-sm">
        <div className="space-y-1">
          <p className="font-bold uppercase text-[10px] text-gray-500">Date</p>
          <p className="border-b border-black font-medium">{gameData.date}</p>
        </div>
        <div className="space-y-1">
          <p className="font-bold uppercase text-[10px] text-gray-500">Division</p>
          <p className="border-b border-black font-medium">{gameData.division}</p>
        </div>
        <div className="space-y-1">
          <p className="font-bold uppercase text-[10px] text-gray-500">Time</p>
          <p className="border-b border-black font-medium">{gameData.gameTime}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
        <div className="space-y-1">
          <p className="font-bold uppercase text-[10px] text-gray-500">Your Team</p>
          <p className="border-b border-black font-medium">{gameData.teamName}</p>
        </div>
        <div className="space-y-1">
          <p className="font-bold uppercase text-[10px] text-gray-500">Opponent</p>
          <p className="border-b border-black font-medium">{gameData.opponent}</p>
        </div>
      </div>

      {/* Player Grid */}
      <div className="border-2 border-black mb-6">
        <table className="w-full text-xs text-center">
          <thead>
            <tr className="bg-gray-100 border-b-2 border-black">
              <th className="border-r border-black p-2 text-left">Player</th>
              <th className="border-r border-black p-2 w-12">#</th>
              <th className="border-r border-black p-2 w-10">Q1</th>
              <th className="border-r border-black p-2 w-10">Q2</th>
              <th className="border-r border-black p-2 w-10">Q3</th>
              <th className="border-r border-black p-2 w-10">Q4</th>
              <th className="p-2 w-12">Total</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player, idx) => (
              <tr key={idx} className="border-b border-black last:border-0">
                <td className="border-r border-black p-2 text-left font-medium uppercase">{player.name}</td>
                <td className="border-r border-black p-2 font-bold">{player.jersey}</td>
                <td className="border-r border-black p-2">{type === 'Referee' ? 'X' : player.position}</td>
                <td className="border-r border-black p-2">{type === 'Referee' ? 'X' : ''}</td>
                <td className="border-r border-black p-2">{type === 'Referee' ? 'X' : ''}</td>
                <td className="border-r border-black p-2">{type === 'Referee' ? 'X' : ''}</td>
                <td className="p-2"></td>
              </tr>
            ))}
            {/* Pad with empty rows if needed */}
            {[...Array(Math.max(0, 10 - players.length))].map((_, i) => (
              <tr key={`empty-${i}`} className="border-b border-black h-8 last:border-0">
                <td className="border-r border-black p-2"></td>
                <td className="border-r border-black p-2"></td>
                <td className="border-r border-black p-2"></td>
                <td className="border-r border-black p-2"></td>
                <td className="border-r border-black p-2"></td>
                <td className="border-r border-black p-2"></td>
                <td className="p-2"></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-8 text-sm font-bold">
          <div className="flex gap-2">
            <span>Score:</span>
            <div className="flex-grow border-b border-black"></div>
          </div>
          <div className="flex gap-2">
            <span>Time Outs:</span>
            <div className="flex-grow border-b border-black"></div>
          </div>
        </div>

        {/* Branding & QR */}
        <div className="flex justify-between items-end pt-4 border-t-2 border-gray-200">
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase text-gray-400">Powered By</p>
            <p className="text-xl font-black tracking-tighter text-black">FlagFooty</p>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-[8px] text-right text-gray-500 leading-tight uppercase font-bold">
              Scan to update<br />live scores
            </p>
            <div className="p-1 border border-black">
              <QrCode size={40} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
