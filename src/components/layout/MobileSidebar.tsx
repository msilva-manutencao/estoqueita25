
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  LayoutDashboard, 
  Plus, 
  Minus, 
  AlertTriangle, 
  FileText,
  ClipboardList,
  Package,
  Menu
} from "lucide-react";

interface MobileSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function MobileSidebar({ activeTab, onTabChange }: MobileSidebarProps) {
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

  const handleItemClick = (itemId: string) => {
    onTabChange(itemId);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Abrir menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72">
        <div className="flex flex-col space-y-4 py-4">
          <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-lg font-semibold">
              AppStoq
            </h2>
          </div>
          <div className="px-3">
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={activeTab === item.id ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start",
                      activeTab === item.id && "bg-primary text-primary-foreground"
                    )}
                    onClick={() => handleItemClick(item.id)}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
