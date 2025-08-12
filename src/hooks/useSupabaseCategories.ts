
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SupabaseCategory {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export function useSupabaseCategories() {
  const [categories, setCategories] = useState<SupabaseCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) {
        console.error('Erro ao buscar categorias:', error);
        return;
      }

      setCategories(data || []);
    } catch (error) {
      console.error('Erro na conexão:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    fetchCategories
  };
}
