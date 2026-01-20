import React, { useState } from 'react';
import { User, GameType } from '../../types';
import { MockApi } from '../../services/mockApi';
import { Button } from '../../components/ui/Button';

interface WheelGameProps {
  user: User | null;
  onUpdate: () => void;
  onBack: () => void;
}

export const WheelGame: React.FC<WheelGameProps> = ({ user, onUpdate, onBack }) => {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [bet, setBet] = useState(100);
  const [message, setMessage] = useState('Испытай удачу!');
  
  // 8 Segments configuration (Matches MockApi)
  // New "Hardcore" Layout
  const SEGMENTS = [
      { color: '#EF4444', label: 'x0', icon: '💀' },      // 0
      { color: '#3B82F6', label: 'x1.5', icon: '🍬' },    // 1
      { color: '#EF4444', label: 'x0', icon: '💀' },      // 2
      { color: '#EC4899', label: 'x3', icon: '🍭' },      // 3
      { color: '#EF4444', label: 'x0', icon: '💀' },      // 4
      { color: '#F59E0B', label: 'x0.5', icon: '🍋' },    // 5
      { color: '#EF4444', label: 'x0', icon: '💀' },      // 6
      { color: '#8B5CF6', label: 'x10', icon: '💎' },     // 7
  ];

  const spinWheel = async () => {
    if (!user || user.balance < bet || spinning) return;
    setSpinning(true);
    setMessage('Поехали! 🌀');

    try {
      const { result } = await MockApi.playGame(GameType.WHEEL, bet);
      
      const segmentIndex = result.wheelSegmentIndex !== undefined ? result.wheelSegmentIndex : 0;
      
      const segmentAngle = 45;
      const targetSegmentAngle = (segmentIndex * segmentAngle) + (segmentAngle / 2);
      
      // Randomize spin count for variety (5 to 8 spins)
      const randomSpins = 5 + Math.floor(Math.random() * 3); 
      const extraSpins = randomSpins * 360; 
      
      const newRotation = rotation + extraSpins + (360 - (rotation % 360)) - targetSegmentAngle;

      setRotation(newRotation);

      setTimeout(() => {
        setSpinning(false);
        setMessage(result.message);
        onUpdate();
      }, 4000); 
    } catch (e) {
      setSpinning(false);
      setMessage('Ошибка');
    }
  };

  return (
    <div className="flex flex-col items-center min-h-[70vh] gap-4 pt-4 overflow-hidden animate-pop-in">
       <div className="w-full flex justify-between items-center z-10">
        <button onClick={onBack} className="text-white/60 hover:text-white font-bold bg-white/10 px-3 py-1 rounded-full"><i className="fas fa-arrow-left"></i> Назад</button>
        <div className="bg-pop-dark px-4 py-1.5 rounded-full border border-pop-yellow/30 text-pop-yellow font-black shadow-lg">
          {user?.balance} ₽
        </div>
      </div>

      <div className="relative mt-8 group">
        {/* Pointer */}
        <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-20 text-white text-5xl drop-shadow-[0_4px_0_rgba(0,0,0,0.5)] animate-bounce-small">
            🔻
        </div>

        {/* Outer Ring with Glow */}
        <div className="p-3 bg-gradient-to-b from-yellow-400 to-red-600 rounded-full shadow-[0_0_40px_rgba(236,72,153,0.4)]">
            <div className="w-72 h-72 bg-white rounded-full overflow-hidden relative shadow-inner border-4 border-black/10">
                {/* Spinning Layer */}
                <div 
                    className="w-full h-full relative"
                    style={{ 
                        transform: `rotate(${rotation}deg)`,
                        transition: 'transform 4s cubic-bezier(0.15, 0, 0.1, 1)'
                    }}
                >
                    {/* Render Segments */}
                    {SEGMENTS.map((seg, i) => (
                        <div 
                            key={i}
                            className="absolute top-0 left-1/2 w-1/2 h-1/2 origin-bottom-left flex items-start justify-end pr-4 pt-2 border-l border-b border-black/10"
                            style={{
                                backgroundColor: seg.color,
                                transform: `rotate(${i * 45}deg) skewY(-45deg)`, 
                            }}
                        >
                        </div>
                    ))}
                    
                    {/* Text Layer */}
                     {SEGMENTS.map((seg, i) => (
                        <div
                            key={`text-${i}`}
                            className="absolute w-full h-full text-center pt-2 font-black text-white text-lg drop-shadow-md"
                            style={{
                                transform: `rotate(${i * 45 + 22.5}deg)`,
                            }}
                        >
                            <span className="block mt-2 text-xl">{seg.icon}</span>
                            <span className="block text-sm leading-none">{seg.label}</span>
                        </div>
                     ))}
                </div>
            </div>
        </div>
        
        {/* Center Knob */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-br from-pop-pink to-purple-600 rounded-full flex items-center justify-center shadow-xl border-4 border-white z-10">
            <span className="text-2xl animate-spin-slow">🤑</span>
        </div>
      </div>

      <div className="text-center h-12 mt-6 bg-black/30 px-6 py-2 rounded-xl backdrop-blur-sm border border-white/5 w-full flex items-center justify-center">
         <span className={`text-xl font-black ${message.includes('!') ? 'text-pop-yellow scale-110 transition-transform' : 'text-gray-300'}`}>
          {message}
        </span>
      </div>

      <div className="w-full max-w-xs space-y-4 mt-auto bg-pop-card p-4 rounded-3xl shadow-lg border border-white/5">
        <div className="flex items-center justify-between">
          <button onClick={() => setBet(Math.max(10, bet - 50))} className="w-12 h-12 rounded-2xl bg-pop-dark text-white font-bold border border-white/10 hover:bg-pop-pink transition-colors text-xl">-</button>
          <div className="text-center">
            <p className="text-[10px] text-gray-400 font-bold uppercase">Ставка</p>
            <p className="font-mono text-2xl text-white font-black">{bet} ₽</p>
          </div>
          <button onClick={() => setBet(bet + 50)} className="w-12 h-12 rounded-2xl bg-pop-dark text-white font-bold border border-white/10 hover:bg-pop-pink transition-colors text-xl">+</button>
        </div>
        <Button onClick={spinWheel} disabled={spinning} variant="primary">
            {spinning ? 'КРУТИМ...' : 'КРУТИТЬ!'}
        </Button>
      </div>
    </div>
  );
};