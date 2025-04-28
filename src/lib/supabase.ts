
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Use the environment variables from .env file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'your-project-url';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Add debugging to verify connection
console.log("Supabase initialization with URL:", supabaseUrl.substring(0, 15) + "...");
