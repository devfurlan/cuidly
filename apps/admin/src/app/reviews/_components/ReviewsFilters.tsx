'use client';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MagnifyingGlassIcon } from '@phosphor-icons/react';

interface ReviewsFiltersProps {
  status: string;
  type: string;
  search: string;
  onStatusChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onSearchChange: (value: string) => void;
}

export default function ReviewsFilters({
  status,
  type,
  search,
  onStatusChange,
  onTypeChange,
  onSearchChange,
}: ReviewsFiltersProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por babá ou família..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os status</SelectItem>
          <SelectItem value="pending">Aguardando</SelectItem>
          <SelectItem value="published">Publicadas</SelectItem>
          <SelectItem value="hidden">Ocultas</SelectItem>
        </SelectContent>
      </Select>

      <Select value={type} onValueChange={onTypeChange}>
        <SelectTrigger className="w-full sm:w-[200px]">
          <SelectValue placeholder="Tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os tipos</SelectItem>
          <SelectItem value="FAMILY_TO_NANNY">Família avalia Babá</SelectItem>
          <SelectItem value="NANNY_TO_FAMILY">Babá avalia Família</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
