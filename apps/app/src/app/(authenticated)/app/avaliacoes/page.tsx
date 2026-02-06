'use client';

import { PiClock, PiStar, PiWarningCircle } from 'react-icons/pi';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/shadcn/card';
import { Button } from '@/components/ui/shadcn/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/shadcn/avatar';
import { ReviewForm } from '@/components/reviews';

interface EligibleUser {
  contact: {
    id: number;
    createdAt: string;
    type: string;
    jobId: number | null;
  };
  user: {
    id: number;
    name: string;
    photoUrl?: string | null;
  };
  daysRemaining: number;
  reviewType: 'FAMILY_TO_NANNY' | 'NANNY_TO_FAMILY';
}

export default function AvaliacoesPage() {
  const [eligible, setEligible] = useState<EligibleUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<EligibleUser | null>(null);

  const fetchEligible = async () => {
    try {
      const response = await fetch('/api/reviews/eligible');
      const data = await response.json();
      // Filter out items with missing contact or user data
      const validEligible = (data.eligible || []).filter(
        (item: EligibleUser) => item?.contact?.id && item?.user?.id
      );
      setEligible(validEligible);
    } catch (error) {
      console.error('Error fetching eligible users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEligible();
  }, []);

  const handleReviewSuccess = () => {
    setSelectedUser(null);
    fetchEligible();
  };

  if (loading) {
    return (
      <div className="py-8">
        <div className="text-center">Carregando...</div>
      </div>
    );
  }

  if (selectedUser) {
    return (
      <div className="py-8">
        <ReviewForm
          targetId={selectedUser.user.id}
          targetName={selectedUser.user.name}
          type={selectedUser.reviewType}
          jobId={selectedUser.contact.jobId || undefined}
          onSuccess={handleReviewSuccess}
          onCancel={() => setSelectedUser(null)}
        />
      </div>
    );
  }

  return (
    <>
      <p className="text-muted-foreground mb-8">
        Você tem {eligible.length} {eligible.length === 1 ? 'pessoa' : 'pessoas'} para avaliar
      </p>

      {eligible.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <PiStar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Nenhuma avaliação pendente no momento
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Quando você entrar em contato com babás ou famílias, poderá avaliá-las aqui.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {eligible.map((item) => (
            <Card key={item.contact.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={item.user.photoUrl || undefined} />
                      <AvatarFallback>
                        {item.user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <h3 className="font-semibold text-lg">{item.user.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        {item.daysRemaining <= 3 ? (
                          <PiWarningCircle className="w-4 h-4 text-red-500" />
                        ) : (
                          <PiClock className="w-4 h-4 text-orange-500" />
                        )}
                        <span className={`text-sm ${item.daysRemaining <= 3 ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}>
                          {item.daysRemaining} {item.daysRemaining === 1 ? 'dia' : 'dias'} restantes
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button onClick={() => setSelectedUser(item)}>
                    <PiStar className="w-4 h-4 mr-2" />
                    Avaliar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
