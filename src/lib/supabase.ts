import { createClient } from '@supabase/supabase-js'
import { ENV } from '../config/env'

export const supabase = createClient(
  ENV.supabase.url || 'https://placeholder.supabase.co',
  ENV.supabase.anonKey || 'placeholder'
)
