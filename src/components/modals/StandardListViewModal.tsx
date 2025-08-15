
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Calendar, Hash, Edit, Trash2, Download, Plus, Minus } from "lucide-react";
import { SupabaseStandardList } from "@/hooks/useSupabaseStandardLists";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseItems } from "@/hooks/useSupabaseItems";

interface StandardListViewModalProps {
  list: SupabaseStandardList | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExecuteBulkWithdraw?: (listId: string) => void;
  onUpdateItem?: (listId: string, itemId: string, newQuantity: number) => void;
  onRemoveItem?: (listId: string, itemId: string) => void;
  onAddItem?: (listId: string, itemId: string, quantity: number) => void;
}

export function StandardListViewModal({ 
  list, 
  open, 
  onOpenChange, 
  onExecuteBulkWithdraw,
  onUpdateItem,
  onRemoveItem,
  onAddItem 
}: StandardListViewModalProps) {
  const { toast } = useToast();
  const { items } = useSupabaseItems();
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editQuantity, setEditQuantity] = useState("");
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItemId, setNewItemId] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState("1");

  if (!list) return null;

  const totalQuantity = list.items.reduce((total, item) => total + item.quantity, 0);

  const handleEditItem = (itemId: string, currentQuantity: number) => {
    setEditingItemId(itemId);
    setEditQuantity(currentQuantity.toString());
  };

  const handleSaveEdit = async (itemId: string) => {
    const newQuantity = parseFloat(editQuantity);
    if (isNaN(newQuantity) || newQuantity <= 0) {
      toast({
        title: "Erro",
        description: "Quantidade deve ser um número positivo",
        variant: "destructive",
      });
      return;
    }

    if (onUpdateItem) {
      setUpdatingItems(prev => new Set(prev).add(itemId));
      await onUpdateItem(list.id, itemId, newQuantity);
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
    
    setEditingItemId(null);
    setEditQuantity("");
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setEditQuantity("");
  };

  const handleRemoveItem = async (itemId: string, itemName: string) => {
    if (window.confirm(`Tem certeza que deseja remover "${itemName}" desta lista?`)) {
      if (onRemoveItem) {
        setUpdatingItems(prev => new Set(prev).add(itemId));
        await onRemoveItem(list.id, itemId);
        setUpdatingItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(itemId);
          return newSet;
        });
      }
    }
  };

  const handleBulkWithdraw = () => {
    if (window.confirm(`Confirma a baixa em lote da lista "${list.name}"? Esta ação não pode ser desfeita.`)) {
      if (onExecuteBulkWithdraw) {
        onExecuteBulkWithdraw(list.id);
      }
    }
  };

  const adjustQuantity = async (itemId: string, currentQuantity: number, increment: number) => {
    const newQuantity = Math.max(1, currentQuantity + increment);
    if (onUpdateItem) {
      setUpdatingItems(prev => new Set(prev).add(itemId));
      await onUpdateItem(list.id, itemId, newQuantity);
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handleAddNewItem = async () => {
    if (!newItemId || !newItemQuantity) {
      toast({
        title: "Erro",
        description: "Selecione um item e informe a quantidade",
        variant: "destructive",
      });
      return;
    }

    const quantity = parseFloat(newItemQuantity);
    if (isNaN(quantity) || quantity <= 0) {
      toast({
        title: "Erro",
        description: "Quantidade deve ser um número positivo",
        variant: "destructive",
      });
      return;
    }

    if (onAddItem) {
      await onAddItem(list.id, newItemId, quantity);
      setNewItemId("");
      setNewItemQuantity("1");
      setShowAddForm(false);
    }
  };

  // Filtrar itens que não estão na lista
  const availableItems = items.filter(item => 
    !list.items.some(listItem => listItem.item_id === item.id)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>{list.name}</span>
            </div>
            <Button 
              onClick={handleBulkWithdraw}
              className="flex items-center space-x-2"
              size="sm"
            >
              <Download className="h-4 w-4" />
              <span>Executar Baixa</span>
            </Button>
          </DialogTitle>
          {list.description && (
            <DialogDescription className="text-base">
              {list.description}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-4">
          {/* List Statistics */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center space-x-2">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Itens</span>
                </div>
                <p className="text-2xl font-bold">{list.items.length}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center space-x-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Total</span>
                </div>
                <p className="text-2xl font-bold">{totalQuantity.toFixed(1)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Criada</span>
                </div>
                <p className="text-sm font-medium">
                  {new Date(list.created_at).toLocaleDateString('pt-BR')}
                </p>
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Items List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Itens da Lista</h3>
              {availableItems.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Adicionar Item</span>
                </Button>
              )}
            </div>

            {/* Add Item Form */}
            {showAddForm && (
              <Card className="border-dashed">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <h4 className="font-medium">Adicionar Novo Item</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="md:col-span-2">
                        <Label htmlFor="newItem">Item</Label>
                        <Select value={newItemId} onValueChange={setNewItemId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um item" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableItems.map((item) => (
                              <SelectItem key={item.id} value={item.id}>
                                {item.name} - Estoque: {item.current_stock} {item.units?.abbreviation || 'un'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="newQuantity">Quantidade</Label>
                        <Input
                          id="newQuantity"
                          type="number"
                          step="0.1"
                          min="0.1"
                          value={newItemQuantity}
                          onChange={(e) => setNewItemQuantity(e.target.value)}
                          placeholder="1"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowAddForm(false);
                          setNewItemId("");
                          setNewItemQuantity("1");
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleAddNewItem}
                        disabled={!newItemId || !newItemQuantity}
                      >
                        Adicionar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-2">
              {list.items.map((item) => {
                const isEditing = editingItemId === item.id;
                const isUpdating = updatingItems.has(item.id);
                const itemName = item.items?.name || 'Item não encontrado';
                const unit = item.items?.units?.abbreviation || item.items?.units?.name || 'un';
                const currentStock = item.items?.current_stock || 0;
                const isOverStock = item.quantity > currentStock;

                return (
                  <Card key={item.id} className={`border-l-4 ${isOverStock ? 'border-l-destructive' : 'border-l-primary'} ${isUpdating ? 'opacity-50' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{itemName}</h4>
                          <p className="text-sm text-muted-foreground">
                            Unidade: {unit} • Estoque disponível: {currentStock} {unit}
                          </p>
                          {isOverStock && (
                            <p className="text-xs text-destructive">
                              ⚠️ Quantidade acima do estoque disponível!
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {isEditing ? (
                            <>
                              <Input
                                type="number"
                                step="0.1"
                                value={editQuantity}
                                onChange={(e) => setEditQuantity(e.target.value)}
                                className="w-20 text-center"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleSaveEdit(item.id);
                                  } else if (e.key === 'Escape') {
                                    handleCancelEdit();
                                  }
                                }}
                                autoFocus
                              />
                              <Button
                                size="sm"
                                onClick={() => handleSaveEdit(item.id)}
                                className="h-8 w-8 p-0"
                                disabled={isUpdating}
                              >
                                ✓
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCancelEdit}
                                className="h-8 w-8 p-0"
                              >
                                ✕
                              </Button>
                            </>
                          ) : (
                            <>
                              <div className="flex items-center space-x-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => adjustQuantity(item.id, item.quantity, -1)}
                                  className="h-8 w-8 p-0"
                                  disabled={item.quantity <= 1 || isUpdating}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                
                                <Badge 
                                  variant={isOverStock ? "destructive" : "secondary"} 
                                  className="text-lg px-3 py-1 cursor-pointer" 
                                  onClick={() => handleEditItem(item.id, item.quantity)}
                                >
                                  {item.quantity} {unit}
                                </Badge>
                                
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => adjustQuantity(item.id, item.quantity, 1)}
                                  className="h-8 w-8 p-0"
                                  disabled={isUpdating}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                              
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditItem(item.id, item.quantity)}
                                className="h-8 w-8 p-0"
                                disabled={isUpdating}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleRemoveItem(item.id, itemName)}
                                className="h-8 w-8 p-0"
                                disabled={isUpdating}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Summary */}
          <Separator />
          <div className="bg-muted/30 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Resumo da Lista</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Quantidade total de itens:</span>
                <p className="font-medium">{list.items.length} tipos diferentes</p>
              </div>
              <div>
                <span className="text-muted-foreground">Volume total estimado:</span>
                <p className="font-medium">{totalQuantity.toFixed(1)} unidades</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
