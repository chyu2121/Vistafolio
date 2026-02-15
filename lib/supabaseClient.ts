import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.warn("Missing NEXT_PUBLIC_SUPABASE_URL env variable. Using placeholder.")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
