import React from 'react';
import { User } from '../types';

interface HeaderProps {
  user: User | null;
}

export const Header: React.FC<HeaderProps> = ({ user }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 px-4 py-4">
      <div className="flex justify-between items-center max-w-md mx-auto bg-pop-card/80 backdrop-blur-md rounded-full p-2 pl-4 border border-white/10 shadow-lg">
        <div className="flex items-center gap-3">
           <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pop-pink to-purple-500 flex items-center justify-center text-white font-bold text-sm border-2 border-white">
             {user?.username.charAt(0) || 'U'}
           </div>
           <span className="font-bold text-sm text-white truncate max-w-[100px]">{user?.username || 'Гость'}</span>
        </div>
        
        <div className="bg-pop-dark rounded-full px-4 py-1.5 flex items-center gap-2 border border-pop-cyan/30">
          <i className="fas fa-coins text-pop-yellow animate-pulse text-sm"></i>
          <span className="font-bold text-pop-yellow tracking-wide">
            {user?.balance.toLocaleString()} ₽
          </span>
        </div>
      </div>
    </header>
  );
};