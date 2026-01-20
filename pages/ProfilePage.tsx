import React, { useState } from 'react';
import { User } from '../types';
import { MockApi } from '../services/mockApi';
import { Button } from '../components/ui/Button';

interface ProfilePageProps {
  user: User | null;
  onUpdate: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ user, onUpdate }) => {
  const [promoCode, setPromoCode] = useState('');
  const [promoStatus, setPromoStatus] = useState<{text: string, isError: boolean} | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePromo = async () => {
    if (!promoCode) return;
    setLoading(true);
    const res = await MockApi.applyPromo(promoCode);
    setPromoStatus({ text: res.message, isError: !res.success });
    if (res.success) onUpdate();
    setLoading(false);
  };

  const handleSupport = () => {
    window.open('https://t.me/support_bot_fake', '_blank');
  };

  return (
    <div className="space-y-6 animate-pop-in">
      {/* User Info Card */}
      <div className="bg-gradient-to-br from-pop-card to-pop-dark border border-white/10 rounded-3xl p-6 flex flex-col items-center relative overflow-hidden shadow-2xl">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-pop-pink/20 blur-3xl rounded-full"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-pop-cyan/20 blur-3xl rounded-full"></div>
        
        <div className="w-24 h-24 rounded-full border-4 border-pop-pink p-1 mb-4 relative shadow-lg">
          <img 
            src={user?.avatar_url || "https://picsum.photos/200"} 
            alt="Avatar" 
            className="w-full h-full rounded-full object-cover"
          />
          <div className="absolute -bottom-1 right-0 bg-pop-yellow text-black text-[10px] font-black px-2 py-0.5 rounded-full border-2 border-black transform rotate-6">
            VIP 5
          </div>
        </div>
        
        <h2 className="text-2xl font-black text-white">{user?.username}</h2>
        <p className="text-gray-400 text-xs font-bold mb-6 opacity-60">ID: {user?.telegram_id}</p>

        <div className="grid grid-cols-2 gap-4 w-full">
            <div className="bg-black/20 rounded-2xl p-4 text-center backdrop-blur-sm border border-white/5">
                <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Удача</p>
                <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                    <div className="bg-pop-cyan h-full" style={{width: `${user?.luck}%`}}></div>
                </div>
                <p className="text-pop-cyan font-bold mt-1">{user?.luck}%</p>
            </div>
            <div className="bg-black/20 rounded-2xl p-4 text-center backdrop-blur-sm border border-white/5">
                <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Статус</p>
                <p className="text-pop-pink font-black text-lg">GOLD</p>
            </div>
        </div>
      </div>

      {/* Promo Code Section */}
      <div className="bg-pop-card border border-white/10 rounded-3xl p-6 shadow-xl">
        <h3 className="text-sm font-black text-white mb-3 flex items-center gap-2">
          <span className="text-xl">🎟️</span> Промокод
        </h3>
        <div className="flex gap-2">
          <input 
            type="text" 
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            placeholder="CODE2025"
            className="flex-1 bg-pop-dark border-2 border-transparent focus:border-pop-yellow rounded-xl px-4 text-sm font-bold text-white focus:outline-none uppercase placeholder-gray-600 transition-colors"
          />
          <button 
            onClick={handlePromo}
            disabled={loading}
            className="bg-pop-yellow text-black px-5 rounded-xl font-black text-sm hover:brightness-110 shadow-lg active:translate-y-0.5 active:shadow-none transition-all"
          >
            {loading ? '...' : 'OK'}
          </button>
        </div>
        {promoStatus && (
          <p className={`text-xs font-bold mt-2 text-center bg-black/20 py-2 rounded-lg ${promoStatus.isError ? 'text-red-400' : 'text-green-400'}`}>
            {promoStatus.text}
          </p>
        )}
      </div>

      <Button variant="secondary" onClick={handleSupport}>
        <i className="fas fa-headset"></i> Поддержка
      </Button>

      <div className="text-center text-[10px] text-gray-500 font-bold opacity-50 pb-4">
        Royal Fortune Casino © 2025
      </div>
    </div>
  );
};