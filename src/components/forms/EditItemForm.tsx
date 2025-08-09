import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { categories, units } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";

interface EditItemFormProps {
  item: any;
  onSave: (item: any) => void;
  onCancel: () => void;
}

export function EditItemForm({ item, onSave, onCancel }: EditItemFormProps) {
  const [formData, setFormData] = useState({
    id: item.id,
    name: item.name,
    category: item.category,
    unit: item.unit,
    currentStock: item.currentStock,
    expiryDate: item.expiryDate || ""
  });
  
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Erro",
        description: "Nome do item é obrigatório",
        variant: "destructive"
      });
      return;
    }

    if (formData.currentStock < 0) {
      toast({
        title: "Erro", 
        description: "Quantidade não pode ser negativa",
        variant: "destructive"
      });
      return;
    }

    onSave(formData);
    toast({
      title: "Sucesso",
      description: "Item atualizado com sucesso!",
      variant: "default"
    });
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
          <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.filter(cat => cat !== "Todos").map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="unit">Unidade</Label>
          <Select value={formData.unit} onValueChange={(value) => setFormData({...formData, unit: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {units.map(unit => (
                <SelectItem key={unit} value={unit}>
                  {unit}
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
            value={formData.currentStock}
            onChange={(e) => setFormData({...formData, currentStock: Number(e.target.value)})}
            min="0"
            step="0.1"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="expiryDate">Data de Validade</Label>
          <Input
            id="expiryDate"
            type="date"
            value={formData.expiryDate}
            onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
          />
        </div>
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