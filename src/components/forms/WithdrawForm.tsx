
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Package } from "lucide-react";
import { BatchOperationForm } from "./BatchOperationForm";
import { useSupabaseItems } from "@/hooks/useSupabaseItems";

export function WithdrawForm() {
  const { toast } = useToast();
  const { items, loading, addStockMovement } = useSupabaseItems();
  const [selectedItem, setSelectedItem] = useState("");
  const [quantity, setQuantity] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showBatchDialog, setShowBatchDialog] = useState(false);

  // Get unique categories from items
  const categories = Array.from(new Set(items.map(item => item.categories?.name).filter(Boolean)));

  const filteredItems = items.filter(item => {
    const matchesCategory = selectedCategory === "all" || item.categories?.name === selectedCategory;
    const matchesSearch = searchTerm === "" || item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const hasStock = item.current_stock > 0;
    return matchesCategory && matchesSearch && hasStock;
  });

  const selectedItemData = items.find(item => item.id === selectedItem);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedItem || !quantity) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um item e informe a quantidade.",
        variant: "destructive",
      });
      return;
    }

    const withdrawQuantity = parseFloat(quantity);
    if (selectedItemData && withdrawQuantity > selectedItemData.current_stock) {
      toast({
        title: "Erro",
        description: "Quantidade solicitada maior que o estoque disponível.",
        variant: "destructive",
      });
      return;
    }

    const success = await addStockMovement(
      selectedItem, 
      withdrawQuantity, 
      'saida', 
      'Baixa manual de estoque'
    );

    if (success) {
      // Reset form
      setSelectedItem("");
      setQuantity("");
      setSelectedCategory("all");
      setSearchTerm("");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando itens...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-center">Baixa de Estoque</CardTitle>
            <Button 
              variant="outline" 
              onClick={() => setShowBatchDialog(true)}
              className="flex items-center space-x-2"
            >
              <Package className="h-4 w-4" />
              <span>Baixa em Lote</span>
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Filtros */}
            <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
              <h3 className="text-sm font-medium text-muted-foreground">Filtros de Busca</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Filtrar por Categoria</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas as categorias" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as categorias</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category || "uncategorized"}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="search">Buscar Item</Label>
                  <Input
                    id="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Digite o nome do item..."
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Seleção do Item */}
            <div className="space-y-2">
              <Label htmlFor="item">Item * ({filteredItems.length} itens disponíveis)</Label>
              <Select value={selectedItem} onValueChange={setSelectedItem}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o item" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {filteredItems.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      {items.length === 0 
                        ? "Nenhum item cadastrado no estoque"
                        : "Nenhum item encontrado com estoque disponível"
                      }
                    </div>
                  ) : (
                    filteredItems.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        <div className="flex flex-col items-start">
                          <span className="font-medium">{item.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {item.categories?.name} • {item.current_stock} {item.units?.abbreviation || item.units?.name} disponível
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {selectedItemData && (
              <div className="p-4 bg-secondary/50 rounded-lg border">
                <div className="flex flex-col space-y-2">
                  <p className="text-sm text-muted-foreground">
                    <strong>Item selecionado:</strong> {selectedItemData.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong>Categoria:</strong> {selectedItemData.categories?.name}
                  </p>
                  <p className="text-sm font-medium">
                    <strong>Estoque atual:</strong> {selectedItemData.current_stock} {selectedItemData.units?.abbreviation || selectedItemData.units?.name}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantidade a retirar *</Label>
              <Input
                id="quantity"
                type="number"
                step="0.01"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0"
                max={selectedItemData?.current_stock}
              />
            </div>

            {selectedItemData && quantity && (
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <p className="text-sm font-medium text-primary">
                  <strong>Saldo após baixa:</strong> {" "}
                  {(selectedItemData.current_stock - parseFloat(quantity || "0")).toFixed(2)} {selectedItemData.units?.abbreviation || selectedItemData.units?.name}
                </p>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={!selectedItem || !quantity}>
              Confirmar Baixa
            </Button>
          </form>
        </CardContent>
      </Card>

      <Dialog open={showBatchDialog} onOpenChange={setShowBatchDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <BatchOperationForm 
            operation="saida" 
            onClose={() => setShowBatchDialog(false)} 
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
