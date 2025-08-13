
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, AlertTriangle, Calendar, TrendingUp, TrendingDown } from "lucide-react";
import { SupabaseItem } from "@/hooks/useSupabaseItems";
import { LowStockModal } from "@/components/modals/LowStockModal";
import { ExpiringItemsModal } from "@/components/modals/ExpiringItemsModal";
import { useState } from "react";

interface StockCardProps {
  items: SupabaseItem[];
}

export function StockCard({ items }: StockCardProps) {
  const [lowStockModalOpen, setLowStockModalOpen] = useState(false);
  const [expiringModalOpen, setExpiringModalOpen] = useState(false);

  const totalItems = items.length;
  const totalStock = items.reduce((sum, item) => sum + item.current_stock, 0);
  
  const lowStockItems = items.filter(item => item.current_stock <= item.minimum_stock);
  const lowStockCount = lowStockItems.length;
  
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const expiringItems = items.filter(item => {
    if (!item.expiry_date) return false;
    const expiryDate = new Date(item.expiry_date);
    return expiryDate <= thirtyDaysFromNow;
  });
  const expiringCount = expiringItems.length;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Itens</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground">
              produtos cadastrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estoque Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStock.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              unidades em estoque
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{lowStockCount}</div>
            <Button 
              variant="link" 
              className="text-xs p-0 h-auto text-muted-foreground hover:text-destructive"
              onClick={() => setLowStockModalOpen(true)}
            >
              ver detalhes
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencimento 30 dias</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{expiringCount}</div>
            <Button 
              variant="link" 
              className="text-xs p-0 h-auto text-muted-foreground hover:text-orange-600"
              onClick={() => setExpiringModalOpen(true)}
            >
              ver detalhes
            </Button>
          </CardContent>
        </Card>
      </div>

      <LowStockModal 
        items={items}
        open={lowStockModalOpen}
        onOpenChange={setLowStockModalOpen}
      />

      <ExpiringItemsModal 
        items={items}
        open={expiringModalOpen}
        onOpenChange={setExpiringModalOpen}
      />
    </>
  );
}
