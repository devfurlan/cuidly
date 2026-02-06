'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ReportsFiltersProps {
  status: string;
  type: string;
  onStatusChange: (value: string) => void;
  onTypeChange: (value: string) => void;
}

export default function ReportsFilters({
  status,
  type,
  onStatusChange,
  onTypeChange,
}: ReportsFiltersProps) {
  return (
    <div className="flex flex-wrap gap-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">Status:</span>
        <Select value={status} onValueChange={onStatusChange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="PENDING">Pendentes</SelectItem>
            <SelectItem value="REVIEWED">Revisadas</SelectItem>
            <SelectItem value="DISMISSED">Dispensadas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">Tipo:</span>
        <Select value={type} onValueChange={onTypeChange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="NANNY">Perfis</SelectItem>
            <SelectItem value="JOB">Vagas</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
