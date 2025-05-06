
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

// Export the hook from this file for backward compatibility
export { useAuth } from '@/hooks/useAuth';
