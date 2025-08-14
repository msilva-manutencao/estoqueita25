
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;

    // Check for existing session first
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (error) {
          console.error('Erro ao obter sessão:', error);
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      } catch (error) {
        console.error('Erro ao verificar sessão:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Erro no login",
          description: error.message === "Invalid login credentials" ? 
            "Email ou senha inválidos" : error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Login realizado com sucesso",
        description: "Bem-vindo ao sistema!",
      });

      return { data, error: null };
    } catch (error) {
      toast({
        title: "Erro de conexão",
        description: "Verifique sua conexão com a internet",
        variant: "destructive",
      });
      return { error };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) {
        let message = error.message;
        if (error.message.includes("already registered")) {
          message = "Este email já está cadastrado. Tente fazer login.";
        }
        
        toast({
          title: "Erro no cadastro",
          description: message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Cadastro realizado",
        description: "Verifique seu email para confirmar a conta",
      });

      return { data, error: null };
    } catch (error) {
      toast({
        title: "Erro de conexão",
        description: "Verifique sua conexão com a internet",
        variant: "destructive",
      });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast({
          title: "Erro ao sair",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Logout realizado",
        description: "Até logo!",
      });
    } catch (error) {
      toast({
        title: "Erro de conexão",
        description: "Verifique sua conexão com a internet",
        variant: "destructive",
      });
    }
  };

  return {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  };
}
