import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useSuperAdmin = () => {
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const checkSuperAdmin = async () => {
    if (!user) {
      setIsSuperAdmin(false);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.rpc('is_super_admin');
      
      if (error) {
        console.error('Erro ao verificar super admin:', error);
        setIsSuperAdmin(false);
      } else {
        setIsSuperAdmin(data || false);
      }
    } catch (error) {
      console.error('Erro ao verificar super admin:', error);
      setIsSuperAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSuperAdmin();
  }, [user]);

  return { isSuperAdmin, loading };
};