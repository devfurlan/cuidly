'use client';

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon } from '@phosphor-icons/react';
import { DateRange } from 'react-day-picker';
import { cn } from '@/lib/shadcn/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DateRangePickerProps {
  value: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
  className?: string;
}

const presets = [
  { label: 'Últimos 7 dias', days: 7 },
  { label: 'Últimos 30 dias', days: 30 },
  { label: 'Últimos 90 dias', days: 90 },
  { label: 'Últimos 6 meses', days: 180 },
  { label: 'Último ano', days: 365 },
];

export function DateRangePicker({ value, onChange, className }: DateRangePickerProps) {
  const handlePresetSelect = (days: string) => {
    const daysNum = parseInt(days, 10);
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - daysNum);
    onChange({ from: start, to: end });
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Select onValueChange={handlePresetSelect}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Selecionar período" />
        </SelectTrigger>
        <SelectContent>
          {presets.map((preset) => (
            <SelectItem key={preset.days} value={preset.days.toString()}>
              {preset.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-[280px] justify-start text-left font-normal',
              !value && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value?.from ? (
              value.to ? (
                <>
                  {format(value.from, 'dd/MM/yyyy', { locale: ptBR })} -{' '}
                  {format(value.to, 'dd/MM/yyyy', { locale: ptBR })}
                </>
              ) : (
                format(value.from, 'dd/MM/yyyy', { locale: ptBR })
              )
            ) : (
              <span>Selecionar datas</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={value?.from}
            selected={value}
            onSelect={onChange}
            numberOfMonths={2}
            locale={ptBR}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
