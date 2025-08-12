
import { BarChart3, Package, FileText, Tag, List, Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

const navItems = [
  { icon: BarChart3, label: "Dashboard", value: "dashboard" },
  { icon: Package, label: "Adicionar Item", value: "add-item" },
  { icon: Package, label: "Retirar Item", value: "withdraw" },
  { icon: List, label: "Itens", value: "items" },
  { icon: Tag, label: "Categorias", value: "categories" },
  { icon: List, label: "Listas Padrão", value: "standard-lists" },
  { icon: FileText, label: "Alertas", value: "alerts" },
  { icon: FileText, label: "Relatórios", value: "reports" },
];

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <div className="border-b md:border-b-0 md:border-r bg-card">
      {/* Mobile Navigation */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="m-4">
              <Menu className="h-4 w-4 mr-2" />
              Menu
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            <SheetHeader className="pl-6 pr-8 pt-6">
              <SheetTitle>Menu</SheetTitle>
              <SheetDescription>
                Navegue pelas funcionalidades do sistema.
              </SheetDescription>
            </SheetHeader>
            <Separator />
            <div className="flex flex-col gap-0.5 p-4">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => onTabChange(item.value)}
                  className={`flex items-center gap-2 rounded-md p-2 text-sm font-semibold text-left hover:bg-secondary ${
                    activeTab === item.value ? 'bg-secondary' : ''
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </button>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:flex md:flex-col md:w-64 md:min-h-screen">
        <div className="flex-1 flex flex-col gap-0.5 p-4">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => onTabChange(item.value)}
              className={`flex items-center gap-2 rounded-md p-2 text-sm font-semibold text-left hover:bg-secondary ${
                activeTab === item.value ? 'bg-secondary' : ''
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </div>

        <div className="p-4">
          <p className="text-sm text-muted-foreground">
            Sistema de Gestão de Estoque
          </p>
        </div>
      </div>
    </div>
  );
}
