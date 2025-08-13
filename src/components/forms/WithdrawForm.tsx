
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSupabaseItems } from "@/hooks/useSupabaseItems";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle } from "lucide-react";
import { QuantityInput } from "@/components/ui/quantity-input";

export function WithdrawForm() {
  const [selectedItemId, setSelectedItemId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [description, setDescription] = useState("");

  const { items, addStockMovement } = useSupabaseItems();
  const { toast } = useToast();

  const selectedItem = items.find(item => item.id === selectedItemId);
  const isStockInsufficient = selectedItem && quantity > selectedItem.current_stock;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedItemId || quantity <= 0) {
      toast({
        title: "Erro",
        description: "Selecione um item e informe uma quantidade válida",
        variant: "destructive",
      });
      return;
    }

    if (isStockInsufficient) {
      toast({
        title: "Erro",
        description: "Quantidade solicitada maior que o estoque disponível",
        variant: "destructive",
      });
      return;
    }

    const success = await addStockMovement(
      selectedItemId,
      quantity,
      'saida',
      description || `Saída de ${quantity} ${selectedItem?.units?.abbreviation || 'un'}`
    );

    if (success) {
      setSelectedItemId("");
      setQuantity(1);
      setDescription("");
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Retirar Item do Estoque</CardTitle>
        <CardDescription>
          Registre a saída de itens do estoque.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="item">Item *</Label>
            <Select value={selectedItemId} onValueChange={setSelectedItemId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um item" />
              </SelectTrigger>
              <SelectContent>
                {items.map((item) => (
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
          </div>

          {selectedItem && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm">
                <strong>Estoque atual:</strong> {selectedItem.current_stock} {selectedItem.units?.abbreviation}
              </p>
              <p className="text-sm">
                <strong>Categoria:</strong> {selectedItem.categories?.name}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantidade *</Label>
            <QuantityInput
              value={quantity}
              onChange={setQuantity}
              min={0.1}
              max={selectedItem?.current_stock || 999999}
              step={0.5}
            />
            {isStockInsufficient && (
              <div className="flex items-center space-x-2 text-destructive text-sm">
                <AlertTriangle className="h-4 w-4" />
                <span>Quantidade maior que o estoque disponível!</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Motivo da saída (opcional)"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={!selectedItemId || isStockInsufficient}
          >
            Retirar do Estoque
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
