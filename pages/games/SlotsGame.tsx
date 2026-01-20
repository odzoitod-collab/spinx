import React, { useState } from 'react';
import { User, GameType } from '../../types';
import { playGame, hapticFeedback, showTelegramAlert } from '../../services/supabase';
import { Button } from '../../components/ui/Button';

interface SlotsGameProps {
  user: User | null;
  onUpdate: () => void;
  onBack: () => void;
}

const SYMBOLS = ['🍇', '🍋', '🍒', '🔔', '💎', '7️⃣'];

export const SlotsGame: React.FC<SlotsGameProps> = ({ user, onUpdate, onBack }) => {
  const [reels, setReels] = useState(['7️⃣', '7️⃣', '7️⃣']);
  const [spinning, setSpinning] = useState(false);
  const [bet, setBet] = useState(100);
  const [message, setMessage] = useState('Жми старт!');

  const calculateWin = (reels: string[], luck: number): { won: boolean; multiplier: number } => {
    // Правильная система удачи: базовый RTP 90% (казино получает 10%)
    const baseRTP = 0.90;
    const luckModifier = (luck - 50) / 100 * 0.1; // ±5% от базового RTP
    const finalRTP = Math.max(0.85, Math.min(0.95, baseRTP + luckModifier));
    
    // Сначала определяем, выиграл ли пользователь вообще
    const isWin = Math.random() < finalRTP;
    if (!isWin) return { won: false, multiplier: 0 };
    
    // Если выиграл, определяем размер выигрыша по комбинации
    if (reels[0] === reels[1] && reels[1] === reels[2]) {
      // Три одинаковых символа
      if (reels[0] === '7️⃣') return { won: true, multiplier: 10 }; // Джекпот
      if (reels[0] === '💎') return { won: true, multiplier: 5 };
      if (reels[0] === '🔔') return { won: true, multiplier: 4 };
      return { won: true, multiplier: 3 };
    } else if (reels[0] === reels[1] || reels[1] === reels[2] || reels[0] === reels[2]) {
      // Два одинаковых символа
      return { won: true, multiplier: 2 };
    }
    
    // Если выиграл, но нет хорошей комбинации - минимальный выигрыш
    return { won: true, multiplier: 1.2 };
  };

  const spin = async () => {
    if (!user || user.balance < bet || spinning) return;
    
    setSpinning(true);
    setMessage('Удачи! 🍀');
    hapticFeedback('medium');
    
    const interval = setInterval(() => {
      setReels([
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
      ]);
    }, 80);

    try {
      setTimeout(async () => {
        clearInterval(interval);
        
        // Генерируем финальную комбинацию
        const finalReels = [
          SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
          SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
          SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
        ];
        
        // Рассчитываем выигрыш с учетом удачи
        const { won, multiplier } = calculateWin(finalReels, user.luck);
        const winAmount = won ? bet * multiplier : 0;
        
        // Обновляем баланс в базе данных
        const result = await playGame(user.telegram_id, 'slots', bet, winAmount);
        
        if (result.success) {
          setReels(finalReels);
          
          if (won) {
            const profit = winAmount - bet;
            setMessage(`ЗАНОС: +${profit}₽`);
            hapticFeedback('heavy');
            showTelegramAlert(`Поздравляем! Выигрыш: ${profit}₽`);
          } else {
            setMessage(`Не повезло: -${bet}₽`);
            hapticFeedback('light');
          }
          
          onUpdate(); // Обновляем баланс в UI
        } else {
          setMessage('Ошибка игры');
        }
        
        setSpinning(false);
      }, 2000);
    } catch (error) {
      clearInterval(interval);
      setSpinning(false);
      setMessage('Ошибка соединения');
      console.error('Slots game error:', error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 animate-pop-in">
      <div className="w-full flex justify-between items-center">
        <button onClick={onBack} className="text-white/60 hover:text-white font-bold bg-white/10 px-3 py-1 rounded-full">
          <i className="fas fa-arrow-left"></i> Назад
        </button>
        <div className="bg-pop-dark px-4 py-1.5 rounded-full border border-pop-yellow/30 text-pop-yellow font-black shadow-lg">
          {user?.balance?.toFixed(2)} ₽
        </div>
      </div>

      {/* Luck Indicator */}
      {user && (
        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 px-4 py-2 rounded-full border border-purple-400/30">
          <span className="text-sm text-purple-300">🍀 Удача: {user.luck}%</span>
        </div>
      )}

      {/* Machine Visual */}
      <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-4 rounded-[2rem] shadow-2xl border-4 border-indigo-400 w-full max-w-xs mx-auto relative">
        {/* Lights */}
        <div className="absolute top-2 left-4 w-3 h-3 bg-red-400 rounded-full animate-ping"></div>
        <div className="absolute top-2 right-4 w-3 h-3 bg-yellow-400 rounded-full animate-ping delay-75"></div>
        
        <div className="bg-pop-dark rounded-2xl p-6 border-4 border-black/20 shadow-inner relative overflow-hidden">
            <div className="absolute inset-x-0 top-1/2 h-1 bg-red-500/80 z-10 pointer-events-none shadow-[0_0_10px_red]"></div>
            
            <div className="flex justify-between gap-2">
            {reels.map((symbol, i) => (
                <div key={i} className={`bg-white text-5xl h-24 w-full rounded-xl flex items-center justify-center border-b-8 border-gray-200 shadow-inner ${spinning ? 'animate-wiggle' : ''}`}>
                {symbol}
                </div>
            ))}
            </div>
        </div>
        
        <div className="mt-4 flex justify-center">
            <div className="bg-black/30 px-6 py-2 rounded-lg border border-white/10">
                <p className="text-pop-yellow font-black text-lg animate-pulse">{spinning ? '...' : 'WIN'}</p>
            </div>
        </div>
      </div>

      <div className="text-center h-10 w-full">
        <span className={`text-xl font-black ${message.includes('ЗАНОС') || message.includes('777') ? 'text-green-400 animate-bounce block' : 'text-gray-300'}`}>
          {message}
        </span>
      </div>

      <div className="w-full max-w-xs space-y-4 bg-pop-card p-4 rounded-3xl shadow-lg border border-white/5">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => setBet(Math.max(10, bet - 50))} 
            className="w-10 h-10 rounded-xl bg-pop-dark text-white font-bold border border-white/10 hover:bg-pop-pink transition-colors"
            disabled={spinning}
          >
            -
          </button>
          <div className="text-center">
            <p className="text-[10px] text-gray-400 font-bold uppercase">Ставка</p>
            <p className="font-mono text-xl text-white font-black">{bet} ₽</p>
          </div>
          <button 
            onClick={() => setBet(Math.min(user?.balance || 0, bet + 50))} 
            className="w-10 h-10 rounded-xl bg-pop-dark text-white font-bold border border-white/10 hover:bg-pop-pink transition-colors"
            disabled={spinning}
          >
            +
          </button>
        </div>

        <Button 
          onClick={spin} 
          disabled={spinning || !user || user.balance < bet} 
          className="shadow-[0_4px_0_rgba(234,179,8,0.5)]"
        >
          {spinning ? 'УДАЧИ...' : user && user.balance < bet ? 'НЕДОСТАТОЧНО СРЕДСТВ' : 'КРУТИТЬ'}
        </Button>
      </div>
    </div>
  );
};