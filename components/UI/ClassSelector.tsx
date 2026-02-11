
import React from 'react';
import { TankClass } from '../../types';

interface ClassSelectorProps {
  classes: TankClass[];
  onSelect: (newClass: TankClass) => void;
}

const ClassSelector: React.FC<ClassSelectorProps> = ({ classes, onSelect }) => {
  if (classes.length === 0) return null;

  return (
    <div className="absolute top-4 left-4 flex flex-col gap-3 animate-in fade-in slide-in-from-top duration-500">
      <div className="text-white font-black uppercase tracking-widest text-xs mb-1 ml-1 drop-shadow-md">Available Evolutions</div>
      <div className="flex flex-col gap-2">
        {classes.map((className) => (
          <button
            key={className}
            onClick={() => onSelect(className)}
            className="px-6 py-4 bg-slate-800 hover:bg-sky-600 text-white rounded-xl border-2 border-slate-700 hover:border-sky-400 transition-all font-bold text-left group shadow-lg"
          >
            <div className="text-lg tracking-tight">{className}</div>
            <div className="text-[10px] text-slate-400 group-hover:text-white/80 uppercase font-bold">Evolution Available</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ClassSelector;
