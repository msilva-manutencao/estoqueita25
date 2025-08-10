
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Plus, 
  Minus, 
  AlertTriangle, 
  FileText,
  ClipboardList,
  Package
} from "lucide-react";
import { MobileSidebar } from "./MobileSidebar";

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      id: "add-item",
      label: "Adicionar Item",
      icon: Plus,
    },
    {
      id: "withdraw", 
      label: "Baixa de Estoque",
      icon: Minus,
    },
    {
      id: "items",
      label: "Gerenciar Itens",
      icon: Package,
    },
    {
      id: "standard-lists",
      label: "Fichas Padrão",
      icon: ClipboardList,
    },
    {
      id: "alerts",
      label: "Alertas",
      icon: AlertTriangle,
    },
    {
      id: "reports",
      label: "Relatórios", 
      icon: FileText,
    },
  ];

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-6">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <MobileSidebar activeTab={activeTab} onTabChange={onTabChange} />
            <h1 className="hidden sm:block text-xl font-semibold">Sistema de Estoque</h1>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onTabChange(item.id)}
                  className={cn(
                    "flex items-center space-x-2",
                    activeTab === item.id && "bg-primary text-primary-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Button>
              );
            })}
          </div>

          {/* Mobile Navigation - Improved buttons */}
          <div className="flex md:hidden items-center justify-center flex-1 px-4">
            <div className="flex items-center space-x-2 overflow-x-auto scrollbar-hide">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={activeTab === item.id ? "default" : "ghost"}
                    size="sm"
                    onClick={() => onTabChange(item.id)}
                    className={cn(
                      "flex flex-col items-center justify-center min-w-[64px] h-12 px-3 py-1",
                      activeTab === item.id && "bg-primary text-primary-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4 mb-1" />
                    <span className="text-xs leading-none truncate max-w-[60px]">
                      {item.label.split(' ')[0]}
                    </span>
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
