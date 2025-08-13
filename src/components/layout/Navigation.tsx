
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MobileSidebar } from "./MobileSidebar";
import { CompanySelector } from "@/components/companies/CompanySelector";
import { useSuperAdmin } from "@/hooks/useSuperAdmin";
import {
  LayoutDashboard,
  Plus,
  Minus,
  ArrowDownToLine,
  ArrowUpFromLine,
  Package,
  FileText,
  Download,
  List,
  Tag,
  Ruler,
  Users,
  Building2,
  Crown
} from "lucide-react";

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { isSuperAdmin } = useSuperAdmin();

  const baseMenuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "add-item", label: "Adicionar Item", icon: Plus },
    { id: "withdraw", label: "Retirar Item", icon: Minus },
    { id: "batch-entry", label: "Entrada em Lote", icon: ArrowDownToLine },
    { id: "batch-exit", label: "Saída em Lote", icon: ArrowUpFromLine },
    { id: "items", label: "Gerenciar Itens", icon: Package },
    { id: "categories", label: "Categorias", icon: Tag },
    { id: "units", label: "Unidades", icon: Ruler },
    { id: "standard-lists", label: "Listas Padrão", icon: List },
    { id: "companies", label: "Empresas", icon: Building2 },
    { id: "users", label: "Usuários", icon: Users },
    { id: "reports", label: "Relatórios", icon: FileText },
    { id: "export", label: "Exportar", icon: Download },
  ];

  const adminMenuItems = [
    { id: "admin", label: "Super Admin", icon: Crown },
  ];

  const menuItems = isSuperAdmin ? [...baseMenuItems, ...adminMenuItems] : baseMenuItems;

  return (
    <>
      {/* Mobile sidebar */}
      <div className="lg:hidden">
        <MobileSidebar
          activeTab={activeTab}
          onTabChange={onTabChange}
          menuItems={menuItems}
        />
      </div>

      {/* Desktop sidebar */}
      <div className={cn(
        "hidden lg:block fixed left-0 top-0 h-full bg-card border-r transition-all duration-300 z-30",
        collapsed ? "w-16" : "w-64"
      )}>
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            {!collapsed && (
              <h1 className="text-lg font-semibold">Sistema de Estoque</h1>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCollapsed(!collapsed)}
              className="p-2"
            >
              {collapsed ? "→" : "←"}
            </Button>
          </div>
          {!collapsed && (
            <div className="mt-4">
              <CompanySelector />
            </div>
          )}
        </div>

        <nav className="p-2 space-y-1">
          {menuItems.map((item) => (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "default" : "ghost"}
              className={cn(
                "w-full justify-start",
                collapsed ? "px-2" : "px-3"
              )}
              onClick={() => onTabChange(item.id)}
            >
              <item.icon className={cn("h-5 w-5", !collapsed && "mr-3")} />
              {!collapsed && <span>{item.label}</span>}
            </Button>
          ))}
        </nav>
      </div>
    </>
  );
}
