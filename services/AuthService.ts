
import { UserAccount } from '../types';

const STORAGE_KEY = 'gemini_tank_accounts';
const SESSION_KEY = 'gemini_tank_current_user';

export class AuthService {
  static register(username: string): UserAccount {
    const accounts = this.getAllAccounts();
    if (accounts[username]) throw new Error("User already exists");
    
    const newUser: UserAccount = {
      username,
      level: 1,
      totalXp: 0,
      topScore: 0
    };
    
    accounts[username] = newUser;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
    this.login(username);
    return newUser;
  }

  static login(username: string): UserAccount {
    const accounts = this.getAllAccounts();
    if (!accounts[username]) throw new Error("User not found");
    localStorage.setItem(SESSION_KEY, username);
    return accounts[username];
  }

  static logout() {
    localStorage.removeItem(SESSION_KEY);
  }

  static getCurrentUser(): UserAccount | null {
    const username = localStorage.getItem(SESSION_KEY);
    if (!username) return null;
    return this.getAllAccounts()[username] || null;
  }

  static saveProgress(xp: number, score: number) {
    const user = this.getCurrentUser();
    if (!user) return;
    const accounts = this.getAllAccounts();
    accounts[user.username].totalXp += xp;
    if (score > accounts[user.username].topScore) {
      accounts[user.username].topScore = score;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
  }

  private static getAllAccounts(): Record<string, UserAccount> {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  }
}
