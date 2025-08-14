
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentCompany } from "./useCurrentCompany";

export interface SupabaseUnit {
  id: string;
  name: string;
  abbreviation: string;
}

export function useSupabaseUnits() {
  const [units, setUnits] = useState<SupabaseUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentCompany } = useCurrentCompany();

  const fetchUnits = async () => {
    if (!currentCompany) {
      setUnits([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('Buscando unidades para empresa:', currentCompany.id);
      
      const { data, error } = await supabase
        .from('units')
        .select('*')
        .eq('company_id', currentCompany.id)
        .order('name');

      if (error) {
        console.error('Erro ao buscar unidades:', error);
        return;
      }

      console.log('Unidades encontradas:', data?.length || 0);
      setUnits(data || []);
    } catch (error) {
      console.error('Erro na conexão:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, [currentCompany?.id]); // Simplificar dependências

  return {
    units,
    loading,
    fetchUnits
  };
}
