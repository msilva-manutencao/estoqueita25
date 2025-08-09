import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Package2, AlertTriangle } from "lucide-react";

interface StockItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  expiryDate: string;
  isExpiringSoon: boolean;
}

interface StockCardProps {
  item: StockItem;
}

export function StockCard({ item }: StockCardProps) {
  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "higienização":
        return "bg-blue-50 text-blue-600 border-blue-200";
      case "grãos e insumos":
        return "bg-green-50 text-green-600 border-green-200";
      case "molhos e temperos":
        return "bg-orange-50 text-orange-600 border-orange-200";
      case "laticínios":
        return "bg-purple-50 text-purple-600 border-purple-200";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <Card className="hover:shadow-md hover:scale-[1.02] transition-all duration-200 border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold text-card-foreground leading-tight">
            {item.name}
          </CardTitle>
          {item.isExpiringSoon && (
            <div className="p-1 bg-warning/10 rounded-full">
              <AlertTriangle className="h-4 w-4 text-warning" />
            </div>
          )}
        </div>
        <Badge className={`${getCategoryColor(item.category)} border text-xs font-medium`} variant="outline">
          {item.category}
        </Badge>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="flex items-center space-x-2">
          <Package2 className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">
            {item.quantity} {item.unit}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Vence: {new Date(item.expiryDate).toLocaleDateString('pt-BR')}
          </span>
        </div>
        
        {item.isExpiringSoon && (
          <Badge variant="destructive" className="text-xs">
            Vencimento próximo
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}