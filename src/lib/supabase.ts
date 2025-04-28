
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Use the environment variables from .env file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'your-project-url';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
