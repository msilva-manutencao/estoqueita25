
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSupabaseCategories } from '@/hooks/useSupabaseCategories';
import { useSupabaseUnits } from '@/hooks/useSupabaseUnits';
import { useSupabaseItems } from '@/hooks/useSupabaseItems';
import { useCurrentCompany } from '@/hooks/useCurrentCompany';
import { ItemNameInput } from './ItemNameInput';
import { toast } from 'sonner';

interface AddItemFormProps {
  onSuccess?: () => void;
}

export const AddItemForm = ({ onSuccess }: AddItemFormProps) => {
  const [itemData, setItemData] = useState({
    name: '',
    category_id: '',
    unit_id: '',
    minimum_stock: 10,
    current_stock: 0,
    expiry_date: '',
  });

  const { categories } = useSupabaseCategories();
  const { units } = useSupabaseUnits();
  const { addItem, loading } = useSupabaseItems();
  const { currentCompany } = useCurrentCompany();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentCompany) {
      toast.error('Selecione uma empresa');
      return;
    }

    if (!itemData.name.trim()) {
      toast.error('Nome do item é obrigatório');
      return;
    }

    if (!itemData.category_id) {
      toast.error('Categoria é obrigatória');
      return;
    }

    if (!itemData.unit_id) {
      toast.error('Unidade é obrigatória');
      return;
    }

    const success = await addItem({
      ...itemData,
      name: itemData.name.trim(),
      company_id: currentCompany.id,
      expiry_date: itemData.expiry_date || null,
    });

    if (success) {
      setItemData({
        name: '',
        category_id: '',
        unit_id: '',
        minimum_stock: 10,
        current_stock: 0,
        expiry_date: '',
      });
      onSuccess?.();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Nome do Item</Label>
        <ItemNameInput
          value={itemData.name}
          onChange={(value) => setItemData({ ...itemData, name: value })}
          placeholder="Digite o nome do item"
        />
      </div>

      <div>
        <Label htmlFor="category">Categoria</Label>
        <Select 
          value={itemData.category_id} 
          onValueChange={(value) => setItemData({ ...itemData, category_id: value })}
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
        <Label htmlFor="unit">Unidade</Label>
        <Select 
          value={itemData.unit_id} 
          onValueChange={(value) => setItemData({ ...itemData, unit_id: value })}
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

      <div>
        <Label htmlFor="minimum_stock">Estoque Mínimo</Label>
        <Input
          id="minimum_stock"
          type="number"
          min="0"
          step="0.01"
          value={itemData.minimum_stock}
          onChange={(e) => setItemData({ ...itemData, minimum_stock: parseFloat(e.target.value) || 0 })}
        />
      </div>

      <div>
        <Label htmlFor="current_stock">Quantidade Inicial de Estoque</Label>
        <Input
          id="current_stock"
          type="number"
          min="0"
          step="0.01"
          value={itemData.current_stock}
          onChange={(e) => setItemData({ ...itemData, current_stock: parseFloat(e.target.value) || 0 })}
        />
      </div>

      <div>
        <Label htmlFor="expiry_date">Data de Validade (opcional)</Label>
        <Input
          id="expiry_date"
          type="date"
          value={itemData.expiry_date}
          onChange={(e) => setItemData({ ...itemData, expiry_date: e.target.value })}
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Adicionando...' : 'Adicionar Item'}
      </Button>
    </form>
  );
};
