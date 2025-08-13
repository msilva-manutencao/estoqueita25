
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSupabaseItems } from "@/hooks/useSupabaseItems";
import { useToast } from "@/hooks/use-toast";
import { Download, FileText, FileSpreadsheet, Printer } from "lucide-react";
import * as XLSX from 'xlsx';

export function ExportView() {
  const { items } = useSupabaseItems();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const exportItemsToExcel = () => {
    try {
      setLoading(true);
      
      // Agrupar itens por categoria
      const itemsByCategory = items.reduce((acc, item) => {
        const categoryName = item.categories?.name || 'Sem Categoria';
        if (!acc[categoryName]) {
          acc[categoryName] = [];
        }
        acc[categoryName].push(item);
        return acc;
      }, {} as Record<string, typeof items>);

      // Criar workbook
      const wb = XLSX.utils.book_new();
      
      // Adicionar uma aba para cada categoria
      Object.entries(itemsByCategory).forEach(([categoryName, categoryItems]) => {
        const headers = ['Nome', 'Estoque Atual', 'Estoque Mínimo', 'Unidade', 'Data de Validade'];
        const data = categoryItems.map(item => [
          item.name,
          item.current_stock,
          item.minimum_stock,
          item.units?.abbreviation || item.units?.name || 'un',
          item.expiry_date ? new Date(item.expiry_date).toLocaleDateString('pt-BR') : 'Sem data'
        ]);

        const wsData = [headers, ...data];
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        
        // Formatação
        const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
        
        // Estilo para cabeçalhos
        for (let col = range.s.c; col <= range.e.c; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
          if (!ws[cellAddress]) continue;
          ws[cellAddress].s = {
            font: { bold: true, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "4F46E5" } },
            alignment: { horizontal: "center" }
          };
        }

        // Largura das colunas
        ws['!cols'] = [
          { width: 30 }, // Nome
          { width: 15 }, // Estoque Atual
          { width: 15 }, // Estoque Mínimo
          { width: 10 }, // Unidade
          { width: 20 }  // Data de Validade
        ];

        // Nome da aba (máximo 31 caracteres)
        const sheetName = categoryName.length > 31 ? categoryName.substring(0, 31) : categoryName;
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
      });

      // Salvar arquivo
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      XLSX.writeFile(wb, `relatorio-itens-por-categoria_${timestamp}.xlsx`);
      
      toast({
        title: "Exportação concluída!",
        description: "Relatório Excel gerado com sucesso",
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: "Erro na exportação",
        description: "Não foi possível gerar o arquivo Excel",
        variant: "destructive",
        duration: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  const exportItemsToPDF = () => {
    try {
      setLoading(true);
      
      // Agrupar itens por categoria
      const itemsByCategory = items.reduce((acc, item) => {
        const categoryName = item.categories?.name || 'Sem Categoria';
        if (!acc[categoryName]) {
          acc[categoryName] = [];
        }
        acc[categoryName].push(item);
        return acc;
      }, {} as Record<string, typeof items>);

      // Gerar HTML para impressão
      let htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Relatório de Itens por Categoria</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; }
            h2 { color: #666; margin-top: 30px; margin-bottom: 15px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .print-date { margin-top: 20px; font-size: 12px; color: #666; text-align: center; }
            .page-break { page-break-before: always; }
          </style>
        </head>
        <body>
          <h1>Relatório de Itens por Categoria</h1>
      `;

      // Adicionar cada categoria
      Object.entries(itemsByCategory).forEach(([categoryName, categoryItems], index) => {
        if (index > 0) {
          htmlContent += '<div class="page-break"></div>';
        }
        
        htmlContent += `
          <h2>${categoryName}</h2>
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Estoque Atual</th>
                <th>Estoque Mínimo</th>
                <th>Unidade</th>
                <th>Data de Validade</th>
              </tr>
            </thead>
            <tbody>
        `;

        categoryItems.forEach(item => {
          htmlContent += `
            <tr>
              <td>${item.name}</td>
              <td>${item.current_stock}</td>
              <td>${item.minimum_stock}</td>
              <td>${item.units?.abbreviation || item.units?.name || 'un'}</td>
              <td>${item.expiry_date ? new Date(item.expiry_date).toLocaleDateString('pt-BR') : 'Sem data'}</td>
            </tr>
          `;
        });

        htmlContent += `
            </tbody>
          </table>
        `;
      });

      htmlContent += `
          <div class="print-date">
            Relatório gerado em: ${new Date().toLocaleString('pt-BR')}
          </div>
        </body>
        </html>
      `;

      // Abrir janela para impressão
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Popup bloqueado');
      }
      
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      
      toast({
        title: "Relatório enviado para impressão",
        description: "Relatório PDF aberto em nova janela",
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: "Erro na impressão",
        description: "Não foi possível gerar o relatório PDF",
        variant: "destructive",
        duration: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Exportar Relatórios</h1>
        <p className="text-muted-foreground">
          Exporte relatórios de itens organizados por categoria
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center space-x-2">
              <FileSpreadsheet className="h-6 w-6" />
              <span>Relatório Excel</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Exporta todos os itens organizados por categoria em abas separadas com formatação avançada.
            </p>
            <Button 
              onClick={exportItemsToExcel} 
              className="w-full"
              disabled={loading || items.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar Excel
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center space-x-2">
              <FileText className="h-6 w-6" />
              <span>Relatório PDF</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Gera um relatório PDF com quebras de página por categoria, ideal para impressão.
            </p>
            <Button 
              onClick={exportItemsToPDF} 
              className="w-full"
              disabled={loading || items.length === 0}
            >
              <Printer className="h-4 w-4 mr-2" />
              Gerar PDF
            </Button>
          </CardContent>
        </Card>
      </div>

      {items.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            Nenhum item encontrado para exportar.
          </p>
        </div>
      )}
    </div>
  );
}
