
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Package } from "lucide-react";
import { SupabaseItem } from "@/hooks/useSupabaseItems";

interface LowStockModalProps {
  items: SupabaseItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LowStockModal({ items, open, onOpenChange }: LowStockModalProps) {
  const lowStockItems = items.filter(item => item.current_stock <= item.minimum_stock).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <span>Itens com Estoque Baixo</span>
          </DialogTitle>
          <DialogDescription>
            {lowStockItems.length} itens estão com estoque baixo ou esgotado
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {lowStockItems.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhum item com estoque baixo!</p>
            </div>
          ) : (
            lowStockItems.map((item) => (
              <Card key={item.id} className="border-l-4 border-l-destructive">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Categoria: {item.categories?.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Estoque mínimo: {item.minimum_stock} {item.units?.abbreviation}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <Badge variant={item.current_stock === 0 ? "destructive" : "secondary"}>
                        {item.current_stock} {item.units?.abbreviation}
                      </Badge>
                      {item.current_stock === 0 && (
                        <p className="text-xs text-destructive mt-1">ESGOTADO</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
