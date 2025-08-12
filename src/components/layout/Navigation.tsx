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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

const navItems = [
  { icon: BarChart3, label: "Dashboard", path: "/" },
  { icon: Package, label: "Itens", path: "/items" },
  { icon: Tag, label: "Categorias", path: "/categories" },
  { icon: List, label: "Listas Padrão", path: "/standard-lists" },
  { icon: FileText, label: "Relatórios", path: "/reports" },
];

export function Navigation() {
  const { user } = useUser();

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
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </div>
          <Separator />
          <div className="p-4">
            {user ? (
              <div className="flex items-center space-x-2">
                <Avatar>
                  <AvatarImage src={user.imageUrl} />
                  <AvatarFallback>
                    {user.firstName?.charAt(0)}
                    {user.lastName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{user.fullName}</p>
                  <p className="text-xs text-muted-foreground">
                    {user.emailAddresses[0].emailAddress}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Faça login para acessar sua conta.
              </p>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex-1 flex flex-col gap-0.5 p-4">
        {navItems.map((item) => (
          <Link
            to={item.path}
            key={item.label}
            className="flex items-center gap-2 rounded-md p-2 text-sm font-semibold hover:bg-secondary"
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </div>

      <TooltipProvider>
        <div className="p-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 w-full justify-start">
                  <Avatar>
                    <AvatarImage src={user.imageUrl} />
                    <AvatarFallback>
                      {user.firstName?.charAt(0)}
                      {user.lastName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col text-left">
                    <p className="text-sm font-medium">{user.fullName}</p>
                    <p className="text-xs text-muted-foreground">
                      {user.emailAddresses[0].emailAddress}
                    </p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80" align="end">
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link to="/profile">Perfil</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <a href="/sign-out">Sair</a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button variant="outline" className="w-full">
                  <a href="/sign-in">Fazer Login</a>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                Acesse sua conta para personalizar a experiência.
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </TooltipProvider>
    </div>
  );
}
