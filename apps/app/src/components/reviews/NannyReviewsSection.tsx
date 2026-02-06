'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/shadcn/card';
import { Skeleton } from '@/components/ui/shadcn/skeleton';
import ReviewList from './ReviewList';

interface Review {
  id: number;
  overallRating: number;
  punctuality?: number | null;
  care?: number | null;
  communication?: number | null;
  reliability?: number | null;
  respect?: number | null;
  environment?: number | null;
  payment?: number | null;
  comment: string | null;
  response: string | null;
  respondedAt: string | null;
  publishedAt: string | null;
  type: string;
  family: {
    id: number;
    name: string;
  };
  nanny: {
    id: number;
    name: string;
    photoUrl: string | null;
  };
}

interface ReviewsResponse {
  reviews: Review[];
  avgRating: number;
  totalReviews: number;
  categoryAverages?: {
    punctuality: number;
    care: number;
    communication: number;
    reliability: number;
  } | null;
}

interface NannyReviewsSectionProps {
  nannyId: number;
}

export default function NannyReviewsSection({ nannyId }: NannyReviewsSectionProps) {
  const [data, setData] = useState<ReviewsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const response = await fetch(`/api/reviews?nannyId=${nannyId}&type=received`);
        if (!response.ok) {
          throw new Error('Erro ao carregar avaliações');
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar avaliações');
      } finally {
        setLoading(false);
      }
    }

    fetchReviews();
  }, [nannyId]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          {error}
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <ReviewList
      reviews={data.reviews}
      avgRating={data.avgRating}
      totalReviews={data.totalReviews}
      categoryAverages={data.categoryAverages}
      isNannyProfile={true}
    />
  );
}
