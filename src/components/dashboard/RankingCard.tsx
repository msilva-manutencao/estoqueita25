
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Package, AlertTriangle } from "lucide-react";
import { mockItems, mockStockMovements } from "@/data/mockData";

export function RankingCard() {
  // Calculate item movements and rankings
  const itemStats = mockItems.map(item => {
    const movements = mockStockMovements.filter(m => m.itemId === item.id);
    const totalMovements = movements.length;
    const totalEntries = movements.filter(m => m.type === 'entrada').reduce((sum, m) => sum + m.quantity, 0);
    const totalExits = movements.filter(m => m.type === 'saida').reduce((sum, m) => sum + m.quantity, 0);
    const netMovement = totalEntries - totalExits;
    
    return {
      ...item,
      totalMovements,
      totalEntries,
      totalExits,
      netMovement,
      turnoverRate: item.currentStock > 0 ? (totalExits / item.currentStock) * 100 : 0
    };
  });

  // Most moved items (by quantity)
  const mostMovedItems = [...itemStats]
    .sort((a, b) => (b.totalEntries + b.totalExits) - (a.totalEntries + a.totalExits))
    .slice(0, 5);

  // Highest turnover rate
  const highestTurnover = [...itemStats]
    .filter(item => item.currentStock > 0)
    .sort((a, b) => b.turnoverRate - a.turnoverRate)
    .slice(0, 5);

  // Lowest stock items
  const lowestStock = [...itemStats]
    .sort((a, b) => a.currentStock - b.currentStock)
    .slice(0, 5);

  // Items with highest stock
  const highestStock = [...itemStats]
    .sort((a, b) => b.currentStock - a.currentStock)
    .slice(0, 5);

  const maxMovement = Math.max(...mostMovedItems.map(item => item.totalEntries + item.totalExits));
  const maxTurnover = Math.max(...highestTurnover.map(item => item.turnoverRate));
  const maxStock = Math.max(...highestStock.map(item => item.currentStock));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Most Moved Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Itens Mais Movimentados</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {mostMovedItems.map((item, index) => {
            const totalMovement = item.totalEntries + item.totalExits;
            const progressValue = maxMovement > 0 ? (totalMovement / maxMovement) * 100 : 0;
            
            return (
              <div key={item.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant={index < 3 ? "default" : "secondary"} className="w-6 h-6 p-0 flex items-center justify-center text-xs">
                      {index + 1}
                    </Badge>
                    <span className="font-medium text-sm">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{totalMovement} {item.unit}</div>
                    <div className="text-xs text-muted-foreground">
                      E: {item.totalEntries} | S: {item.totalExits}
                    </div>
                  </div>
                </div>
                <Progress value={progressValue} className="h-2" />
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Highest Turnover Rate */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingDown className="h-5 w-5" />
            <span>Maior Giro de Estoque</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {highestTurnover.map((item, index) => {
            const progressValue = maxTurnover > 0 ? (item.turnoverRate / maxTurnover) * 100 : 0;
            
            return (
              <div key={item.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant={index < 3 ? "default" : "secondary"} className="w-6 h-6 p-0 flex items-center justify-center text-xs">
                      {index + 1}
                    </Badge>
                    <span className="font-medium text-sm">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{item.turnoverRate.toFixed(1)}%</div>
                    <div className="text-xs text-muted-foreground">
                      Estoque: {item.currentStock} {item.unit}
                    </div>
                  </div>
                </div>
                <Progress value={progressValue} className="h-2" />
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Lowest Stock Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <span>Menor Estoque</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {lowestStock.map((item, index) => {
            const isLowStock = item.currentStock <= 10;
            
            return (
              <div key={item.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={isLowStock ? "destructive" : "secondary"} 
                      className="w-6 h-6 p-0 flex items-center justify-center text-xs"
                    >
                      {index + 1}
                    </Badge>
                    <span className="font-medium text-sm">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${isLowStock ? 'text-destructive' : ''}`}>
                      {item.currentStock} {item.unit}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {item.category}
                    </div>
                  </div>
                </div>
                {isLowStock && (
                  <div className="text-xs text-destructive bg-destructive/10 px-2 py-1 rounded">
                    ⚠️ Estoque baixo
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Highest Stock Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5 text-success" />
            <span>Maior Estoque</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {highestStock.map((item, index) => {
            const progressValue = maxStock > 0 ? (item.currentStock / maxStock) * 100 : 0;
            
            return (
              <div key={item.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant="default" className="w-6 h-6 p-0 flex items-center justify-center text-xs">
                      {index + 1}
                    </Badge>
                    <span className="font-medium text-sm">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-success">
                      {item.currentStock} {item.unit}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {item.category}
                    </div>
                  </div>
                </div>
                <Progress value={progressValue} className="h-2" />
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
