import React, { createContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';
import { AuthContextType, Profile } from '@/types/auth';
import { useAuthSignUp } from '@/hooks/useAuthSignUp';
import { useAuthSignIn } from '@/hooks/useAuthSignIn';
import { useAuthSignOut } from '@/hooks/useAuthSignOut';
import { useAuthResetPassword } from '@/hooks/useAuthResetPassword';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Handle auth state changes and profile fetching
  useEffect(() => {
    console.log('Setting up auth listeners');
    
    // Initial session fetch
    const fetchInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error fetching session:', error);
          setLoading(false);
          return;
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        
        // Fetch profile if we have a user
        if (session?.user) {
          fetchProfile(session.user.id);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error('Error in fetchInitialSession:', err);
        setLoading(false);
      }
    };
    
    // Helper function to fetch profile
    const fetchProfile = async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
          
        if (error) {
          console.error('Error fetching profile:', error);
        } else {
          setProfile(data);
        }
      } catch (err) {
        console.error('Error in fetchProfile:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchInitialSession();
    
    // Set up auth state change subscriber
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('Auth state changed:', event);
        
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (newSession?.user) {
            fetchProfile(newSession.user.id);
          }
        } else if (event === 'SIGNED_OUT') {
          setProfile(null);
          setLoading(false);
        }
      }
    );
    
    // Cleanup subscription when component unmounts
    return () => {
      console.log('Cleaning up auth subscriptions');
      subscription.unsubscribe();
    };
  }, []);

  // Import the authentication methods from separate files
  const { signUp } = useAuthSignUp({ setLoading, toast });
  const { signIn } = useAuthSignIn({ setLoading, toast });
  const { signOut } = useAuthSignOut({ setLoading, toast });
  const { resetPassword } = useAuthResetPassword({ setLoading, toast });

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isAdmin: profile?.is_admin ?? false,
        loading,
        signIn,
        signUp,
        signOut,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Export the hook from this file for backward compatibility
export { useAuth } from '@/hooks/useAuth';