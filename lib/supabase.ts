import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://sjrmdmudpttfsdwqirab.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqcm1kbXVkcHR0ZnNkd3FpcmFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5Nzc1OTksImV4cCI6MjA4MDU1MzU5OX0.1NZfQ-96FheYDm0i5Tf6g3cZTZw6vea7KTNQUZnBBbg'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// TypeScript interfaces
export interface UserData {
  id: string
  full_name: string
  email_or_phone: string
  balance: number
  vip_level: number
  kyc_status: string
  linked_banks: any[]
  transaction_history: any[]
  notifications: any[]
  created_at: string
  last_login: string
}

export interface TransactionRequest {
  id: string
  user_id: string
  user_name: string
  type: string
  amount: number
  bank_info: string
  status: string
  created_at: string
}

// Database Schema:
// Table: users
// - id (text, primary key)
// - full_name (text)
// - email_or_phone (text, unique)
// - balance (numeric, default 0)
// - vip_level (integer, default 0)
// - kyc_status (text, default 'Chưa xác minh')
// - linked_banks (jsonb, default [])
// - transaction_history (jsonb, default [])
// - notifications (jsonb, default [])
// - created_at (timestamp)
// - last_login (timestamp)

// Table: transaction_requests
// - id (text, primary key)
// - user_id (text, foreign key to users.id)
// - user_name (text)
// - type (text) // 'Nạp tiền' hoặc 'Rút tiền'
// - amount (numeric)
// - bank_info (text)
// - status (text, default 'Chờ duyệt')
// - created_at (timestamp)
