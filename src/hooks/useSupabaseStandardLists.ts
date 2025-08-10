
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface SupabaseStandardList {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  items: SupabaseStandardListItem[];
}

export interface SupabaseStandardListItem {
  id: string;
  item_id: string;
  quantity: number;
  standard_list_id: string;
  created_at: string;
  items?: {
    name: string;
    units?: {
      name: string;
      abbreviation: string;
    };
    current_stock: number;
  };
}

export function useSupabaseStandardLists() {
  const [standardLists, setStandardLists] = useState<SupabaseStandardList[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchStandardLists = async () => {
    try {
      setLoading(true);
      console.log('Buscando listas padrão no Supabase...');
      
      const { data: lists, error } = await supabase
        .from('standard_lists')
        .select(`
          *,
          standard_list_items (
            *,
            items (
              name,
              current_stock,
              units (
                name,
                abbreviation
              )
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar listas padrão:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as listas padrão",
          variant: "destructive",
        });
        return;
      }

      console.log('Listas padrão carregadas:', lists);
      
      const formattedLists = lists?.map(list => ({
        ...list,
        items: list.standard_list_items || []
      })) || [];
      
      setStandardLists(formattedLists);
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

  const createStandardList = async (listData: {
    name: string;
    description?: string;
    items: Array<{ item_id: string; quantity: number }>;
  }) => {
    try {
      console.log('Criando lista padrão:', listData);

      // Criar a lista
      const { data: list, error: listError } = await supabase
        .from('standard_lists')
        .insert({
          name: listData.name,
          description: listData.description
        })
        .select()
        .single();

      if (listError) {
        console.error('Erro ao criar lista:', listError);
        toast({
          title: "Erro",
          description: "Não foi possível criar a lista",
          variant: "destructive",
        });
        return false;
      }

      // Adicionar os itens da lista
      if (listData.items.length > 0) {
        const { error: itemsError } = await supabase
          .from('standard_list_items')
          .insert(
            listData.items.map(item => ({
              standard_list_id: list.id,
              item_id: item.item_id,
              quantity: item.quantity
            }))
          );

        if (itemsError) {
          console.error('Erro ao adicionar itens à lista:', itemsError);
          toast({
            title: "Erro",
            description: "Lista criada mas houve erro ao adicionar itens",
            variant: "destructive",
          });
          return false;
        }
      }

      toast({
        title: "Sucesso",
        description: "Lista padrão criada com sucesso",
      });

      await fetchStandardLists();
      return true;
    } catch (error) {
      console.error('Erro na conexão:', error);
      return false;
    }
  };

  const deleteStandardList = async (listId: string) => {
    try {
      // Primeiro deletar os itens da lista
      const { error: itemsError } = await supabase
        .from('standard_list_items')
        .delete()
        .eq('standard_list_id', listId);

      if (itemsError) {
        console.error('Erro ao deletar itens da lista:', itemsError);
        toast({
          title: "Erro",
          description: "Não foi possível deletar os itens da lista",
          variant: "destructive",
        });
        return false;
      }

      // Depois deletar a lista
      const { error: listError } = await supabase
        .from('standard_lists')
        .delete()
        .eq('id', listId);

      if (listError) {
        console.error('Erro ao deletar lista:', listError);
        toast({
          title: "Erro",
          description: "Não foi possível deletar a lista",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Sucesso",
        description: "Lista removida com sucesso",
      });

      await fetchStandardLists();
      return true;
    } catch (error) {
      console.error('Erro na conexão:', error);
      return false;
    }
  };

  const executeBulkWithdraw = async (listId: string) => {
    try {
      console.log('Executando baixa em lote para lista:', listId);

      const list = standardLists.find(l => l.id === listId);
      if (!list) {
        toast({
          title: "Erro",
          description: "Lista não encontrada",
          variant: "destructive",
        });
        return false;
      }

      // Verificar estoque disponível para todos os itens
      const insufficientItems: string[] = [];
      
      for (const item of list.items) {
        if (item.items && item.items.current_stock < item.quantity) {
          insufficientItems.push(`${item.items.name} (disponível: ${item.items.current_stock}, necessário: ${item.quantity})`);
        }
      }

      if (insufficientItems.length > 0) {
        toast({
          title: "Estoque Insuficiente",
          description: `Itens com estoque insuficiente: ${insufficientItems.join(', ')}`,
          variant: "destructive",
        });
        return false;
      }

      // Executar as movimentações de saída
      const movements = list.items.map(item => ({
        item_id: item.item_id,
        quantity: item.quantity,
        movement_type: 'saida' as const,
        description: `Baixa em lote - Lista: ${list.name}`
      }));

      const { error } = await supabase
        .from('stock_movements')
        .insert(movements);

      if (error) {
        console.error('Erro ao registrar movimentações:', error);
        toast({
          title: "Erro",
          description: "Não foi possível registrar as movimentações",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Sucesso",
        description: `Baixa em lote realizada! ${list.items.length} itens processados.`,
      });

      return true;
    } catch (error) {
      console.error('Erro na conexão:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchStandardLists();
  }, []);

  return {
    standardLists,
    loading,
    fetchStandardLists,
    createStandardList,
    deleteStandardList,
    executeBulkWithdraw
  };
}
