import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { CompanyUser } from './useCompanies';

export const useCompanyUsers = (companyId?: string) => {
  const [companyUsers, setCompanyUsers] = useState<CompanyUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchCompanyUsers = async () => {
    if (!user || !companyId) return;

    try {
      const { data, error } = await supabase
        .rpc('get_company_users_with_profiles', { p_company_id: companyId });

      if (error) throw error;

      // Os dados já vêm no formato correto da função RPC
      const users = data || [];
      setCompanyUsers(users);
    } catch (error) {
      console.error('Erro ao buscar usuários da empresa:', error);
      toast.error('Erro ao carregar usuários da empresa');
    } finally {
      setLoading(false);
    }
  };

  const addUserToCompany = async (userEmail: string, permissionType: 'read' | 'write' | 'admin') => {
    if (!user || !companyId) return null;

    try {
      // Usar função RPC para adicionar usuário à empresa
      const { data, error } = await supabase
        .rpc('add_user_to_company_by_email', {
          p_user_email: userEmail.trim(),
          p_company_id: companyId,
          p_permission_type: permissionType
        });

      if (error) {
        console.error('Erro ao adicionar usuário:', error);
        toast.error('Erro ao adicionar usuário: ' + error.message);
        return null;
      }

      const result = data as { success: boolean; message?: string; error?: string };
      
      if (result.success) {
        toast.success(result.message || 'Usuário adicionado com sucesso!');
        await fetchCompanyUsers();
        return { success: true };
      } else {
        toast.error(result.error || 'Erro ao adicionar usuário');
        return null;
      }
    } catch (error: any) {
      console.error('Erro ao adicionar usuário à empresa:', error);
      toast.error('Erro ao adicionar usuário à empresa: ' + (error.message || 'Erro desconhecido'));
      return null;
    }
  };

  const updateUserPermission = async (companyUserId: string, permissionType: 'read' | 'write' | 'admin') => {
    try {
      const { error } = await supabase
        .from('company_users')
        .update({ permission_type: permissionType })
        .eq('id', companyUserId);

      if (error) throw error;

      toast.success('Permissão atualizada com sucesso!');
      await fetchCompanyUsers();
    } catch (error) {
      console.error('Erro ao atualizar permissão:', error);
      toast.error('Erro ao atualizar permissão');
    }
  };

  const removeUserFromCompany = async (companyUserId: string) => {
    try {
      const { error } = await supabase
        .from('company_users')
        .update({ is_active: false })
        .eq('id', companyUserId);

      if (error) throw error;

      toast.success('Usuário removido da empresa com sucesso!');
      await fetchCompanyUsers();
    } catch (error) {
      console.error('Erro ao remover usuário da empresa:', error);
      toast.error('Erro ao remover usuário da empresa');
    }
  };

  useEffect(() => {
    fetchCompanyUsers();
  }, [user, companyId]);

  return {
    companyUsers,
    loading,
    addUserToCompany,
    updateUserPermission,
    removeUserFromCompany,
    refetch: fetchCompanyUsers,
  };
};