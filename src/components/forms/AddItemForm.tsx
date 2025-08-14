
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSupabaseCategories } from "@/hooks/useSupabaseCategories";
import { useSupabaseUnits } from "@/hooks/useSupabaseUnits";
import { useSupabaseItems } from "@/hooks/useSupabaseItems";
import { useToast } from "@/hooks/use-toast";
import { QuantityInput } from "@/components/ui/quantity-input";
import { ItemNameInput } from "./ItemNameInput";

export function AddItemForm() {
  const [formData, setFormData] = useState({
    name: "",
    category_id: "",
    unit_id: "",
    current_stock: 0,
    minimum_stock: 0,
    expiry_date: "",
  });

  const { categories } = useSupabaseCategories();
  const { units } = useSupabaseUnits();
  const { addItem } = useSupabaseItems();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category_id || !formData.unit_id) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    const success = await addItem({
      ...formData,
      expiry_date: formData.expiry_date || null,
    });

    if (success) {
      setFormData({
        name: "",
        category_id: "",
        unit_id: "",
        current_stock: 0,
        minimum_stock: 0,
        expiry_date: "",
      });
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Adicionar Novo Item</CardTitle>
        <CardDescription>
          Adicione um novo item ao estoque do sistema.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Item *</Label>
              <ItemNameInput
                value={formData.name}
                onChange={(value) => setFormData({ ...formData, name: value })}
                placeholder="Digite o nome do item"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria *</Label>
              <Select 
                value={formData.category_id} 
                onValueChange={(value) => setFormData({ ...formData, category_id: value })}
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

            <div className="space-y-2">
              <Label htmlFor="unit">Unidade *</Label>
              <Select 
                value={formData.unit_id} 
                onValueChange={(value) => setFormData({ ...formData, unit_id: value })}
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

            <div className="space-y-2">
              <Label htmlFor="expiry_date">Data de Vencimento</Label>
              <Input
                id="expiry_date"
                type="date"
                value={formData.expiry_date}
                onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="current_stock">Estoque Atual *</Label>
              <QuantityInput
                value={formData.current_stock}
                onChange={(value) => setFormData({ ...formData, current_stock: value })}
                min={0}
                step={0.5}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="minimum_stock">Estoque Mínimo</Label>
              <QuantityInput
                value={formData.minimum_stock}
                onChange={(value) => setFormData({ ...formData, minimum_stock: value })}
                min={0}
                step={0.5}
              />
            </div>
          </div>

          <Button type="submit" className="w-full">
            Adicionar Item
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
