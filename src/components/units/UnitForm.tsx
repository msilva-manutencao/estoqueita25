
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSupabaseUnitsCRUD, UnitFormData } from "@/hooks/useSupabaseUnitsCRUD";
import { SupabaseUnit } from "@/hooks/useSupabaseUnits";

interface UnitFormProps {
  unit?: SupabaseUnit;
  onSuccess: () => void;
  onCancel: () => void;
}

export function UnitForm({ unit, onSuccess, onCancel }: UnitFormProps) {
  const { addUnit, updateUnit, operationLoading } = useSupabaseUnitsCRUD();
  
  const [formData, setFormData] = useState<UnitFormData>({
    name: "",
    abbreviation: ""
  });

  useEffect(() => {
    if (unit) {
      setFormData({
        name: unit.name,
        abbreviation: unit.abbreviation
      });
    }
  }, [unit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.abbreviation.trim()) {
      return;
    }

    const success = unit 
      ? await updateUnit(unit.id, formData)
      : await addUnit(formData);

    if (success) {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome da Unidade</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          placeholder="Ex: Quilograma, Metro, Litro"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="abbreviation">Abreviação</Label>
        <Input
          id="abbreviation"
          value={formData.abbreviation}
          onChange={(e) => setFormData({...formData, abbreviation: e.target.value})}
          placeholder="Ex: kg, m, l"
          required
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={operationLoading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={operationLoading}>
          {operationLoading ? "Salvando..." : unit ? "Atualizar" : "Criar"}
        </Button>
      </div>
    </form>
  );
}
