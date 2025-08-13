
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'user';
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  created_at: string;
}

export function useUserRoles() {
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [operationLoading, setOperationLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchUserRoles = async () => {
    try {
      setLoading(true);
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .order('created_at', { ascending: false });

      if (rolesError) {
        console.error('Erro ao buscar roles:', rolesError);
        return;
      }

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('Erro ao buscar perfis:', profilesError);
        return;
      }

      setUserRoles(roles || []);
      setUserProfiles(profiles || []);
    } catch (error) {
      console.error('Erro na conexão:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Erro ao verificar role:', error);
        return null;
      }

      return data?.role || null;
    } catch (error) {
      console.error('Erro na conexão:', error);
      return null;
    }
  };

  const assignExistingDataToAdmin = async () => {
    try {
      setOperationLoading(true);
      
      const { error } = await supabase.rpc('assign_existing_data_to_admin');
      
      if (error) {
        console.error('Erro ao vincular dados ao admin:', error);
        toast({
          title: "Erro",
          description: "Não foi possível vincular os dados ao administrador",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Sucesso",
        description: "Dados vinculados ao administrador com sucesso",
      });
      
      return true;
    } catch (error) {
      console.error('Erro na conexão:', error);
      toast({
        title: "Erro de Conexão",
        description: "Verifique sua conexão com a internet",
        variant: "destructive",
      });
      return false;
    } finally {
      setOperationLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserRoles();
    }
  }, [user]);

  return {
    userRoles,
    userProfiles,
    loading,
    operationLoading,
    fetchUserRoles,
    checkUserRole,
    assignExistingDataToAdmin
  };
}
