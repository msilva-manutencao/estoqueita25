
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart3, TrendingUp, TrendingDown, Package, Filter } from "lucide-react";
import { useSupabaseStockMovements } from "@/hooks/useSupabaseStockMovements";
import { DateRangeFilter } from "./DateRangeFilter";
import { ExportButton } from "./ExportButton";

export default function ReportsView() {
  const { movements, loading, fetchMovements, getMovementsSummary } = useSupabaseStockMovements();
  
  // Configurar datas padrão do mês corrente
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  const [filters, setFilters] = useState({
    startDate: firstDayOfMonth.toISOString().split('T')[0],
    endDate: lastDayOfMonth.toISOString().split('T')[0],
    movementType: 'all' as 'entrada' | 'saida' | 'all'
  });

  // Aplicar filtros quando houver mudanças
  useEffect(() => {
    fetchMovements(filters);
  }, [filters]);

  const summary = getMovementsSummary(movements);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    setFilters({
      startDate: firstDayOfMonth.toISOString().split('T')[0],
      endDate: lastDayOfMonth.toISOString().split('T')[0],
      movementType: 'all'
    });
  };

  const getMovementTypeBadge = (type: string) => {
    return type === 'entrada' ? 
      <Badge variant="default" className="bg-green-100 text-green-800">Entrada</Badge> :
      <Badge variant="destructive">Saída</Badge>;
  };

  // Agrupar movimentações por categoria
  const movementsByCategory = movements.reduce((acc, movement) => {
    const categoryName = movement.items?.categories?.name || 'Sem Categoria';
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(movement);
    return acc;
  }, {} as Record<string, typeof movements>);

  // Format movements data for export
  const formatMovementsForExport = () => {
    return movements.map(movement => [
      new Date(movement.date).toLocaleDateString('pt-BR'),
      movement.items?.name || 'Item não encontrado',
      movement.items?.categories?.name || 'Sem categoria',
      movement.movement_type === 'entrada' ? 'Entrada' : 'Saída',
      movement.quantity.toString(),
      movement.items?.units?.abbreviation || movement.items?.units?.name || 'un',
      movement.description || 'Sem descrição'
    ]);
  };

  const exportHeaders = [
    'Data',
    'Item',
    'Categoria',
    'Tipo',
    'Quantidade',
    'Unidade',
    'Descrição'
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="text-lg">Carregando relatórios...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-center md:justify-start space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filtros</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-1">
              <DateRangeFilter
                startDate={filters.startDate}
                endDate={filters.endDate}
                onStartDateChange={(date) => handleFilterChange('startDate', date)}
                onEndDateChange={(date) => handleFilterChange('endDate', date)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Movimentação</label>
              <Select 
                value={filters.movementType} 
                onValueChange={(value) => handleFilterChange('movementType', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="entrada">Entradas</SelectItem>
                  <SelectItem value="saida">Saídas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center mt-4 gap-4">
            <Button variant="outline" onClick={clearFilters} className="w-full md:w-auto">
              Limpar Filtros
            </Button>
            <ExportButton 
              data={formatMovementsForExport()} 
              headers={exportHeaders}
              filename="relatorio-movimentacoes" 
              title="Relatório de Movimentações"
              className="w-full md:w-auto"
            />
          </div>
        </CardContent>
      </Card>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Movimentações</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-center">{summary.totalMovements}</div>
            <p className="text-xs text-muted-foreground text-center">
              No período selecionado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entradas</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 text-center">{summary.entries.count}</div>
            <p className="text-xs text-muted-foreground text-center">
              Quantidade total: {summary.entries.quantity}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saídas</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 text-center">{summary.exits.count}</div>
            <p className="text-xs text-muted-foreground text-center">
              Quantidade total: {summary.exits.quantity}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Movimentações agrupadas por categoria */}
      <div className="space-y-6">
        {Object.entries(movementsByCategory).map(([categoryName, categoryMovements]) => (
          <Card key={categoryName}>
            <CardHeader>
              <CardTitle className="text-center md:text-left">
                {categoryName} ({categoryMovements.length} movimentações)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20 md:w-24">Data</TableHead>
                      <TableHead className="min-w-32">Item</TableHead>
                      <TableHead className="w-20 md:w-24">Tipo</TableHead>
                      <TableHead className="w-20 md:w-24">Qtd</TableHead>
                      <TableHead className="w-16 md:w-20">Un.</TableHead>
                      <TableHead className="hidden md:table-cell min-w-40">Descrição</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categoryMovements.map((movement) => (
                      <TableRow key={movement.id}>
                        <TableCell className="text-xs md:text-sm whitespace-nowrap">
                          {new Date(movement.date).toLocaleDateString('pt-BR', { 
                            day: '2-digit', 
                            month: '2-digit' 
                          })}
                        </TableCell>
                        <TableCell className="font-medium text-xs md:text-sm">
                          <div className="truncate max-w-32 md:max-w-none">
                            {movement.items?.name || 'Item não encontrado'}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs md:text-sm">
                          <Badge 
                            variant={movement.movement_type === 'entrada' ? 'default' : 'destructive'}
                            className="text-xs px-1 py-0"
                          >
                            {movement.movement_type === 'entrada' ? 'E' : 'S'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs md:text-sm">
                          <span className={movement.movement_type === 'entrada' ? 'text-green-600' : 'text-red-600'}>
                            {movement.movement_type === 'entrada' ? '+' : '-'}{movement.quantity}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs md:text-sm">
                          {movement.items?.units?.abbreviation || movement.items?.units?.name || 'un'}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-xs md:text-sm max-w-40 truncate">
                          {movement.description || 'Sem descrição'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {movements.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Nenhuma movimentação encontrada no período selecionado.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
