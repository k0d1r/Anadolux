import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL veya Anon Key eksik!')
}

console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Key:', supabaseAnonKey?.substring(0, 20) + '...')

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database Types
export interface Room {
  id: string
  name: string
  description?: string
  created_at: string
  created_by: string
}

export interface Message {
  id: string
  content: string
  room_id: string
  user_id: string
  user_name: string
  user_image?: string
  created_at: string
}

export interface Profile {
  id: string
  user_id: string
  username: string
  avatar_url?: string
  created_at: string
}
