'use client';

import { PiClock, PiPencilSimple, PiStar, PiStarFill, PiTrash } from 'react-icons/pi';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/shadcn/card';
import { Button } from '@/components/ui/shadcn/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/shadcn/avatar';
import { Badge } from '@/components/ui/shadcn/badge';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import ReviewForm from '@/components/reviews/ReviewForm';

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
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
  type: string;
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

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= Math.round(rating);
        const Icon = isFilled ? PiStarFill : PiStar;
        return (
          <Icon
            key={star}
            className={`w-4 h-4 ${isFilled ? 'text-yellow-400' : 'text-gray-300'}`}
          />
        );
      })}
    </div>
  );
}

export default function MinhasAvaliacoesPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchReviews = async () => {
    try {
      const response = await fetch('/api/reviews/my-reviews');
      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = async (reviewId: number) => {
    if (!confirm('Tem certeza que deseja excluir esta avaliação?')) return;

    setDeletingId(reviewId);
    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setReviews(reviews.filter(r => r.id !== reviewId));
      } else {
        const data = await response.json();
        alert(data.error || 'Erro ao excluir avaliação');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Erro ao excluir avaliação');
    } finally {
      setDeletingId(null);
    }
  };

  const getTargetInfo = (review: Review) => {
    if (review.type === 'FAMILY_TO_NANNY') {
      return { name: review.nanny.name, image: review.nanny.photoUrl };
    }
    return { name: review.family.name, image: null };
  };

  const getTargetId = (review: Review) => {
    if (review.type === 'FAMILY_TO_NANNY') {
      return review.nanny.id;
    }
    return review.family.id;
  };

  const publishedReviews = reviews.filter(r => r.isPublished);
  const unpublishedReviews = reviews.filter(r => !r.isPublished);

  if (editingReview) {
    const target = getTargetInfo(editingReview);
    return (
      <ReviewForm
        targetId={getTargetId(editingReview)}
        targetName={target.name}
        type={editingReview.type as 'FAMILY_TO_NANNY' | 'NANNY_TO_FAMILY'}
        editMode={true}
        reviewData={{
          id: editingReview.id,
          punctuality: editingReview.punctuality,
          care: editingReview.care,
          communication: editingReview.communication,
          reliability: editingReview.reliability,
          respect: editingReview.respect,
          environment: editingReview.environment,
          payment: editingReview.payment,
          comment: editingReview.comment,
        }}
        onSuccess={() => {
          setEditingReview(null);
          fetchReviews();
        }}
        onCancel={() => setEditingReview(null)}
      />
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Minhas Avaliações</h1>
        <p className="text-muted-foreground">
          Veja e gerencie as avaliações que você fez
        </p>
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Carregando...</p>
          </CardContent>
        </Card>
      ) : reviews.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Você ainda não fez nenhuma avaliação</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Unpublished Reviews */}
          {unpublishedReviews.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <PiClock className="w-5 h-5 text-amber-500" />
                Aguardando Publicação ({unpublishedReviews.length})
              </h2>
              <p className="text-sm text-muted-foreground">
                Estas avaliações serão publicadas quando a outra parte também avaliar, ou após 14 dias.
              </p>
              <div className="space-y-4">
                {unpublishedReviews.map((review) => {
                  const target = getTargetInfo(review);
                  return (
                    <Card key={review.id} className="border-amber-200 bg-amber-50/50">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={target.image || undefined} />
                            <AvatarFallback>
                              {target.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <h4 className="font-semibold">{target.name}</h4>
                                <p className="text-sm text-muted-foreground">
                                  Criada {formatDistanceToNow(new Date(review.createdAt), {
                                    addSuffix: true,
                                    locale: ptBR,
                                  })}
                                </p>
                              </div>
                              <Badge variant="warning">Aguardando</Badge>
                            </div>

                            <div className="mb-3 flex items-center gap-3">
                              <StarRating rating={review.overallRating} />
                              <span className="font-semibold">{review.overallRating.toFixed(1)}</span>
                            </div>

                            {review.comment && (
                              <p className="text-gray-700 mb-4">{review.comment}</p>
                            )}

                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingReview(review)}
                              >
                                <PiPencilSimple className="w-4 h-4 mr-2" />
                                Editar
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleDelete(review.id)}
                                disabled={deletingId === review.id}
                              >
                                <PiTrash className="w-4 h-4 mr-2" />
                                {deletingId === review.id ? 'Excluindo...' : 'Excluir'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Published Reviews */}
          {publishedReviews.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">
                Avaliações Publicadas ({publishedReviews.length})
              </h2>
              <div className="space-y-4">
                {publishedReviews.map((review) => {
                  const target = getTargetInfo(review);
                  return (
                    <Card key={review.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={target.image || undefined} />
                            <AvatarFallback>
                              {target.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <h4 className="font-semibold">{target.name}</h4>
                                {review.publishedAt && (
                                  <p className="text-sm text-muted-foreground">
                                    Publicada {formatDistanceToNow(new Date(review.publishedAt), {
                                      addSuffix: true,
                                      locale: ptBR,
                                    })}
                                  </p>
                                )}
                              </div>
                              <Badge variant="success">Publicada</Badge>
                            </div>

                            <div className="mb-3 flex items-center gap-3">
                              <StarRating rating={review.overallRating} />
                              <span className="font-semibold">{review.overallRating.toFixed(1)}</span>
                            </div>

                            {review.comment && (
                              <p className="text-gray-700">{review.comment}</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
