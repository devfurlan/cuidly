'use client';

import { useState, useEffect, useCallback } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import SupportCounters from './SupportCounters';
import SupportFilters from './SupportFilters';
import SupportTable from './SupportTable';

interface Stats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  positive: number;
  negative: number;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SupportTicketRow {
  id: string;
  subject: string;
  category: string;
  status: string;
  satisfactionRating: boolean | null;
  createdAt: string;
  updatedAt: string;
  nannyId: number | null;
  familyId: number | null;
  nanny: { id: number; name: string | null } | null;
  family: { id: number; name: string | null } | null;
  messages: { body: string; createdAt: string }[];
  _count: { messages: number };
}

export default function SupportContent() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [data, setData] = useState<SupportTicketRow[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/support/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        status: statusFilter,
        category: categoryFilter,
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      const response = await fetch(`/api/support/tickets?${params}`);
      if (response.ok) {
        const result = await response.json();
        setData(result.data);
        setPagination(result.pagination);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, categoryFilter, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = () => {
    fetchStats();
    fetchData();
  };

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  return (
    <div className="space-y-6">
      {stats ? (
        <SupportCounters stats={stats} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-[110px] rounded-xl" />
          ))}
        </div>
      )}

      <SupportFilters
        status={statusFilter}
        category={categoryFilter}
        onStatusChange={(value) => {
          setStatusFilter(value);
          setPagination((prev) => ({ ...prev, page: 1 }));
        }}
        onCategoryChange={(value) => {
          setCategoryFilter(value);
          setPagination((prev) => ({ ...prev, page: 1 }));
        }}
      />

      {loading ? (
        <Skeleton className="h-[400px] rounded-xl" />
      ) : (
        <SupportTable
          tickets={data}
          onUpdate={handleRefresh}
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
