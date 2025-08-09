
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy } from "lucide-react";
import { mockItems } from "@/data/mockData";

export function TopStockRanking() {
  // Get top 5 items with highest stock
  const topStockItems = [...mockItems]
    .sort((a, b) => b.currentStock - a.currentStock)
    .slice(0, 5);

  const maxStock = topStockItems.length > 0 ? topStockItems[0].currentStock : 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <span>Ranking - Maior Estoque</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {topStockItems.map((item, index) => {
          const progressValue = (item.currentStock / maxStock) * 100;
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
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full ${rankColors[index]} flex items-center justify-center text-white font-bold text-sm`}>
                    {index + 1}
                  </div>
                  <div>
                    <span className="font-medium">{item.name}</span>
                    <div className="text-xs text-muted-foreground">{item.category}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">
                    {item.currentStock} <span className="text-sm font-normal text-muted-foreground">{item.unit}</span>
                  </div>
                  <Badge variant={index < 3 ? "default" : "secondary"} className="text-xs">
                    #{index + 1}
                  </Badge>
                </div>
              </div>
              <Progress value={progressValue} className="h-3" />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
