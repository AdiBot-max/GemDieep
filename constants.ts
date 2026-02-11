
import { Team, TankClass } from './types';

export const WORLD_SIZE = 5000;
export const MAX_SHAPES = 150;
export const INITIAL_PLAYER_RADIUS = 28;
export const STAT_LIMIT = 8;

export const COLORS = {
  TEAM_BLUE: '#38bdf8',
  TEAM_RED: '#fb7185',
  NEUTRAL: '#94a3b8',
  WALL: '#1e293b',
  BACKGROUND: '#020617',
  GRID: '#0f172a',
  SQUARE: '#fde047',
  TRIANGLE: '#f43f5e',
  PENTAGON: '#818cf8'
};

// Evolution tree defining which classes can be selected at level milestones
export const EVOLUTIONS: Record<string, TankClass[]> = {
  [TankClass.BASIC]: [TankClass.TWIN, TankClass.SNIPER, TankClass.MACHINE_GUN, TankClass.FLANK_GUARD],
  [TankClass.TWIN]: [TankClass.TRIPLE_SHOT, TankClass.QUAD_TANK],
  [TankClass.SNIPER]: [TankClass.OVERSEER],
  [TankClass.MACHINE_GUN]: [TankClass.DESTROYER],
  [TankClass.FLANK_GUARD]: [],
  [TankClass.TRIPLE_SHOT]: [],
  [TankClass.QUAD_TANK]: [],
  [TankClass.OVERSEER]: [],
  [TankClass.DESTROYER]: []
};

export const SVG_BARREL = `
  <svg viewBox="0 0 100 40" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="5" width="100" height="30" rx="4" fill="#64748b" stroke="#334155" stroke-width="2"/>
    <rect x="80" y="5" width="20" height="30" rx="2" fill="#475569"/>
  </svg>
`;
