
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseCategories } from "./useSupabaseCategories";

export interface CategoryFormData {
  name: string;
  description?: string;
}

export function useSupabaseCategoriesCRUD() {
  const { categories, loading, fetchCategories } = useSupabaseCategories();
  const [operationLoading, setOperationLoading] = useState(false);
  const { toast } = useToast();

  const addCategory = async (categoryData: CategoryFormData) => {
    try {
      setOperationLoading(true);
      console.log('Inserindo nova categoria:', categoryData);
      
      const { data, error } = await supabase
        .from('categories')
        .insert(categoryData)
        .select();

      if (error) {
        console.error('Erro ao adicionar categoria:', error);
        toast({
          title: "Erro",
          description: `Não foi possível adicionar a categoria: ${error.message}`,
          variant: "destructive",
        });
        return false;
      }

      console.log('Categoria inserida com sucesso:', data);
      
      toast({
        title: "Sucesso",
        description: "Categoria adicionada com sucesso",
      });

      await fetchCategories();
      return true;
    } catch (error) {
      console.error('Erro na conexão:', error);
      toast({
        title: "Erro de Conexão",
        description: "Verifique sua conexão com a internet",
        variant: "destructive",
      });
      return false;
    } finally {
      setOperationLoading(false);
    }
  };

  const updateCategory = async (categoryId: string, categoryData: CategoryFormData) => {
    try {
      setOperationLoading(true);
      console.log('Atualizando categoria:', { categoryId, categoryData });
      
      const { error } = await supabase
        .from('categories')
        .update(categoryData)
        .eq('id', categoryId);

      if (error) {
        console.error('Erro ao atualizar categoria:', error);
        toast({
          title: "Erro",
          description: `Não foi possível atualizar a categoria: ${error.message}`,
          variant: "destructive",
        });
        return false;
      }

      console.log('Categoria atualizada com sucesso');
      
      toast({
        title: "Sucesso",
        description: "Categoria atualizada com sucesso",
      });

      await fetchCategories();
      return true;
    } catch (error) {
      console.error('Erro na conexão:', error);
      toast({
        title: "Erro de Conexão",
        description: "Verifique sua conexão com a internet",
        variant: "destructive",
      });
      return false;
    } finally {
      setOperationLoading(false);
    }
  };

  const deleteCategory = async (categoryId: string) => {
    try {
      setOperationLoading(true);
      console.log('Excluindo categoria:', categoryId);
      
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

      if (error) {
        console.error('Erro ao excluir categoria:', error);
        toast({
          title: "Erro",
          description: `Não foi possível excluir a categoria: ${error.message}`,
          variant: "destructive",
        });
        return false;
      }

      console.log('Categoria excluída com sucesso');
      
      toast({
        title: "Sucesso",
        description: "Categoria excluída com sucesso",
      });

      await fetchCategories();
      return true;
    } catch (error) {
      console.error('Erro na conexão:', error);
      toast({
        title: "Erro de Conexão",
        description: "Verifique sua conexão com a internet",
        variant: "destructive",
      });
      return false;
    } finally {
      setOperationLoading(false);
    }
  };

  return {
    categories,
    loading,
    operationLoading,
    addCategory,
    updateCategory,
    deleteCategory,
    fetchCategories
  };
}
