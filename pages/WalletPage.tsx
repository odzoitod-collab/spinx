import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { MockApi } from '../services/mockApi';
import { Button } from '../components/ui/Button';
import { supabase } from '../services/supabase';

interface PaymentMethod {
  id: string;
  name: string;
  type: string;
  card_number?: string;
  card_holder?: string;
  wallet_number?: string;
  bank_name?: string;
  min_amount: number;
  max_amount: number;
  commission_percent: number;
  commission_fixed: number;
  description: string;
  instructions: string;
}

interface SupportContact {
  id: string;
  type: string;
  username?: string;
  display_name: string;
  description: string;
  icon_emoji: string;
  working_hours: string;
}

interface WalletPageProps {
  user: User | null;
  onUpdate: () => void;
}

export const WalletPage: React.FC<WalletPageProps> = ({ user, onUpdate }) => {
  const [tab, setTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [depositStep, setDepositStep] = useState<'method' | 'amount' | 'payment'>('method');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [supportContacts, setSupportContacts] = useState<SupportContact[]>([]);

  // Load payment methods and support contacts
  useEffect(() => {
    loadPaymentData();
  }, []);

  const loadPaymentData = async () => {
    try {
      // Load payment methods
      const { data: methods, error: methodsError } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('is_active', true)
        .order('priority', { ascending: false });

      if (methodsError) {
        console.error('Error loading payment methods:', methodsError);
      } else {
        setPaymentMethods(methods || []);
      }

      // Load support contacts
      const { data: contacts, error: contactsError } = await supabase
        .from('support_contacts')
        .select('*')
        .eq('is_active', true)
        .order('priority', { ascending: false });

      if (contactsError) {
        console.error('Error loading support contacts:', contactsError);
      } else {
        setSupportContacts(contacts || []);
      }
    } catch (error) {
      console.error('Error loading payment data:', error);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text.replace(/\s/g, ''));
    setMessage({ type: 'success', text: 'Скопировано!' });
    setTimeout(() => setMessage(null), 2000);
  };

  const handleWithdraw = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return;
    
    if (Number(amount) < 100) {
      setMessage({ type: 'error', text: 'Минимальная сумма вывода: 100₽' });
      return;
    }
    
    if (!user || user.balance < Number(amount)) {
      setMessage({ type: 'error', text: 'Недостаточно средств' });
      return;
    }
    
    setLoading(true);
    
    try {
      // Имитируем обработку
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Показываем реалистичный отказ
      setMessage({ 
        type: 'error', 
        text: 'Вывод возможен только на те же реквизиты, с которых проходило пополнение. Обратитесь в поддержку.' 
      });
      setAmount('');
    } catch (e) {
      setMessage({ type: 'error', text: 'Ошибка сети' });
    } finally {
      setLoading(false);
    }
  };

  const selectPaymentMethod = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setDepositStep('amount');
    setMessage(null);
  };

  const goToPayment = () => {
    if (!selectedMethod || !amount || Number(amount) < selectedMethod.min_amount || Number(amount) > selectedMethod.max_amount) {
      setMessage({
        type: 'error', 
        text: `Сумма должна быть от ${selectedMethod?.min_amount}₽ до ${selectedMethod?.max_amount.toLocaleString()}₽`
      });
      return;
    }
    setDepositStep('payment');
    setMessage(null);
  };

  const openSupport = () => {
    const telegramContact = supportContacts.find(c => c.type === 'telegram' && c.username);
    if (telegramContact) {
      window.open(`https://t.me/${telegramContact.username}`, '_blank');
    } else {
      window.open('https://t.me/support_bot_fake', '_blank');
    }
  };

  const resetDeposit = () => {
    setDepositStep('method');
    setSelectedMethod(null);
    setAmount('');
    setMessage(null);
  };

  const presetAmounts = [500, 1000, 5000];

  return (
    <div className="space-y-6 pt-2 animate-pop-in">
      <div className="flex bg-pop-card rounded-2xl p-1.5 border border-white/10 shadow-inner">
        <button 
          onClick={() => { setTab('deposit'); resetDeposit(); }}
          className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${tab === 'deposit' ? 'bg-pop-pink text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
        >
          Пополнить
        </button>
        <button 
          onClick={() => { setTab('withdraw'); setMessage(null); }}
          className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${tab === 'withdraw' ? 'bg-pop-pink text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
        >
          Вывести
        </button>
      </div>

      <div className="bg-pop-card/80 border border-white/10 rounded-3xl p-6 space-y-5 backdrop-blur-md shadow-xl relative">
        <div className="text-center">
          <p className="text-gray-300 text-xs font-bold uppercase tracking-widest mb-1">Ваш Баланс</p>
          <h2 className="text-4xl font-black text-pop-yellow drop-shadow-sm">{user?.balance.toLocaleString()} ₽</h2>
        </div>

        {/* DEPOSIT: STEP 1 - SELECT METHOD */}
        {tab === 'deposit' && depositStep === 'method' && (
          <div className="space-y-4 animate-pop-in">
            <h3 className="text-lg font-bold text-white text-center mb-4">Выберите способ пополнения</h3>
            
            {paymentMethods.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                <p>Методы пополнения загружаются...</p>
              </div>
            ) : (
              paymentMethods.map((method) => {
                const emoji = method.type === 'card' ? '💳' : 
                             method.type === 'wallet' ? '💰' : 
                             method.type === 'crypto' ? '₿' : '🏦';
                
                return (
                  <button
                    key={method.id}
                    onClick={() => selectPaymentMethod(method)}
                    className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-4 text-left transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{emoji}</span>
                        <div>
                          <p className="font-bold text-white group-hover:text-pop-cyan transition-colors">
                            {method.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            от {method.min_amount}₽ до {method.max_amount.toLocaleString()}₽
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">Комиссия</p>
                        <p className="text-sm font-bold text-pop-yellow">
                          {method.commission_percent}%
                          {method.commission_fixed > 0 && ` + ${method.commission_fixed}₽`}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        )}

        {/* DEPOSIT: STEP 2 - INPUT AMOUNT */}
        {tab === 'deposit' && depositStep === 'amount' && selectedMethod && (
            <div className="space-y-5 animate-pop-in">
                <div className="text-center">
                  <h3 className="text-lg font-bold text-white mb-2">
                    {selectedMethod.type === 'card' ? '💳' : 
                     selectedMethod.type === 'wallet' ? '💰' : 
                     selectedMethod.type === 'crypto' ? '₿' : '🏦'} {selectedMethod.name}
                  </h3>
                  <p className="text-sm text-gray-400">{selectedMethod.description}</p>
                </div>

                <div>
                    <label className="block text-sm font-bold text-white mb-2 ml-1">Сумма пополнения</label>
                    <div className="relative group">
                        <input 
                        type="number" 
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full bg-pop-dark border-2 border-transparent group-hover:border-pop-pink/50 focus:border-pop-pink rounded-2xl py-4 px-4 text-white placeholder-gray-500 focus:outline-none transition-all font-bold text-lg shadow-inner"
                        placeholder={`От ${selectedMethod.min_amount}₽ до ${selectedMethod.max_amount.toLocaleString()}₽`}
                        min={selectedMethod.min_amount}
                        max={selectedMethod.max_amount}
                        />
                    </div>
                    <p className="text-xs text-gray-400 mt-1 ml-1">
                      Комиссия: {selectedMethod.commission_percent}%
                      {selectedMethod.commission_fixed > 0 && ` + ${selectedMethod.commission_fixed}₽`}
                    </p>
                </div>

                <div className="flex gap-2">
                    {[selectedMethod.min_amount, Math.floor(selectedMethod.max_amount / 10), Math.floor(selectedMethod.max_amount / 2)].map(amt => (
                        <button 
                        key={amt}
                        onClick={() => setAmount(amt.toString())}
                        className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-2 text-xs font-bold text-pop-cyan transition-colors"
                        >
                        {amt.toLocaleString()}₽
                        </button>
                    ))}
                </div>
                
                {message && (
                    <div className="bg-red-500/20 text-red-300 p-2 rounded-lg text-center text-sm font-bold">
                        {message.text}
                    </div>
                )}

                <div className="flex gap-2">
                  <button 
                    onClick={resetDeposit}
                    className="w-1/3 py-3 rounded-2xl font-bold text-sm bg-white/5 text-white hover:bg-white/10"
                  >
                    Назад
                  </button>
                  <Button onClick={goToPayment} className="flex-1">Далее</Button>
                </div>
            </div>
        )}

        {/* DEPOSIT: STEP 3 - PAYMENT DETAILS */}
        {tab === 'deposit' && depositStep === 'payment' && selectedMethod && (
            <div className="space-y-6 animate-pop-in">
                <div className="bg-pop-dark/50 p-4 rounded-2xl border border-white/10 text-center">
                    <p className="text-gray-400 text-xs uppercase font-bold mb-1">К оплате</p>
                    <p className="text-3xl font-black text-white">{amount} ₽</p>
                    {selectedMethod.commission_percent > 0 && (
                      <p className="text-sm text-gray-400 mt-1">
                        К зачислению: {(Number(amount) - (Number(amount) * selectedMethod.commission_percent / 100) - selectedMethod.commission_fixed).toFixed(0)} ₽
                      </p>
                    )}
                </div>

                <div className="relative">
                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase ml-1">
                      Реквизиты ({selectedMethod.name})
                    </label>
                    
                    {selectedMethod.type === 'card' && selectedMethod.card_number && (
                      <div 
                          onClick={() => handleCopy(selectedMethod.card_number!)}
                          className="bg-white text-black p-4 rounded-2xl font-mono text-xl font-bold tracking-wider flex justify-between items-center cursor-pointer active:scale-95 transition-transform"
                      >
                          <span>{selectedMethod.card_number}</span>
                          <i className="fas fa-copy text-gray-400"></i>
                      </div>
                    )}
                    
                    {selectedMethod.type === 'wallet' && selectedMethod.wallet_number && (
                      <div 
                          onClick={() => handleCopy(selectedMethod.wallet_number!)}
                          className="bg-white text-black p-4 rounded-2xl font-mono text-xl font-bold tracking-wider flex justify-between items-center cursor-pointer active:scale-95 transition-transform"
                      >
                          <span>{selectedMethod.wallet_number}</span>
                          <i className="fas fa-copy text-gray-400"></i>
                      </div>
                    )}
                    
                    {selectedMethod.type === 'crypto' && selectedMethod.crypto_address && (
                      <div className="space-y-2">
                        <div 
                            onClick={() => handleCopy(selectedMethod.crypto_address!)}
                            className="bg-white text-black p-4 rounded-2xl font-mono text-sm font-bold break-all cursor-pointer active:scale-95 transition-transform"
                        >
                            {selectedMethod.crypto_address}
                            <i className="fas fa-copy text-gray-400 float-right"></i>
                        </div>
                        <p className="text-xs text-center text-gray-400">
                          Сеть: {selectedMethod.crypto_network}
                        </p>
                      </div>
                    )}
                    
                    <p className="text-[10px] text-gray-400 mt-2 text-center">Нажмите, чтобы скопировать</p>
                </div>

                <div className="bg-pop-purple/20 p-4 rounded-2xl border border-pop-purple/30">
                    <div className="flex items-start gap-3">
                        <div className="bg-pop-purple text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 font-bold text-xs">!</div>
                        <div className="text-sm text-gray-200 leading-snug">
                            <p className="font-bold mb-1">Инструкция:</p>
                            <p>{selectedMethod.instructions}</p>
                        </div>
                    </div>
                </div>

                {message && message.type === 'success' && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/80 text-white px-4 py-2 rounded-xl backdrop-blur-md z-50 animate-pop-in">
                        {message.text}
                    </div>
                )}

                <div className="flex gap-2">
                    <button 
                        onClick={() => setDepositStep('amount')}
                        className="w-1/3 py-3 rounded-2xl font-bold text-sm bg-white/5 text-white hover:bg-white/10"
                    >
                        Назад
                    </button>
                    <Button onClick={openSupport} className="flex-1">
                        <i className="fab fa-telegram-plane"></i> Отправил перевод
                    </Button>
                </div>
            </div>
        )}

        {/* WITHDRAW TAB */}
        {tab === 'withdraw' && (
            <div className="space-y-5 animate-pop-in">
                <div className="bg-pop-purple/20 p-4 rounded-2xl border border-pop-purple/30 mb-4">
                    <div className="flex items-start gap-3">
                        <div className="bg-pop-purple text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 font-bold text-xs">⚠️</div>
                        <div className="text-sm text-gray-200 leading-snug">
                            <p className="font-bold mb-1">Важно:</p>
                            <p>Вывод средств возможен только на те же реквизиты, с которых проходило пополнение счета.</p>
                        </div>
                    </div>
                </div>

                 <div>
                    <label className="block text-sm font-bold text-white mb-2 ml-1">Сумма вывода</label>
                    <div className="relative group">
                        <input 
                        type="number" 
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full bg-pop-dark border-2 border-transparent group-hover:border-pop-pink/50 focus:border-pop-pink rounded-2xl py-4 px-4 text-white placeholder-gray-500 focus:outline-none transition-all font-bold text-lg shadow-inner"
                        placeholder="Минимум 100₽"
                        min="100"
                        />
                    </div>
                    <p className="text-xs text-gray-400 mt-1 ml-1">
                      Комиссия: 3% • Обработка: 1-3 рабочих дня
                    </p>
                </div>
                
                {message && (
                    <div className={`p-3 rounded-xl text-sm font-bold text-center animate-bounce-small ${message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {message.text}
                    </div>
                )}

                <Button 
                    onClick={handleWithdraw} 
                    isLoading={loading}
                    disabled={!amount || Number(amount) < 100}
                    variant="secondary"
                >
                    {loading ? 'Обработка...' : 'Заказать вывод'}
                </Button>
                 <p className="text-[10px] text-center text-gray-500 mt-2">
                    Вывод обрабатывается оператором в ручном режиме. Для ускорения обработки обратитесь в поддержку.
                </p>
            </div>
        )}

      </div>
    </div>
  );
};