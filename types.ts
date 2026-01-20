export interface User {
  telegram_id: number;
  username: string;
  balance: number;
  luck: number; // 0-100
  avatar_url?: string;
  referred_by?: number;
}

export enum GameType {
  SLOTS = 'SLOTS',
  WHEEL = 'WHEEL',
  CUPS = 'CUPS',
  GUESS_NUMBER = 'GUESS_NUMBER',
  ROULETTE = 'ROULETTE',
  ROCK_PAPER_SCISSORS = 'ROCK_PAPER_SCISSORS',
}

export interface GameResult {
  won: boolean;
  amount: number;
  message: string;
  // Game specific data
  slotsResult?: string[]; 
  wheelSegmentIndex?: number; // 0-7
  cupPosition?: number;
  guessedNumber?: number;
  secretNumber?: number;
  rouletteNumber?: number;
  rpsChoice?: string;
  rpsBotChoice?: string;
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw' | 'game_win' | 'game_loss' | 'promo' | 'welcome_bonus';
  amount: number;
  date: string;
}

export enum AppRoute {
  HOME = 'home',
  WALLET = 'wallet',
  PROFILE = 'profile',
  SUPPORT = 'support',
  GAME_SLOTS = 'game_slots',
  GAME_WHEEL = 'game_wheel',
  GAME_CUPS = 'game_cups',
  GAME_GUESS_NUMBER = 'game_guess_number',
  GAME_ROULETTE = 'game_roulette',
  GAME_RPS = 'game_rps',
}

// Telegram WebApp Types
declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready(): void;
        expand(): void;
        close(): void;
        showAlert(message: string): void;
        initDataUnsafe?: {
          user?: {
            id: number;
            first_name?: string;
            last_name?: string;
            username?: string;
            language_code?: string;
          };
        };
        HapticFeedback?: {
          impactOccurred(style: 'light' | 'medium' | 'heavy'): void;
        };
      };
    };
  }
}