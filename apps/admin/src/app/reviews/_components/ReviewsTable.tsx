'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/Badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  StarIcon,
  DotsThreeIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
} from '@phosphor-icons/react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

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

interface ReviewsTableProps {
  reviews: Review[];
  onReviewUpdate: () => void;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <StarIcon
          key={star}
          weight={star <= Math.round(rating) ? 'fill' : 'regular'}
          className={`h-4 w-4 ${
            star <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );
}

function getStatusBadge(review: Review) {
  if (!review.isVisible) {
    return <Badge variant="destructive">Oculta</Badge>;
  }
  if (review.isPublished) {
    return <Badge variant="default" className="bg-green-600">Publicada</Badge>;
  }
  return <Badge variant="secondary" className="bg-amber-100 text-amber-800">Aguardando</Badge>;
}

function getTypeBadge(type: string) {
  if (type === 'FAMILY_TO_NANNY') {
    return <Badge variant="outline">Família para Babá</Badge>;
  }
  return <Badge variant="outline">Babá para Família</Badge>;
}

export default function ReviewsTable({ reviews, onReviewUpdate }: ReviewsTableProps) {
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    action: 'hide' | 'show' | 'publish' | null;
    review: Review | null;
  }>({ open: false, action: null, review: null });
  const [moderationNote, setModerationNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAction = async () => {
    if (!actionDialog.action || !actionDialog.review) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/reviews/${actionDialog.review.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: actionDialog.action,
          moderationNote: moderationNote.trim() || null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        onReviewUpdate();
      } else {
        toast.error(data.error || 'Erro ao executar acao');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erro ao executar acao');
    } finally {
      setLoading(false);
      setActionDialog({ open: false, action: null, review: null });
      setModerationNote('');
    }
  };

  const openActionDialog = (action: 'hide' | 'show' | 'publish', review: Review) => {
    setActionDialog({ open: true, action, review });
    setModerationNote('');
  };

  const getActionTitle = () => {
    switch (actionDialog.action) {
      case 'hide':
        return 'Ocultar Avaliacao';
      case 'show':
        return 'Tornar Visivel';
      case 'publish':
        return 'Publicar Avaliacao';
      default:
        return '';
    }
  };

  const getActionDescription = () => {
    switch (actionDialog.action) {
      case 'hide':
        return 'Esta avaliação será ocultada e não aparecerá mais para os usuários.';
      case 'show':
        return 'Esta avaliação voltará a ser visível para os usuários.';
      case 'publish':
        return 'Esta avaliação será publicada imediatamente.';
      default:
        return '';
    }
  };

  if (reviews.length === 0) {
    return (
      <div className="rounded-md border p-8 text-center">
        <p className="text-muted-foreground">Nenhuma avaliacao encontrada</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Avaliador</TableHead>
              <TableHead>Avaliado</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Nota</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="w-[70px]">Acoes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews.map((review) => {
              const reviewer = review.type === 'FAMILY_TO_NANNY' ? review.family : review.nanny;
              const reviewed = review.type === 'FAMILY_TO_NANNY' ? review.nanny : review.family;

              return (
                <TableRow key={review.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        {review.type === 'NANNY_TO_FAMILY' && review.nanny.photoUrl && (
                          <AvatarImage src={review.nanny.photoUrl} />
                        )}
                        <AvatarFallback>
                          {reviewer.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{reviewer.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        {review.type === 'FAMILY_TO_NANNY' && review.nanny.photoUrl && (
                          <AvatarImage src={review.nanny.photoUrl} />
                        )}
                        <AvatarFallback>
                          {reviewed.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{reviewed.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getTypeBadge(review.type)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <StarRating rating={review.overallRating} />
                      <span className="text-sm font-medium">
                        {review.overallRating.toFixed(1)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(review)}</TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(review.createdAt), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <DotsThreeIcon className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {review.isVisible ? (
                          <DropdownMenuItem onClick={() => openActionDialog('hide', review)}>
                            <EyeSlashIcon className="mr-2 h-4 w-4" />
                            Ocultar
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => openActionDialog('show', review)}>
                            <EyeIcon className="mr-2 h-4 w-4" />
                            Tornar Visivel
                          </DropdownMenuItem>
                        )}
                        {!review.isPublished && (
                          <DropdownMenuItem onClick={() => openActionDialog('publish', review)}>
                            <CheckCircleIcon className="mr-2 h-4 w-4" />
                            Publicar
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <Dialog open={actionDialog.open} onOpenChange={(open) => {
        if (!open) {
          setActionDialog({ open: false, action: null, review: null });
          setModerationNote('');
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{getActionTitle()}</DialogTitle>
            <DialogDescription>{getActionDescription()}</DialogDescription>
          </DialogHeader>

          {actionDialog.review && (
            <div className="space-y-4">
              <div className="rounded-md bg-muted p-4">
                <div className="mb-2 flex items-center gap-2">
                  <StarRating rating={actionDialog.review.overallRating} />
                  <span className="font-medium">
                    {actionDialog.review.overallRating.toFixed(1)}
                  </span>
                </div>
                {actionDialog.review.comment && (
                  <p className="text-sm text-muted-foreground">
                    &ldquo;{actionDialog.review.comment}&rdquo;
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">
                  Nota de moderacao (opcional)
                </label>
                <Textarea
                  placeholder="Adicione uma nota sobre esta acao..."
                  value={moderationNote}
                  onChange={(e) => setModerationNote(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setActionDialog({ open: false, action: null, review: null })}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button onClick={handleAction} disabled={loading}>
              {loading ? 'Processando...' : 'Confirmar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
