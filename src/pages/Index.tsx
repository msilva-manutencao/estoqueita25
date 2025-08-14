import { useState, useEffect } from "react";
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
import { ItemsManager } from "@/components/items/ItemsManager";
import { UnitsManager } from "@/components/units/UnitsManager";
import { CategoriesManager } from "@/components/categories/CategoriesManager";
import { CompaniesManager } from "@/components/companies/CompaniesManager";
import { SuperAdminPanel } from "@/components/admin/SuperAdminPanel";
import { NoCompanySelected } from "@/components/companies/NoCompanySelected";
import { NoCompanyAccess } from "@/components/companies/NoCompanyAccess";
import UsersPage from "@/pages/UsersPage";

import { AuthPage } from "@/components/auth/AuthPage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSupabaseItems } from "@/hooks/useSupabaseItems";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentCompany } from "@/hooks/useCurrentCompany";
import { useCompanies } from "@/hooks/useCompanies";
import { Package, TrendingUp, AlertTriangle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import React from "react";

export default function Index() {
  const [activeView, setActiveView] = useState("dashboard");
  const { items } = useSupabaseItems();
  const { user, loading, signOut } = useAuth();
  const { currentCompany } = useCurrentCompany();
  
  // Importar useCompanies para verificar se o usuário tem acesso a empresas
  const { companies: userCompanies, loading: companiesLoading } = useCompanies();

  // Debug logs
  useEffect(() => {
    console.log('Index - Estado atual:', {
      user: user?.email,
      loading,
      companiesLoading,
      userCompaniesCount: userCompanies.length,
      currentCompany: currentCompany?.name
    });
  }, [user, loading, companiesLoading, userCompanies, currentCompany]);

  // Timeout de segurança para evitar carregamento infinito
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading || companiesLoading) {
        setLoadingTimeout(true);
        console.warn('Timeout de carregamento atingido');
      }
    }, 10000); // 10 segundos

    return () => clearTimeout(timer);
  }, [loading, companiesLoading]);

  if ((loading || companiesLoading) && !loadingTimeout) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg mb-2">Carregando...</div>
          <div className="text-sm text-muted-foreground">
            Conectando ao servidor...
          </div>
        </div>
      </div>
    );
  }

  if (loadingTimeout) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg mb-4 text-red-600">Erro de Conexão</div>
          <div className="text-sm text-muted-foreground mb-4">
            Não foi possível conectar ao servidor. Verifique sua conexão com a internet.
          </div>
          <Button onClick={() => window.location.reload()}>
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  // Se o usuário não tem acesso a nenhuma empresa, mostrar tela de acesso pendente
  if (userCompanies.length === 0) {
    return <NoCompanyAccess />;
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
    // Mostrar tela de seleção de empresa se não houver empresa selecionada
    // (exceto para as páginas de empresas e admin)
    if (!currentCompany && activeView !== 'companies' && activeView !== 'admin') {
      return <NoCompanySelected onNavigateToCompanies={() => setActiveView('companies')} />;
    }

    switch (activeView) {
      case "dashboard":
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold">Painel de Controle</h1>
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
        return <AddItemForm />;
      case "withdraw":
        return <WithdrawForm />;
      case "batch-entry":
        return <BatchEntryForm />;
      case "batch-exit":
        return <BatchExitForm />;
      case "items":
        return <ItemsManager />;
      case "categories":
        return (
          <div>
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold">Gerenciar Categorias</h1>
            </div>
            <CategoriesManager />
          </div>
        );
      case "units":
        return (
          <div>
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold">Gerenciar Unidades</h1>
            </div>
            <UnitsManager />
          </div>
        );
      case "standard-lists":
        return (
          <div>
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold">Gerenciar Listas</h1>
            </div>
            <StandardListsManager />
          </div>
        );
      case "companies":
        return (
          <div>
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold">Gerenciar Empresas</h1>
            </div>
            <CompaniesManager />
          </div>
        );
      case "admin":
        return (
          <div>
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold">Painel Super Admin</h1>
            </div>
            <SuperAdminPanel />
          </div>
        );
      case "reports":
        return <ReportsView />;
      case "export":
        return <ExportView />;
      case "users":
        return (
          <div>
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold">Gerenciar Usuários</h1>
            </div>
            <UsersPage />
          </div>
        );
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
      <Navigation activeTab={activeView} onTabChange={setActiveView} />
      <main className="lg:ml-64 p-4 lg:p-8">
        {renderContent()}
      </main>
    </div>
  );
}
