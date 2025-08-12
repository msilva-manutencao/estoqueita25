
import { BarChart3, Package, FileText, Tag, List } from "lucide-react";
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
import { Link } from "react-router-dom";

const navItems = [
  { icon: BarChart3, label: "Dashboard", path: "/" },
  { icon: Package, label: "Itens", path: "/items" },
  { icon: Tag, label: "Categorias", path: "/categories" },
  { icon: List, label: "Listas Padrão", path: "/standard-lists" },
  { icon: FileText, label: "Relatórios", path: "/reports" },
];

interface NavigationProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const handleNavClick = (path: string) => {
    if (onTabChange && path === "/") {
      onTabChange("dashboard");
    }
  };

  return (
    <div className="border-r flex flex-col w-64">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="p-4">
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
              <Link
                to={item.path}
                key={item.label}
                className="flex items-center gap-2 rounded-md p-2 text-sm font-semibold hover:bg-secondary"
                onClick={() => handleNavClick(item.path)}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex-1 flex flex-col gap-0.5 p-4">
        {navItems.map((item) => (
          <Link
            to={item.path}
            key={item.label}
            className="flex items-center gap-2 rounded-md p-2 text-sm font-semibold hover:bg-secondary"
            onClick={() => handleNavClick(item.path)}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </div>

      <div className="p-4">
        <p className="text-sm text-muted-foreground">
          Sistema de Gestão de Estoque
        </p>
      </div>
    </div>
  );
}
