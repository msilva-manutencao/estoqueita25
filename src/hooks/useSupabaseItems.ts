
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface SupabaseItem {
  id: string;
  name: string;
  category_id: string;
  unit_id: string;
  current_stock: number;
  minimum_stock: number;
  expiry_date: string | null;
  created_at: string;
  updated_at: string;
  categories?: { name: string };
  units?: { name: string; abbreviation: string };
}

export function useSupabaseItems() {
  const [items, setItems] = useState<SupabaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('items')
        .select(`
          *,
          categories (name),
          units (name, abbreviation)
        `);

      if (error) {
        console.error('Erro ao buscar itens:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os itens do estoque",
          variant: "destructive",
        });
        return;
      }

      setItems(data || []);
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

  const addStockMovement = async (itemId: string, quantity: number, type: 'entrada' | 'saida', description?: string) => {
    try {
      const { error } = await supabase
        .from('stock_movements')
        .insert({
          item_id: itemId,
          quantity: quantity,
          movement_type: type,
          description: description || `${type === 'entrada' ? 'Entrada' : 'Saída'} de estoque`
        });

      if (error) {
        console.error('Erro ao adicionar movimentação:', error);
        toast({
          title: "Erro",
          description: "Não foi possível registrar a movimentação",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Sucesso",
        description: `${type === 'entrada' ? 'Entrada' : 'Saída'} registrada com sucesso`,
        variant: "default",
      });

      // Atualizar lista de itens
      await fetchItems();
      return true;
    } catch (error) {
      console.error('Erro na conexão:', error);
      return false;
    }
  };

  const addItem = async (itemData: {
    name: string;
    category_id: string;
    unit_id: string;
    current_stock: number;
    minimum_stock?: number;
    expiry_date?: string;
  }) => {
    try {
      const { error } = await supabase
        .from('items')
        .insert(itemData);

      if (error) {
        console.error('Erro ao adicionar item:', error);
        toast({
          title: "Erro",
          description: "Não foi possível adicionar o item",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Sucesso",
        description: "Item adicionado com sucesso",
        variant: "default",
      });

      await fetchItems();
      return true;
    } catch (error) {
      console.error('Erro na conexão:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return {
    items,
    loading,
    fetchItems,
    addStockMovement,
    addItem
  };
}
