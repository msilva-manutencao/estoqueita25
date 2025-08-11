
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
        // Converter para UTC mantendo a data local brasileira
        const startDate = new Date(filters.startDate + 'T00:00:00-03:00');
        query = query.gte('date', startDate.toISOString());
        console.log('Data início (UTC):', startDate.toISOString());
      }

      if (filters?.endDate) {
        // Converter para UTC mantendo a data local brasileira
        const endDate = new Date(filters.endDate + 'T23:59:59-03:00');
        query = query.lte('date', endDate.toISOString());
        console.log('Data fim (UTC):', endDate.toISOString());
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
      console.log('Filtros aplicados:', filters);
      
      // Fazemos um cast seguro dos dados, garantindo que movement_type seja do tipo correto
      const typedMovements = (data || []).map(movement => ({
        ...movement,
        movement_type: movement.movement_type as 'entrada' | 'saida'
      })) as SupabaseStockMovement[];
      
      setMovements(typedMovements);
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

  const addMovement = async (movement: {
    item_id: string;
    quantity: number;
    movement_type: 'entrada' | 'saida';
    description?: string;
    date?: string;
  }) => {
    try {
      console.log('Adicionando movimentação:', movement);
      
      const { data, error } = await supabase
        .from('stock_movements')
        .insert([{
          ...movement,
          date: movement.date || new Date().toISOString(),
        }])
        .select(`
          *,
          items (
            name,
            categories (name),
            units (name, abbreviation)
          )
        `)
        .single();

      if (error) {
        console.error('Erro ao adicionar movimentação:', error);
        toast({
          title: "Erro",
          description: "Não foi possível registrar a movimentação",
          variant: "destructive",
        });
        return null;
      }

      console.log('Movimentação adicionada:', data);
      
      // Cast seguro do movimento adicionado
      const typedMovement = {
        ...data,
        movement_type: data.movement_type as 'entrada' | 'saida'
      } as SupabaseStockMovement;
      
      // Atualizar a lista local
      setMovements(prev => [typedMovement, ...prev]);
      
      toast({
        title: "Sucesso",
        description: "Movimentação registrada com sucesso",
      });
      
      return typedMovement;
    } catch (error) {
      console.error('Erro na conexão:', error);
      toast({
        title: "Erro de Conexão",
        description: "Verifique sua conexão com a internet",
        variant: "destructive",
      });
      return null;
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
    addMovement,
    getMovementsSummary
  };
}
