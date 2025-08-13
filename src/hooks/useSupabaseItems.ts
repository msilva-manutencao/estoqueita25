
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCurrentCompany } from "./useCurrentCompany";

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
  company_id?: string;
  categories?: { name: string };
  units?: { name: string; abbreviation: string };
}

export function useSupabaseItems() {
  const [items, setItems] = useState<SupabaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { currentCompany } = useCurrentCompany();

  const fetchItems = async () => {
    if (!currentCompany) {
      setItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('Buscando itens no Supabase para empresa:', currentCompany.id);
      
      const { data, error } = await supabase
        .from('items')
        .select(`
          *,
          categories (name),
          units (name, abbreviation)
        `)
        .eq('company_id', currentCompany.id);

      if (error) {
        console.error('Erro ao buscar itens:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os itens do estoque",
          variant: "destructive",
        });
        return;
      }

      console.log('Itens carregados do Supabase:', data);
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
    if (!currentCompany) return false;

    try {
      console.log('Adicionando movimentação:', { itemId, quantity, type, description });
      
      const { error } = await supabase
        .from('stock_movements')
        .insert({
          item_id: itemId,
          quantity: quantity,
          movement_type: type,
          description: description || `${type === 'entrada' ? 'Entrada' : 'Saída'} de estoque`,
          company_id: currentCompany.id
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
    expiry_date?: string | null;
  }) => {
    if (!currentCompany) return false;

    try {
      console.log('Inserindo novo item:', itemData);
      
      const { data, error } = await supabase
        .from('items')
        .insert({
          ...itemData,
          company_id: currentCompany.id
        })
        .select();

      if (error) {
        console.error('Erro ao adicionar item:', error);
        toast({
          title: "Erro",
          description: `Não foi possível adicionar o item: ${error.message}`,
          variant: "destructive",
        });
        return false;
      }

      console.log('Item inserido com sucesso:', data);
      
      toast({
        title: "Sucesso",
        description: "Item adicionado com sucesso",
        variant: "default",
      });

      await fetchItems();
      return true;
    } catch (error) {
      console.error('Erro na conexão:', error);
      toast({
        title: "Erro de Conexão",
        description: "Verifique sua conexão com a internet",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateItem = async (itemId: string, itemData: {
    name?: string;
    category_id?: string;
    unit_id?: string;
    current_stock?: number;
    minimum_stock?: number;
    expiry_date?: string | null;
  }) => {
    try {
      console.log('Atualizando item:', { itemId, itemData });
      
      const { error } = await supabase
        .from('items')
        .update(itemData)
        .eq('id', itemId);

      if (error) {
        console.error('Erro ao atualizar item:', error);
        toast({
          title: "Erro",
          description: `Não foi possível atualizar o item: ${error.message}`,
          variant: "destructive",
        });
        return false;
      }

      console.log('Item atualizado com sucesso');
      
      toast({
        title: "Sucesso",
        description: "Item atualizado com sucesso",
        variant: "default",
      });

      await fetchItems();
      return true;
    } catch (error) {
      console.error('Erro na conexão:', error);
      toast({
        title: "Erro de Conexão",
        description: "Verifique sua conexão com a internet",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteItem = async (itemId: string) => {
    try {
      console.log('Excluindo item:', itemId);
      
      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', itemId);

      if (error) {
        console.error('Erro ao excluir item:', error);
        toast({
          title: "Erro",
          description: `Não foi possível excluir o item: ${error.message}`,
          variant: "destructive",
        });
        return false;
      }

      console.log('Item excluído com sucesso');
      
      toast({
        title: "Sucesso",
        description: "Item excluído com sucesso",
        variant: "default",
      });

      await fetchItems();
      return true;
    } catch (error) {
      console.error('Erro na conexão:', error);
      toast({
        title: "Erro de Conexão",
        description: "Verifique sua conexão com a internet",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchItems();
  }, [currentCompany]);

  return {
    items,
    loading,
    fetchItems,
    addStockMovement,
    addItem,
    updateItem,
    deleteItem
  };
}
