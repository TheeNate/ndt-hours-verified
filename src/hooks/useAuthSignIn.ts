
import { supabase } from '@/lib/supabase';

interface UseAuthSignInProps {
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  toast: any;
}

export function useAuthSignIn({ setLoading, toast }: UseAuthSignInProps) {
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
