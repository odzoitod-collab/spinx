import { User, GameResult, Transaction, GameType } from '../types';

// Mock state simulating Supabase 'users' table
let currentUser: User = {
  telegram_id: 123456789,
  username: 'Lucky_Player',
  balance: 5000,
  luck: 50, // Default from SQL: default 50
  avatar_url: 'https://picsum.photos/200',
};

// Transactions simulating 'transactions' table
const transactions: Transaction[] = [
  { id: '1', type: 'deposit', amount: 5000, date: new Date().toISOString() }
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const MockApi = {
  /**
   * Simulates: SELECT * FROM users WHERE telegram_id = ...
   */
  getUser: async (): Promise<User> => {
    await delay(300);
    return { ...currentUser };
  },

  /**
   * Simulates promo code activation and insert into transactions
   */
  applyPromo: async (code: string): Promise<{ success: boolean; message: string; reward?: number }> => {
    await delay(500);
    // In real Supabase: SELECT * FROM promo_codes WHERE code = $1 AND is_active = TRUE
    if (code.toUpperCase() === 'BONUS2025') {
      const reward = 1000;
      currentUser.balance += reward;
      transactions.unshift({
        id: crypto.randomUUID(),
        type: 'promo',
        amount: reward,
        date: new Date().toISOString()
      });
      return { success: true, message: 'Промокод активен! +1000₽', reward };
    }
    return { success: false, message: 'Неверный код или он истек' };
  },

  deposit: async (amount: number): Promise<User> => {
    await delay(500);
    currentUser.balance += amount;
    transactions.unshift({
      id: crypto.randomUUID(),
      type: 'deposit',
      amount,
      date: new Date().toISOString()
    });
    return { ...currentUser };
  },

  withdraw: async (amount: number): Promise<{ success: boolean; message: string; newBalance?: number }> => {
    await delay(800);
    if (currentUser.balance >= amount) {
      currentUser.balance -= amount;
      transactions.unshift({
        id: crypto.randomUUID(),
        type: 'withdraw',
        amount,
        date: new Date().toISOString()
      });
      return { success: true, message: 'Заявка на вывод создана!', newBalance: currentUser.balance };
    }
    return { success: false, message: 'Недостаточно средств' };
  },

  /**
   * CORE GAME LOGIC
   * Uses 'luck' column to determine win probability directly.
   */
  playGame: async (game: GameType, bet: number): Promise<{ user: User; result: GameResult }> => {
    await delay(600); 

    if (currentUser.balance < bet) {
      throw new Error("Недостаточно баланса");
    }

    // 1. Deduct Bet (UPDATE users SET balance = balance - bet)
    currentUser.balance -= bet;
    
    // 2. Determine Win based on Luck
    // Logic: If luck is 80, there is an 80% chance to win.
    // Math.random() is 0.0 to 1.0.
    const winProbability = currentUser.luck / 100; 
    const isWin = Math.random() < winProbability;
    
    let winAmount = 0;
    let resultData: GameResult = { won: false, amount: 0, message: 'Попробуй еще!' };

    switch (game) {
      case GameType.SLOTS:
        if (isWin) {
          // WIN: Return 777
          winAmount = bet * 5;
          resultData = { 
            won: true, 
            amount: winAmount, 
            message: 'ДЖЕКПОТ! 777', 
            slotsResult: ['7️⃣', '7️⃣', '7️⃣'] 
          };
        } else {
          // LOSE: Return random mismatch
          const symbols = ['🍒', '🍋', '🍇', '🔔', '💎'];
          const r1 = symbols[Math.floor(Math.random() * symbols.length)];
          const r2 = symbols[Math.floor(Math.random() * symbols.length)];
          let r3 = symbols[Math.floor(Math.random() * symbols.length)];
          
          // Ensure it's not a triple match by accident
          while (r1 === r2 && r2 === r3) {
             r3 = symbols[Math.floor(Math.random() * symbols.length)];
          }

          resultData = { 
            won: false, 
            amount: 0, 
            message: 'Мимо...', 
            slotsResult: [r1, r2, r3] 
          };
        }
        break;

      case GameType.WHEEL:
        // SEGMENTS:
        // Win Indices: 1 (x1.5), 3 (x3), 7 (x10)
        // Lose Indices: 0, 2, 4, 6 (x0), 5 (x0.5 - considered partial loss/recovery)
        
        let segmentIndex = 0;

        if (isWin) {
            // Pick a winning segment
            const rand = Math.random();
            if (rand < 0.1) segmentIndex = 7; // 10% chance for Jackpot inside a win
            else if (rand < 0.4) segmentIndex = 3; // 30% chance for x3
            else segmentIndex = 1; // 60% chance for x1.5
        } else {
            // Pick a losing segment
            const losingIndices = [0, 2, 4, 6, 5];
            segmentIndex = losingIndices[Math.floor(Math.random() * losingIndices.length)];
        }

        // Calculate Multiplier
        const segmentsValues = [0, 1.5, 0, 3, 0, 0.5, 0, 10];
        const multiplier = segmentsValues[segmentIndex];
        winAmount = Math.floor(bet * multiplier);
        
        let msg = 'Пусто...';
        if (multiplier >= 10) msg = 'МЕГА ДЖЕКПОТ!';
        else if (multiplier > 1) msg = `Выигрыш x${multiplier}!`;
        else if (multiplier > 0) msg = 'Возврат части...';

        resultData = { 
            won: multiplier >= 1, 
            amount: winAmount, 
            message: msg,
            wheelSegmentIndex: segmentIndex 
        };
        break;

      case GameType.CUPS:
        // Frontend sends request AFTER user picks a cup.
        // We just decide if that pick was correct based on luck.
        
        if (isWin) {
            // User wins: The ball is in the cup they clicked (simulated by returning won: true)
            // Frontend logic handles the "reveal" visual based on 'won' status
            winAmount = Math.floor(bet * 2); // x2 usually for 1 out of 3, but let's be generous
            resultData = { 
                won: true, 
                amount: winAmount, 
                message: 'Нашел! Красава!', 
                cupPosition: 0 // Placeholder, frontend handles exact ID
            }; 
        } else {
             // User loses
             resultData = { 
                 won: false, 
                 amount: 0, 
                 message: 'Пусто...', 
                 cupPosition: 1 // Placeholder
             };
        }
        break;
    }

    // 3. Update Balance (UPDATE users SET balance = ...)
    if (resultData.won || winAmount > 0) {
      currentUser.balance += winAmount;
      transactions.unshift({
        id: crypto.randomUUID(),
        type: 'game_win',
        amount: winAmount,
        date: new Date().toISOString()
      });
    }

    return { user: { ...currentUser }, result: resultData };
  }
};