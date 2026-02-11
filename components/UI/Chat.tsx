
import React, { useState, useRef, useEffect } from 'react';
import { ChatEntry, Team } from '../../types';

interface ChatProps {
  log: ChatEntry[];
  onSend: (text: string) => void;
  playerTeam: Team;
}

const Chat: React.FC<ChatProps> = ({ log, onSend, playerTeam }) => {
  const [message, setMessage] = useState('');
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [log]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSend(message);
      setMessage('');
    }
  };

  return (
    <div className="bg-black/40 backdrop-blur-lg border border-white/10 rounded-2xl overflow-hidden flex flex-col shadow-2xl h-64 pointer-events-auto">
      <div className="bg-white/5 p-2 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-white/5 flex justify-between">
        <span>Team Comms</span>
        <span className={playerTeam === Team.BLUE ? 'text-sky-400' : 'text-rose-400'}>{playerTeam}</span>
      </div>
      
      <div 
        ref={logRef}
        className="flex-1 overflow-y-auto p-3 space-y-1 scroll-smooth"
      >
        {log.map((entry) => {
          const isSystem = entry.team === Team.NONE;
          const isSelf = entry.sender === 'You';
          const teamColor = entry.team === Team.BLUE ? 'text-sky-400' : 'text-rose-400';
          
          return (
            <div key={entry.id} className="text-xs leading-relaxed animate-in fade-in slide-in-from-bottom-1 duration-200">
              {isSystem ? (
                <span className="text-yellow-500 font-bold">SYSTEM: {entry.text}</span>
              ) : (
                <>
                  <span className={`${teamColor} font-black`}>[{entry.sender}] </span>
                  <span className="text-slate-200">{entry.text}</span>
                </>
              )}
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="p-2 bg-white/5 border-t border-white/10 flex gap-2">
        <input 
          type="text" 
          placeholder="Press ENTER to chat..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 flex-1"
        />
      </form>
    </div>
  );
};

export default Chat;
