import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { EditItemForm } from "@/components/forms/EditItemForm";
import { Package, Search, Edit, Trash2, AlertTriangle, Calendar, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

export function ItemsManager() {
    const [items, setItems] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [units, setUnits] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [editingItem, setEditingItem] = useState<string | null>(null);
    const { toast } = useToast();

    const fetchData = async () => {
        try {
            setLoading(true);
            console.log("Carregando dados...");

            // Buscar itens com categorias e unidades
            const { data: itemsData, error: itemsError } = await supabase
                .from('items')
                .select(`
          *,
          categories (name),
          units (name, abbreviation)
        `);

            if (itemsError) {
                console.error("Erro ao buscar itens:", itemsError);
                toast({
                    title: "Erro",
                    description: "Não foi possível carregar os itens",
                    variant: "destructive",
                });
            } else {
                console.log("Itens carregados:", itemsData);
                setItems(itemsData || []);
            }

            // Buscar categorias
            const { data: categoriesData, error: categoriesError } = await supabase
                .from('categories')
                .select('*')
                .order('name');

            if (categoriesError) {
                console.error("Erro ao buscar categorias:", categoriesError);
            } else {
                console.log("Categorias carregadas:", categoriesData);
                setCategories(categoriesData || []);
            }

            // Buscar unidades
            const { data: unitsData, error: unitsError } = await supabase
                .from('units')
                .select('*')
                .order('name');

            if (unitsError) {
                console.error("Erro ao buscar unidades:", unitsError);
            } else {
                console.log("Unidades carregadas:", unitsData);
                setUnits(unitsData || []);
            }

        } catch (error) {
            console.error("Erro geral:", error);
            toast({
                title: "Erro de Conexão",
                description: "Verifique sua conexão com a internet",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const deleteItem = async (itemId: string) => {
        try {
            const { error } = await supabase
                .from('items')
                .delete()
                .eq('id', itemId);

            if (error) {
                console.error("Erro ao excluir item:", error);
                toast({
                    title: "Erro",
                    description: "Não foi possível excluir o item",
                    variant: "destructive",
                });
                return false;
            }

            toast({
                title: "Sucesso",
                description: "Item excluído com sucesso",
            });

            // Recarregar dados
            await fetchData();
            return true;
        } catch (error) {
            console.error("Erro na conexão:", error);
            return false;
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredItems = items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === "all" || item.category_id === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleDeleteItem = async (itemId: string, itemName: string) => {
        if (window.confirm(`Tem certeza que deseja excluir o item "${itemName}"?`)) {
            await deleteItem(itemId);
        }
    };

    const getStockStatus = (currentStock: number, minimumStock: number) => {
        if (currentStock <= minimumStock) {
            return { status: "low", color: "destructive", text: "Estoque Baixo" };
        }
        if (currentStock <= minimumStock * 1.5) {
            return { status: "medium", color: "secondary", text: "Estoque Médio" };
        }
        return { status: "good", color: "default", text: "Estoque Bom" };
    };

    const isExpiringSoon = (expiryDate: string | null) => {
        if (!expiryDate) return false;
        const expiry = new Date(expiryDate);
        const now = new Date();
        const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 3600 * 24));
        return daysLeft <= 30;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="flex items-center space-x-2">
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    <span className="text-lg">Carregando itens...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Package className="h-5 w-5" />
                        <span>Gerenciar Itens</span>
                    </CardTitle>
                    <CardDescription>
                        Visualize, edite e gerencie todos os itens do seu estoque
                    </CardDescription>
                    <div className="flex justify-end">
                        <Button variant="outline" size="sm" onClick={fetchData}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Atualizar
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Filtros */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <Label htmlFor="search">Buscar item</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="search"
                                    placeholder="Digite o nome do item..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div className="sm:w-48">
                            <Label htmlFor="category">Categoria</Label>
                            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Todas as categorias" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todas as categorias</SelectItem>
                                    {categories.map((category) => (
                                        <SelectItem key={category.id} value={category.id}>
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Estatísticas */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                            <CardContent className="p-4">
                                <div className="text-2xl font-bold">{filteredItems.length}</div>
                                <p className="text-sm text-muted-foreground">Itens encontrados</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="text-2xl font-bold text-destructive">
                                    {filteredItems.filter(item => item.current_stock <= item.minimum_stock).length}
                                </div>
                                <p className="text-sm text-muted-foreground">Com estoque baixo</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="text-2xl font-bold text-orange-600">
                                    {filteredItems.filter(item => isExpiringSoon(item.expiry_date)).length}
                                </div>
                                <p className="text-sm text-muted-foreground">Vencendo em 30 dias</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Tabela de itens */}
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Item</TableHead>
                                    <TableHead>Categoria</TableHead>
                                    <TableHead>Estoque Atual</TableHead>
                                    <TableHead>Estoque Mínimo</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Validade</TableHead>
                                    <TableHead>Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredItems.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8">
                                            <div className="flex flex-col items-center space-y-2">
                                                <Package className="h-8 w-8 text-muted-foreground" />
                                                <p className="text-muted-foreground">
                                                    {searchTerm || selectedCategory !== "all"
                                                        ? "Nenhum item encontrado com os filtros aplicados"
                                                        : "Nenhum item cadastrado"}
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredItems.map((item) => {
                                        const stockStatus = getStockStatus(item.current_stock, item.minimum_stock);
                                        const category = categories.find(c => c.id === item.category_id);
                                        const unit = units.find(u => u.id === item.unit_id);
                                        const expiringSoon = isExpiringSoon(item.expiry_date);

                                        return (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-medium">{item.name}</TableCell>
                                                <TableCell>{category?.name || "N/A"}</TableCell>
                                                <TableCell>
                                                    {item.current_stock} {unit?.abbreviation || ""}
                                                </TableCell>
                                                <TableCell>
                                                    {item.minimum_stock} {unit?.abbreviation || ""}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center space-x-2">
                                                        <Badge variant={stockStatus.color as any}>
                                                            {stockStatus.text}
                                                        </Badge>
                                                        {item.current_stock <= item.minimum_stock && (
                                                            <AlertTriangle className="h-4 w-4 text-destructive" />
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {item.expiry_date ? (
                                                        <div className="flex items-center space-x-2">
                                                            <span className={expiringSoon ? "text-orange-600" : ""}>
                                                                {format(new Date(item.expiry_date), "dd/MM/yyyy", { locale: ptBR })}
                                                            </span>
                                                            {expiringSoon && (
                                                                <Calendar className="h-4 w-4 text-orange-600" />
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground">Sem validade</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center space-x-2">
                                                        <Dialog>
                                                            <DialogTrigger asChild>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => setEditingItem(item.id)}
                                                                >
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                            </DialogTrigger>
                                                            <DialogContent className="max-w-md">
                                                                <DialogHeader>
                                                                    <DialogTitle>Editar Item</DialogTitle>
                                                                    <DialogDescription>
                                                                        Edite as informações do item "{item.name}"
                                                                    </DialogDescription>
                                                                </DialogHeader>
                                                                <EditItemForm
                                                                    item={item}
                                                                    onSuccess={() => {
                                                                        setEditingItem(null);
                                                                        fetchData();
                                                                    }}
                                                                />
                                                            </DialogContent>
                                                        </Dialog>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleDeleteItem(item.id, item.name)}
                                                            className="text-destructive hover:text-destructive"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}