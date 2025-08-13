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
        .from('company_users')
        .select(`
          *,
          user:user_id (
            email,
            profiles (
              full_name
            )
          )
        `)
        .eq('company_id', companyId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCompanyUsers(data || []);
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
      // Primeiro, buscar o usuário pelo email
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', userEmail)
        .single();

      if (userError || !userData) {
        toast.error('Usuário não encontrado');
        return null;
      }

      const { data, error } = await supabase
        .from('company_users')
        .insert({
          company_id: companyId,
          user_id: userData.id,
          permission_type: permissionType,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Usuário adicionado à empresa com sucesso!');
      await fetchCompanyUsers();
      return data;
    } catch (error: any) {
      console.error('Erro ao adicionar usuário à empresa:', error);
      if (error.code === '23505') {
        toast.error('Usuário já está na empresa');
      } else {
        toast.error('Erro ao adicionar usuário à empresa');
      }
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