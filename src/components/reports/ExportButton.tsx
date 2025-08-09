
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Download, FileSpreadsheet, Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';

interface ExportButtonProps {
  data: string[][];
  headers: string[];
  filename: string;
  title: string;
}

export function ExportButton({ data, headers, filename, title }: ExportButtonProps) {
  const { toast } = useToast();

  const exportToExcel = () => {
    try {
      // Create a new workbook
      const wb = XLSX.utils.book_new();
      
      // Add headers and data together
      const wsData = [headers, ...data];
      
      // Create worksheet
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      
      // Set column widths
      const colWidths = headers.map(() => ({ width: 20 }));
      ws['!cols'] = colWidths;
      
      // Add the worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, "Relatório");
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const finalFilename = `${filename}_${timestamp}.xlsx`;
      
      // Save the file
      XLSX.writeFile(wb, finalFilename);
      
      toast({
        title: "Exportação concluída!",
        description: `Arquivo ${finalFilename} foi baixado com sucesso.`,
      });
    } catch (error) {
      toast({
        title: "Erro na exportação",
        description: "Não foi possível gerar o arquivo Excel.",
        variant: "destructive",
      });
    }
  };

  const exportToCSV = () => {
    try {
      // Create CSV content
      const csvHeaders = headers.join(',');
      const csvRows = data.map(row => 
        row.map(cell => 
          // Escape commas and quotes in cell data
          typeof cell === 'string' && (cell.includes(',') || cell.includes('"')) 
            ? `"${cell.replace(/"/g, '""')}"` 
            : cell
        ).join(',')
      );
      
      const csvContent = [csvHeaders, ...csvRows].join('\n');
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const finalFilename = `${filename}_${timestamp}.csv`;
      
      link.setAttribute('href', url);
      link.setAttribute('download', finalFilename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Exportação concluída!",
        description: `Arquivo ${finalFilename} foi baixado com sucesso.`,
      });
    } catch (error) {
      toast({
        title: "Erro na exportação",
        description: "Não foi possível gerar o arquivo CSV.",
        variant: "destructive",
      });
    }
  };

  const printReport = () => {
    try {
      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Popup bloqueado');
      }
      
      // Generate HTML content
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .print-date { margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <table>
            <thead>
              <tr>
                ${headers.map(header => `<th>${header}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${data.map(row => 
                `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`
              ).join('')}
            </tbody>
          </table>
          <div class="print-date">
            Relatório gerado em: ${new Date().toLocaleString('pt-BR')}
          </div>
        </body>
        </html>
      `;
      
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      
      toast({
        title: "Relatório enviado para impressão",
        description: "O relatório foi aberto em uma nova janela para impressão.",
      });
    } catch (error) {
      toast({
        title: "Erro na impressão",
        description: "Não foi possível abrir o relatório para impressão.",
        variant: "destructive",
      });
    }
  };

  if (data.length === 0) {
    return (
      <Button variant="outline" disabled>
        <Download className="h-4 w-4 mr-2" />
        Exportar
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToExcel}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Exportar Excel (.xlsx)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToCSV}>
          <Download className="h-4 w-4 mr-2" />
          Exportar CSV (.csv)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={printReport}>
          <Printer className="h-4 w-4 mr-2" />
          Imprimir Relatório
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
