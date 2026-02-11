
import React from 'react';
import { Tank } from '../../types';

interface HUDProps {
  player: Tank;
}

const HUD: React.FC<HUDProps> = ({ player }) => {
  const xpPercentage = (player.xp / player.maxXp) * 100;
  const hpPercentage = (player.hp / player.maxHp) * 100;

  return (
    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-2xl px-8 pointer-events-none select-none">
      <div className="flex flex-col gap-2">
        {/* Level and Score */}
        <div className="flex justify-between items-end mb-1">
          <div className="text-white font-black text-2xl drop-shadow-lg">
            LVL <span className="text-sky-400">{player.level}</span>
            <span className="ml-4 text-slate-400 text-base font-bold uppercase tracking-widest">{player.class}</span>
          </div>
          <div className="text-right">
            <div className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">Current Score</div>
            <div className="text-white font-mono text-xl">{player.score.toLocaleString()}</div>
          </div>
        </div>

        {/* Health Bar */}
        <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden border border-white/5 backdrop-blur-sm">
          <div 
            className="h-full bg-emerald-500 transition-all duration-300 ease-out"
            style={{ width: `${Math.max(0, hpPercentage)}%` }}
          />
        </div>

        {/* XP Bar */}
        <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden border border-white/5 backdrop-blur-sm">
          <div 
            className="h-full bg-yellow-400 transition-all duration-300 ease-out"
            style={{ width: `${xpPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default HUD;
