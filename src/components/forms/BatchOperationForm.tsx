
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Package, Download, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { mockItems, categories, getItemsByCategory, mockStandardLists } from "@/data/mockData";

interface BatchItem {
  itemId: string;
  itemName: string;
  quantity: number;
  unit: string;
  category: string;
}

interface BatchOperationFormProps {
  operation: 'entrada' | 'saida';
  onClose: () => void;
}

export function BatchOperationForm({ operation, onClose }: BatchOperationFormProps) {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState<BatchItem[]>([]);
  const [quantities, setQuantities] = useState<Record<string, string>>({});
  const [selectedStandardList, setSelectedStandardList] = useState("");

  const filteredItems = getItemsByCategory(selectedCategory).filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleItemToggle = (item: typeof mockItems[0], checked: boolean) => {
    if (checked) {
      const batchItem: BatchItem = {
        itemId: item.id,
        itemName: item.name,
        quantity: 0,
        unit: item.unit,
        category: item.category
      };
      setSelectedItems(prev => [...prev, batchItem]);
      setQuantities(prev => ({ ...prev, [item.id]: "1" }));
    } else {
      setSelectedItems(prev => prev.filter(i => i.itemId !== item.id));
      setQuantities(prev => {
        const newQuantities = { ...prev };
        delete newQuantities[item.id];
        return newQuantities;
      });
    }
  };

  const handleQuantityChange = (itemId: string, quantity: string) => {
    setQuantities(prev => ({ ...prev, [itemId]: quantity }));
    setSelectedItems(prev => prev.map(item => 
      item.itemId === itemId 
        ? { ...item, quantity: parseFloat(quantity) || 0 }
        : item
    ));
  };

  const handleLoadStandardList = () => {
    if (!selectedStandardList) return;
    
    const standardList = mockStandardLists.find(list => list.id === selectedStandardList);
    if (!standardList) return;

    const newItems: BatchItem[] = standardList.items.map(item => ({
      itemId: item.itemId,
      itemName: item.itemName,
      quantity: item.quantity,
      unit: item.unit,
      category: mockItems.find(i => i.id === item.itemId)?.category || "Outros"
    }));

    setSelectedItems(newItems);
    
    const newQuantities: Record<string, string> = {};
    standardList.items.forEach(item => {
      newQuantities[item.itemId] = item.quantity.toString();
    });
    setQuantities(newQuantities);

    toast({
      title: "Lista carregada!",
      description: `${standardList.items.length} itens carregados da lista "${standardList.name}".`,
    });
  };

  const handleSubmit = () => {
    if (selectedItems.length === 0) {
      toast({
        title: "Erro",
        description: "Selecione pelo menos um item.",
        variant: "destructive",
      });
      return;
    }

    const invalidItems = selectedItems.filter(item => item.quantity <= 0);
    if (invalidItems.length > 0) {
      toast({
        title: "Erro",
        description: "Todos os itens devem ter quantidade maior que zero.",
        variant: "destructive",
      });
      return;
    }

    // Verificar estoque apenas para saídas
    if (operation === 'saida') {
      const insufficientStock = selectedItems.filter(item => {
        const stockItem = mockItems.find(i => i.id === item.itemId);
        return stockItem && stockItem.currentStock < item.quantity;
      });

      if (insufficientStock.length > 0) {
        toast({
          title: "Estoque insuficiente",
          description: `Os seguintes itens não possuem estoque suficiente: ${insufficientStock.map(i => i.itemName).join(", ")}`,
          variant: "destructive",
        });
        return;
      }
    }

    const totalItems = selectedItems.length;
    const totalQuantity = selectedItems.reduce((sum, item) => sum + item.quantity, 0);

    toast({
      title: `${operation === 'entrada' ? 'Entrada' : 'Saída'} em lote realizada!`,
      description: `${totalItems} tipos de itens processados (${totalQuantity.toFixed(1)} unidades total).`,
    });

    onClose();
  };

  const totalQuantity = selectedItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold flex items-center space-x-2">
            {operation === 'entrada' ? <Upload className="h-6 w-6" /> : <Download className="h-6 w-6" />}
            <span>{operation === 'entrada' ? 'Entrada' : 'Saída'} em Lote</span>
          </h2>
          <p className="text-muted-foreground">
            Processe múltiplos itens de uma só vez
          </p>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          {selectedItems.length} itens selecionados
        </Badge>
      </div>

      <Tabs defaultValue="manual" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual">Seleção Manual</TabsTrigger>
          <TabsTrigger value="standard">Lista Padrão</TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Filtros</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Buscar Item</Label>
                  <Input
                    placeholder="Digite o nome do item..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Itens Disponíveis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredItems.map(item => {
                  const isSelected = selectedItems.some(i => i.itemId === item.id);
                  const currentQuantity = quantities[item.id] || "1";
                  
                  return (
                    <div key={item.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => handleItemToggle(item, checked as boolean)}
                      />
                      <div className="flex-1">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.category} • Estoque: {item.currentStock} {item.unit}
                        </div>
                      </div>
                      {isSelected && (
                        <div className="flex items-center space-x-2">
                          <Input
                            type="number"
                            step="0.1"
                            value={currentQuantity}
                            onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                            className="w-20 text-center"
                          />
                          <span className="text-sm text-muted-foreground">{item.unit}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="standard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Usar Lista Padrão</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Selecionar Lista</Label>
                  <Select value={selectedStandardList} onValueChange={setSelectedStandardList}>
                    <SelectTrigger>
                      <SelectValue placeholder="Escolha uma lista padrão" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockStandardLists.map(list => (
                        <SelectItem key={list.id} value={list.id}>
                          {list.name} ({list.items.length} itens)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>&nbsp;</Label>
                  <Button
                    onClick={handleLoadStandardList}
                    disabled={!selectedStandardList}
                    className="w-full"
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Carregar Lista
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Selected Items Summary */}
      {selectedItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Resumo da Operação</span>
              <Badge variant="outline">
                Total: {totalQuantity.toFixed(1)} unidades
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {selectedItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex-1">
                    <span className="font-medium">{item.itemName}</span>
                    <span className="text-sm text-muted-foreground ml-2">({item.category})</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">
                      {item.quantity} {item.unit}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleItemToggle(mockItems.find(i => i.id === item.itemId)!, false)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end space-x-3">
        <Button variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} disabled={selectedItems.length === 0}>
          {operation === 'entrada' ? 'Processar Entrada' : 'Processar Saída'}
        </Button>
      </div>
    </div>
  );
}
