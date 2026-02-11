
import React, { useState } from 'react';
import { Team } from '../../types';

interface MenuProps {
  username: string;
  onStart: (team: Team) => void;
  onOpenEditor: () => void;
}

const Menu: React.FC<MenuProps> = ({ username, onStart, onOpenEditor }) => {
  const [team, setTeam] = useState<Team>(Team.BLUE);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-950 overflow-hidden">
      <div className="absolute w-[800px] h-[800px] bg-sky-500/10 rounded-full blur-[120px] animate-pulse -top-20 -left-20"></div>
      
      <div className="relative z-10 bg-slate-900/90 p-16 rounded-[4rem] border border-slate-800 shadow-[0_0_100px_rgba(0,0,0,0.8)] backdrop-blur-2xl w-full max-w-xl text-center">
        <div className="mb-12">
          <div className="text-[10px] font-black text-sky-500 uppercase tracking-[0.5em] mb-4">Tactical Command Center</div>
          <h1 className="text-8xl font-black text-white italic tracking-tighter mb-4">GEMINI <span className="text-sky-500">TANK</span></h1>
          <div className="inline-block bg-slate-800 px-6 py-2 rounded-full text-slate-400 font-bold text-sm">
            PILOT: <span className="text-white">{username}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-10">
          <button 
            onClick={() => setTeam(Team.BLUE)}
            className={`py-8 rounded-[2rem] border-4 transition-all flex flex-col items-center gap-2 ${
              team === Team.BLUE ? 'border-sky-500 bg-sky-500/10' : 'border-slate-800 bg-slate-800/50 grayscale'
            }`}
          >
            <div className="text-4xl font-black text-sky-500">BLUE</div>
            <div className="text-[10px] font-bold text-sky-400/50 uppercase">Division One</div>
          </button>
          <button 
            onClick={() => setTeam(Team.RED)}
            className={`py-8 rounded-[2rem] border-4 transition-all flex flex-col items-center gap-2 ${
              team === Team.RED ? 'border-rose-500 bg-rose-500/10' : 'border-slate-800 bg-slate-800/50 grayscale'
            }`}
          >
            <div className="text-4xl font-black text-rose-500">RED</div>
            <div className="text-[10px] font-bold text-rose-400/50 uppercase">Division Two</div>
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <button 
            onClick={() => onStart(team)}
            className="w-full py-6 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-3xl rounded-[2rem] transition-all transform hover:scale-[1.02] active:scale-95 shadow-2xl shadow-indigo-600/30"
          >
            DEPLOY TO ARENA
          </button>
          
          <div className="flex gap-4">
            <button 
              onClick={onOpenEditor}
              className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl border border-slate-700 text-xs uppercase tracking-widest"
            >
              Arena Designer
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-4 bg-slate-800 hover:bg-slate-700 text-slate-500 font-bold rounded-2xl border border-slate-700 text-xs uppercase"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Menu;
