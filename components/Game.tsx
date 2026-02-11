
import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from '../engine/GameEngine';
import HUD from './UI/HUD';
import UpgradePanel from './UI/UpgradePanel';
import ClassSelector from './UI/ClassSelector';
import Chat from './UI/Chat';
import { TankClass, Tank, Team, ChatEntry, MapObject } from '../types';

interface GameProps {
  playerName: string;
  team: Team;
  customMap: MapObject[];
  onGameOver: (score: number) => void;
}

const Game: React.FC<GameProps> = ({ playerName, team, customMap, onGameOver }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const [playerData, setPlayerData] = useState<Tank | null>(null);
  const [availableEvolutions, setAvailableEvolutions] = useState<TankClass[]>([]);
  const [chatLog, setChatLog] = useState<ChatEntry[]>([]);
  const [teamScores, setTeamScores] = useState<Record<Team, number>>({ [Team.BLUE]: 0, [Team.RED]: 0, [Team.NONE]: 0 });

  useEffect(() => {
    if (!canvasRef.current) return;
    
    const engine = new GameEngine(
      canvasRef.current, 
      playerName, 
      team,
      customMap,
      (score) => onGameOver(score)
    );
    
    engineRef.current = engine;
    engine.start();

    const interval = setInterval(() => {
      if (engineRef.current) {
        setPlayerData({ ...engineRef.current.getPlayer() });
        setAvailableEvolutions(engineRef.current.getAvailableEvolutions());
        setChatLog([...engineRef.current.getChatLog()]);
        setTeamScores({ ...engineRef.current.getTeamScores() });
      }
    }, 100);

    return () => {
      clearInterval(interval);
      engine.stop();
    };
  }, [playerName, team, customMap, onGameOver]);

  const handleUpgrade = (statKey: keyof Tank['stats']) => {
    engineRef.current?.upgradeStat(statKey);
  };

  const handleEvolve = (newClass: TankClass) => {
    engineRef.current?.evolve(newClass);
  };

  const handleSendMessage = (text: string) => {
    engineRef.current?.addChatMessage(playerName, text, team);
  };

  return (
    <div className="relative w-full h-full bg-slate-900">
      <canvas ref={canvasRef} className="w-full h-full" />

      {playerData && (
        <>
          <HUD player={playerData} />
          
          <div className="absolute top-4 left-4 flex flex-col gap-4 pointer-events-none">
            <div className="bg-black/60 p-4 rounded-xl border border-white/10 backdrop-blur-md pointer-events-auto">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Team War Score</h4>
              <div className="flex gap-4 items-center">
                <div className="flex flex-col">
                  <span className="text-sky-400 font-black">BLUE</span>
                  <span className="text-xl font-mono">{teamScores[Team.BLUE].toLocaleString()}</span>
                </div>
                <div className="w-[1px] h-8 bg-white/10" />
                <div className="flex flex-col">
                  <span className="text-rose-500 font-black">RED</span>
                  <span className="text-xl font-mono">{teamScores[Team.RED].toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-4 left-4 flex flex-col gap-4">
            <UpgradePanel 
              stats={playerData.stats} 
              points={playerData.statPoints} 
              onUpgrade={handleUpgrade} 
            />
          </div>

          <div className="absolute bottom-4 right-4 w-80">
            <Chat log={chatLog} onSend={handleSendMessage} playerTeam={team} />
          </div>

          {availableEvolutions.length > 0 && (
            <div className="absolute top-24 left-4">
              <ClassSelector classes={availableEvolutions} onSelect={handleEvolve} />
            </div>
          )}

          <div className="absolute top-4 right-4 bg-black/60 p-4 rounded-xl backdrop-blur-md border border-white/10 text-white min-w-[220px]">
            <h3 className="font-bold text-xs uppercase text-slate-400 mb-3 border-b border-white/10 pb-2">Global Rankings</h3>
            {engineRef.current?.getLeaderboard().map((entry, i) => (
              <div key={i} className="flex justify-between items-center text-sm py-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-500">{i + 1}</span>
                  <span className={`${i === 0 ? 'text-yellow-400 font-bold' : 'text-slate-200'}`}>{entry.name}</span>
                </div>
                <span className="font-mono text-slate-400">{entry.score}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Game;
