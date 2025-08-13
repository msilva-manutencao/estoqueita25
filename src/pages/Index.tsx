import { useState } from "react";
import { Navigation } from "@/components/layout/Navigation";
import { AddItemForm } from "@/components/forms/AddItemForm";
import { WithdrawForm } from "@/components/forms/WithdrawForm";
import { BatchEntryForm } from "@/components/forms/BatchEntryForm";
import { BatchExitForm } from "@/components/forms/BatchExitForm";
import { StockCard } from "@/components/dashboard/StockCard";
import { StockChart } from "@/components/dashboard/StockChart";
import { TopStockRanking } from "@/components/dashboard/TopStockRanking";
import ReportsView from "@/components/reports/ReportsView";
import { ExportView } from "@/components/reports/ExportView";
import { StandardListsManager } from "@/components/standard-lists/StandardListsManager";
import { AuthPage } from "@/components/auth/AuthPage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSupabaseItems } from "@/hooks/useSupabaseItems";
import { useAuth } from "@/hooks/useAuth";
import { Package, TrendingUp, AlertTriangle, Clock, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Index() {
  const [activeView, setActiveView] = useState("dashboard");
  const { items } = useSupabaseItems();
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  const totalItems = items.length;
  const lowStockItems = items.filter(item => item.current_stock <= item.minimum_stock).length;
  const expiringSoonItems = items.filter(item => {
    if (!item.expiry_date) return false;
    const expiryDate = new Date(item.expiry_date);
    const now = new Date();
    const timeDiff = expiryDate.getTime() - now.getTime();
    const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysLeft <= 30;
  }).length;

  const renderContent = () => {
    switch (activeView) {
      case "dashboard":
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold">Painel de Controle</h1>
              <p className="text-muted-foreground">
                Visão geral do seu estoque
              </p>
              <div className="flex justify-center mt-4">
                <Button variant="outline" onClick={signOut} className="flex items-center space-x-2">
                  <LogOut className="h-4 w-4" />
                  <span>Sair</span>
                </Button>
              </div>
            </div>

            <StockCard items={items} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <StockChart />
              <TopStockRanking />
            </div>
          </div>
        );
      case "add":
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
      case "lists":
        return (
          <div>
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold">Gerenciar Listas</h1>
            </div>
            <StandardListsManager />
          </div>
        );
      case "reports":
        return <ReportsView />;
      case "export":
        return <ExportView />;
      default:
        return (
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Bem-vindo ao Sistema de Estoque</h1>
            <p className="text-muted-foreground">
              Selecione uma opção no menu lateral para começar.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation activeView={activeView} onViewChange={setActiveView} />
      <main className="lg:ml-64 p-4 lg:p-8">
        {renderContent()}
      </main>
    </div>
  );
}
