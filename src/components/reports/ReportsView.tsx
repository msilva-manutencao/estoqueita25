import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Download, FileText, TrendingUp, TrendingDown, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { mockItems, mockStockMovements, categories, getExpiringItems, getLowStockItems } from "@/data/mockData";
import { ExportButton } from "./ExportButton";

export function ReportsView() {
  const { toast } = useToast();
  const [selectedReport, setSelectedReport] = useState("movements");
  const [dateFrom, setDateFrom] = useState("2024-01-01");
  const [dateTo, setDateTo] = useState("2024-12-31");
  const [selectedCategory, setSelectedCategory] = useState("Todos");

  const filteredMovements = mockStockMovements.filter(movement => {
    const movementDate = new Date(movement.date);
    const fromDate = new Date(dateFrom);
    const toDate = new Date(dateTo);
    
    const dateMatch = movementDate >= fromDate && movementDate <= toDate;
    const categoryMatch = selectedCategory === "Todos" || 
      mockItems.find(item => item.id === movement.itemId)?.category === selectedCategory;
    
    return dateMatch && categoryMatch;
  });

  const expiringItems = getExpiringItems(30);
  const lowStockItems = getLowStockItems(10);

  const stockSummary = mockItems.map(item => {
    const movements = mockStockMovements.filter(m => m.itemId === item.id);
    const totalEntries = movements.filter(m => m.type === 'entrada').reduce((sum, m) => sum + m.quantity, 0);
    const totalExits = movements.filter(m => m.type === 'saida').reduce((sum, m) => sum + m.quantity, 0);
    
    return {
      ...item,
      totalEntries,
      totalExits,
      netMovement: totalEntries - totalExits
    };
  });

  const getReportData = () => {
    switch (selectedReport) {
      case "movements":
        return {
          title: "Relatório de Movimentações",
          headers: ["Data", "Item", "Tipo", "Quantidade", "Descrição"],
          data: filteredMovements.map(movement => [
            new Date(movement.date).toLocaleDateString('pt-BR'),
            movement.itemName,
            movement.type === 'entrada' ? 'Entrada' : 'Saída',
            `${movement.quantity} ${mockItems.find(i => i.id === movement.itemId)?.unit || ''}`,
            movement.description || '-'
          ])
        };
      
      case "stock":
        return {
          title: "Relatório de Estoque Atual",
          headers: ["Item", "Categoria", "Estoque", "Unidade", "Validade"],
          data: mockItems.map(item => [
            item.name,
            item.category,
            item.currentStock.toString(),
            item.unit,
            item.expiryDate ? new Date(item.expiryDate).toLocaleDateString('pt-BR') : 'Sem data'
          ])
        };
      
      case "expiring":
        return {
          title: "Relatório de Itens Vencendo",
          headers: ["Item", "Categoria", "Estoque", "Data de Validade", "Dias para Vencer"],
          data: expiringItems.map(item => {
            const daysToExpiry = item.expiryDate 
              ? Math.ceil((new Date(item.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
              : 0;
            return [
              item.name,
              item.category,
              `${item.currentStock} ${item.unit}`,
              item.expiryDate ? new Date(item.expiryDate).toLocaleDateString('pt-BR') : '-',
              daysToExpiry.toString()
            ];
          })
        };
      
      case "summary":
        return {
          title: "Relatório Resumo por Item",
          headers: ["Item", "Categoria", "Estoque Atual", "Total Entradas", "Total Saídas", "Movimento Líquido"],
          data: stockSummary.map(item => [
            item.name,
            item.category,
            `${item.currentStock} ${item.unit}`,
            `${item.totalEntries} ${item.unit}`,
            `${item.totalExits} ${item.unit}`,
            `${item.netMovement > 0 ? '+' : ''}${item.netMovement} ${item.unit}`
          ])
        };
      
      default:
        return { title: "", headers: [], data: [] };
    }
  };

  const reportData = getReportData();

  const statistics = {
    totalItems: mockItems.length,
    totalMovements: filteredMovements.length,
    totalEntries: filteredMovements.filter(m => m.type === 'entrada').length,
    totalExits: filteredMovements.filter(m => m.type === 'saida').length,
    expiringItems: expiringItems.length,
    lowStockItems: lowStockItems.length
  };

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
            <Package className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
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

      <Card>
        <CardHeader>
          <CardTitle>Filtros e Configurações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Relatório</Label>
              <Select value={selectedReport} onValueChange={setSelectedReport}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="movements">Movimentações</SelectItem>
                  <SelectItem value="stock">Estoque Atual</SelectItem>
                  <SelectItem value="expiring">Itens Vencendo</SelectItem>
                  <SelectItem value="summary">Resumo por Item</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
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
              <Label>Categoria</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
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
          </div>
        </CardContent>
      </Card>

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
          {reportData.data.length > 0 ? (
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