
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseCategories } from "@/hooks/useSupabaseCategories";
import { useSupabaseUnits } from "@/hooks/useSupabaseUnits";
import { useSupabaseItems } from "@/hooks/useSupabaseItems";

export function AddItemForm() {
  const { toast } = useToast();
  const { categories, loading: categoriesLoading } = useSupabaseCategories();
  const { units, loading: unitsLoading } = useSupabaseUnits();
  const { addItem } = useSupabaseItems();
  
  const [formData, setFormData] = useState({
    name: "",
    category_id: "",
    quantity: "",
    unit_id: "",
    minimum_stock: "",
    expiryDate: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category_id || !formData.quantity || !formData.unit_id) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const itemData = {
        name: formData.name.trim(),
        category_id: formData.category_id,
        unit_id: formData.unit_id,
        current_stock: parseFloat(formData.quantity),
        minimum_stock: formData.minimum_stock ? parseFloat(formData.minimum_stock) : 10,
        expiry_date: formData.expiryDate || null,
      };

      console.log('Dados do item a ser cadastrado:', itemData);

      const success = await addItem(itemData);

      if (success) {
        // Reset form
        setFormData({
          name: "",
          category_id: "",
          quantity: "",
          unit_id: "",
          minimum_stock: "",
          expiryDate: "",
        });
      }
    } catch (error) {
      console.error('Erro ao cadastrar item:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao cadastrar o item. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (categoriesLoading || unitsLoading) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="p-6">
          <div className="text-center">Carregando...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Cadastrar Novo Item</CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Item *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Arroz branco"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria *</Label>
            <Select 
              value={formData.category_id} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a categoria" />
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantidade Inicial *</Label>
              <Input
                id="quantity"
                type="number"
                step="0.01"
                min="0"
                value={formData.quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                placeholder="0"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unidade *</Label>
              <Select 
                value={formData.unit_id} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, unit_id: value }))}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Unidade" />
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

          <div className="space-y-2">
            <Label htmlFor="minimum_stock">Estoque Mínimo</Label>
            <Input
              id="minimum_stock"
              type="number"
              step="0.01"
              min="0"
              value={formData.minimum_stock}
              onChange={(e) => setFormData(prev => ({ ...prev, minimum_stock: e.target.value }))}
              placeholder="10"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiryDate">Data de Vencimento</Label>
            <Input
              id="expiryDate"
              type="date"
              value={formData.expiryDate}
              onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
              disabled={isSubmitting}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Cadastrando..." : "Cadastrar Item"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
