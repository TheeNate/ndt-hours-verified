
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// These will be replaced with environment variables in a production environment
// For Lovable preview, we can define them here
const supabaseUrl = 'https://your-project.supabase.co';
const supabaseAnonKey = 'your-anon-key';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
