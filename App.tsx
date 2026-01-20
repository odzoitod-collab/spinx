import React, { useState, useEffect } from 'react';
import { AppRoute, User } from './types';
import { 
  getUser, 
  createUser, 
  getTelegramUser, 
  expandTelegramApp,
  showTelegramAlert 
} from './services/supabase';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';

// Pages
import { HomePage } from './pages/HomePage';
import { WalletPage } from './pages/WalletPage';
import { ProfilePage } from './pages/ProfilePage';
import { SupportPage } from './pages/SupportPage';
import { SlotsGame } from './pages/games/SlotsGame';
import { WheelGame } from './pages/games/WheelGame';
import { CupsGame } from './pages/games/CupsGame';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [route, setRoute] = useState<AppRoute>(AppRoute.HOME);
  const [isLoading, setIsLoading] = useState(true);
  const [telegramUser, setTelegramUser] = useState<any>(null);

  useEffect(() => {
    // Initialize Telegram WebApp
    const initTelegram = () => {
      try {
        const tgUser = getTelegramUser();
        setTelegramUser(tgUser);
        expandTelegramApp();
        return tgUser;
      } catch (error) {
        console.error('Failed to initialize Telegram WebApp:', error);
        return null;
      }
    };

    // Initial data fetch
    const init = async () => {
      try {
        const tgUser = initTelegram();
        
        if (tgUser) {
          // Try to get existing user
          let userData = await getUser(tgUser.id);
          
          // If user doesn't exist, create new one
          if (!userData) {
            userData = await createUser(tgUser.id, tgUser.username);
            if (userData) {
              showTelegramAlert('Добро пожаловать в Royal Fortune Casino! 🎰');
            }
          }
          
          setUser(userData);
        } else {
          // Fallback for development
          console.warn('Running in development mode without Telegram WebApp');
          const fallbackUser = await getUser(123456789);
          setUser(fallbackUser);
        }
      } catch (error) {
        console.error("Failed to load user:", error);
        showTelegramAlert('Ошибка загрузки данных пользователя');
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  const refreshUser = async () => {
    if (telegramUser) {
      const userData = await getUser(telegramUser.id);
      setUser(userData);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <i className="fas fa-circle-notch fa-spin text-4xl text-gold-500 mb-4"></i>
            <p className="text-gray-400">Загрузка Royal Fortune Casino...</p>
          </div>
        </div>
      );
    }

    if (!user) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <i className="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
            <p className="text-gray-400">Ошибка загрузки пользователя</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-gold-500 text-black rounded-lg font-semibold"
            >
              Перезагрузить
            </button>
          </div>
        </div>
      );
    }

    switch (route) {
      case AppRoute.HOME:
        return <HomePage onNavigate={setRoute} />;
      case AppRoute.WALLET:
        return <WalletPage user={user} onUpdate={refreshUser} />;
      case AppRoute.PROFILE:
        return <ProfilePage user={user} onUpdate={refreshUser} />;
      case AppRoute.SUPPORT:
        return <SupportPage />;
      case AppRoute.GAME_SLOTS:
        return <SlotsGame user={user} onUpdate={refreshUser} onBack={() => setRoute(AppRoute.HOME)} />;
      case AppRoute.GAME_WHEEL:
        return <WheelGame user={user} onUpdate={refreshUser} onBack={() => setRoute(AppRoute.HOME)} />;
      case AppRoute.GAME_CUPS:
        return <CupsGame user={user} onUpdate={refreshUser} onBack={() => setRoute(AppRoute.HOME)} />;
      default:
        return <HomePage onNavigate={setRoute} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-black text-white font-sans selection:bg-gold-500/30">
      <Header user={user} />
      
      <main className="pb-24 pt-16 px-4 max-w-md mx-auto min-h-screen flex flex-col">
        {renderContent()}
      </main>

      <Navigation currentRoute={route} onNavigate={setRoute} />
    </div>
  );
};

export default App;