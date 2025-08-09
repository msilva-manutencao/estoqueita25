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
import { AlertTriangle, Package, TrendingUp, TrendingDown, Download, Plus } from "lucide-react";
import { mockItems } from "@/data/mockData";
import { BatchOperationForm } from "@/components/forms/BatchOperationForm";
import ItemsPage from "./ItemsPage";

// Mock data - será substituído pela integração com Supabase
const mockStockItems = [
  {
    id: "1",
    name: "Arroz branco",
    category: "Grãos e Insumos",
    quantity: 25,
    unit: "kg",
    expiryDate: "2024-12-15",
    isExpiringSoon: false,
  },
  {
    id: "2",
    name: "Feijão preto",
    category: "Grãos e Insumos", 
    quantity: 15,
    unit: "kg",
    expiryDate: "2024-08-20",
    isExpiringSoon: true,
  },
  {
    id: "3",
    name: "Copo descartável",
    category: "Higienização",
    quantity: 10,
    unit: "pacote",
    expiryDate: "2025-06-30",
    isExpiringSoon: false,
  },
  {
    id: "4",
    name: "Molho de tomate",
    category: "Molhos e Temperos",
    quantity: 50,
    unit: "lata",
    expiryDate: "2024-08-18",
    isExpiringSoon: true,
  },
];

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showBatchDialog, setShowBatchDialog] = useState(false);
  const [batchOperation, setBatchOperation] = useState<'entrada' | 'saida'>('entrada');

  const expiringItems = mockStockItems.filter(item => item.isExpiringSoon);
  const totalItems = mockStockItems.length;
  const lowStockItems = mockStockItems.filter(item => item.quantity < 20).length;

  // Prepare stock report data for Excel export
  const stockReportData = mockItems.map(item => [
    item.name,
    item.category,
    item.currentStock.toString(),
    item.unit,
    item.expiryDate || 'N/A',
    item.currentStock <= 10 ? 'Baixo' : 'Normal'
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

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Header with Batch Operations */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => handleBatchOperation('entrada')}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Entrada em Lote</span>
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleBatchOperation('saida')}
            className="flex items-center space-x-2"
          >
            <Package className="h-4 w-4" />
            <span>Saída em Lote</span>
          </Button>
          <ExportButton 
            data={stockReportData}
            headers={stockReportHeaders}
            filename="relatorio_estoque"
            title="Relatório de Estoque"
          />
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Itens</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning-foreground">{lowStockItems}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencendo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive-foreground">{expiringItems.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas de Vencimento */}
      {expiringItems.length > 0 && (
        <Card className="border-warning">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-warning-foreground" />
              <span>Itens com Vencimento Próximo</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {expiringItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-2 bg-warning rounded-lg">
                  <span className="font-medium">{item.name}</span>
                  <Badge variant="outline" className="text-warning-foreground">
                    {new Date(item.expiryDate).toLocaleDateString('pt-BR')}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ranking e Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopStockRanking />
        <div>
          <StockChart />
        </div>
      </div>
    </div>
  );

  const renderAlerts = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Alertas do Sistema</h2>
      
      {expiringItems.length > 0 ? (
        <div className="space-y-4">
          {expiringItems.map((item) => (
            <Card key={item.id} className="border-warning">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">{item.category}</p>
                    <p className="text-sm">Estoque: {item.quantity} {item.unit}</p>
                  </div>
                  <Badge variant="destructive">
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
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Relatórios</h2>
        <ExportButton 
          data={stockReportData}
          headers={stockReportHeaders}
          filename="relatorio_estoque"
          title="Relatório de Estoque"
        />
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Relatório Diário - {new Date().toLocaleDateString('pt-BR')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center">
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
      
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>

      <Dialog open={showBatchDialog} onOpenChange={setShowBatchDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
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
