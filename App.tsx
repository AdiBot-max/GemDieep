
import React, { useState, useCallback } from 'react';
import Game from './components/Game';
import Menu from './components/UI/Menu';
import MapEditor from './components/UI/MapEditor';
import AuthGate from './components/Auth/AuthGate';
import { Team, MapObject, UserAccount } from './types';

type AppState = 'AUTH' | 'MENU' | 'PLAYING' | 'GAMEOVER' | 'MAP_EDITOR';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('AUTH');
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [playerTeam, setPlayerTeam] = useState<Team>(Team.BLUE);
  const [finalScore, setFinalScore] = useState(0);
  const [customMap, setCustomMap] = useState<MapObject[]>([]);

  const handleAuth = (user: UserAccount) => {
    setCurrentUser(user);
    setAppState('MENU');
  };

  const startGame = (team: Team) => {
    setPlayerTeam(team);
    setAppState('PLAYING');
  };

  const handleGameOver = useCallback((score: number) => {
    setFinalScore(score);
    setAppState('GAMEOVER');
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans text-slate-100">
      {appState === 'AUTH' && <AuthGate onAuthenticated={handleAuth} />}

      {appState === 'MENU' && currentUser && (
        <Menu 
          username={currentUser.username}
          onStart={startGame} 
          onOpenEditor={() => setAppState('MAP_EDITOR')} 
        />
      )}

      {appState === 'MAP_EDITOR' && (
        <MapEditor 
          onSave={(map) => { setCustomMap(map); setAppState('MENU'); }} 
          onCancel={() => setAppState('MENU')} 
        />
      )}

      {appState === 'PLAYING' && currentUser && (
        <Game 
          playerName={currentUser.username} 
          team={playerTeam} 
          customMap={customMap}
          onGameOver={handleGameOver} 
        />
      )}

      {appState === 'GAMEOVER' && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[6000] animate-in fade-in duration-500 backdrop-blur-xl">
          <div className="text-center p-12 bg-slate-900 rounded-[3rem] border border-slate-800 shadow-2xl max-w-lg w-full">
            <h1 className="text-7xl font-black text-white italic tracking-tighter mb-8">TERMINATED</h1>
            <div className="text-6xl font-black text-sky-500 mb-12 drop-shadow-[0_0_20px_rgba(14,165,233,0.4)]">
              {finalScore.toLocaleString()}
            </div>
            <button 
              onClick={() => setAppState('MENU')}
              className="w-full py-6 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-2xl rounded-3xl transition-all shadow-xl shadow-indigo-600/30"
            >
              RETURN TO BASE
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
