
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Package } from "lucide-react";
import { SupabaseItem } from "@/hooks/useSupabaseItems";

interface ExpiringItemsModalProps {
  items: SupabaseItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExpiringItemsModal({ items, open, onOpenChange }: ExpiringItemsModalProps) {
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  
  const expiringItems = items.filter(item => {
    if (!item.expiry_date) return false;
    const expiryDate = new Date(item.expiry_date);
    return expiryDate <= thirtyDaysFromNow;
  });

  const getDaysUntilExpiry = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getExpiryBadgeVariant = (daysUntilExpiry: number) => {
    if (daysUntilExpiry < 0) return "destructive"; // Vencido
    if (daysUntilExpiry <= 7) return "destructive"; // Vence em 7 dias
    if (daysUntilExpiry <= 15) return "default"; // Vence em 15 dias
    return "secondary"; // Vence em até 30 dias
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-orange-500" />
            <span>Itens Próximos ao Vencimento</span>
          </DialogTitle>
          <DialogDescription>
            {expiringItems.length} itens vencem nos próximos 30 dias
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {expiringItems.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhum item próximo ao vencimento!</p>
            </div>
          ) : (
            expiringItems
              .sort((a, b) => {
                const daysA = getDaysUntilExpiry(a.expiry_date!);
                const daysB = getDaysUntilExpiry(b.expiry_date!);
                return daysA - daysB;
              })
              .map((item) => {
                const daysUntilExpiry = getDaysUntilExpiry(item.expiry_date!);
                const isExpired = daysUntilExpiry < 0;
                
                return (
                  <Card key={item.id} className={`border-l-4 ${isExpired ? 'border-l-destructive' : 'border-l-orange-500'}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Categoria: {item.categories?.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Estoque: {item.current_stock} {item.units?.abbreviation}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Vencimento: {new Date(item.expiry_date!).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        
                        <div className="text-right">
                          <Badge variant={getExpiryBadgeVariant(daysUntilExpiry)}>
                            {isExpired 
                              ? `Vencido há ${Math.abs(daysUntilExpiry)} dias`
                              : daysUntilExpiry === 0
                              ? "Vence hoje"
                              : `${daysUntilExpiry} dias`
                            }
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
