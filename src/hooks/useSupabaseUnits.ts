
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SupabaseUnit {
  id: string;
  name: string;
  abbreviation: string;
}

export function useSupabaseUnits() {
  const [units, setUnits] = useState<SupabaseUnit[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUnits = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('units')
        .select('*')
        .order('name');

      if (error) {
        console.error('Erro ao buscar unidades:', error);
        return;
      }

      setUnits(data || []);
    } catch (error) {
      console.error('Erro na conexão:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, []);

  return {
    units,
    loading,
    fetchUnits
  };
}
