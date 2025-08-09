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

// Mock data - será substituído pela integração com Supabase
const mockItems = [
  { id: "1", name: "Arroz branco", category: "Grãos e Insumos", unit: "kg", currentStock: 25 },
  { id: "2", name: "Feijão preto", category: "Grãos e Insumos", unit: "kg", currentStock: 15 },
  { id: "3", name: "Molho de tomate", category: "Molhos e Temperos", unit: "lata", currentStock: 50 },
  { id: "4", name: "Copo descartável", category: "Higienização", unit: "pacote", currentStock: 10 },
];

const categories = [
  "Higienização",
  "Grãos e Insumos", 
  "Molhos e Temperos",
  "Laticínios",
  "Carnes e Proteínas",
  "Frutas e Verduras",
];

export function WithdrawForm() {
  const { toast } = useToast();
  const [selectedItem, setSelectedItem] = useState("");
  const [quantity, setQuantity] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showBatchDialog, setShowBatchDialog] = useState(false);

  const filteredItems = mockItems.filter(item => {
    const matchesCategory = selectedCategory === "" || item.category === selectedCategory;
    const matchesSearch = searchTerm === "" || item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const selectedItemData = mockItems.find(item => item.id === selectedItem);

  const handleSubmit = (e: React.FormEvent) => {
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
    if (selectedItemData && withdrawQuantity > selectedItemData.currentStock) {
      toast({
        title: "Erro",
        description: "Quantidade solicitada maior que o estoque disponível.",
        variant: "destructive",
      });
      return;
    }

    // Aqui será implementada a integração com Supabase
    toast({
      title: "Baixa realizada!",
      description: `${quantity} ${selectedItemData?.unit} de ${selectedItemData?.name} foram retirados do estoque.`,
    });

    // Reset form
    setSelectedItem("");
    setQuantity("");
    setSelectedCategory("");
    setSearchTerm("");
  };

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
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
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
              <Label htmlFor="item">Item * ({filteredItems.length} itens encontrados)</Label>
              <Select value={selectedItem} onValueChange={setSelectedItem}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o item" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {filteredItems.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      Nenhum item encontrado
                    </div>
                  ) : (
                    filteredItems.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        <div className="flex flex-col items-start">
                          <span className="font-medium">{item.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {item.category} • {item.currentStock} {item.unit} disponível
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
                    <strong>Categoria:</strong> {selectedItemData.category}
                  </p>
                  <p className="text-sm font-medium">
                    <strong>Estoque atual:</strong> {selectedItemData.currentStock} {selectedItemData.unit}
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
                max={selectedItemData?.currentStock}
              />
            </div>

            {selectedItemData && quantity && (
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <p className="text-sm font-medium text-primary">
                  <strong>Saldo após baixa:</strong> {" "}
                  {(selectedItemData.currentStock - parseFloat(quantity || "0")).toFixed(2)} {selectedItemData.unit}
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
