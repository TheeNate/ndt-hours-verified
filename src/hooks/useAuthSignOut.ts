
import { supabase } from '@/lib/supabase';

interface UseAuthSignOutProps {
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  toast: any;
}

export function useAuthSignOut({ setLoading, toast }: UseAuthSignOutProps) {
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
