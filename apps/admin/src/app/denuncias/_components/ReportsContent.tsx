'use client';

import { useState, useEffect, useCallback } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import ReportsCounters from './ReportsCounters';
import ReportsFilters from './ReportsFilters';
import ReportsTable from './ReportsTable';

interface Report {
  id: number;
  targetType: 'NANNY' | 'JOB';
  reason: string;
  status: 'PENDING' | 'REVIEWED' | 'DISMISSED';
  action: string | null;
  createdAt: string;
  targetNanny: { id: number; name: string; slug: string; photoUrl: string | null } | null;
  targetJob: { id: number; title: string } | null;
  reporterNanny: { id: number; name: string } | null;
  reporterFamily: { id: number; name: string } | null;
  actionTakenBy: { id: string; name: string | null; email: string } | null;
}

interface ReportStats {
  total: number;
  pending: number;
  reviewed: number;
  dismissed: number;
  byType: { nanny: number; job: number };
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function ReportsContent() {
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('all');
  const [type, setType] = useState('all');

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/reports/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        status,
        type,
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      const response = await fetch(`/api/reports?${params}`);
      if (response.ok) {
        const data = await response.json();
        setReports(data.reports);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  }, [status, type, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleRefresh = () => {
    fetchStats();
    fetchReports();
  };

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  return (
    <div className="space-y-6">
      {stats ? (
        <ReportsCounters stats={stats} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-[110px] rounded-xl" />
          ))}
        </div>
      )}

      <ReportsFilters
        status={status}
        type={type}
        onStatusChange={(value) => {
          setStatus(value);
          setPagination((prev) => ({ ...prev, page: 1 }));
        }}
        onTypeChange={(value) => {
          setType(value);
          setPagination((prev) => ({ ...prev, page: 1 }));
        }}
      />

      {loading ? (
        <Skeleton className="h-[400px] rounded-xl" />
      ) : (
        <ReportsTable
          reports={reports}
          onReportUpdate={handleRefresh}
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
