
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseUnits } from "./useSupabaseUnits";
import { useCurrentCompany } from "./useCurrentCompany";

export interface UnitFormData {
  name: string;
  abbreviation: string;
}

export function useSupabaseUnitsCRUD() {
  const { units, loading, fetchUnits } = useSupabaseUnits();
  const [operationLoading, setOperationLoading] = useState(false);
  const { toast } = useToast();
  const { currentCompany } = useCurrentCompany();

  const addUnit = async (unitData: UnitFormData) => {
    if (!currentCompany) return false;

    try {
      setOperationLoading(true);
      console.log('Inserindo nova unidade:', unitData);
      
      const { data, error } = await supabase
        .from('units')
        .insert({
          ...unitData,
          company_id: currentCompany.id
        })
        .select();

      if (error) {
        console.error('Erro ao adicionar unidade:', error);
        toast({
          title: "Erro",
          description: `Não foi possível adicionar a unidade: ${error.message}`,
          variant: "destructive",
        });
        return false;
      }

      console.log('Unidade inserida com sucesso:', data);
      
      toast({
        title: "Sucesso",
        description: "Unidade adicionada com sucesso",
      });

      await fetchUnits();
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

  const updateUnit = async (unitId: string, unitData: UnitFormData) => {
    try {
      setOperationLoading(true);
      console.log('Atualizando unidade:', { unitId, unitData });
      
      const { error } = await supabase
        .from('units')
        .update(unitData)
        .eq('id', unitId);

      if (error) {
        console.error('Erro ao atualizar unidade:', error);
        toast({
          title: "Erro",
          description: `Não foi possível atualizar a unidade: ${error.message}`,
          variant: "destructive",
        });
        return false;
      }

      console.log('Unidade atualizada com sucesso');
      
      toast({
        title: "Sucesso",
        description: "Unidade atualizada com sucesso",
      });

      await fetchUnits();
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

  const deleteUnit = async (unitId: string) => {
    try {
      setOperationLoading(true);
      console.log('Excluindo unidade:', unitId);
      
      const { error } = await supabase
        .from('units')
        .delete()
        .eq('id', unitId);

      if (error) {
        console.error('Erro ao excluir unidade:', error);
        toast({
          title: "Erro",
          description: `Não foi possível excluir a unidade: ${error.message}`,
          variant: "destructive",
        });
        return false;
      }

      console.log('Unidade excluída com sucesso');
      
      toast({
        title: "Sucesso",
        description: "Unidade excluída com sucesso",
      });

      await fetchUnits();
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
    units,
    loading,
    operationLoading,
    addUnit,
    updateUnit,
    deleteUnit,
    fetchUnits
  };
}
