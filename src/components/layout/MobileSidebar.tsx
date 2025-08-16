
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
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
  Crown,
  Menu,
  LogOut,
  Receipt
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSuperAdmin } from "@/hooks/useSuperAdmin";
import { CompanySelector } from "@/components/companies/CompanySelector";

interface MobileSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function MobileSidebar({ activeTab, onTabChange }: MobileSidebarProps) {
  const [open, setOpen] = useState(false);
  const { signOut } = useAuth();
  const { isSuperAdmin } = useSuperAdmin();

  const baseMenuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "add-item", label: "Adicionar Item", icon: Plus },
    { id: "withdraw", label: "Retirar Item", icon: Minus },
    { id: "batch-entry", label: "Entrada em Lote", icon: ArrowDownToLine },
    { id: "batch-exit", label: "Saída em Lote", icon: ArrowUpFromLine },
    { id: "invoice", label: "Nota Fiscal", icon: Receipt },
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

  const navItems = isSuperAdmin ? [...baseMenuItems, ...adminMenuItems] : baseMenuItems;

  const handleItemClick = (itemId: string) => {
    onTabChange(itemId);
    setOpen(false); // Fechar o sidebar após clicar
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Abrir menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 flex flex-col">
        <div className="flex flex-col h-full py-4">
          <div className="px-3 py-2 flex-shrink-0">
            <h2 className="mb-2 px-4 text-lg font-semibold">
              Sistema de Estoque
            </h2>
          </div>
          <div className="px-3 mb-4 flex-shrink-0">
            <CompanySelector />
          </div>
          <div className="px-3 flex-1 overflow-y-auto">
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
          <div className="px-3 pt-4 border-t flex-shrink-0">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => {
                signOut();
                setOpen(false);
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
