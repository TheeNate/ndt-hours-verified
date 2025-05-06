import React, { createContext, useContext, useEffect, useState } from 'react';
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

  useEffect(() => {
    let mounted = true;

    const loadAuth = async () => {
      try {
        console.log('AuthProvider: fetching session...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
        }

        if (session?.user && mounted) {
          console.log('AuthProvider: fetching profile for user', session.user.id);
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          if (profileError) throw profileError;
          if (mounted) setProfile(profileData);
        }
      } catch (err) {
        console.error('AuthProvider loadAuth error:', err);
      } finally {
        if (mounted) {
          setLoading(false);
          console.log('AuthProvider: initial load complete');
        }
      }
    };

    loadAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        try {
          console.log('AuthProvider: auth state changed:', _event);
          if (mounted) {
            setSession(session);
            setUser(session?.user ?? null);
          }

          if (session?.user && mounted) {
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            if (profileError) throw profileError;
            if (mounted) setProfile(profileData);
          } else if (mounted) {
            setProfile(null);
          }
        } catch (err) {
          console.error('AuthProvider onAuthStateChange error:', err);
        } finally {
          if (mounted) {
            setLoading(false);
            console.log('AuthProvider: state change handling complete');
          }
        }
      }
    );

    return () => {
      mounted = false;
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