
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Company {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  owner_id: string;
  is_active: boolean;
}

export interface CompanyUser {
  id: string;
  company_id: string;
  user_id: string;
  permission_type: 'read' | 'write' | 'admin';
  created_at: string;
  created_by: string;
  is_active: boolean;
  user?: {
    email: string;
    profiles?: {
      full_name?: string;
    };
  };
}

export const useCompanies = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchCompanies = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // As políticas RLS agora cuidam do acesso, então podemos buscar diretamente
      const { data: companies, error } = await supabase
        .from('companies')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;

      setCompanies(companies || []);
    } catch (error) {
      console.error('Erro ao buscar empresas:', error);
      toast.error('Erro ao carregar empresas');
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  const createCompany = async (companyData: { name: string; description?: string }) => {
    if (!user) return null;

    try {
      // Verificar se é super admin
      const { data: isSuperAdmin } = await supabase.rpc('is_super_admin');
      
      if (!isSuperAdmin) {
        toast.error('Apenas super admins podem criar empresas');
        return null;
      }

      const { data, error } = await supabase
        .from('companies')
        .insert({
          ...companyData,
          owner_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Empresa criada com sucesso!');
      await fetchCompanies();
      return data;
    } catch (error) {
      console.error('Erro ao criar empresa:', error);
      toast.error('Erro ao criar empresa');
      return null;
    }
  };

  const updateCompany = async (id: string, updates: Partial<Company>) => {
    try {
      // Verificar se é super admin
      const { data: isSuperAdmin } = await supabase.rpc('is_super_admin');
      
      if (!isSuperAdmin) {
        // Verificar se o usuário é proprietário da empresa
        const company = companies.find(c => c.id === id);
        if (!company || company.owner_id !== user?.id) {
          toast.error('Apenas o proprietário ou super admin pode editar a empresa');
          return;
        }
      }

      const { error } = await supabase
        .from('companies')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast.success('Empresa atualizada com sucesso!');
      await fetchCompanies();
    } catch (error) {
      console.error('Erro ao atualizar empresa:', error);
      toast.error('Erro ao atualizar empresa');
    }
  };

  const deleteCompany = async (id: string) => {
    try {
      // Verificar se é super admin
      const { data: isSuperAdmin } = await supabase.rpc('is_super_admin');
      
      if (!isSuperAdmin) {
        // Verificar se o usuário é proprietário da empresa
        const company = companies.find(c => c.id === id);
        if (!company || company.owner_id !== user?.id) {
          toast.error('Apenas o proprietário ou super admin pode desativar a empresa');
          return;
        }
      }

      const { error } = await supabase
        .from('companies')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      toast.success('Empresa desativada com sucesso!');
      await fetchCompanies();
    } catch (error) {
      console.error('Erro ao desativar empresa:', error);
      toast.error('Erro ao desativar empresa');
    }
  };

  useEffect(() => {
    let mounted = true;
    
    const loadCompanies = async () => {
      if (user && mounted) {
        await fetchCompanies();
      } else if (!user && mounted) {
        setCompanies([]);
        setLoading(false);
      }
    };

    loadCompanies();

    return () => {
      mounted = false;
    };
  }, [user?.id]);

  return {
    companies,
    loading,
    createCompany,
    updateCompany,
    deleteCompany,
    refetch: fetchCompanies,
  };
};
