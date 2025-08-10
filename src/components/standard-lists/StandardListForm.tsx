
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseItems } from "@/hooks/useSupabaseItems";
import { useSupabaseStandardLists } from "@/hooks/useSupabaseStandardLists";

interface ListItem {
  itemId: string;
  itemName: string;
  quantity: number;
  unit: string;
}

interface StandardListFormProps {
  listId?: string;
  onBack: () => void;
}

export function StandardListForm({ listId, onBack }: StandardListFormProps) {
  const { toast } = useToast();
  const { items, loading: itemsLoading } = useSupabaseItems();
  const { standardLists, createStandardList, loading: listsLoading } = useSupabaseStandardLists();
  const isEdit = !!listId;
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  
  const [listItems, setListItems] = useState<ListItem[]>([]);
  const [newItem, setNewItem] = useState({
    itemId: "",
    quantity: "",
  });

  // Load existing list data when editing
  useEffect(() => {
    if (isEdit && listId) {
      const existingList = standardLists.find(list => list.id === listId);
      if (existingList) {
        setFormData({
          name: existingList.name,
          description: existingList.description || "",
        });
        
        // Convert existing items
        const convertedItems = existingList.items.map(item => ({
          itemId: item.item_id,
          itemName: item.items?.name || 'Item não encontrado',
          quantity: item.quantity,
          unit: item.items?.units?.abbreviation || item.items?.units?.name || 'un',
        }));
        setListItems(convertedItems);
      }
    }
  }, [isEdit, listId, standardLists]);

  const handleAddItem = () => {
    if (!newItem.itemId || !newItem.quantity) {
      toast({
        title: "Erro",
        description: "Selecione um item e informe a quantidade.",
        variant: "destructive",
      });
      return;
    }

    const selectedItem = items.find(item => item.id === newItem.itemId);
    if (!selectedItem) return;

    // Verifica se o item já está na lista
    const existingItemIndex = listItems.findIndex(item => item.itemId === newItem.itemId);
    
    if (existingItemIndex >= 0) {
      // Atualiza a quantidade do item existente
      const updatedItems = [...listItems];
      updatedItems[existingItemIndex].quantity += parseFloat(newItem.quantity);
      setListItems(updatedItems);

      toast({
        title: "Item atualizado",
        description: `Quantidade do item "${selectedItem.name}" foi atualizada.`,
      });
    } else {
      // Adiciona novo item à lista
      const newListItem: ListItem = {
        itemId: newItem.itemId,
        itemName: selectedItem.name,
        quantity: parseFloat(newItem.quantity),
        unit: selectedItem.units?.abbreviation || selectedItem.units?.name || 'un',
      };
      setListItems([...listItems, newListItem]);

      toast({
        title: "Item adicionado",
        description: `Item "${selectedItem.name}" adicionado à lista.`,
      });
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

  const handleSubmit = async (e: React.FormEvent) => {
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

    const listData = {
      name: formData.name,
      description: formData.description,
      items: listItems.map(item => ({
        item_id: item.itemId,
        quantity: item.quantity
      }))
    };

    const success = await createStandardList(listData);
    
    if (success) {
      onBack();
    }
  };

  const totalQuantity = listItems.reduce((total, item) => total + item.quantity, 0);

  // Filter items that have stock > 0
  const availableItems = items.filter(item => item.current_stock > 0);

  if (itemsLoading || listsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

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
              <h4 className="text-sm font-medium mb-3">Adicionar Item do Estoque</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="item">Item Disponível</Label>
                  <Select
                    value={newItem.itemId}
                    onValueChange={(value) => setNewItem(prev => ({ ...prev, itemId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um item do estoque" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableItems.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name} ({item.units?.abbreviation || item.units?.name || 'un'}) - Estoque: {item.current_stock}
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
              
              {availableItems.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  <p>Nenhum item com estoque disponível.</p>
                  <p className="text-sm">Adicione itens ao estoque antes de criar listas padrão.</p>
                </div>
              )}
            </div>

            {/* Lista de itens adicionados */}
            {listItems.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Itens Adicionados:</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {listItems.map((item, index) => {
                    const stockItem = items.find(i => i.id === item.itemId);
                    const currentStock = stockItem?.current_stock || 0;
                    const isOverStock = item.quantity > currentStock;
                    
                    return (
                      <div key={index} className="flex items-center justify-between p-3 bg-background border rounded-lg">
                        <div className="flex-1">
                          <span className="font-medium">{item.itemName}</span>
                          <span className="text-sm text-muted-foreground ml-2">
                            ({item.unit})
                          </span>
                          <div className="text-xs text-muted-foreground">
                            Estoque disponível: {currentStock} {item.unit}
                            {isOverStock && (
                              <span className="text-destructive ml-2">⚠️ Quantidade acima do estoque!</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Input
                            type="number"
                            step="0.1"
                            value={item.quantity}
                            onChange={(e) => handleUpdateItemQuantity(index, parseFloat(e.target.value) || 0)}
                            className={`w-20 text-center ${isOverStock ? 'border-destructive' : ''}`}
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
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-3">
          <Button type="button" variant="outline" onClick={onBack}>
            Cancelar
          </Button>
          <Button type="submit" disabled={listItems.length === 0}>
            {isEdit ? "Atualizar Lista" : "Criar Lista"}
          </Button>
        </div>
      </form>
    </div>
  );
}
