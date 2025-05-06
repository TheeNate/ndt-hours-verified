
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

interface UseAuthSignUpProps {
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  toast: any;
}

export function useAuthSignUp({ setLoading, toast }: UseAuthSignUpProps) {
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
