
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSupabaseCategoriesCRUD, CategoryFormData } from "@/hooks/useSupabaseCategoriesCRUD";
import { SupabaseCategory } from "@/hooks/useSupabaseCategories";

interface CategoryFormProps {
  category?: SupabaseCategory;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CategoryForm({ category, onSuccess, onCancel }: CategoryFormProps) {
  const { addCategory, updateCategory, operationLoading } = useSupabaseCategoriesCRUD();
  
  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    description: ""
  });

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description || ""
      });
    }
  }, [category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      return;
    }

    const success = category 
      ? await updateCategory(category.id, formData)
      : await addCategory(formData);

    if (success) {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome da Categoria</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          placeholder="Digite o nome da categoria"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição (opcional)</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          placeholder="Digite uma descrição para a categoria"
          rows={3}
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={operationLoading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={operationLoading}>
          {operationLoading ? "Salvando..." : category ? "Atualizar" : "Criar"}
        </Button>
      </div>
    </form>
  );
}
