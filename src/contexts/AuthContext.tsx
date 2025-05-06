import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

type Profile = {
  id: string;
  username: string;
  full_name: string;
  is_admin: boolean;
  created_at: string;
};

type AuthContextType = {
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

  const signUp = async (email: string, password: string, username: string, fullName: string) => {
    setLoading(true);
    try {
      const { data: existing, error: existErr } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .single();
      if (existing) {
        throw new Error('Username already taken');
      }

      const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({ email, password });
      if (signUpErr) throw signUpErr;

      if (signUpData.user) {
        const { error: profileErr } = await supabase.from('profiles').insert({
          id: signUpData.user.id,
          username,
          full_name: fullName,
          is_admin: false,
        });
        if (profileErr) throw profileErr;
      }
      toast({ title: 'Registration successful', description: 'Please verify your email.' });
    } catch (err: any) {
      toast({ title: 'Registration failed', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (err: any) {
      toast({ title: 'Login failed', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (err: any) {
      toast({ title: 'Sign out failed', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast({ title: 'Password reset email sent', description: 'Check your inbox.' });
    } catch (err: any) {
      toast({ title: 'Password reset failed', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
