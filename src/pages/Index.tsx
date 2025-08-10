
import { useState } from "react";
import { Navigation } from "@/components/layout/Navigation";
import { StockCard } from "@/components/dashboard/StockCard";
import { AddItemForm } from "@/components/forms/AddItemForm";
import { WithdrawForm } from "@/components/forms/WithdrawForm";
import { StandardListsManager } from "@/components/standard-lists/StandardListsManager";
import { TopStockRanking } from "@/components/dashboard/TopStockRanking";
import { StockChart } from "@/components/dashboard/StockChart";
import { ExportButton } from "@/components/reports/ExportButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Package, TrendingUp, TrendingDown, Plus, Loader2, AlertCircle } from "lucide-react";
import { BatchOperationForm } from "@/components/forms/BatchOperationForm";
import { useSupabaseItems } from "@/hooks/useSupabaseItems";
import { ReportsView } from "@/components/reports/ReportsView";
import ItemsPage from "./ItemsPage";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showBatchDialog, setShowBatchDialog] = useState(false);
  const [batchOperation, setBatchOperation] = useState<'entrada' | 'saida'>('entrada');
  
  const { items, loading } = useSupabaseItems();

  // Converter dados do Supabase para o formato esperado pelos componentes
  const mockStockItems = items.map(item => ({
    id: item.id,
    name: item.name,
    category: item.categories?.name || 'Sem categoria',
    quantity: item.current_stock,
    unit: item.units?.abbreviation || item.units?.name || 'un',
    expiryDate: item.expiry_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    minimumStock: item.minimum_stock || 10,
    isExpiringSoon: item.expiry_date ? 
      new Date(item.expiry_date).getTime() - new Date().getTime() < 30 * 24 * 60 * 60 * 1000 && 
      new Date(item.expiry_date).getTime() > new Date().getTime() : false,
    isLowStock: item.current_stock < (item.minimum_stock || 10),
  }));

  // Itens vencendo nos próximos 30 dias
  const expiringItems30 = mockStockItems.filter(item => 
    item.expiryDate && 
    new Date(item.expiryDate).getTime() - new Date().getTime() <= 30 * 24 * 60 * 60 * 1000 &&
    new Date(item.expiryDate).getTime() > new Date().getTime()
  );

  // Itens vencendo nos próximos 60 dias (para alertas)
  const expiringItems60 = mockStockItems.filter(item => 
    item.expiryDate && 
    new Date(item.expiryDate).getTime() - new Date().getTime() <= 60 * 24 * 60 * 60 * 1000 &&
    new Date(item.expiryDate).getTime() > new Date().getTime()
  );

  const totalItems = mockStockItems.length;
  const lowStockItems = mockStockItems.filter(item => item.isLowStock);

  // Prepare stock report data for Excel export
  const stockReportData = mockStockItems.map(item => [
    item.name,
    item.category,
    item.quantity.toString(),
    item.unit,
    item.expiryDate || 'N/A',
    item.quantity <= item.minimumStock ? 'Baixo' : 'Normal'
  ]);

  const stockReportHeaders = [
    'Item',
    'Categoria', 
    'Estoque Atual',
    'Unidade',
    'Data de Vencimento',
    'Status'
  ];

  const handleBatchOperation = (operation: 'entrada' | 'saida') => {
    setBatchOperation(operation);
    setShowBatchDialog(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span>Carregando dados...</span>
        </div>
      </div>
    );
  }

  const renderDashboard = () => (
    <div className="space-y-4 md:space-y-6">
      {/* Header with Batch Operations - Mobile Optimized */}
      <div className="flex flex-col space-y-3 md:flex-row md:justify-between md:items-center md:space-y-0">
        <h1 className="text-xl md:text-2xl font-bold">Dashboard</h1>
        <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
          <Button 
            variant="outline" 
            onClick={() => handleBatchOperation('entrada')}
            className="flex items-center justify-center space-x-2 w-full md:w-auto"
            size="sm"
          >
            <Plus className="h-4 w-4" />
            <span>Entrada em Lote</span>
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleBatchOperation('saida')}
            className="flex items-center justify-center space-x-2 w-full md:w-auto"
            size="sm"
          >
            <Package className="h-4 w-4" />
            <span>Saída em Lote</span>
          </Button>
          <ExportButton 
            data={stockReportData}
            headers={stockReportHeaders}
            filename="relatorio_estoque"
            title="Relatório"
          />
        </div>
      </div>

      {/* Cards de Estatísticas - Mobile Optimized */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Itens</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{totalItems}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-warning-foreground">{lowStockItems.length}</div>
          </CardContent>
        </Card>

        <Card className="sm:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencimento 30 dias</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-destructive-foreground">{expiringItems30.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas de Vencimento - Mobile Optimized */}
      {expiringItems30.length > 0 && (
        <Card className="border-warning">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-sm md:text-base">
              <AlertTriangle className="h-4 w-4 md:h-5 md:w-5 text-warning-foreground" />
              <span>Itens com Vencimento nos Próximos 30 Dias</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {expiringItems30.map((item) => (
                <div key={item.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-2 bg-warning rounded-lg space-y-1 sm:space-y-0">
                  <span className="font-medium text-sm">{item.name}</span>
                  <Badge variant="outline" className="text-warning-foreground text-xs w-fit">
                    {new Date(item.expiryDate).toLocaleDateString('pt-BR')}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ranking e Gráficos - Mobile Optimized */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
        <div>
          <TopStockRanking />
        </div>
        <div>
          <StockChart />
        </div>
      </div>
    </div>
  );

  const renderAlerts = () => (
    <div className="space-y-4">
      <h2 className="text-lg md:text-xl font-semibold">Alertas do Sistema</h2>
      
      <Tabs defaultValue="estoque" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="estoque">Estoque Baixo</TabsTrigger>
          <TabsTrigger value="vencimento">Vencimento</TabsTrigger>
        </TabsList>

        <TabsContent value="estoque" className="space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <h3 className="text-lg font-medium">Itens com Estoque Abaixo do Mínimo</h3>
            <Badge variant="destructive">{lowStockItems.length} itens</Badge>
          </div>
          
          {lowStockItems.length > 0 ? (
            <div className="space-y-3">
              {lowStockItems.map((item) => (
                <Card key={item.id} className="border-destructive">
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">{item.category}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-sm">Estoque atual: {item.quantity} {item.unit}</span>
                          <span className="text-sm text-muted-foreground">|</span>
                          <span className="text-sm">Mínimo: {item.minimumStock} {item.unit}</span>
                        </div>
                      </div>
                      <Badge variant="destructive">
                        Crítico
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">Nenhum item com estoque baixo!</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="vencimento" className="space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <h3 className="text-lg font-medium">Itens Vencendo nos Próximos 60 Dias</h3>
            <Badge variant="secondary">{expiringItems60.length} itens</Badge>
          </div>
          
          {expiringItems60.length > 0 ? (
            <div className="space-y-3">
              {expiringItems60.map((item) => {
                const daysToExpiry = Math.ceil((new Date(item.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                const isUrgent = daysToExpiry <= 7;
                
                return (
                  <Card key={item.id} className={isUrgent ? "border-destructive" : "border-warning"}>
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold">{item.name}</h4>
                          <p className="text-sm text-muted-foreground">{item.category}</p>
                          <p className="text-sm">Estoque: {item.quantity} {item.unit}</p>
                          <p className="text-sm">Data de vencimento: {new Date(item.expiryDate).toLocaleDateString('pt-BR')}</p>
                        </div>
                        <Badge variant={isUrgent ? "destructive" : "secondary"}>
                          {daysToExpiry} dias
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">Nenhum item vencendo nos próximos 60 dias!</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );

  const renderReports = () => <ReportsView />;

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return renderDashboard();
      case "add-item":
        return <AddItemForm />;
      case "withdraw":
        return <WithdrawForm />;
      case "items":
        return <ItemsPage />;
      case "standard-lists":
        return <StandardListsManager />;
      case "alerts":
        return renderAlerts();
      case "reports":
        return renderReports();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="container mx-auto px-3 py-4 md:px-6 md:py-8">
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>

      <Dialog open={showBatchDialog} onOpenChange={setShowBatchDialog}>
        <DialogContent className="mx-2 max-w-[calc(100vw-1rem)] md:mx-auto md:max-w-6xl max-h-[90vh] overflow-y-auto">
          <BatchOperationForm 
            operation={batchOperation} 
            onClose={() => setShowBatchDialog(false)} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
