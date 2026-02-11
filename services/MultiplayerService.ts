
import { Tank, Bullet } from '../types';

export class MultiplayerService {
  private channel: BroadcastChannel;
  private onMessage: (type: string, data: any) => void;

  constructor(onMessage: (type: string, data: any) => void) {
    this.channel = new BroadcastChannel('gemini_tank_multiplayer');
    this.onMessage = onMessage;
    this.channel.onmessage = (event) => {
      this.onMessage(event.data.type, event.data.data);
    };
  }

  broadcastUpdate(player: Tank) {
    this.channel.postMessage({ type: 'PLAYER_UPDATE', data: player });
  }

  broadcastFire(bullet: Bullet) {
    this.channel.postMessage({ type: 'PLAYER_FIRE', data: bullet });
  }

  broadcastDeath(id: string) {
    this.channel.postMessage({ type: 'PLAYER_DEATH', data: id });
  }

  close() {
    this.channel.close();
  }
}
