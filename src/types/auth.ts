
import type { User, Session } from '@supabase/supabase-js';

export type Profile = {
  id: string;
  username: string;
  full_name: string;
  is_admin: boolean;
  created_at: string;
};

export type AuthContextType = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
};
