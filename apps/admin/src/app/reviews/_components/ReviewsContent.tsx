'use client';

import { useState, useEffect, useCallback } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import ReviewsCounters from './ReviewsCounters';
import ReviewsFilters from './ReviewsFilters';
import ReviewsTable from './ReviewsTable';
import ReviewsPagination from './ReviewsPagination';
import { useDebounce } from '@/hooks/useDebounce';

interface Review {
  id: number;
  overallRating: number;
  comment: string | null;
  isPublished: boolean;
  isVisible: boolean;
  publishedAt: string | null;
  createdAt: string;
  type: string;
  photos: string[];
  moderatedAt: string | null;
  moderatedBy: string | null;
  moderationNote: string | null;
  family: {
    id: number;
    name: string;
  };
  nanny: {
    id: number;
    name: string;
    photoUrl: string | null;
    slug: string;
  };
}

interface ReviewStats {
  total: number;
  pending: number;
  published: number;
  hidden: number;
  averages: {
    overall: number;
  };
  recentCount: number;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function ReviewsContent() {
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('all');
  const [type, setType] = useState('all');
  const [search, setSearch] = useState('');

  const debouncedSearch = useDebounce(search, 500);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/reviews/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        status,
        type,
        search: debouncedSearch,
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      const response = await fetch(`/api/reviews?${params}`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  }, [status, type, debouncedSearch, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleRefresh = () => {
    fetchStats();
    fetchReviews();
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  // Reset page when filters change
  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [status, type, debouncedSearch]);

  return (
    <div className="space-y-6">
      {/* Stats */}
      {stats ? (
        <ReviewsCounters stats={stats} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-[110px] rounded-xl" />
          ))}
        </div>
      )}

      {/* Filters */}
      <ReviewsFilters
        status={status}
        type={type}
        search={search}
        onStatusChange={setStatus}
        onTypeChange={setType}
        onSearchChange={setSearch}
      />

      {/* Table */}
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-[400px] rounded-xl" />
        </div>
      ) : (
        <ReviewsTable reviews={reviews} onReviewUpdate={handleRefresh} />
      )}

      {/* Pagination */}
      {!loading && pagination.totalPages > 1 && (
        <ReviewsPagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
