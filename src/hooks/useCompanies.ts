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
      
      // Buscar empresas onde o usuário é proprietário OU tem acesso via company_users
      const { data: ownedCompanies, error: ownedError } = await supabase
        .from('companies')
        .select('*')
        .eq('owner_id', user.id)
        .eq('is_active', true);

      if (ownedError) throw ownedError;

      const { data: accessibleCompanies, error: accessError } = await supabase
        .from('company_users')
        .select(`
          companies!inner (
            id,
            name,
            description,
            created_at,
            updated_at,
            owner_id,
            is_active
          )
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .eq('companies.is_active', true);

      if (accessError) throw accessError;

      // Combinar empresas próprias e acessíveis, removendo duplicatas
      const allCompanies = [
        ...(ownedCompanies || []),
        ...(accessibleCompanies?.map(item => item.companies).filter(Boolean) || [])
      ];

      // Remover duplicatas baseado no ID
      const uniqueCompanies = allCompanies.filter((company, index, self) => 
        index === self.findIndex(c => c.id === company.id)
      );

      setCompanies(uniqueCompanies.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (error) {
      console.error('Erro ao buscar empresas:', error);
      toast.error('Erro ao carregar empresas');
      setCompanies([]); // Definir array vazio em caso de erro
    } finally {
      setLoading(false);
    }
  };

  const createCompany = async (companyData: { name: string; description?: string }) => {
    if (!user) return null;

    try {
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
  }, [user?.id]); // Usar user.id ao invés de user para evitar re-renders desnecessários

  return {
    companies,
    loading,
    createCompany,
    updateCompany,
    deleteCompany,
    refetch: fetchCompanies,
  };
};