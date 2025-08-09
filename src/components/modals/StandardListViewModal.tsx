import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Package, Calendar, Hash } from "lucide-react";
import { StandardList } from "@/data/mockData";

interface StandardListViewModalProps {
  list: StandardList | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StandardListViewModal({ list, open, onOpenChange }: StandardListViewModalProps) {
  if (!list) return null;

  const totalQuantity = list.items.reduce((total, item) => total + item.quantity, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>{list.name}</span>
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
                  {new Date(list.createdAt).toLocaleDateString('pt-BR')}
                </p>
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Items List */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Itens da Lista</h3>
            <div className="space-y-2">
              {list.items.map((item, index) => (
                <Card key={index} className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{item.itemName}</h4>
                        <p className="text-sm text-muted-foreground">
                          Unidade: {item.unit}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className="text-lg px-3 py-1">
                          {item.quantity} {item.unit}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
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