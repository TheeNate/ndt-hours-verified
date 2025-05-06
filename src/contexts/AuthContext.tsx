
import React, { createContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';
import { AuthContextType, Profile } from '@/types/auth';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  console.log("Auth Provider initializing, loading state:", loading);

  useEffect(() => {
    let mounted = true;
    
    console.log("Auth Provider useEffect running");
    
    const setData = async () => {
      try {
        console.log("Getting session from Supabase");
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error fetching session:", error);
          if (mounted) setLoading(false);
          return;
        }
        
        console.log("Session retrieved:", session ? "Yes" : "No");
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
        }
        
        if (session?.user && mounted) {
          console.log("Fetching profile for user:", session.user.id);
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (profileError) {
            console.error("Error fetching profile:", profileError);
          } else if (mounted) {
            console.log("Profile retrieved:", profileData ? "Yes" : "No");
            setProfile(profileData);
          }
        }
      } catch (error) {
        console.error("Unexpected error in auth context:", error);
      } finally {
        // Ensure loading is set to false even if there's an error
        if (mounted) {
          console.log("Setting loading to false");
          setLoading(false);
        }
      }
    };
    
    setData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event);
        
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
            
          if (profileError) {
            console.error("Error fetching profile:", profileError);
          } else if (mounted) {
            setProfile(profileData);
          }
        } else if (mounted) {
          setProfile(null);
        }
        
        if (mounted) setLoading(false);
      }
    );

    return () => {
      console.log("Auth Provider useEffect cleanup");
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
        isAdmin: profile?.is_admin || false,
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

// Auth method hooks
interface AuthMethodProps {
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  toast: any;
}

function useAuthSignUp({ setLoading, toast }: AuthMethodProps) {
  const signUp = async (email: string, password: string, username: string, fullName: string) => {
    try {
      setLoading(true);
      
      // Check if username already exists
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .single();
      
      if (existingUser) {
        toast({
          title: "Registration failed",
          description: "Username already taken. Please choose another one.",
          variant: "destructive",
        });
        return;
      }
      
      const { data, error } = await supabase.auth.signUp({ email, password });
      
      if (error) {
        toast({
          title: "Registration failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      if (data.user) {
        const { error: profileError } = await supabase.from('profiles').insert({
          id: data.user.id,
          username,
          full_name: fullName,
          is_admin: false,
        });
        
        if (profileError) {
          toast({
            title: "Profile creation failed",
            description: profileError.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Registration successful",
            description: "Please check your email to verify your account.",
          });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return { signUp };
}

function useAuthSignIn({ setLoading, toast }: AuthMethodProps) {
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return { signIn };
}

function useAuthSignOut({ setLoading, toast }: AuthMethodProps) {
  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast({
          title: "Sign out failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return { signOut };
}

function useAuthResetPassword({ setLoading, toast }: AuthMethodProps) {
  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        toast({
          title: "Password reset failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Password reset email sent",
          description: "Please check your email to reset your password.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return { resetPassword };
}

// Export the hook from this file for backward compatibility
export { useAuth } from '@/hooks/useAuth';
