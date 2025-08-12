
import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";

interface DateRangeFilterProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
}

export function DateRangeFilter({ 
  startDate, 
  endDate, 
  onStartDateChange, 
  onEndDateChange 
}: DateRangeFilterProps) {
  const [startDateObj, setStartDateObj] = useState<Date | undefined>();
  const [endDateObj, setEndDateObj] = useState<Date | undefined>();

  // Configurar datas padrão (início e fim do mês corrente)
  useEffect(() => {
    if (!startDate && !endDate) {
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      const startDateStr = firstDayOfMonth.toISOString().split('T')[0];
      const endDateStr = lastDayOfMonth.toISOString().split('T')[0];
      
      onStartDateChange(startDateStr);
      onEndDateChange(endDateStr);
      setStartDateObj(firstDayOfMonth);
      setEndDateObj(lastDayOfMonth);
    } else {
      if (startDate) setStartDateObj(new Date(startDate));
      if (endDate) setEndDateObj(new Date(endDate));
    }
  }, [startDate, endDate, onStartDateChange, onEndDateChange]);

  const handleStartDateSelect = (date: Date | undefined) => {
    if (date) {
      setStartDateObj(date);
      onStartDateChange(date.toISOString().split('T')[0]);
    }
  };

  const handleEndDateSelect = (date: Date | undefined) => {
    if (date) {
      setEndDateObj(date);
      onEndDateChange(date.toISOString().split('T')[0]);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Data Início</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !startDateObj && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startDateObj ? (
                format(startDateObj, "dd/MM/yyyy", { locale: ptBR })
              ) : (
                <span>Data início</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={startDateObj}
              onSelect={handleStartDateSelect}
              initialFocus
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Data Fim</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !endDateObj && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {endDateObj ? (
                format(endDateObj, "dd/MM/yyyy", { locale: ptBR })
              ) : (
                <span>Data fim</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={endDateObj}
              onSelect={handleEndDateSelect}
              initialFocus
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
