
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Package } from "lucide-react";
import { useSupabaseItems } from "@/hooks/useSupabaseItems";

export function TopStockRanking() {
  const { items, loading } = useSupabaseItems();

  // Get top 5 items with highest stock
  const topStockItems = [...items]
    .sort((a, b) => b.current_stock - a.current_stock)
    .slice(0, 5);

  const maxStock = topStockItems.length > 0 ? topStockItems[0].current_stock : 1;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <span>Ranking - Maior Estoque</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-muted-foreground">
            <Package className="h-8 w-8 mx-auto mb-2" />
            <p>Carregando dados...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (topStockItems.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <span>Ranking - Maior Estoque</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-muted-foreground">
            <Package className="h-8 w-8 mx-auto mb-2" />
            <p>Nenhum item cadastrado ainda</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <span className="text-sm md:text-base">Ranking - Maior Estoque</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 md:space-y-4">
        {topStockItems.map((item, index) => {
          const progressValue = (item.current_stock / maxStock) * 100;
          const rankColors = [
            "bg-yellow-500", // 1º lugar - ouro
            "bg-gray-400",   // 2º lugar - prata  
            "bg-orange-600", // 3º lugar - bronze
            "bg-blue-500",   // 4º lugar
            "bg-purple-500"  // 5º lugar
          ];
          
          return (
            <div key={item.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 md:space-x-3 flex-1 min-w-0">
                  <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full ${rankColors[index]} flex items-center justify-center text-white font-bold text-xs md:text-sm flex-shrink-0`}>
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-xs md:text-sm truncate">{item.name}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {item.categories?.name || 'Sem categoria'}
                    </div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-bold text-sm md:text-lg">
                    {item.current_stock} <span className="text-xs font-normal text-muted-foreground">
                      {item.units?.abbreviation || item.units?.name || 'un'}
                    </span>
                  </div>
                  <Badge variant={index < 3 ? "default" : "secondary"} className="text-xs">
                    #{index + 1}
                  </Badge>
                </div>
              </div>
              <Progress value={progressValue} className="h-2 md:h-3" />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
