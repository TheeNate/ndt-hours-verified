
import { supabase } from '@/lib/supabase';

interface UseAuthResetPasswordProps {
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  toast: any;
}

export function useAuthResetPassword({ setLoading, toast }: UseAuthResetPasswordProps) {
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
