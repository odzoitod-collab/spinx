import React from 'react';
import { AppRoute } from '../types';

interface NavigationProps {
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentRoute, onNavigate }) => {
  const navItems = [
    { id: AppRoute.WALLET, icon: 'fa-wallet', label: 'Касса' },
    { id: AppRoute.HOME, icon: 'fa-gamepad', label: 'Игры' },
    { id: AppRoute.SUPPORT, icon: 'fa-headset', label: 'Поддержка' },
    { id: AppRoute.PROFILE, icon: 'fa-user', label: 'Профиль' },
  ];

  return (
    <div className="fixed bottom-6 left-6 right-6 h-20 bg-pop-card/90 backdrop-blur-xl border-2 border-white/10 rounded-full flex items-center justify-evenly shadow-2xl z-50">
      {navItems.map((item) => {
        const isActive = currentRoute === item.id || 
          (item.id === AppRoute.HOME && [AppRoute.GAME_SLOTS, AppRoute.GAME_WHEEL, AppRoute.GAME_CUPS].includes(currentRoute));
        
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`relative flex flex-col items-center justify-center w-16 h-16 rounded-full transition-all duration-300 ${isActive ? '-translate-y-4 bg-pop-pink shadow-lg border-4 border-pop-dark scale-110' : 'text-gray-400 hover:text-white'}`}
          >
            <i className={`fas ${item.icon} text-xl ${isActive ? 'text-white' : ''}`}></i>
            {!isActive && <span className="text-[10px] font-bold mt-1">{item.label}</span>}
          </button>
        );
      })}
    </div>
  );
};