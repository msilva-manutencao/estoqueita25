
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface SupabaseStockMovement {
  id: string;
  item_id: string;
  quantity: number;
  movement_type: 'entrada' | 'saida';
  date: string;
  description?: string;
  created_at: string;
  items?: {
    name: string;
    categories?: {
      name: string;
    };
    units?: {
      name: string;
      abbreviation: string;
    };
  };
}

export function useSupabaseStockMovements() {
  const [movements, setMovements] = useState<SupabaseStockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchMovements = async (filters?: {
    startDate?: string;
    endDate?: string;
    movementType?: 'entrada' | 'saida' | 'all';
  }) => {
    try {
      setLoading(true);
      console.log('Buscando movimentações no Supabase...');
      
      let query = supabase
        .from('stock_movements')
        .select(`
          *,
          items (
            name,
            categories (name),
            units (name, abbreviation)
          )
        `)
        .order('date', { ascending: false });

      if (filters?.startDate) {
        query = query.gte('date', filters.startDate);
      }

      if (filters?.endDate) {
        query = query.lte('date', filters.endDate);
      }

      if (filters?.movementType && filters.movementType !== 'all') {
        query = query.eq('movement_type', filters.movementType);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar movimentações:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as movimentações",
          variant: "destructive",
        });
        return;
      }

      console.log('Movimentações carregadas:', data);
      setMovements(data || []);
    } catch (error) {
      console.error('Erro na conexão:', error);
      toast({
        title: "Erro de Conexão",
        description: "Verifique sua conexão com a internet",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getMovementsSummary = (movements: SupabaseStockMovement[]) => {
    const summary = movements.reduce((acc, movement) => {
      const key = movement.movement_type;
      if (!acc[key]) {
        acc[key] = { count: 0, quantity: 0 };
      }
      acc[key].count++;
      acc[key].quantity += movement.quantity;
      return acc;
    }, {} as Record<string, { count: number; quantity: number }>);

    return {
      totalMovements: movements.length,
      entries: summary.entrada || { count: 0, quantity: 0 },
      exits: summary.saida || { count: 0, quantity: 0 }
    };
  };

  useEffect(() => {
    fetchMovements();
  }, []);

  return {
    movements,
    loading,
    fetchMovements,
    getMovementsSummary
  };
}
