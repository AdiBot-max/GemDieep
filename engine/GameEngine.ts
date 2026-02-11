
import { 
  GameState, Tank, Shape, Bullet, Vector, ShapeType, TankClass, 
  StatModifiers, Team, MapObject, ChatEntry 
} from '../types';
import { 
  WORLD_SIZE, MAX_SHAPES, COLORS, INITIAL_PLAYER_RADIUS,
  EVOLUTIONS, STAT_LIMIT
} from '../constants';
import { MultiplayerService } from '../services/MultiplayerService';

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private state: GameState;
  private keys: Set<string> = new Set();
  private mousePos: Vector = { x: 0, y: 0 };
  private mouseDown: boolean = false;
  private animationFrameId: number | null = null;
  private lastUpdate: number = 0;
  private multiplayer: MultiplayerService;
  private onGameOver: (score: number) => void;
  private tankImages: Record<string, HTMLImageElement> = {};

  constructor(
    canvas: HTMLCanvasElement, 
    playerName: string, 
    team: Team, 
    customMap: MapObject[],
    onGameOver: (score: number) => void
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.onGameOver = onGameOver;

    const initialStats: StatModifiers = {
      healthRegen: 0, maxHealth: 1, bodyDamage: 1, bulletSpeed: 1,
      bulletPenetration: 1, bulletDamage: 1, reload: 1, movementSpeed: 2
    };

    const player: Tank = {
      id: Math.random().toString(36).substr(2, 9),
      name: playerName,
      pos: this.getSpawnPos(team, customMap),
      vel: { x: 0, y: 0 },
      radius: INITIAL_PLAYER_RADIUS,
      hp: 100, maxHp: 100,
      angle: 0, class: TankClass.BASIC,
      level: 1, xp: 0, maxXp: 100,
      statPoints: 0, stats: initialStats,
      team, score: 0, lastFired: 0
    };

    // Initialize GameState with camera and chatLog to satisfy interface requirements
    this.state = {
      player,
      remotePlayers: {},
      shapes: [],
      bullets: [],
      mapObjects: customMap.length > 0 ? customMap : this.createDefaultMap(),
      camera: { x: 0, y: 0 },
      chatLog: []
    };

    this.multiplayer = new MultiplayerService((type, data) => {
      if (type === 'PLAYER_UPDATE') {
        if (data.id !== this.state.player.id) {
          this.state.remotePlayers[data.id] = data;
        }
      } else if (type === 'PLAYER_FIRE') {
        this.state.bullets.push(data);
      } else if (type === 'PLAYER_DEATH') {
        delete this.state.remotePlayers[data];
      }
    });

    this.initArena();
    this.setupEventListeners();
  }

  private getSpawnPos(team: Team, map: MapObject[]): Vector {
    const spawns = map.filter(o => team === Team.BLUE ? o.type === ShapeType.SPAWN_BLUE : o.type === ShapeType.SPAWN_RED);
    if (spawns.length > 0) {
      const s = spawns[Math.floor(Math.random() * spawns.length)];
      return { x: s.pos.x, y: s.pos.y };
    }
    return team === Team.BLUE ? { x: 300, y: 300 } : { x: WORLD_SIZE - 300, y: WORLD_SIZE - 300 };
  }

  private createDefaultMap(): MapObject[] {
    return [
      { type: ShapeType.OBSTACLE, pos: { x: WORLD_SIZE/2, y: WORLD_SIZE/2 }, size: { x: 400, y: 400 } },
      { type: ShapeType.SPAWN_BLUE, pos: { x: 500, y: 500 }, size: { x: 1000, y: 1000 } },
      { type: ShapeType.SPAWN_RED, pos: { x: WORLD_SIZE - 500, y: WORLD_SIZE - 500 }, size: { x: 1000, y: 1000 } }
    ];
  }

  private initArena() {
    for (let i = 0; i < MAX_SHAPES; i++) this.spawnShape();
  }

  private spawnShape() {
    const r = Math.random();
    let type = ShapeType.SQUARE, xp = 10, color = COLORS.SQUARE, radius = 18;
    if (r > 0.95) { type = ShapeType.PENTAGON; xp = 200; color = COLORS.PENTAGON; radius = 45; }
    else if (r > 0.8) { type = ShapeType.TRIANGLE; xp = 40; color = COLORS.TRIANGLE; radius = 24; }
    
    this.state.shapes.push({
      id: Math.random().toString(36).substr(2, 5),
      pos: { x: Math.random() * WORLD_SIZE, y: Math.random() * WORLD_SIZE },
      radius, hp: radius * 3, maxHp: radius * 3,
      color, type, xpValue: xp,
      rot: Math.random() * Math.PI,
      rotS: (Math.random() - 0.5) * 0.04
    });
  }

  private setupEventListeners() {
    window.addEventListener('keydown', (e) => this.keys.add(e.code));
    window.addEventListener('keyup', (e) => this.keys.delete(e.code));
    window.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mousePos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    });
    window.addEventListener('mousedown', () => this.mouseDown = true);
    window.addEventListener('mouseup', () => this.mouseDown = false);
    window.addEventListener('resize', () => this.resize());
    this.resize();
  }

  private resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  public start() {
    this.lastUpdate = performance.now();
    this.loop();
  }

  public stop() {
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    this.multiplayer.close();
  }

  private loop = () => {
    const now = performance.now();
    const dt = Math.min((now - this.lastUpdate) / 1000, 0.1);
    this.lastUpdate = now;
    this.update(dt, now);
    this.draw();
    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  private update(dt: number, now: number) {
    const { player, shapes, bullets, mapObjects, remotePlayers } = this.state;

    // Movement
    const speed = 180 + (player.stats.movementSpeed * 40);
    let moveX = 0, moveY = 0;
    if (this.keys.has('KeyW')) moveY -= 1;
    if (this.keys.has('KeyS')) moveY += 1;
    if (this.keys.has('KeyA')) moveX -= 1;
    if (this.keys.has('KeyD')) moveX += 1;

    if (moveX !== 0 || moveY !== 0) {
      const mag = Math.sqrt(moveX**2 + moveY**2);
      player.vel.x = (moveX / mag) * speed;
      player.vel.y = (moveY / mag) * speed;
    } else {
      player.vel.x *= 0.9; player.vel.y *= 0.9;
    }

    player.pos.x += player.vel.x * dt;
    player.pos.y += player.vel.y * dt;

    // Collisions
    player.pos.x = Math.max(player.radius, Math.min(WORLD_SIZE - player.radius, player.pos.x));
    player.pos.y = Math.max(player.radius, Math.min(WORLD_SIZE - player.radius, player.pos.y));

    for (const obj of mapObjects) {
      if (obj.type !== ShapeType.OBSTACLE) continue;
      const dx = player.pos.x - obj.pos.x;
      const dy = player.pos.y - obj.pos.y;
      const hX = obj.size.x / 2 + player.radius;
      const hY = obj.size.y / 2 + player.radius;
      if (Math.abs(dx) < hX && Math.abs(dy) < hY) {
        const oX = hX - Math.abs(dx);
        const oY = hY - Math.abs(dy);
        if (oX < oY) player.pos.x += dx > 0 ? oX : -oX;
        else player.pos.y += dy > 0 ? oY : -oY;
      }
    }

    const sCX = this.canvas.width / 2;
    const sCY = this.canvas.height / 2;
    player.angle = Math.atan2(this.mousePos.y - sCY, this.mousePos.x - sCX);

    // Shooting
    if (this.mouseDown && now - player.lastFired > 1000 / (player.stats.reload * 2 + 3)) {
      this.fire(player);
      player.lastFired = now;
    }

    // Sync
    this.multiplayer.broadcastUpdate(player);

    // Bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
      const b = bullets[i];
      b.pos.x += b.vel.x * dt;
      b.pos.y += b.vel.y * dt;
      b.lifeTime += dt;
      if (b.lifeTime > 2) { bullets.splice(i, 1); continue; }

      // Bullet-Wall
      let hit = false;
      for (const obj of mapObjects) {
        if (obj.type === ShapeType.OBSTACLE && Math.abs(b.pos.x - obj.pos.x) < obj.size.x/2 && Math.abs(b.pos.y - obj.pos.y) < obj.size.y/2) {
          bullets.splice(i, 1); hit = true; break;
        }
      }
      if (hit) continue;

      // Bullet-Tank
      if (b.ownerId !== player.id && b.team !== player.team) {
        if (Math.sqrt((b.pos.x - player.pos.x)**2 + (b.pos.y - player.pos.y)**2) < b.radius + player.radius) {
          player.hp -= b.damage;
          bullets.splice(i, 1);
          if (player.hp <= 0) {
            this.multiplayer.broadcastDeath(player.id);
            this.onGameOver(player.score);
          }
          continue;
        }
      }
    }

    shapes.forEach(s => s.rot += s.rotS);
    // Update camera to follow player
    this.state.camera = { x: player.pos.x - this.canvas.width/2, y: player.pos.y - this.canvas.height/2 };
  }

  private fire(tank: Tank) {
    const b: Bullet = {
      id: Math.random().toString(36).substr(2, 5),
      ownerId: tank.id,
      pos: { x: tank.pos.x + Math.cos(tank.angle) * tank.radius * 1.5, y: tank.pos.y + Math.sin(tank.angle) * tank.radius * 1.5 },
      vel: { x: Math.cos(tank.angle) * 600, y: Math.sin(tank.angle) * 600 },
      radius: 10,
      damage: 15,
      team: tank.team,
      lifeTime: 0
    };
    this.state.bullets.push(b);
    this.multiplayer.broadcastFire(b);
  }

  private draw() {
    const { ctx, canvas, state } = this;
    ctx.fillStyle = COLORS.BACKGROUND;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    // Apply camera viewport translation
    ctx.translate(-state.camera.x, -state.camera.y);

    // Grid
    ctx.strokeStyle = COLORS.GRID;
    ctx.lineWidth = 2;
    const step = 80;
    for (let x = 0; x <= WORLD_SIZE; x += step) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, WORLD_SIZE); ctx.stroke(); }
    for (let y = 0; y <= WORLD_SIZE; y += step) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(WORLD_SIZE, y); ctx.stroke(); }

    // Map
    state.mapObjects.forEach(obj => {
      if (obj.type === ShapeType.OBSTACLE) {
        ctx.fillStyle = COLORS.WALL;
        ctx.fillRect(obj.pos.x - obj.size.x/2, obj.pos.y - obj.size.y/2, obj.size.x, obj.size.y);
      } else {
        ctx.fillStyle = (obj.type === ShapeType.SPAWN_BLUE ? COLORS.TEAM_BLUE : COLORS.TEAM_RED) + '11';
        ctx.fillRect(obj.pos.x - obj.size.x/2, obj.pos.y - obj.size.y/2, obj.size.x, obj.size.y);
      }
    });

    // Shapes
    state.shapes.forEach(s => {
      ctx.save(); ctx.translate(s.pos.x, s.pos.y); ctx.rotate(s.rot);
      ctx.fillStyle = s.color; ctx.strokeStyle = '#00000033'; ctx.lineWidth = 3;
      if (s.type === ShapeType.SQUARE) { ctx.fillRect(-s.radius, -s.radius, s.radius*2, s.radius*2); ctx.strokeRect(-s.radius, -s.radius, s.radius*2, s.radius*2); }
      else {
        const sides = s.type === ShapeType.TRIANGLE ? 3 : 5;
        ctx.beginPath();
        for (let i = 0; i < sides; i++) {
          const a = (i * 2 * Math.PI) / sides;
          ctx.lineTo(Math.cos(a) * s.radius * 1.2, Math.sin(a) * s.radius * 1.2);
        }
        ctx.closePath(); ctx.fill(); ctx.stroke();
      }
      ctx.restore();
    });

    // Bullets
    state.bullets.forEach(b => {
      ctx.beginPath(); ctx.arc(b.pos.x, b.pos.y, b.radius, 0, Math.PI*2);
      ctx.fillStyle = b.team === Team.BLUE ? COLORS.TEAM_BLUE : COLORS.TEAM_RED;
      ctx.fill(); ctx.stroke();
    });

    // Players
    this.drawTank(state.player);
    Object.values(state.remotePlayers).forEach(p => this.drawTank(p));

    ctx.restore();
  }

  private drawTank(t: Tank) {
    const { ctx } = this;
    ctx.save();
    ctx.translate(t.pos.x, t.pos.y);
    
    // Name
    ctx.fillStyle = 'white'; ctx.font = 'bold 16px Inter'; ctx.textAlign = 'center';
    ctx.fillText(t.name, 0, -t.radius - 20);

    ctx.rotate(t.angle);
    
    // Barrel
    ctx.fillStyle = '#64748b'; ctx.strokeStyle = '#334155'; ctx.lineWidth = 3;
    ctx.fillRect(0, -t.radius * 0.4, t.radius * 2, t.radius * 0.8);
    ctx.strokeRect(0, -t.radius * 0.4, t.radius * 2, t.radius * 0.8);

    // Body
    ctx.beginPath(); ctx.arc(0, 0, t.radius, 0, Math.PI*2);
    ctx.fillStyle = t.team === Team.BLUE ? COLORS.TEAM_BLUE : COLORS.TEAM_RED;
    ctx.fill(); ctx.strokeStyle = '#00000033'; ctx.lineWidth = 5; ctx.stroke();

    ctx.restore();

    // HP Bar
    const hpW = t.radius * 2.5;
    ctx.fillStyle = '#00000066'; ctx.fillRect(t.pos.x - hpW/2, t.pos.y + t.radius + 15, hpW, 8);
    ctx.fillStyle = t.hp > (t.maxHp * 0.4) ? '#2ecc71' : '#e74c3c';
    ctx.fillRect(t.pos.x - hpW/2, t.pos.y + t.radius + 15, hpW * (t.hp/t.maxHp), 8);
  }

  public getPlayer() { return this.state.player; }

  // Returns possible tank evolutions based on player level and current class
  public getAvailableEvolutions() { 
    if (this.state.player.level >= 15 && EVOLUTIONS[this.state.player.class]) {
      return EVOLUTIONS[this.state.player.class];
    }
    return []; 
  }

  public getChatLog() { return this.state.chatLog; }

  public getTeamScores() { 
    const scores = { [Team.BLUE]: 0, [Team.RED]: 0, [Team.NONE]: 0 };
    Object.values(this.state.remotePlayers).forEach(p => scores[p.team] += p.score);
    scores[this.state.player.team] += this.state.player.score;
    return scores; 
  }

  public getLeaderboard() { 
    const players = [this.state.player, ...Object.values(this.state.remotePlayers)];
    return players
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(p => ({ name: p.name, score: p.score }));
  }

  // Upgrades a specific stat if the player has points available
  public upgradeStat(k: keyof StatModifiers) {
    if (this.state.player.statPoints > 0 && this.state.player.stats[k] < STAT_LIMIT) {
      this.state.player.stats[k]++;
      this.state.player.statPoints--;
    }
  }

  // Changes player's tank class upon evolution
  public evolve(c: TankClass) {
    this.state.player.class = c;
  }

  // Implementation of addChatMessage to handle in-game chat events
  public addChatMessage(sender: string, text: string, team: Team) {
    const entry: ChatEntry = {
      id: Math.random().toString(36).substr(2, 9),
      sender,
      text,
      team
    };
    this.state.chatLog.push(entry);
    // Keep log size manageable
    if (this.state.chatLog.length > 50) this.state.chatLog.shift();
  }
}
