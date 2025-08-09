
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { mockItems, getStandardListById, ListItem } from "@/data/mockData";

interface StandardListFormProps {
  listId?: string;
  onBack: () => void;
}

export function StandardListForm({ listId, onBack }: StandardListFormProps) {
  const { toast } = useToast();
  const isEdit = !!listId;
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  
  const [listItems, setListItems] = useState<ListItem[]>([]);

  // Load existing list data when editing
  useEffect(() => {
    if (isEdit && listId) {
      const existingList = getStandardListById(listId);
      if (existingList) {
        setFormData({
          name: existingList.name,
          description: existingList.description,
        });
        setListItems(existingList.items);
      }
    }
  }, [isEdit, listId]);
  const [newItem, setNewItem] = useState({
    itemId: "",
    quantity: "",
  });

  const handleAddItem = () => {
    if (!newItem.itemId || !newItem.quantity) {
      toast({
        title: "Erro",
        description: "Selecione um item e informe a quantidade.",
        variant: "destructive",
      });
      return;
    }

    const selectedItem = mockItems.find(item => item.id === newItem.itemId);
    if (!selectedItem) return;

    // Verifica se o item já está na lista
    const existingItemIndex = listItems.findIndex(item => item.itemId === newItem.itemId);
    
    if (existingItemIndex >= 0) {
      // Atualiza a quantidade do item existente
      const updatedItems = [...listItems];
      updatedItems[existingItemIndex].quantity += parseFloat(newItem.quantity);
      setListItems(updatedItems);
    } else {
      // Adiciona novo item à lista
      const newListItem: ListItem = {
        itemId: newItem.itemId,
        itemName: selectedItem.name,
        quantity: parseFloat(newItem.quantity),
        unit: selectedItem.unit,
      };
      setListItems([...listItems, newListItem]);
    }

    // Reset do formulário de item
    setNewItem({ itemId: "", quantity: "" });
  };

  const handleRemoveItem = (index: number) => {
    const updatedItems = listItems.filter((_, i) => i !== index);
    setListItems(updatedItems);
  };

  const handleUpdateItemQuantity = (index: number, newQuantity: number) => {
    const updatedItems = [...listItems];
    updatedItems[index].quantity = newQuantity;
    setListItems(updatedItems);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Erro",
        description: "O nome da lista é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    if (listItems.length === 0) {
      toast({
        title: "Erro", 
        description: "Adicione pelo menos um item à lista.",
        variant: "destructive",
      });
      return;
    }

    // Aqui será implementada a integração com Supabase
    toast({
      title: isEdit ? "Lista atualizada!" : "Lista criada!",
      description: `A lista "${formData.name}" foi ${isEdit ? 'atualizada' : 'criada'} com sucesso.`,
    });

    onBack();
  };

  const totalQuantity = listItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-semibold">
            {isEdit ? "Editar Lista Padrão" : "Nova Lista Padrão"}
          </h2>
          <p className="text-muted-foreground">
            {isEdit ? "Modifique os dados da lista" : "Crie uma nova ficha de baixa padrão"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações da Lista</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Lista *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Café da Manhã"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descreva o propósito desta lista"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Itens da Lista</span>
              <Badge variant="secondary">
                {listItems.length} itens • {totalQuantity.toFixed(1)} unidades total
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Formulário para adicionar item */}
            <div className="p-4 bg-muted/30 rounded-lg border">
              <h4 className="text-sm font-medium mb-3">Adicionar Item</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="item">Item</Label>
                  <Select
                    value={newItem.itemId}
                    onValueChange={(value) => setNewItem(prev => ({ ...prev, itemId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um item" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockItems.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name} ({item.unit})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantidade</Label>
                  <Input
                    id="quantity"
                    type="number"
                    step="0.1"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem(prev => ({ ...prev, quantity: e.target.value }))}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label>&nbsp;</Label>
                  <Button type="button" onClick={handleAddItem} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar
                  </Button>
                </div>
              </div>
            </div>

            {/* Lista de itens adicionados */}
            {listItems.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Itens Adicionados:</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {listItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-background border rounded-lg">
                      <div className="flex-1">
                        <span className="font-medium">{item.itemName}</span>
                        <span className="text-sm text-muted-foreground ml-2">
                          ({item.unit})
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          step="0.1"
                          value={item.quantity}
                          onChange={(e) => handleUpdateItemQuantity(index, parseFloat(e.target.value) || 0)}
                          className="w-20 text-center"
                        />
                        <span className="text-sm text-muted-foreground min-w-fit">
                          {item.unit}
                        </span>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveItem(index)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-3">
          <Button type="button" variant="outline" onClick={onBack}>
            Cancelar
          </Button>
          <Button type="submit">
            {isEdit ? "Atualizar Lista" : "Criar Lista"}
          </Button>
        </div>
      </form>
    </div>
  );
}
