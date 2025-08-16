import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSupabaseCategories } from "@/hooks/useSupabaseCategories";
import { useSupabaseUnits } from "@/hooks/useSupabaseUnits";
import { useSupabaseItems } from "@/hooks/useSupabaseItems";
import { useToast } from "@/hooks/use-toast";

interface NewItemFormProps {
  initialDescription?: string;
  onSuccess?: (itemId: string, itemName: string) => void;
  onCancel?: () => void;
}

export function NewItemForm({ initialDescription = "", onSuccess, onCancel }: NewItemFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: initialDescription,
    categoryId: "",
    unitId: "",
    minimumStock: 1,
    currentStock: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { categories } = useSupabaseCategories();
  const { units } = useSupabaseUnits();
  const { addItem } = useSupabaseItems();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, informe o nome do item",
        variant: "destructive"
      });
      return;
    }

    if (!formData.categoryId) {
      toast({
        title: "Categoria obrigatória",
        description: "Por favor, selecione uma categoria",
        variant: "destructive"
      });
      return;
    }

    if (!formData.unitId) {
      toast({
        title: "Unidade obrigatória", 
        description: "Por favor, selecione uma unidade",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Cadastra o item real no Supabase
      const success = await addItem({
        name: formData.name.trim(),
        category_id: formData.categoryId,
        unit_id: formData.unitId,
        current_stock: formData.currentStock,
        minimum_stock: formData.minimumStock,
        expiry_date: null
      });

      if (success) {
        // Busca o item recém-criado para obter o ID real
        // Como o addItem não retorna o ID, vamos usar um identificador temporário
        // e o InvoiceManager vai atualizar a lista de itens
        const tempId = `temp-${Date.now()}`;
        onSuccess?.(tempId, formData.name.trim());
      }
    } catch (error) {
      console.error('Erro ao cadastrar item:', error);
      toast({
        title: "Erro ao cadastrar item",
        description: "Ocorreu um erro ao cadastrar o item. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Nome do Item *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Digite o nome do item"
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Descrição detalhada do item"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="category">Categoria *</Label>
          <Select
            value={formData.categoryId}
            onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="unit">Unidade *</Label>
          <Select
            value={formData.unitId}
            onValueChange={(value) => setFormData(prev => ({ ...prev, unitId: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma unidade" />
            </SelectTrigger>
            <SelectContent>
              {units.map((unit) => (
                <SelectItem key={unit.id} value={unit.id}>
                  {unit.name} ({unit.abbreviation})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="minimumStock">Estoque Mínimo</Label>
          <Input
            id="minimumStock"
            type="number"
            min="0"
            value={formData.minimumStock}
            onChange={(e) => setFormData(prev => ({ ...prev, minimumStock: Number(e.target.value) }))}
          />
        </div>

        <div>
          <Label htmlFor="currentStock">Estoque Atual</Label>
          <Input
            id="currentStock"
            type="number"
            min="0"
            value={formData.currentStock}
            onChange={(e) => setFormData(prev => ({ ...prev, currentStock: Number(e.target.value) }))}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Cadastrando..." : "Cadastrar Item"}
        </Button>
      </div>
    </form>
  );
}