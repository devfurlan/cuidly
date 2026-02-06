'use client';

import { PiChatCircle, PiStar, PiStarFill, PiWarningCircle } from 'react-icons/pi';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/shadcn/card';
import { Button } from '@/components/ui/shadcn/button';
import { Textarea } from '@/components/ui/shadcn/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/shadcn/avatar';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
  photos?: string[];
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

interface CategoryAverages {
  punctuality?: number;
  care?: number;
  communication?: number;
  reliability?: number;
  respect?: number;
  environment?: number;
  payment?: number;
}

interface ReviewListProps {
  reviews: Review[];
  avgRating: number;
  totalReviews: number;
  categoryAverages?: CategoryAverages | null;
  canRespond?: boolean;
  currentUserId?: number;
  isNannyProfile?: boolean;
}

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) {
  const sizeClass = size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= Math.round(rating);
        const Icon = isFilled ? PiStarFill : PiStar;
        return (
          <Icon
            key={star}
            className={`${sizeClass} ${isFilled ? 'text-yellow-400' : 'text-gray-300'}`}
          />
        );
      })}
    </div>
  );
}

export default function ReviewList({
  reviews,
  avgRating,
  totalReviews,
  categoryAverages,
  canRespond = false,
  currentUserId,
  isNannyProfile = true,
}: ReviewListProps) {
  const [respondingTo, setRespondingTo] = useState<number | null>(null);
  const [responseText, setResponseText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitResponse = async (reviewId: number) => {
    if (!responseText.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/reviews/${reviewId}/response`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response: responseText }),
      });

      if (response.ok) {
        window.location.reload();
      } else {
        const data = await response.json();
        alert(data.error || 'Erro ao enviar resposta');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Erro ao enviar resposta');
    } finally {
      setSubmitting(false);
      setRespondingTo(null);
      setResponseText('');
    }
  };

  const handleReport = async (reviewId: number) => {
    if (!confirm('Deseja reportar esta avaliação como inapropriada?')) return;

    try {
      const response = await fetch(`/api/reviews/${reviewId}/report`, {
        method: 'POST',
      });

      if (response.ok) {
        alert('Avaliação reportada com sucesso');
      } else {
        alert('Erro ao reportar avaliação');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Erro ao reportar avaliação');
    }
  };

  const getReviewerInfo = (review: Review) => {
    if (review.type === 'FAMILY_TO_NANNY') {
      return { name: review.family.name, image: null };
    }
    return { name: review.nanny.name, image: review.nanny.photoUrl };
  };

  const getReviewedId = (review: Review) => {
    if (review.type === 'FAMILY_TO_NANNY') {
      return review.nanny.id;
    }
    return review.family.id;
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card className="bg-linear-to-r from-yellow-50 to-orange-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900">
                {avgRating.toFixed(1)}
              </div>
              <div className="flex justify-center mt-2">
                <StarRating rating={avgRating} size="lg" />
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {totalReviews} {totalReviews === 1 ? 'avaliação' : 'avaliações'}
              </div>
            </div>

            <div className="flex-1">
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = reviews.filter((r) => Math.round(r.overallRating) === rating).length;
                  const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

                  return (
                    <div key={rating} className="flex items-center gap-3">
                      <div className="flex items-center gap-1 w-12">
                        <span className="text-sm font-medium">{rating}</span>
                        <PiStarFill className="w-3 h-3 text-yellow-400" />
                      </div>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-400"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-8 text-right">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Category Averages */}
          {categoryAverages && (
            <div className="mt-6 pt-6 border-t">
              <h4 className="font-semibold mb-3">Avaliações por Categoria</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {isNannyProfile ? (
                  <>
                    {categoryAverages.punctuality !== undefined && (
                      <div>
                        <div className="text-sm text-gray-600">Pontualidade</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-bold">{categoryAverages.punctuality.toFixed(1)}</span>
                          <StarRating rating={categoryAverages.punctuality} />
                        </div>
                      </div>
                    )}
                    {categoryAverages.care !== undefined && (
                      <div>
                        <div className="text-sm text-gray-600">Cuidado</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-bold">{categoryAverages.care.toFixed(1)}</span>
                          <StarRating rating={categoryAverages.care} />
                        </div>
                      </div>
                    )}
                    {categoryAverages.communication !== undefined && (
                      <div>
                        <div className="text-sm text-gray-600">Comunicação</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-bold">{categoryAverages.communication.toFixed(1)}</span>
                          <StarRating rating={categoryAverages.communication} />
                        </div>
                      </div>
                    )}
                    {categoryAverages.reliability !== undefined && (
                      <div>
                        <div className="text-sm text-gray-600">Confiabilidade</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-bold">{categoryAverages.reliability.toFixed(1)}</span>
                          <StarRating rating={categoryAverages.reliability} />
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {categoryAverages.communication !== undefined && (
                      <div>
                        <div className="text-sm text-gray-600">Comunicação</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-bold">{categoryAverages.communication.toFixed(1)}</span>
                          <StarRating rating={categoryAverages.communication} />
                        </div>
                      </div>
                    )}
                    {categoryAverages.respect !== undefined && (
                      <div>
                        <div className="text-sm text-gray-600">Respeito</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-bold">{categoryAverages.respect.toFixed(1)}</span>
                          <StarRating rating={categoryAverages.respect} />
                        </div>
                      </div>
                    )}
                    {categoryAverages.environment !== undefined && (
                      <div>
                        <div className="text-sm text-gray-600">Ambiente</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-bold">{categoryAverages.environment.toFixed(1)}</span>
                          <StarRating rating={categoryAverages.environment} />
                        </div>
                      </div>
                    )}
                    {categoryAverages.payment !== undefined && (
                      <div>
                        <div className="text-sm text-gray-600">Pagamento</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-bold">{categoryAverages.payment.toFixed(1)}</span>
                          <StarRating rating={categoryAverages.payment} />
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Nenhuma avaliação ainda</p>
            </CardContent>
          </Card>
        ) : (
          reviews.map((review) => {
            const reviewer = getReviewerInfo(review);
            const reviewedId = getReviewedId(review);

            return (
              <Card key={review.id}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={reviewer.image || undefined} />
                      <AvatarFallback>
                        {reviewer.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-semibold">{reviewer.name}</h4>
                          {review.publishedAt && (
                            <p className="text-sm text-muted-foreground">
                              {formatDistanceToNow(new Date(review.publishedAt), {
                                addSuffix: true,
                                locale: ptBR,
                              })}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleReport(review.id)}
                        >
                          <PiWarningCircle className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="mb-3 flex items-center gap-3">
                        <StarRating rating={review.overallRating} />
                        <span className="font-semibold">{review.overallRating.toFixed(1)}</span>
                      </div>

                      {/* Categories */}
                      {(review.punctuality || review.care || review.communication || review.reliability ||
                        review.respect || review.environment || review.payment) && (
                        <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                          {review.punctuality && (
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">Pontualidade:</span>
                              <span className="font-medium">{review.punctuality}</span>
                            </div>
                          )}
                          {review.care && (
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">Cuidado:</span>
                              <span className="font-medium">{review.care}</span>
                            </div>
                          )}
                          {review.communication && (
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">Comunicação:</span>
                              <span className="font-medium">{review.communication}</span>
                            </div>
                          )}
                          {review.reliability && (
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">Confiabilidade:</span>
                              <span className="font-medium">{review.reliability}</span>
                            </div>
                          )}
                          {review.respect && (
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">Respeito:</span>
                              <span className="font-medium">{review.respect}</span>
                            </div>
                          )}
                          {review.environment && (
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">Ambiente:</span>
                              <span className="font-medium">{review.environment}</span>
                            </div>
                          )}
                          {review.payment && (
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">Pagamento:</span>
                              <span className="font-medium">{review.payment}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {review.comment && (
                        <p className="text-gray-700 mb-4">{review.comment}</p>
                      )}

                      {/* Photos */}
                      {review.photos && review.photos.length > 0 && (
                        <div className="grid grid-cols-3 gap-2 mb-4">
                          {review.photos.map((photo, index) => (
                            <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                              <Image
                                src={photo}
                                alt={`Foto ${index + 1}`}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Response */}
                      {review.response && (
                        <Card className="bg-blue-50 border-blue-200">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <PiChatCircle className="w-4 h-4 text-blue-600 mt-1" />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-blue-900 mb-1">
                                  Resposta:
                                </p>
                                <p className="text-sm text-gray-700">{review.response}</p>
                                {review.respondedAt && (
                                  <p className="text-xs text-gray-500 mt-2">
                                    {formatDistanceToNow(new Date(review.respondedAt), {
                                      addSuffix: true,
                                      locale: ptBR,
                                    })}
                                  </p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Response Form */}
                      {canRespond && !review.response && reviewedId === currentUserId && (
                        <div className="mt-4">
                          {respondingTo === review.id ? (
                            <div className="space-y-3">
                              <Textarea
                                placeholder="Escreva sua resposta..."
                                value={responseText}
                                onChange={(e) => setResponseText(e.target.value)}
                                rows={3}
                              />
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => handleSubmitResponse(review.id)}
                                  disabled={submitting || !responseText.trim()}
                                  size="sm"
                                >
                                  {submitting ? 'Enviando...' : 'Enviar Resposta'}
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setRespondingTo(null);
                                    setResponseText('');
                                  }}
                                  size="sm"
                                >
                                  Cancelar
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setRespondingTo(review.id)}
                            >
                              <PiChatCircle className="w-4 h-4 mr-2" />
                              Responder
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
