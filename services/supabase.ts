import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface User {
  telegram_id: number
  username: string | null
  balance: number
  luck: number
  referred_by: number | null
  created_at?: string
}

export interface Transaction {
  id: string
  user_id: number
  type: string
  amount: number
  created_at: string
}

export interface PromoCode {
  code: string
  reward_amount: number
  uses_left: number
  is_active: boolean
  created_by_worker?: number
}

export interface Worker {
  telegram_id: number
  ref_code: string
  total_referrals: number
}

// User functions
export async function getUser(telegramId: number): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('telegram_id', telegramId)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching user:', error)
    return null
  }

  return data
}

export async function createUser(telegramId: number, username: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .insert({
      telegram_id: telegramId,
      username: username,
      balance: 0,
      luck: 50
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating user:', error)
    return null
  }

  return data
}

export async function updateUserBalance(telegramId: number, newBalance: number): Promise<boolean> {
  const { error } = await supabase
    .from('users')
    .update({ balance: newBalance })
    .eq('telegram_id', telegramId)

  if (error) {
    console.error('Error updating balance:', error)
    return false
  }

  return true
}

export async function addTransaction(
  userId: number, 
  amount: number, 
  type: string
): Promise<boolean> {
  const { error } = await supabase
    .from('transactions')
    .insert({
      user_id: userId,
      amount: amount,
      type: type
    })

  if (error) {
    console.error('Error adding transaction:', error)
    return false
  }

  return true
}

// Game functions
export async function playGame(
  telegramId: number,
  gameType: string,
  betAmount: number,
  winAmount: number
): Promise<{ success: boolean; newBalance: number }> {
  try {
    // Get current user
    const user = await getUser(telegramId)
    if (!user) {
      return { success: false, newBalance: 0 }
    }

    // Check if user has enough balance
    if (user.balance < betAmount) {
      return { success: false, newBalance: user.balance }
    }

    // Calculate new balance
    const newBalance = user.balance - betAmount + winAmount

    // Update balance
    const balanceUpdated = await updateUserBalance(telegramId, newBalance)
    if (!balanceUpdated) {
      return { success: false, newBalance: user.balance }
    }

    // Add transaction
    const netAmount = winAmount - betAmount
    await addTransaction(telegramId, netAmount, `game_${gameType}`)

    return { success: true, newBalance }
  } catch (error) {
    console.error('Error playing game:', error)
    return { success: false, newBalance: 0 }
  }
}

// Telegram WebApp functions
export function getTelegramUser() {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    const webApp = window.Telegram.WebApp
    webApp.ready()
    
    if (webApp.initDataUnsafe?.user) {
      return {
        id: webApp.initDataUnsafe.user.id,
        username: webApp.initDataUnsafe.user.username || webApp.initDataUnsafe.user.first_name || 'User',
        first_name: webApp.initDataUnsafe.user.first_name,
        last_name: webApp.initDataUnsafe.user.last_name
      }
    }
  }
  
  // Fallback for development
  return {
    id: 123456789,
    username: 'TestUser',
    first_name: 'Test',
    last_name: 'User'
  }
}

export function expandTelegramApp() {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    window.Telegram.WebApp.expand()
  }
}

export function closeTelegramApp() {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    window.Telegram.WebApp.close()
  }
}

export function showTelegramAlert(message: string) {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    window.Telegram.WebApp.showAlert(message)
  } else {
    alert(message)
  }
}

export function hapticFeedback(type: 'light' | 'medium' | 'heavy' = 'medium') {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp?.HapticFeedback) {
    window.Telegram.WebApp.HapticFeedback.impactOccurred(type)
  }
}

// Payment and Support functions
export async function getPaymentMethods() {
  try {
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('is_active', true)
      .order('priority', { ascending: false })

    if (error) {
      console.error('Error fetching payment methods:', error)
      // Fallback to hardcoded methods
      return [
        {
          id: '1',
          name: 'Сбербанк',
          type: 'card',
          card_number: '2202 2063 4567 8901',
          card_holder: 'IVAN PETROV',
          min_amount: 100,
          max_amount: 50000,
          commission_percent: 0,
          commission_fixed: 0,
          description: 'Пополнение через карту Сбербанка',
          instructions: 'Переведите точную сумму на карту. В комментарии укажите ваш Telegram ID.'
        },
        {
          id: '2',
          name: 'Тинькофф Банк',
          type: 'card',
          card_number: '5536 9137 1234 5678',
          card_holder: 'IVAN PETROV',
          min_amount: 100,
          max_amount: 50000,
          commission_percent: 0,
          commission_fixed: 0,
          description: 'Пополнение через карту Тинькофф',
          instructions: 'Переведите точную сумму на карту. В комментарии укажите ваш Telegram ID.'
        },
        {
          id: '3',
          name: 'QIWI Кошелек',
          type: 'wallet',
          wallet_number: '+79123456789',
          min_amount: 50,
          max_amount: 25000,
          commission_percent: 2,
          commission_fixed: 0,
          description: 'Пополнение через QIWI',
          instructions: 'Переведите сумму на номер. В комментарии укажите ваш Telegram ID.'
        }
      ]
    }

    return data || []
  } catch (error) {
    console.error('Error fetching payment methods:', error)
    return []
  }
}

export async function getSupportContacts() {
  try {
    const { data, error } = await supabase
      .from('support_contacts')
      .select('*')
      .eq('is_active', true)
      .order('priority', { ascending: false })

    if (error) {
      console.error('Error fetching support contacts:', error)
      // Fallback to hardcoded contacts
      return [
        {
          id: '1',
          type: 'telegram',
          username: 'casino_support',
          display_name: 'Техподдержка',
          description: 'Основная техподдержка 24/7',
          icon_emoji: '💬',
          working_hours: '24/7'
        },
        {
          id: '2',
          type: 'telegram',
          username: 'casino_admin',
          display_name: 'Администратор',
          description: 'Администратор казино',
          icon_emoji: '👨‍💼',
          working_hours: '10:00-22:00 МСК'
        }
      ]
    }

    return data || []
  } catch (error) {
    console.error('Error fetching support contacts:', error)
    return []
  }
}