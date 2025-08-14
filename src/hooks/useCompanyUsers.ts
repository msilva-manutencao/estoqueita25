
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
          id,
          user_id,
          company_id,
          permission_type,
          created_at,
          created_by,
          is_active,
          profiles!inner (
            email,
            full_name
          )
        `)
        .eq('company_id', companyId)
        .eq('is_active', true);

      if (error) throw error;

      // Transformar os dados para o formato esperado
      const users = data?.map(item => ({
        id: item.id,
        company_id: item.company_id,
        user_id: item.user_id,
        permission_type: item.permission_type as 'read' | 'write' | 'admin',
        created_at: item.created_at,
        created_by: item.created_by,
        is_active: item.is_active,
        user: {
          email: item.profiles.email,
          profiles: {
            full_name: item.profiles.full_name
          }
        }
      })) || [];

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
      // Buscar o usuário pela email
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', userEmail.trim())
        .single();

      if (profileError || !profile) {
        toast.error('Usuário não encontrado');
        return null;
      }

      // Verificar se o usuário já está na empresa
      const { data: existingUser, error: existingError } = await supabase
        .from('company_users')
        .select('id')
        .eq('user_id', profile.id)
        .eq('company_id', companyId)
        .eq('is_active', true)
        .maybeSingle();

      if (existingError) throw existingError;

      if (existingUser) {
        toast.error('Usuário já está vinculado a esta empresa');
        return null;
      }

      // Adicionar usuário à empresa
      const { error: insertError } = await supabase
        .from('company_users')
        .insert({
          user_id: profile.id,
          company_id: companyId,
          permission_type: permissionType,
          created_by: user.id
        });

      if (insertError) throw insertError;

      toast.success('Usuário adicionado com sucesso!');
      await fetchCompanyUsers();
      return { success: true };
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
