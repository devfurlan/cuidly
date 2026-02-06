'use client';

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/shadcn/pagination';

export default function ListPostsPagination({
  totalPages,
  currentPage,
}: {
  totalPages: number;
  currentPage: number;
}) {
  return totalPages > 1 ? (
    <div className="mt-12">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="/blog" />
          </PaginationItem>
          {Array.from({ length: totalPages }, (_, i) => (
            <PaginationItem key={i + 1}>
              <PaginationLink
                href={i === 0 ? `/blog` : `/blog?page=${i + 1}`}
                isActive={i + 1 === currentPage}
              >
                {i + 1}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext href={`/blog?page=${totalPages}`} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  ) : null;
}
