
export enum ShapeType {
  SQUARE = 'SQUARE',
  TRIANGLE = 'TRIANGLE',
  PENTAGON = 'PENTAGON',
  OBSTACLE = 'OBSTACLE',
  SPAWN_BLUE = 'SPAWN_BLUE',
  SPAWN_RED = 'SPAWN_RED'
}

export enum TankClass {
  BASIC = 'Basic',
  TWIN = 'Twin',
  SNIPER = 'Sniper',
  MACHINE_GUN = 'Machine Gun',
  FLANK_GUARD = 'Flank Guard',
  TRIPLE_SHOT = 'Triple Shot',
  QUAD_TANK = 'Quad Tank',
  OVERSEER = 'Overseer',
  DESTROYER = 'Destroyer'
}

export enum Team {
  BLUE = 'BLUE',
  RED = 'RED',
  NONE = 'NONE'
}

export interface Vector { x: number; y: number; }

export interface UserAccount {
  username: string;
  password?: string;
  level: number;
  totalXp: number;
  topScore: number;
}

export interface MapObject {
  type: ShapeType;
  pos: Vector;
  size: Vector;
}

export interface StatModifiers {
  healthRegen: number;
  maxHealth: number;
  bodyDamage: number;
  bulletSpeed: number;
  bulletPenetration: number;
  bulletDamage: number;
  reload: number;
  movementSpeed: number;
}

export interface Tank {
  id: string;
  name: string;
  pos: Vector;
  vel: Vector;
  radius: number;
  hp: number;
  maxHp: number;
  angle: number;
  class: TankClass;
  level: number;
  xp: number;
  maxXp: number;
  statPoints: number;
  stats: StatModifiers;
  team: Team;
  score: number;
  lastFired: number;
}

export interface Bullet {
  id: string;
  ownerId: string;
  pos: Vector;
  vel: Vector;
  radius: number;
  damage: number;
  team: Team;
  lifeTime: number;
}

// Added Shape interface to represent game entities like squares and triangles
export interface Shape {
  id: string;
  pos: Vector;
  radius: number;
  hp: number;
  maxHp: number;
  color: string;
  type: ShapeType;
  xpValue: number;
  rot: number;
  rotS: number;
}

// Added ChatEntry interface for team communication
export interface ChatEntry {
  id: string;
  sender: string;
  text: string;
  team: Team;
}

export interface GameState {
  player: Tank;
  remotePlayers: Record<string, Tank>;
  shapes: Shape[]; // Updated from any[] to Shape[]
  bullets: Bullet[];
  mapObjects: MapObject[];
  camera: Vector; // Added camera property for rendering viewport
  chatLog: ChatEntry[]; // Added chatLog to store session messages
}
