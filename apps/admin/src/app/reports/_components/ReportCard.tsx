'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon, DownloadSimple, Spinner } from '@phosphor-icons/react';
import { DateRange } from 'react-day-picker';
import { cn } from '@/lib/shadcn/utils';
import { toast } from 'sonner';

interface FilterOption {
  value: string;
  label: string;
}

interface Filter {
  name: string;
  param: string;
  options: FilterOption[];
}

interface ReportCardProps {
  title: string;
  description: string;
  endpoint: string;
  filters: Filter[];
  icon: React.ReactNode;
}

export function ReportCard({ title, description, endpoint, filters, icon }: ReportCardProps) {
  const [loading, setLoading] = useState(false);
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const handleDownload = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();

      // Adicionar filtros
      Object.entries(filterValues).forEach(([key, value]) => {
        if (value && value !== 'all') {
          params.set(key, value);
        }
      });

      // Adicionar datas
      if (dateRange?.from) {
        params.set('startDate', dateRange.from.toISOString());
      }
      if (dateRange?.to) {
        params.set('endDate', dateRange.to.toISOString());
      }

      const response = await fetch(`${endpoint}?${params}`);

      if (!response.ok) {
        throw new Error('Erro ao gerar relatório');
      }

      // Extrair nome do arquivo do header
      const contentDisposition = response.headers.get('Content-Disposition');
      const filenameMatch = contentDisposition?.match(/filename="?(.+)"?/);
      const filename = filenameMatch?.[1] || 'relatório.csv';

      // Criar blob e baixar
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Relatorio gerado com sucesso!');
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error('Erro ao gerar relatório. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filters.map((filter) => (
            <div key={filter.param}>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">
                {filter.name}
              </label>
              <Select
                value={filterValues[filter.param] || 'all'}
                onValueChange={(value) =>
                  setFilterValues((prev) => ({ ...prev, [filter.param]: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={`Selecionar ${filter.name.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                  {filter.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}

          {/* Date Range Picker */}
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-muted-foreground mb-1 block">
              Período
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !dateRange && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, 'dd/MM/yyyy', { locale: ptBR })} -{' '}
                        {format(dateRange.to, 'dd/MM/yyyy', { locale: ptBR })}
                      </>
                    ) : (
                      format(dateRange.from, 'dd/MM/yyyy', { locale: ptBR })
                    )
                  ) : (
                    <span>Todos os períodos</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                  locale={ptBR}
                />
                <div className="p-3 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={() => setDateRange(undefined)}
                  >
                    Limpar datas
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Botao de download */}
        <Button onClick={handleDownload} disabled={loading} className="w-full">
          {loading ? (
            <>
              <Spinner className="mr-2 h-4 w-4 animate-spin" />
              Gerando relatório...
            </>
          ) : (
            <>
              <DownloadSimple className="mr-2 h-4 w-4" />
              Gerar e Baixar CSV
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
