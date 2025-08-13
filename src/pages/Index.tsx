
import { useState } from "react";
import { Navigation } from "@/components/layout/Navigation";
import { AddItemForm } from "@/components/forms/AddItemForm";
import { WithdrawForm } from "@/components/forms/WithdrawForm";
import { BatchEntryForm } from "@/components/forms/BatchEntryForm";
import { BatchExitForm } from "@/components/forms/BatchExitForm";
import ItemsPage from "./ItemsPage";
import CategoriesPage from "./CategoriesPage";
import UnitsPage from "./UnitsPage";
import ReportsView from "@/components/reports/ReportsView";
import { ExportView } from "@/components/reports/ExportView";
import { StandardListsView } from "@/components/standard-lists/StandardListsView";
import { StandardListsManager } from "@/components/standard-lists/StandardListsManager";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSupabaseItems } from "@/hooks/useSupabaseItems";
import { StockCard } from "@/components/dashboard/StockCard";
import { StockChart } from "@/components/dashboard/StockChart";
import { TopStockRanking } from "@/components/dashboard/TopStockRanking";
import { AlertTriangle, Clock, Package, TrendingUp } from "lucide-react";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { items } = useSupabaseItems();

  // Calculations for low stock, expiring items, total items
  const lowStockItems = items.filter(item => item.current_stock <= item.minimum_stock);
  const expiringItems = items.filter(item => {
    if (!item.expiry_date) return false;
    const expiryDate = new Date(item.expiry_date);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return expiryDate <= thirtyDaysFromNow;
  });
  const totalItems = items.length;
  const totalStock = items.reduce((sum, item) => sum + item.current_stock, 0);

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground">
                Visão geral do seu estoque
              </p>
            </div>

            <StockCard items={items} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <StockChart />
              <TopStockRanking />
            </div>
          </div>
        );
      case "add-item":
        return (
          <div>
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold">Adicionar Item</h1>
            </div>
            <AddItemForm />
          </div>
        );
      case "withdraw":
        return (
          <div>
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold">Retirar Item</h1>
            </div>
            <WithdrawForm />
          </div>
        );
      case "batch-entry":
        return (
          <div>
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold">Entrada em Lote</h1>
            </div>
            <BatchEntryForm />
          </div>
        );
      case "batch-exit":
        return (
          <div>
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold">Saída em Lote</h1>
            </div>
            <BatchExitForm />
          </div>
        );
      case "items":
        return <ItemsPage />;
      case "categories":
        return <CategoriesPage />;
      case "units":
        return <UnitsPage />;
      case "standard-lists":
        return (
          <div>
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold">Listas Padrão</h1>
            </div>
            <StandardListsManager />
          </div>
        );
      case "alerts":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold">Alertas</h1>
              <p className="text-muted-foreground">
                Monitore itens que precisam de atenção
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    <span>Estoque Baixo</span>
                  </CardTitle>
                  <CardDescription>
                    Itens com estoque abaixo do mínimo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {lowStockItems.length === 0 ? (
                      <p className="text-muted-foreground">Nenhum item com estoque baixo</p>
                    ) : (
                      lowStockItems.slice(0, 5).map((item) => (
                        <div key={item.id} className="flex items-center justify-between">
                          <span className="text-sm">{item.name}</span>
                          <Badge variant="destructive">
                            {item.current_stock} {item.units?.abbreviation}
                          </Badge>
                        </div>
                      ))
                    )}
                    {lowStockItems.length > 5 && (
                      <p className="text-xs text-muted-foreground">
                        +{lowStockItems.length - 5} outros itens
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-red-500" />
                    <span>Próximos ao Vencimento</span>
                  </CardTitle>
                  <CardDescription>
                    Itens que vencem nos próximos 30 dias
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {expiringItems.length === 0 ? (
                      <p className="text-muted-foreground">Nenhum item próximo ao vencimento</p>
                    ) : (
                      expiringItems.slice(0, 5).map((item) => (
                        <div key={item.id} className="flex items-center justify-between">
                          <span className="text-sm">{item.name}</span>
                          <Badge variant="outline">
                            {item.expiry_date ? new Date(item.expiry_date).toLocaleDateString('pt-BR') : 'Sem data'}
                          </Badge>
                        </div>
                      ))
                    )}
                    {expiringItems.length > 5 && (
                      <p className="text-xs text-muted-foreground">
                        +{expiringItems.length - 5} outros itens
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      case "reports":
        return (
          <div>
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold">Relatórios</h1>
            </div>
            <ReportsView />
          </div>
        );
      case "export":
        return (
          <div>
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold">Exportar</h1>
            </div>
            <ExportView />
          </div>
        );
      default:
        return (
          <div className="text-center">
            <h1 className="text-3xl font-bold">Dashboard</h1>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex w-full">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 p-4 md:p-6 overflow-auto">
        {renderContent()}
      </main>
    </div>
  );
};

export default Index;
