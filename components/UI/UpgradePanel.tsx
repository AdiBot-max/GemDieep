
import React from 'react';
import { StatModifiers, Tank } from '../../types';
import { STAT_LIMIT } from '../../constants';

interface UpgradePanelProps {
  stats: StatModifiers;
  points: number;
  onUpgrade: (statKey: keyof StatModifiers) => void;
}

const UpgradePanel: React.FC<UpgradePanelProps> = ({ stats, points, onUpgrade }) => {
  if (points <= 0) return null;

  const statLabels: { key: keyof StatModifiers; label: string; color: string }[] = [
    { key: 'healthRegen', label: 'Health Regen', color: 'bg-emerald-500' },
    { key: 'maxHealth', label: 'Max Health', color: 'bg-rose-500' },
    { key: 'bodyDamage', label: 'Body Damage', color: 'bg-indigo-500' },
    { key: 'bulletSpeed', label: 'Bullet Speed', color: 'bg-orange-500' },
    { key: 'bulletPenetration', label: 'Penetration', color: 'bg-amber-500' },
    { key: 'bulletDamage', label: 'Bullet Damage', color: 'bg-sky-500' },
    { key: 'reload', label: 'Reload Rate', color: 'bg-pink-500' },
    { key: 'movementSpeed', label: 'Move Speed', color: 'bg-teal-500' },
  ];

  return (
    <div className="bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-2xl w-64 animate-in slide-in-from-left duration-300">
      <div className="flex justify-between items-center mb-4">
        <span className="text-white font-black uppercase tracking-tighter text-sm">Upgrade Stats</span>
        <span className="bg-sky-500 text-white px-2 py-0.5 rounded text-xs font-black">{points} PTS</span>
      </div>
      
      <div className="space-y-2">
        {statLabels.map((stat) => (
          <button
            key={stat.key}
            onClick={() => onUpgrade(stat.key)}
            disabled={stats[stat.key] >= STAT_LIMIT}
            className="group w-full flex flex-col gap-1.5 p-1 rounded-lg hover:bg-white/5 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-white transition-colors">
              <span>{stat.label}</span>
              <span>{stats[stat.key]} / {STAT_LIMIT}</span>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: STAT_LIMIT }).map((_, i) => (
                <div 
                  key={i}
                  className={`h-2 flex-1 rounded-sm border border-black/20 ${
                    i < stats[stat.key] ? stat.color : 'bg-slate-800'
                  }`}
                />
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default UpgradePanel;
