
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
import { AlertTriangle, Package, TrendingUp, TrendingDown, Plus, Loader2 } from "lucide-react";
import { BatchOperationForm } from "@/components/forms/BatchOperationForm";
import { useSupabaseItems } from "@/hooks/useSupabaseItems";
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
    isExpiringSoon: item.expiry_date ? 
      new Date(item.expiry_date).getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000 && 
      new Date(item.expiry_date).getTime() > new Date().getTime() : false,
  }));

  const expiringItems = mockStockItems.filter(item => item.isExpiringSoon);
  const totalItems = mockStockItems.length;
  const lowStockItems = mockStockItems.filter(item => item.quantity < 20).length;

  // Prepare stock report data for Excel export
  const stockReportData = mockStockItems.map(item => [
    item.name,
    item.category,
    item.quantity.toString(),
    item.unit,
    item.expiryDate || 'N/A',
    item.quantity <= 10 ? 'Baixo' : 'Normal'
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
            className="w-full md:w-auto"
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
            <div className="text-xl md:text-2xl font-bold text-warning-foreground">{lowStockItems}</div>
          </CardContent>
        </Card>

        <Card className="sm:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencendo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-destructive-foreground">{expiringItems.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas de Vencimento - Mobile Optimized */}
      {expiringItems.length > 0 && (
        <Card className="border-warning">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-sm md:text-base">
              <AlertTriangle className="h-4 w-4 md:h-5 md:w-5 text-warning-foreground" />
              <span>Itens com Vencimento Próximo</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {expiringItems.map((item) => (
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
      
      {expiringItems.length > 0 ? (
        <div className="space-y-4">
          {expiringItems.map((item) => (
            <Card key={item.id} className="border-warning">
              <CardContent className="pt-4 md:pt-6">
                <div className="flex flex-col space-y-2 md:flex-row md:items-start md:justify-between md:space-y-0">
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm md:text-base">{item.name}</h3>
                    <p className="text-xs md:text-sm text-muted-foreground">{item.category}</p>
                    <p className="text-xs md:text-sm">Estoque: {item.quantity} {item.unit}</p>
                  </div>
                  <Badge variant="destructive" className="text-xs w-fit">
                    Vence em {Math.ceil((new Date(item.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} dias
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Nenhum alerta no momento!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderReports = () => (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2 md:flex-row md:justify-between md:items-center md:space-y-0">
        <h2 className="text-lg md:text-xl font-semibold">Relatórios</h2>
        <ExportButton 
          data={stockReportData}
          headers={stockReportHeaders}
          filename="relatorio_estoque"
          title="Relatório de Estoque"
          className="w-full md:w-auto"
        />
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-sm md:text-base">Relatório Diário - {new Date().toLocaleDateString('pt-BR')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center text-xs md:text-sm">
            Use o botão "Exportar" acima para baixar o relatório completo em Excel, CSV ou imprimir.
          </p>
        </CardContent>
      </Card>
    </div>
  );

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
