import { supabase } from './supabase'

export interface UserData {
  id: string
  fullName: string
  emailOrPhone: string
  password: string
  transactionPassword: string
  balance: number
  vipLevel: number
  vipPoints: number
  linkedBanks: any[]
  kycStatus: string
  transactionHistory: any[]
  createdAt: string
  lastLogin: string
}

// 🔹 ĐĂNG NHẬP
export async function loginUser(emailOrPhone: string, password: string): Promise<UserData | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email_or_phone', emailOrPhone)
      .single()
    
    if (error || !data) return null
    
    // Lấy password từ linked_banks JSONB
    const storedPassword = data.linked_banks?.[0]?.password
    if (storedPassword !== password) return null
    
    // Cập nhật last_login
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', data.id)
    
    return {
      id: data.id,
      fullName: data.full_name,
      emailOrPhone: data.email_or_phone,
      password: storedPassword || '',
      transactionPassword: data.linked_banks?.[0]?.transactionPassword || '',
      balance: Number(data.balance),
      vipLevel: data.vip_level,
      vipPoints: 0,
      linkedBanks: data.linked_banks || [],
      kycStatus: data.kyc_status,
      transactionHistory: data.transaction_history || [],
      createdAt: data.created_at,
      lastLogin: data.last_login
    }
  } catch (err) {
    console.error('Login error:', err)
    return null
  }
}

// 🔹 ĐĂNG KÝ
export async function registerUser(userData: {
  fullName: string
  emailOrPhone: string
  password: string
  transactionPassword: string
}): Promise<UserData | null> {
  try {
    // Kiểm tra email/phone đã tồn tại chưa
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email_or_phone', userData.emailOrPhone)
      .single()
    
    if (existing) return null // Đã tồn tại
    
    const userId = `VF-${Date.now()}`
    const now = new Date().toISOString()
    
    const { data, error } = await supabase
      .from('users')
      .insert([{
        id: userId,
        full_name: userData.fullName,
        email_or_phone: userData.emailOrPhone,
        balance: 0,
        vip_level: 0,
        kyc_status: 'Chưa xác minh',
        linked_banks: [{ password: userData.password, transactionPassword: userData.transactionPassword }],
        transaction_history: [],
        notifications: [],
        created_at: now,
        last_login: now
      }])
      .select()
      .single()
    
    if (error || !data) {
      console.error('Register error:', error)
      return null
    }
    
    return {
      id: data.id,
      fullName: data.full_name,
      emailOrPhone: data.email_or_phone,
      password: userData.password,
      transactionPassword: userData.transactionPassword,
      balance: 0,
      vipLevel: 0,
      vipPoints: 0,
      linkedBanks: data.linked_banks || [],
      kycStatus: 'Chưa xác minh',
      transactionHistory: [],
      createdAt: data.created_at,
      lastLogin: data.last_login
    }
  } catch (err) {
    console.error('Register error:', err)
    return null
  }
}

// 🔹 CẬP NHẬT USER
export async function updateUser(userId: string, updates: Partial<UserData>): Promise<boolean> {
  try {
    const dbUpdates: any = {}
    
    if (updates.fullName) dbUpdates.full_name = updates.fullName
    if (updates.balance !== undefined) dbUpdates.balance = updates.balance
    if (updates.vipLevel !== undefined) dbUpdates.vip_level = updates.vipLevel
    if (updates.kycStatus) dbUpdates.kyc_status = updates.kycStatus
    if (updates.linkedBanks) dbUpdates.linked_banks = updates.linkedBanks
    if (updates.transactionHistory) dbUpdates.transaction_history = updates.transactionHistory
    
    const { error } = await supabase
      .from('users')
      .update(dbUpdates)
      .eq('id', userId)
    
    return !error
  } catch (err) {
    console.error('Update error:', err)
    return false
  }
}
