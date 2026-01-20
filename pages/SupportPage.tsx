import React, { useState, useEffect } from 'react';
import { getSupportContacts } from '../services/supabase';

interface SupportContact {
  id: string;
  type: string;
  username?: string;
  email?: string;
  phone?: string;
  website_url?: string;
  display_name: string;
  description: string;
  icon_emoji: string;
  working_hours: string;
}

export const SupportPage: React.FC = () => {
  const [contacts, setContacts] = useState<SupportContact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const data = await getSupportContacts();
      setContacts(data);
    } catch (error) {
      console.error('Error loading support contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const openContact = (contact: SupportContact) => {
    let url = '';
    
    switch (contact.type) {
      case 'telegram':
        if (contact.username) {
          url = `https://t.me/${contact.username}`;
        }
        break;
      case 'email':
        if (contact.email) {
          url = `mailto:${contact.email}`;
        }
        break;
      case 'phone':
        if (contact.phone) {
          url = `tel:${contact.phone}`;
        }
        break;
      case 'website':
        if (contact.website_url) {
          url = contact.website_url;
        }
        break;
    }
    
    if (url) {
      window.open(url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 pt-2 animate-pop-in">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pop-pink mx-auto"></div>
          <p className="text-gray-400 mt-4">Загрузка контактов...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-2 animate-pop-in">
      <div className="text-center">
        <h1 className="text-2xl font-black text-white mb-2">💬 Поддержка</h1>
        <p className="text-gray-400 text-sm">Мы всегда готовы помочь вам!</p>
      </div>

      <div className="bg-pop-card/80 border border-white/10 rounded-3xl p-6 space-y-4 backdrop-blur-md shadow-xl">
        {contacts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">Контакты поддержки не найдены</p>
          </div>
        ) : (
          contacts.map((contact) => (
            <button
              key={contact.id}
              onClick={() => openContact(contact)}
              className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-4 text-left transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="text-3xl">{contact.icon_emoji}</div>
                <div className="flex-1">
                  <h3 className="font-bold text-white group-hover:text-pop-cyan transition-colors">
                    {contact.display_name}
                  </h3>
                  <p className="text-sm text-gray-400 mb-1">{contact.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>⏰ {contact.working_hours}</span>
                    {contact.type === 'telegram' && contact.username && (
                      <span>@{contact.username}</span>
                    )}
                    {contact.type === 'email' && contact.email && (
                      <span>{contact.email}</span>
                    )}
                    {contact.type === 'phone' && contact.phone && (
                      <span>{contact.phone}</span>
                    )}
                  </div>
                </div>
                <div className="text-pop-pink opacity-0 group-hover:opacity-100 transition-opacity">
                  <i className="fas fa-external-link-alt"></i>
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      <div className="bg-pop-purple/20 p-4 rounded-2xl border border-pop-purple/30">
        <div className="flex items-start gap-3">
          <div className="bg-pop-purple text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 font-bold text-xs">💡</div>
          <div className="text-sm text-gray-200 leading-snug">
            <p className="font-bold mb-1">Часто задаваемые вопросы:</p>
            <ul className="space-y-1 text-xs">
              <li>• Пополнение обрабатывается в течение 5-15 минут</li>
              <li>• Вывод средств занимает 1-3 рабочих дня</li>
              <li>• Минимальная сумма вывода: 100 ₽</li>
              <li>• Комиссия за вывод: 3%</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};