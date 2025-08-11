
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
      priority: 1, // Sempre visível
    },
    {
      id: "items",
      label: "Gerenciar Itens",
      icon: Package,
      priority: 1, // Sempre visível
    },
    {
      id: "withdraw", 
      label: "Baixa de Estoque",
      icon: Minus,
      priority: 1, // Sempre visível
    },
    {
      id: "add-item",
      label: "Adicionar Item",
      icon: Plus,
      priority: 2, // Visível em telas pequenas
    },
    {
      id: "alerts",
      label: "Alertas",
      icon: AlertTriangle,
      priority: 2, // Visível em telas pequenas
    },
    {
      id: "standard-lists",
      label: "Fichas Padrão",
      icon: ClipboardList,
      priority: 3, // Visível em telas médias
    },
    {
      id: "reports",
      label: "Relatórios", 
      icon: FileText,
      priority: 3, // Visível em telas médias
    },
  ];

  // Filtrar itens para mobile baseado no tamanho da tela
  const getMobileItems = () => {
    // Sempre mostrar itens de prioridade 1
    const alwaysVisible = navItems.filter(item => item.priority === 1);
    
    return alwaysVisible;
  };

  const getSmallScreenItems = () => {
    return navItems.filter(item => item.priority <= 2);
  };

  const mobileItems = getMobileItems();
  const smallScreenItems = getSmallScreenItems();

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

          {/* Mobile Navigation - Responsivo por tamanho */}
          <div className="flex md:hidden items-center justify-center flex-1 px-4">
            {/* Telas muito pequenas - apenas 3 botões principais */}
            <div className="flex xs:hidden items-center justify-center space-x-1 w-full">
              {mobileItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={activeTab === item.id ? "default" : "ghost"}
                    size="sm"
                    onClick={() => onTabChange(item.id)}
                    className={cn(
                      "flex flex-col items-center justify-center flex-1 h-14 px-2 py-1",
                      activeTab === item.id && "bg-primary text-primary-foreground"
                    )}
                  >
                    <Icon className="h-5 w-5 mb-1" />
                    <span className="text-xs leading-none text-center">
                      {item.id === "items" ? "Gerenciar" : 
                       item.id === "withdraw" ? "Baixa" :
                       item.label.split(' ')[0]}
                    </span>
                  </Button>
                );
              })}
            </div>

            {/* Telas pequenas - 5 botões */}
            <div className="hidden xs:flex sm:hidden items-center justify-center space-x-1 w-full">
              {smallScreenItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={activeTab === item.id ? "default" : "ghost"}
                    size="sm"
                    onClick={() => onTabChange(item.id)}
                    className={cn(
                      "flex flex-col items-center justify-center flex-1 h-14 px-1 py-1",
                      activeTab === item.id && "bg-primary text-primary-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4 mb-1" />
                    <span className="text-xs leading-none text-center">
                      {item.id === "add-item" ? "Adicionar" :
                       item.id === "items" ? "Gerenciar" : 
                       item.id === "withdraw" ? "Baixa" :
                       item.label.split(' ')[0]}
                    </span>
                  </Button>
                );
              })}
            </div>

            {/* Telas médias - todos os botões */}
            <div className="hidden sm:flex md:hidden items-center space-x-1 overflow-x-auto scrollbar-hide w-full justify-center">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={activeTab === item.id ? "default" : "ghost"}
                    size="sm"
                    onClick={() => onTabChange(item.id)}
                    className={cn(
                      "flex flex-col items-center justify-center min-w-[70px] h-14 px-2 py-1 flex-shrink-0",
                      activeTab === item.id && "bg-primary text-primary-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4 mb-1" />
                    <span className="text-xs leading-none text-center max-w-[65px] truncate">
                      {item.id === "add-item" ? "Adicionar" :
                       item.id === "standard-lists" ? "Fichas" :
                       item.id === "items" ? "Gerenciar" : 
                       item.id === "withdraw" ? "Baixa" :
                       item.label.split(' ')[0]}
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
