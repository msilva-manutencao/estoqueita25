
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Package, Calendar, Hash, Edit, Trash2, Download, Plus, Minus } from "lucide-react";
import { SupabaseStandardList } from "@/hooks/useSupabaseStandardLists";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface StandardListViewModalProps {
  list: SupabaseStandardList | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExecuteBulkWithdraw?: (listId: string) => void;
  onUpdateItem?: (listId: string, itemId: string, newQuantity: number) => void;
  onRemoveItem?: (listId: string, itemId: string) => void;
}

export function StandardListViewModal({ 
  list, 
  open, 
  onOpenChange, 
  onExecuteBulkWithdraw,
  onUpdateItem,
  onRemoveItem 
}: StandardListViewModalProps) {
  const { toast } = useToast();
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editQuantity, setEditQuantity] = useState("");

  if (!list) return null;

  const totalQuantity = list.items.reduce((total, item) => total + item.quantity, 0);

  const handleEditItem = (itemId: string, currentQuantity: number) => {
    setEditingItemId(itemId);
    setEditQuantity(currentQuantity.toString());
  };

  const handleSaveEdit = (itemId: string) => {
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
      onUpdateItem(list.id, itemId, newQuantity);
    }
    
    setEditingItemId(null);
    setEditQuantity("");
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setEditQuantity("");
  };

  const handleRemoveItem = (itemId: string, itemName: string) => {
    if (window.confirm(`Tem certeza que deseja remover "${itemName}" desta lista?`)) {
      if (onRemoveItem) {
        onRemoveItem(list.id, itemId);
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

  const adjustQuantity = (itemId: string, currentQuantity: number, increment: number) => {
    const newQuantity = Math.max(0.1, currentQuantity + increment);
    if (onUpdateItem) {
      onUpdateItem(list.id, itemId, newQuantity);
    }
  };

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
            <h3 className="text-lg font-semibold">Itens da Lista</h3>
            <div className="space-y-2">
              {list.items.map((item) => {
                const isEditing = editingItemId === item.id;
                const itemName = item.items?.name || 'Item não encontrado';
                const unit = item.items?.units?.abbreviation || item.items?.units?.name || 'un';
                const currentStock = item.items?.current_stock || 0;
                const isOverStock = item.quantity > currentStock;

                return (
                  <Card key={item.id} className={`border-l-4 ${isOverStock ? 'border-l-destructive' : 'border-l-primary'}`}>
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
                                  onClick={() => adjustQuantity(item.id, item.quantity, -0.5)}
                                  className="h-8 w-8 p-0"
                                  disabled={item.quantity <= 0.1}
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
                                  onClick={() => adjustQuantity(item.id, item.quantity, 0.5)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                              
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditItem(item.id, item.quantity)}
                                className="h-8 w-8 p-0"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleRemoveItem(item.id, itemName)}
                                className="h-8 w-8 p-0"
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
