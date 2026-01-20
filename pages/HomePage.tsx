import React from 'react';
import { AppRoute } from '../types';

interface HomePageProps {
  onNavigate: (route: AppRoute) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const games = [
    {
      id: AppRoute.GAME_CUPS,
      title: "Наперстки",
      desc: "Угадай где шарик",
      color: "from-blue-500 to-pop-cyan",
      icon: "🎲"
    },
    {
      id: AppRoute.GAME_SLOTS,
      title: "Слоты 777",
      desc: "Крути и заноси",
      color: "from-orange-500 to-pop-yellow",
      icon: "🎰"
    },
    {
      id: AppRoute.GAME_WHEEL,
      title: "Колесо Фортуны",
      desc: "Бонусы до x50",
      color: "from-pink-600 to-pop-pink",
      icon: "🎡"
    }
  ];

  return (
    <div className="space-y-6 animate-pop-in">
      {/* Fun Promo Banner */}
      <div className="relative bg-gradient-to-r from-pop-purple to-indigo-600 p-6 rounded-3xl shadow-xl overflow-hidden border-2 border-white/10 transform transition-transform hover:scale-[1.02]">
        <div className="absolute -right-4 -top-4 text-9xl opacity-10 rotate-12">🎁</div>
        <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
                <span className="bg-pop-yellow text-black text-[10px] font-bold px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                    <i className="fas fa-bolt"></i> Бонус
                </span>
                <span className="text-white/80 text-xs font-bold">Действует 24ч</span>
            </div>
            <h2 className="text-2xl font-black text-white leading-tight mb-2">Есть секретный код?</h2>
            <p className="text-sm text-white/90 mb-4 font-medium">Введи и получи халявные 1000₽ на счет!</p>
            <button 
                onClick={() => onNavigate(AppRoute.PROFILE)}
                className="bg-white text-pop-purple px-6 py-2.5 rounded-xl font-bold text-sm shadow-[0_4px_0_rgba(0,0,0,0.1)] active:shadow-none active:translate-y-1 transition-all">
            Активировать
            </button>
        </div>
      </div>

      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
            <i className="fas fa-fire text-pop-yellow text-xl animate-pulse"></i>
            <h3 className="text-xl font-bold text-white">Топ Игры</h3>
        </div>
        <span className="text-[10px] bg-white/10 px-2 py-1 rounded-lg text-white/60 font-bold">Онлайн: 1,420</span>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {games.map((game) => (
          <div 
            key={game.id}
            onClick={() => onNavigate(game.id)}
            className={`group relative h-28 rounded-3xl overflow-hidden cursor-pointer shadow-lg transition-all active:scale-95 bg-gradient-to-r ${game.color} border-b-4 border-black/20`}
          >
            <div className="absolute top-0 right-0 p-4 opacity-30 group-hover:opacity-50 transition-opacity transform group-hover:rotate-12 group-hover:scale-125">
               <span className="text-6xl grayscale-0">{game.icon}</span>
            </div>
            
            <div className="absolute inset-0 flex flex-col justify-center px-6">
              <h4 className="text-2xl font-black text-white drop-shadow-md">{game.title}</h4>
              <p className="text-sm text-white font-bold opacity-90 bg-black/20 inline-block px-2 py-1 rounded-lg self-start mt-1 backdrop-blur-sm">
                  {game.desc}
              </p>
            </div>
            
            {/* Hot Badge on Slots */}
            {game.id === AppRoute.GAME_SLOTS && (
                <div className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-sm rotate-3 animate-bounce-small">
                    HOT
                </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};