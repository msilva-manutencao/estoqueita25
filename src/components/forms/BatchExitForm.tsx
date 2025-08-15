
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSupabaseItems } from "@/hooks/useSupabaseItems";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus, AlertTriangle } from "lucide-react";
import { QuantityInput } from "@/components/ui/quantity-input";

interface BatchItem {
  id: string;
  itemId: string;
  quantity: number;
}

export function BatchExitForm() {
  const [batchItems, setBatchItems] = useState<BatchItem[]>([]);
  const [description, setDescription] = useState("");

  const { items, addStockMovement } = useSupabaseItems();
  const { toast } = useToast();

  const addBatchItem = () => {
    setBatchItems(prev => [...prev, {
      id: Math.random().toString(),
      itemId: "",
      quantity: 1
    }]);
  };

  const removeBatchItem = (id: string) => {
    setBatchItems(prev => prev.filter(item => item.id !== id));
  };

  const updateBatchItem = (id: string, field: 'itemId' | 'quantity', value: string | number) => {
    setBatchItems(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const getStockValidation = () => {
    return batchItems.map(batchItem => {
      const selectedItem = items.find(item => item.id === batchItem.itemId);
      return {
        ...batchItem,
        selectedItem,
        isStockInsufficient: selectedItem ? batchItem.quantity > selectedItem.current_stock : false
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (batchItems.length === 0) {
      toast({
        title: "Erro",
        description: "Adicione pelo menos um item",
        variant: "destructive",
        duration: 2000,
      });
      return;
    }

    const validationResults = getStockValidation();
    const invalidItems = validationResults.filter(item => !item.itemId || item.quantity <= 0);
    const insufficientStock = validationResults.filter(item => item.isStockInsufficient);

    if (invalidItems.length > 0) {
      toast({
        title: "Erro",
        description: "Todos os itens devem ter um produto selecionado e quantidade válida",
        variant: "destructive",
        duration: 2000,
      });
      return;
    }

    if (insufficientStock.length > 0) {
      toast({
        title: "Estoque Insuficiente",
        description: `${insufficientStock.length} item(ns) não possuem estoque suficiente`,
        variant: "destructive",
        duration: 2000,
      });
      return;
    }

    let successCount = 0;
    
    for (const batchItem of batchItems) {
      const selectedItem = items.find(item => item.id === batchItem.itemId);
      const success = await addStockMovement(
        batchItem.itemId,
        batchItem.quantity,
        'saida',
        description || `Saída em lote - ${batchItem.quantity} ${selectedItem?.units?.abbreviation || 'un'}`
      );
      
      if (success) {
        successCount++;
      }
    }

    if (successCount === batchItems.length) {
      setBatchItems([]);
      setDescription("");
      toast({
        title: "Sucesso",
        description: `${successCount} itens retirados do estoque`,
        duration: 2000,
      });
    } else {
      toast({
        title: "Parcialmente concluído",
        description: `${successCount} de ${batchItems.length} itens foram processados`,
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  const validationResults = getStockValidation();
  const hasInsufficientStock = validationResults.some(item => item.isStockInsufficient);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle>Saída em Lote</CardTitle>
        <CardDescription>
          Retire múltiplos itens do estoque de uma só vez.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Descrição Geral</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Motivo da saída (opcional)"
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Itens para Saída</Label>
              <Button type="button" onClick={addBatchItem} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Item
              </Button>
            </div>

            {batchItems.map((batchItem) => {
              const validation = validationResults.find(v => v.id === batchItem.id);
              const selectedItem = validation?.selectedItem;
              const isStockInsufficient = validation?.isStockInsufficient;
              
              return (
                <div key={batchItem.id} className="flex flex-col md:flex-row gap-4 p-4 border rounded-lg">
                  <div className="flex-1">
                    <Label>Item</Label>
                    <Select 
                      value={batchItem.itemId} 
                      onValueChange={(value) => updateBatchItem(batchItem.id, 'itemId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um item" />
                      </SelectTrigger>
                      <SelectContent>
                        {items.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')).map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            <div className="flex items-center justify-between w-full">
                              <span>{item.name}</span>
                              <Badge variant={item.current_stock <= item.minimum_stock ? "destructive" : "secondary"}>
                                {item.current_stock} {item.units?.abbreviation}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedItem && (
                      <div className="mt-1 text-xs text-muted-foreground">
                        Estoque atual: {selectedItem.current_stock} {selectedItem.units?.abbreviation}
                      </div>
                    )}
                  </div>

                  <div className="w-full md:w-32">
                    <Label>Quantidade</Label>
                    <QuantityInput
                      value={batchItem.quantity}
                      onChange={(value) => updateBatchItem(batchItem.id, 'quantity', value)}
                      min={0.1}
                      max={selectedItem?.current_stock || 999999}
                      step={0.5}
                    />
                    {isStockInsufficient && (
                      <div className="flex items-center space-x-1 text-destructive text-xs mt-1">
                        <AlertTriangle className="h-3 w-3" />
                        <span>Estoque insuficiente</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeBatchItem(batchItem.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}

            {batchItems.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum item adicionado. Clique em "Adicionar Item" para começar.
              </div>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={batchItems.length === 0 || hasInsufficientStock}
          >
            Processar Saída em Lote ({batchItems.length} itens)
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
