import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Search, Edit, Trash2, Package, SortAsc, SortDesc, Filter } from "lucide-react";
import { mockItems, categories } from "@/data/mockData";
import { EditItemForm } from "@/components/forms/EditItemForm";

type SortField = 'name' | 'currentStock' | 'category' | 'status';
type SortOrder = 'asc' | 'desc';

export default function ItemsPage() {
  const [items, setItems] = useState(mockItems);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Todos");
  const [stockFilter, setStockFilter] = useState("all");
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [editingItem, setEditingItem] = useState<any>(null);

  // Filter and sort items
  const filteredAndSortedItems = items
    .filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === "Todos" || item.category === categoryFilter;
      const matchesStock = stockFilter === "all" || 
        (stockFilter === "low" && item.currentStock <= 10) ||
        (stockFilter === "high" && item.currentStock > 10);
      
      return matchesSearch && matchesCategory && matchesStock;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'currentStock':
          aValue = a.currentStock;
          bValue = b.currentStock;
          break;
        case 'category':
          aValue = a.category.toLowerCase();
          bValue = b.category.toLowerCase();
          break;
        case 'status':
          aValue = a.currentStock > 0 ? 'ativo' : 'inativo';
          bValue = b.currentStock > 0 ? 'ativo' : 'inativo';
          break;
        default:
          return 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleDeleteItem = (itemId: string) => {
    setItems(items.filter(item => item.id !== itemId));
  };

  const handleEditItem = (updatedItem: any) => {
    setItems(items.map(item => 
      item.id === updatedItem.id ? updatedItem : item
    ));
    setEditingItem(null);
  };

  const getStatusBadge = (stock: number) => {
    if (stock === 0) {
      return <Badge variant="destructive">Inativo</Badge>;
    } else if (stock <= 10) {
      return <Badge variant="outline" className="border-warning text-warning">Estoque Baixo</Badge>;
    } else {
      return <Badge variant="default">Ativo</Badge>;
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <SortAsc className="h-4 w-4 opacity-30" />;
    return sortOrder === 'asc' ? 
      <SortAsc className="h-4 w-4" /> : 
      <SortDesc className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Itens</h1>
          <p className="text-muted-foreground">
            Visualize, edite e gerencie todos os itens do estoque
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Package className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold">{filteredAndSortedItems.length}</span>
          <span className="text-muted-foreground">itens</span>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filtros e Busca</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar Item</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Nome do item..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Categoria</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Stock Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Quantidade</label>
              <Select value={stockFilter} onValueChange={setStockFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="low">Estoque Baixo (≤10)</SelectItem>
                  <SelectItem value="high">Estoque Alto (&gt;10)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters */}
            <div className="space-y-2">
              <label className="text-sm font-medium opacity-0">Clear</label>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setCategoryFilter("Todos");
                  setStockFilter("all");
                  setSortField('name');
                  setSortOrder('asc');
                }}
                className="w-full"
              >
                Limpar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mobile Cards View */}
      <div className="block md:hidden">
        <div className="space-y-4">
          {filteredAndSortedItems.map((item) => (
            <Card key={item.id} className="p-4">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">{item.category}</p>
                  </div>
                  {getStatusBadge(item.currentStock)}
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Estoque:</span>
                    <span className={`ml-2 font-medium ${item.currentStock <= 10 ? "text-warning" : ""}`}>
                      {item.currentStock} {item.unit}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Validade:</span>
                    <span className="ml-2">
                      {item.expiryDate ? 
                        new Date(item.expiryDate).toLocaleDateString('pt-BR') : 
                        'Não informado'
                      }
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 pt-2 border-t">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setEditingItem(item)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Editar Item</DialogTitle>
                      </DialogHeader>
                      {editingItem && (
                        <EditItemForm 
                          item={editingItem}
                          onSave={handleEditItem}
                          onCancel={() => setEditingItem(null)}
                        />
                      )}
                    </DialogContent>
                  </Dialog>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4 mr-1" />
                        Excluir
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir o item "{item.name}"? 
                          Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDeleteItem(item.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Desktop Table View */}
      <Card className="hidden md:block">
        <CardHeader>
          <CardTitle>Lista de Itens</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50 select-none"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center space-x-2">
                      <span>Nome</span>
                      <SortIcon field="name" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50 select-none"
                    onClick={() => handleSort('category')}
                  >
                    <div className="flex items-center space-x-2">
                      <span>Categoria</span>
                      <SortIcon field="category" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50 select-none"
                    onClick={() => handleSort('currentStock')}
                  >
                    <div className="flex items-center space-x-2">
                      <span>Estoque</span>
                      <SortIcon field="currentStock" />
                    </div>
                  </TableHead>
                  <TableHead>Unidade</TableHead>
                  <TableHead>Validade</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50 select-none"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center space-x-2">
                      <span>Status</span>
                      <SortIcon field="status" />
                    </div>
                  </TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>
                      <span className={item.currentStock <= 10 ? "text-warning font-medium" : ""}>
                        {item.currentStock}
                      </span>
                    </TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell>
                      {item.expiryDate ? 
                        new Date(item.expiryDate).toLocaleDateString('pt-BR') : 
                        'Não informado'
                      }
                    </TableCell>
                    <TableCell>{getStatusBadge(item.currentStock)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setEditingItem(item)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>Editar Item</DialogTitle>
                            </DialogHeader>
                            {editingItem && (
                              <EditItemForm 
                                item={editingItem}
                                onSave={handleEditItem}
                                onCancel={() => setEditingItem(null)}
                              />
                            )}
                          </DialogContent>
                        </Dialog>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir o item "{item.name}"? 
                                Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteItem(item.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredAndSortedItems.length === 0 && (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum item encontrado com os filtros aplicados.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
