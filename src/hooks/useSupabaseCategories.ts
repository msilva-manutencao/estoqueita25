
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentCompany } from "./useCurrentCompany";

export interface SupabaseCategory {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export function useSupabaseCategories() {
  const [categories, setCategories] = useState<SupabaseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentCompany } = useCurrentCompany();

  const fetchCategories = async () => {
    if (!currentCompany) {
      setCategories([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('Buscando categorias para empresa:', currentCompany.id);
      
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('company_id', currentCompany.id)
        .order('name');

      if (error) {
        console.error('Erro ao buscar categorias:', error);
        return;
      }

      console.log('Categorias encontradas:', data?.length || 0);
      setCategories(data || []);
    } catch (error) {
      console.error('Erro na conexão:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [currentCompany?.id]); // Simplificar dependências

  return {
    categories,
    loading,
    fetchCategories
  };
}
