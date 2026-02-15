'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FiltersProps {
  status: string;
  category: string;
  onStatusChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
}

export default function SupportFilters({
  status,
  category,
  onStatusChange,
  onCategoryChange,
}: FiltersProps) {
  return (
    <div className="flex flex-wrap gap-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">
          Status:
        </span>
        <Select value={status} onValueChange={onStatusChange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="OPEN">Abertos</SelectItem>
            <SelectItem value="IN_PROGRESS">Em andamento</SelectItem>
            <SelectItem value="RESOLVED">Resolvidos</SelectItem>
            <SelectItem value="CLOSED">Encerrados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">
          Categoria:
        </span>
        <Select value={category} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Todas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="SUBSCRIPTION_PAYMENT">
              Assinatura / Pagamento
            </SelectItem>
            <SelectItem value="ACCOUNT">Conta</SelectItem>
            <SelectItem value="BUG_TECHNICAL">
              Bug / Problema técnico
            </SelectItem>
            <SelectItem value="SUGGESTION">Sugestão</SelectItem>
            <SelectItem value="OTHER">Outro</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
