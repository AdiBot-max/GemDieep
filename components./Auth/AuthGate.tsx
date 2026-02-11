
import React, { useState, useEffect } from 'react';
import { AuthService } from '../../services/AuthService';
import { UserAccount } from '../../types';

interface AuthGateProps {
  onAuthenticated: (user: UserAccount) => void;
}

const AuthGate: React.FC<AuthGateProps> = ({ onAuthenticated }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const user = AuthService.getCurrentUser();
    if (user) onAuthenticated(user);
  }, [onAuthenticated]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isRegistering) {
        onAuthenticated(AuthService.register(username));
      } else {
        onAuthenticated(AuthService.login(username));
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950 flex items-center justify-center z-[5000]">
      <div className="bg-slate-900 p-12 rounded-[2.5rem] border border-slate-800 w-full max-w-md shadow-2xl backdrop-blur-3xl">
        <div className="mb-10 text-center">
          <h1 className="text-5xl font-black text-white italic tracking-tighter mb-2">GEMINI <span className="text-sky-500">ID</span></h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Pilot Identification Required</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-2">Username</label>
            <input 
              type="text" 
              required
              className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl px-6 py-4 text-white font-bold text-lg focus:outline-none focus:border-sky-500 transition-all"
              placeholder="CALLSIGN"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          {error && <div className="text-rose-500 text-xs font-bold text-center bg-rose-500/10 py-2 rounded-lg">{error}</div>}

          <button className="w-full py-4 bg-sky-600 hover:bg-sky-500 text-white font-black text-xl rounded-2xl transition-all shadow-lg shadow-sky-600/20">
            {isRegistering ? 'INITIALIZE PROFILE' : 'RESUME COMMAND'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-slate-400 text-xs font-bold uppercase hover:text-white transition-colors"
          >
            {isRegistering ? 'Already have an account? Login' : 'New pilot? Create account'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthGate;
