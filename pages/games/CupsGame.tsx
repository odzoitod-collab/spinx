import React, { useState, useEffect } from 'react';
import { User, GameType } from '../../types';
import { MockApi } from '../../services/mockApi';
import { Button } from '../../components/ui/Button';

interface CupsGameProps {
  user: User | null;
  onUpdate: () => void;
  onBack: () => void;
}

export const CupsGame: React.FC<CupsGameProps> = ({ user, onUpdate, onBack }) => {
  const [gameState, setGameState] = useState<'IDLE' | 'SHOW_START' | 'SHUFFLING' | 'PICKING' | 'REVEAL'>('IDLE');
  const [bet, setBet] = useState(100);
  const [message, setMessage] = useState('Сделай ставку!');
  
  const [ballIndex, setBallIndex] = useState(1); 
  const [visualPositions, setVisualPositions] = useState([0, 1, 2]);
  const [revealedCupId, setRevealedCupId] = useState<number | null>(null);

  const startGame = async () => {
    if (!user || user.balance < bet) return;
    
    // 1. Reset Board - Ensure cups are down and back to start positions
    setGameState('IDLE'); 
    setVisualPositions([0, 1, 2]);
    setRevealedCupId(null);

    // Wait for UI to settle (cups down, positions reset)
    await new Promise(r => setTimeout(r, 100));
    
    // 2. Place Ball Randomly (Hidden change while cups are down)
    const newBallIndex = Math.floor(Math.random() * 3);
    setBallIndex(newBallIndex);
    
    // Force delay to ensure paint of ball in new position
    await new Promise(r => setTimeout(r, 100));

    // 3. Reveal Ball (Start Animation - Cup Lifts)
    setMessage('Смотри внимательно! 👀');
    setGameState('SHOW_START');
    
    // Wait for user to see the ball
    await new Promise(r => setTimeout(r, 1000));
    
    // 4. Hide Ball (Drop Cup)
    setGameState('IDLE');
    // Wait for cup to fully close (transition is ~300ms)
    await new Promise(r => setTimeout(r, 500));

    // 5. Start Shuffling
    setGameState('SHUFFLING');
    setMessage('Вжух-вжух! 💨');

    // Animation Sequence
    let shuffles = 0;
    const maxShuffles = 15; // Fast and furious
    const speed = 180; // Fast

    const interval = setInterval(() => {
        setVisualPositions(prev => {
            const slotA = Math.floor(Math.random() * 3);
            let slotB = Math.floor(Math.random() * 3);
            while (slotA === slotB) slotB = Math.floor(Math.random() * 3);

            const cupIdAtSlotA = prev.findIndex(pos => pos === slotA);
            const cupIdAtSlotB = prev.findIndex(pos => pos === slotB);

            const newPositions = [...prev];
            newPositions[cupIdAtSlotA] = slotB;
            newPositions[cupIdAtSlotB] = slotA;
            return newPositions;
        });
        
        shuffles++;
        if (shuffles >= maxShuffles) {
            clearInterval(interval);
            setTimeout(() => {
                setGameState('PICKING');
                setMessage('Где он спрятался? 👇');
            }, speed);
        }
    }, speed);
  };

  const handleCupClick = async (clickedCupId: number) => {
    if (gameState !== 'PICKING') return;
    
    setGameState('REVEAL');
    setRevealedCupId(clickedCupId);
    
    try {
      const { result } = await MockApi.playGame(GameType.CUPS, bet);
      
      if (result.won) {
          setMessage(`НАШЕЛ! +${result.amount}₽ 🔥`);
          setBallIndex(clickedCupId); 
      } else {
          setMessage('Нету... 💨');
          const otherCupIds = [0, 1, 2].filter(id => id !== clickedCupId);
          const randomOther = otherCupIds[Math.floor(Math.random() * otherCupIds.length)];
          setBallIndex(randomOther);
      }
      onUpdate();
      
      setTimeout(() => {
        setGameState('IDLE');
        setRevealedCupId(null);
        setVisualPositions([0, 1, 2]); 
        setBallIndex(1); 
        setMessage('Еще разок?');
      }, 3000);

    } catch (e) {
      setGameState('IDLE');
    }
  };

  return (
    <div className="flex flex-col items-center min-h-[70vh] gap-4 pt-4 animate-pop-in">
      <div className="w-full flex justify-between items-center mb-8">
        <button onClick={onBack} className="text-white/60 hover:text-white font-bold bg-white/10 px-3 py-1 rounded-full"><i className="fas fa-arrow-left"></i> Назад</button>
        <div className="bg-pop-dark px-4 py-1.5 rounded-full border border-pop-yellow/30 text-pop-yellow font-black shadow-lg">
          {user?.balance} ₽
        </div>
      </div>

      {/* Game Area */}
      <div className="relative h-56 w-full max-w-xs mx-auto perspective-1000">
        
        {/* Render 3 Cups by ID */}
        {[0, 1, 2].map((cupId) => {
            const currentSlot = visualPositions[cupId]; 
            const leftPercents = ['0%', '33.33%', '66.66%'];
            
            // Logic to lift the cup
            const isRevealed = 
                (gameState === 'REVEAL' && (revealedCupId === cupId || ballIndex === cupId)) || // End game
                (gameState === 'SHOW_START' && ballIndex === cupId); // Start game
            
            const hasBall = ballIndex === cupId;

            return (
                <div 
                   key={cupId}
                   className="absolute top-10 w-1/3 h-32 transition-all ease-in-out"
                   style={{ 
                       left: leftPercents[currentSlot],
                       transitionDuration: gameState === 'SHUFFLING' ? '180ms' : '300ms',
                       zIndex: isRevealed ? 30 : 20, // Cups are high z-index
                   }}
                >
                    <div 
                        onClick={() => handleCupClick(cupId)}
                        className={`relative w-24 h-28 mx-auto cursor-pointer transition-transform duration-200 
                        ${gameState === 'PICKING' ? 'hover:-translate-y-2 hover:scale-105 active:scale-95' : ''}
                        ${gameState === 'SHUFFLING' ? 'blur-[1px]' : ''} 
                        `}
                        style={{
                            transform: isRevealed ? 'translateY(-65px)' : 'translateY(0)',
                            zIndex: 20
                        }}
                    >
                        {/* Cleaner Cup Visual (Removed text/circle) */}
                        <div className="w-full h-full bg-gradient-to-r from-red-600 to-red-800 rounded-t-[3rem] border-b-[6px] border-red-950 shadow-2xl flex items-center justify-center relative z-20 overflow-hidden ring-1 ring-white/10">
                             {/* Glossy reflection */}
                             <div className="absolute top-4 left-4 w-4 h-12 bg-white/20 rounded-full blur-sm transform -rotate-12"></div>
                             <div className="absolute top-2 right-6 w-2 h-4 bg-white/10 rounded-full blur-xs"></div>
                        </div>
                    </div>

                    {/* Ball - Adjusted position to be higher (bottom-6) so it's fully covered by cup */}
                    {hasBall && (
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-10 h-10 bg-white rounded-full shadow-[inset_-5px_-5px_10px_rgba(0,0,0,0.3)] z-0 flex items-center justify-center">
                            <div className="w-3 h-3 bg-gray-200 rounded-full absolute top-2 right-2 opacity-80"></div>
                        </div>
                    )}
                </div>
            );
        })}

      </div>

      <div className="text-center h-12 mt-4 bg-black/20 px-6 py-2 rounded-xl backdrop-blur-sm border border-white/5 w-full max-w-xs flex items-center justify-center">
        <span className={`text-xl font-black ${message.includes('ЕСТЬ') || message.includes('НАШЕЛ') ? 'text-green-400 scale-110' : 'text-white'}`}>
          {message}
        </span>
      </div>

      {gameState === 'IDLE' && (
        <div className="w-full max-w-xs space-y-4 mt-auto bg-pop-card p-4 rounded-3xl shadow-lg border border-white/5 animate-pop-in">
          <div className="flex items-center justify-between">
            <button onClick={() => setBet(Math.max(10, bet - 50))} className="w-12 h-12 rounded-2xl bg-pop-dark text-white font-bold border border-white/10 hover:bg-pop-pink transition-colors text-xl">-</button>
            <div className="text-center">
              <p className="text-[10px] text-gray-400 font-bold uppercase">Ставка</p>
              <p className="font-mono text-2xl text-white font-black">{bet} ₽</p>
            </div>
            <button onClick={() => setBet(bet + 50)} className="w-12 h-12 rounded-2xl bg-pop-dark text-white font-bold border border-white/10 hover:bg-pop-pink transition-colors text-xl">+</button>
          </div>
          <Button onClick={startGame}>ИГРАТЬ</Button>
        </div>
      )}
    </div>
  );
};