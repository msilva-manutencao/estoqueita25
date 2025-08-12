
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseCategories } from "@/hooks/useSupabaseCategories";
import { useSupabaseUnits } from "@/hooks/useSupabaseUnits";
import { useSupabaseItems } from "@/hooks/useSupabaseItems";

interface EditItemFormProps {
  item: any;
  onSave: (item: any) => void;
  onCancel: () => void;
}

export function EditItemForm({ item, onSave, onCancel }: EditItemFormProps) {
  const { categories } = useSupabaseCategories();
  const { units } = useSupabaseUnits();
  const { updateItem } = useSupabaseItems();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    category_id: "",
    unit_id: "",
    current_stock: 0,
    minimum_stock: 10,
    expiry_date: ""
  });

  // Inicializar dados do formulário quando o item ou as listas mudarem
  useEffect(() => {
    if (item && categories.length > 0 && units.length > 0) {
      console.log('Configurando formulário com item:', item);
      console.log('Categorias disponíveis:', categories);
      console.log('Unidades disponíveis:', units);

      // Encontrar IDs corretos baseado nos dados do item
      let categoryId = "";
      let unitId = "";

      // Se o item já tem category_id e unit_id, usar diretamente
      if (item.category_id) {
        categoryId = item.category_id;
      } else if (item.categories?.name) {
        // Buscar por nome da categoria
        const foundCategory = categories.find(cat => cat.name === item.categories.name);
        categoryId = foundCategory?.id || "";
      }

      if (item.unit_id) {
        unitId = item.unit_id;
      } else if (item.units?.abbreviation || item.units?.name) {
        // Buscar por abreviação ou nome da unidade
        const foundUnit = units.find(unit => 
          unit.abbreviation === item.units?.abbreviation || 
          unit.name === item.units?.name
        );
        unitId = foundUnit?.id || "";
      }

      console.log('IDs encontrados:', { categoryId, unitId });

      setFormData({
        id: item.id,
        name: item.name,
        category_id: categoryId,
        unit_id: unitId,
        current_stock: Number(item.current_stock),
        minimum_stock: Number(item.minimum_stock) || 10,
        expiry_date: item.expiry_date || ""
      });
    }
  }, [item, categories, units]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Dados do formulário antes da validação:', formData);

    if (!formData.name.trim()) {
      toast({
        title: "Erro",
        description: "Nome do item é obrigatório",
        variant: "destructive"
      });
      return;
    }

    if (!formData.category_id) {
      toast({
        title: "Erro",
        description: "Categoria é obrigatória",
        variant: "destructive"
      });
      return;
    }

    if (!formData.unit_id) {
      toast({
        title: "Erro",
        description: "Unidade é obrigatória",
        variant: "destructive"
      });
      return;
    }

    if (formData.current_stock < 0) {
      toast({
        title: "Erro", 
        description: "Quantidade não pode ser negativa",
        variant: "destructive"
      });
      return;
    }

    const updateData = {
      name: formData.name.trim(),
      category_id: formData.category_id,
      unit_id: formData.unit_id,
      current_stock: formData.current_stock,
      minimum_stock: formData.minimum_stock,
      expiry_date: formData.expiry_date || null
    };

    console.log('Enviando dados para atualização:', updateData);

    const success = await updateItem(formData.id, updateData);

    if (success) {
      onSave(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome do Item</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          placeholder="Digite o nome do item"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Categoria</Label>
          <Select value={formData.category_id} onValueChange={(value) => setFormData({...formData, category_id: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a categoria" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="unit">Unidade</Label>
          <Select value={formData.unit_id} onValueChange={(value) => setFormData({...formData, unit_id: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a unidade" />
            </SelectTrigger>
            <SelectContent>
              {units.map(unit => (
                <SelectItem key={unit.id} value={unit.id}>
                  {unit.name} ({unit.abbreviation})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="currentStock">Quantidade em Estoque</Label>
          <Input
            id="currentStock"
            type="number"
            value={formData.current_stock}
            onChange={(e) => setFormData({...formData, current_stock: Number(e.target.value)})}
            min="0"
            step="0.1"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="minimumStock">Estoque Mínimo</Label>
          <Input
            id="minimumStock"
            type="number"
            value={formData.minimum_stock}
            onChange={(e) => setFormData({...formData, minimum_stock: Number(e.target.value)})}
            min="0"
            step="0.1"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="expiryDate">Data de Validade</Label>
        <Input
          id="expiryDate"
          type="date"
          value={formData.expiry_date}
          onChange={(e) => setFormData({...formData, expiry_date: e.target.value})}
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          Salvar Alterações
        </Button>
      </div>
    </form>
  );
}
