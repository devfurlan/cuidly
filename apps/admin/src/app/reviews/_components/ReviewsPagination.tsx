'use client';

import { Button } from '@/components/ui/button';
import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';

interface ReviewsPaginationProps {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
}

export default function ReviewsPagination({
  page,
  totalPages,
  total,
  onPageChange,
}: ReviewsPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-muted-foreground">
        Mostrando página {page} de {totalPages} ({total} avaliações)
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          <CaretLeftIcon className="mr-1 h-4 w-4" />
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
        >
          Próxima
          <CaretRightIcon className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
