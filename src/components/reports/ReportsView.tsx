
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Download, FileText, TrendingUp, TrendingDown, Package, AlertTriangle, Loader2 } from "lucide-react";
import { useSupabaseItems } from "@/hooks/useSupabaseItems";
import { useSupabaseCategories } from "@/hooks/useSupabaseCategories";
import { useSupabaseStockMovements } from "@/hooks/useSupabaseStockMovements";
import { ExportButton } from "./ExportButton";

export function ReportsView() {
  const { items, loading: itemsLoading } = useSupabaseItems();
  const { categories } = useSupabaseCategories();
  const { movements, loading: movementsLoading, fetchMovements, getMovementsSummary } = useSupabaseStockMovements();
  
  const [selectedReport, setSelectedReport] = useState("stock");
  const [dateFrom, setDateFrom] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [movementType, setMovementType] = useState<'entrada' | 'saida' | 'all'>('all');

  const allCategories = ["Todos", ...categories.map(cat => cat.name)];

  // Filtrar itens por categoria
  const filteredItems = items.filter(item => 
    selectedCategory === "Todos" || item.categories?.name === selectedCategory
  );

  // Calcular alertas
  const lowStockItems = filteredItems.filter(item => 
    item.current_stock < (item.minimum_stock || 10)
  );

  const expiringItems = filteredItems.filter(item => 
    item.expiry_date && 
    new Date(item.expiry_date).getTime() - new Date().getTime() <= 60 * 24 * 60 * 60 * 1000 &&
    new Date(item.expiry_date).getTime() > new Date().getTime()
  );

  // Buscar movimentações com filtros
  const handleFetchMovements = () => {
    fetchMovements({
      startDate: dateFrom,
      endDate: dateTo,
      movementType: movementType
    });
  };

  const movementsSummary = getMovementsSummary(movements);

  const getReportData = () => {
    switch (selectedReport) {
      case "stock":
        return {
          title: "Relatório de Estoque Físico",
          headers: ["Item", "Categoria", "Estoque Atual", "Estoque Mínimo", "Unidade", "Data de Validade", "Status"],
          data: filteredItems.map(item => [
            item.name,
            item.categories?.name || 'Sem categoria',
            item.current_stock.toString(),
            (item.minimum_stock || 10).toString(),
            item.units?.abbreviation || item.units?.name || 'un',
            item.expiry_date ? new Date(item.expiry_date).toLocaleDateString('pt-BR') : 'Sem data',
            item.current_stock < (item.minimum_stock || 10) ? 'Estoque Baixo' : 
            (item.expiry_date && new Date(item.expiry_date).getTime() - new Date().getTime() <= 30 * 24 * 60 * 60 * 1000) ? 'Vencendo' : 'Normal'
          ])
        };
      
      case "movements":
        return {
          title: "Relatório de Movimentações",
          headers: ["Data", "Item", "Categoria", "Tipo", "Quantidade", "Unidade", "Descrição"],
          data: movements.map(movement => [
            new Date(movement.date).toLocaleDateString('pt-BR'),
            movement.items?.name || 'Item não encontrado',
            movement.items?.categories?.name || 'Sem categoria',
            movement.movement_type === 'entrada' ? 'Entrada' : 'Saída',
            movement.quantity.toString(),
            movement.items?.units?.abbreviation || movement.items?.units?.name || 'un',
            movement.description || '-'
          ])
        };
      
      case "alerts":
        const alertsData = [
          ...lowStockItems.map(item => [
            item.name,
            item.categories?.name || 'Sem categoria',
            'Estoque Baixo',
            `Atual: ${item.current_stock}, Mínimo: ${item.minimum_stock || 10}`,
            item.units?.abbreviation || item.units?.name || 'un',
            'Alta'
          ]),
          ...expiringItems.map(item => [
            item.name,
            item.categories?.name || 'Sem categoria',
            'Vencimento Próximo',
            item.expiry_date ? new Date(item.expiry_date).toLocaleDateString('pt-BR') : 'Sem data',
            item.units?.abbreviation || item.units?.name || 'un',
            new Date(item.expiry_date!).getTime() - new Date().getTime() <= 7 * 24 * 60 * 60 * 1000 ? 'Crítica' : 'Média'
          ])
        ];
        
        return {
          title: "Relatório de Alertas",
          headers: ["Item", "Categoria", "Tipo de Alerta", "Detalhes", "Unidade", "Prioridade"],
          data: alertsData
        };
      
      default:
        return { title: "", headers: [], data: [] };
    }
  };

  const reportData = getReportData();

  const statistics = {
    totalItems: filteredItems.length,
    totalMovements: movements.length,
    totalEntries: movementsSummary.entries.count,
    totalExits: movementsSummary.exits.count,
    lowStockItems: lowStockItems.length,
    expiringItems: expiringItems.length
  };

  const isLoading = itemsLoading || movementsLoading;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold flex items-center space-x-2">
            <FileText className="h-6 w-6" />
            <span>Relatórios</span>
          </h2>
          <p className="text-muted-foreground">
            Gere relatórios detalhados do seu estoque
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Package className="h-8 w-8 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{statistics.totalItems}</div>
            <div className="text-xs text-muted-foreground">Total de Itens</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-success" />
            <div className="text-2xl font-bold">{statistics.totalEntries}</div>
            <div className="text-xs text-muted-foreground">Entradas</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingDown className="h-8 w-8 mx-auto mb-2 text-destructive" />
            <div className="text-2xl font-bold">{statistics.totalExits}</div>
            <div className="text-xs text-muted-foreground">Saídas</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="h-8 w-8 mx-auto mb-2 text-warning" />
            <div className="text-2xl font-bold">{statistics.expiringItems}</div>
            <div className="text-xs text-muted-foreground">Vencendo</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <div className="text-2xl font-bold">{statistics.lowStockItems}</div>
            <div className="text-xs text-muted-foreground">Estoque Baixo</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <FileText className="h-8 w-8 mx-auto mb-2 text-accent" />
            <div className="text-2xl font-bold">{statistics.totalMovements}</div>
            <div className="text-xs text-muted-foreground">Movimentações</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedReport} onValueChange={setSelectedReport} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="stock">Estoque Físico</TabsTrigger>
          <TabsTrigger value="movements">Movimentações</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
        </TabsList>

        <TabsContent value="stock" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Filtros - Relatório de Estoque</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {allCategories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Filtros - Relatório de Movimentações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Data Inicial</Label>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Data Final</Label>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Tipo de Movimento</Label>
                  <Select value={movementType} onValueChange={(value: 'entrada' | 'saida' | 'all') => setMovementType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="entrada">Entrada</SelectItem>
                      <SelectItem value="saida">Saída</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>&nbsp;</Label>
                  <Button onClick={handleFetchMovements} className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Buscar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Filtros - Relatório de Alertas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {allCategories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{reportData.title}</CardTitle>
          <div className="flex space-x-2">
            <ExportButton
              data={reportData.data}
              headers={reportData.headers}
              filename={`${selectedReport}_${dateFrom}_${dateTo}`}
              title={reportData.title}
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Carregando dados...</span>
            </div>
          ) : reportData.data.length > 0 ? (
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {reportData.headers.map((header, index) => (
                      <TableHead key={index}>{header}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.data.map((row, index) => (
                    <TableRow key={index}>
                      {row.map((cell, cellIndex) => (
                        <TableCell key={cellIndex}>{cell}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum dado encontrado para os filtros selecionados.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
