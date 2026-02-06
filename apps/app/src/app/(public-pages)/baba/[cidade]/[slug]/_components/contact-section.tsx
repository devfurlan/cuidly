'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { PiChat, PiShareNetwork, PiUser } from 'react-icons/pi';
import { Button } from '@/components/ui/shadcn/button';
import { Card } from '@/components/ui/shadcn/card';
import { ReportButton } from '@/components/ReportButton';
import { PremiumUpsellModal } from '@/components/PremiumUpsellModal';
import { createClient } from '@/utils/supabase/client';

interface ContactSectionProps {
  nannyId: number;
  nannyUserId: string | null;
  nannyFirstName: string | null;
  nannySlug: string;
  cidade: string;
  variant: 'mobile' | 'desktop';
}

function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

async function trackEvent(
  nannyId: number,
  actionType: 'VIEW' | 'HIRE_CLICK' | 'CONTACT_CLICK' | 'SHARE',
  sessionId: string,
) {
  try {
    await fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nannyId, actionType, sessionId }),
    });
  } catch (error) {
    console.error('Error tracking event:', error);
  }
}

export function ContactSection({
  nannyId,
  nannyUserId,
  nannyFirstName,
  nannySlug,
  cidade,
  variant,
}: ContactSectionProps) {
  const router = useRouter();
  const supabase = createClient();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [existingConversationId, setExistingConversationId] = useState<string | null>(null);
  const [isStartingChat, setIsStartingChat] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [sessionId] = useState(() => generateSessionId());

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
      setCurrentUserId(user?.id || null);

      if (user) {
        try {
          const roleResponse = await fetch('/api/user/role');
          if (roleResponse.ok) {
            const roleData = await roleResponse.json();
            setUserRole(roleData.role);
          }
        } catch {
          // Ignore role check errors
        }
      }
    };

    checkAuth();
  }, [supabase]);

  // Check for existing conversation
  useEffect(() => {
    const checkExistingConversation = async () => {
      if (!isAuthenticated || userRole !== 'FAMILY') return;

      try {
        const response = await fetch('/api/chat/conversations');
        if (response.ok) {
          const data = await response.json();
          const existingConv = data.conversations?.find(
            (conv: { otherParticipant?: { id?: number; role?: string } }) =>
              conv.otherParticipant?.role === 'NANNY' &&
              conv.otherParticipant?.id === nannyId
          );
          if (existingConv) {
            setExistingConversationId(existingConv.id);
          }
        }
      } catch (error) {
        console.error('Error checking existing conversation:', error);
      }
    };

    checkExistingConversation();
  }, [isAuthenticated, userRole, nannyId]);

  const isOwnProfile = currentUserId && nannyUserId && currentUserId === nannyUserId;

  const handleStartChat = async () => {
    if (!isAuthenticated) {
      router.push(`/login?callbackUrl=/baba/${cidade}/${nannySlug}`);
      return;
    }

    if (existingConversationId) {
      await trackEvent(nannyId, 'CONTACT_CLICK', sessionId);
      router.push(`/app/mensagens/${existingConversationId}`);
      return;
    }

    if (!nannyUserId) {
      toast.error('Não foi possível iniciar o chat. Tente novamente mais tarde.');
      return;
    }

    setIsStartingChat(true);

    try {
      await trackEvent(nannyId, 'CONTACT_CLICK', sessionId);

      const response = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientNannyId: nannyId }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.code === 'PREMIUM_REQUIRED') {
          toast.error('Você precisa de um plano Plus para entrar em contato com babás.');
          router.push('/planos');
          return;
        }
        if (data.code === 'CONVERSATION_LIMIT_REACHED') {
          setShowPremiumModal(true);
          return;
        }
        throw new Error(data.error || 'Erro ao iniciar conversa');
      }

      router.push(`/app/mensagens/${data.conversation.id}`);
    } catch (error) {
      console.error('Error starting chat:', error);
      toast.error('Erro ao iniciar conversa. Tente novamente.');
    } finally {
      setIsStartingChat(false);
    }
  };

  const handleShare = async () => {
    await trackEvent(nannyId, 'SHARE', sessionId);

    const shareUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Perfil de ${nannyFirstName} - Cuidly`,
          text: `Confira o perfil de ${nannyFirstName}, babá profissional na Cuidly`,
          url: shareUrl,
        });
        return;
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link copiado para a área de transferência!');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast.error('Erro ao copiar link');
    }
  };

  if (variant === 'mobile') {
    return (
      <>
        <Card className="border-0 bg-gradient-to-br from-fuchsia-500 to-fuchsia-600 text-white shadow-lg lg:hidden">
          <div className="p-6">
            {isOwnProfile ? (
              <>
                <h3 className="mb-1 text-xl font-bold">Este é o seu perfil</h3>
                <p className="mb-4 text-fuchsia-100">Veja como outras pessoas veem você</p>
                <Button
                  size="lg"
                  variant="secondary"
                  className="w-full"
                  onClick={() => router.push('/app/perfil')}
                >
                  <PiUser size={22} className="mr-1.5" />
                  Editar Perfil
                </Button>
              </>
            ) : (
              <>
                <h3 className="mb-1 text-xl font-bold">
                  {existingConversationId
                    ? `Conversa com ${nannyFirstName}`
                    : `Gostou de ${nannyFirstName}?`}
                </h3>
                <p className="mb-4 text-fuchsia-100">
                  {existingConversationId
                    ? 'Continue a conversa de onde parou!'
                    : 'Entre em contato agora mesmo!'}
                </p>
                <Button
                  size="lg"
                  variant="secondary"
                  className="mb-3 w-full"
                  onClick={handleStartChat}
                  disabled={isStartingChat}
                >
                  <PiChat size={22} className="mr-1.5" />
                  {isStartingChat
                    ? 'Carregando...'
                    : existingConversationId
                      ? 'Continuar Conversa'
                      : 'Enviar Mensagem'}
                </Button>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="flex-1 text-white hover:bg-fuchsia-600/50"
                    onClick={handleShare}
                  >
                    <PiShareNetwork size={18} className="mr-1" />
                    Compartilhar
                  </Button>
                  {!isAuthenticated && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="flex-1 text-white hover:bg-fuchsia-600/50"
                      onClick={() => router.push('/cadastro')}
                    >
                      <PiUser size={18} className="mr-1" />
                      Criar Conta
                    </Button>
                  )}
                  <ReportButton
                    targetType="NANNY"
                    targetId={nannyId}
                    targetName={nannyFirstName || 'Babá'}
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-fuchsia-600/50 hover:text-red-200"
                    showLabel={false}
                  />
                </div>
              </>
            )}
          </div>
        </Card>

        <PremiumUpsellModal
          isOpen={showPremiumModal}
          onClose={() => setShowPremiumModal(false)}
          feature="contact"
        />
      </>
    );
  }

  // Desktop variant
  return (
    <>
      <Card className="border-0 bg-gradient-to-br from-fuchsia-500 to-fuchsia-600 text-white shadow-xl">
        <div className="p-6">
          {isOwnProfile ? (
            <>
              <h3 className="mb-1 text-xl font-bold">Este é o seu perfil</h3>
              <p className="mb-6 text-fuchsia-100">Veja como outras pessoas veem você</p>
              <Button
                size="lg"
                variant="secondary"
                className="mb-3 w-full text-base"
                onClick={() => router.push('/app/perfil')}
              >
                <PiUser size={22} className="mr-1.5" />
                Editar Perfil
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="w-full text-white hover:bg-fuchsia-600/50"
                onClick={handleShare}
              >
                <PiShareNetwork size={18} className="mr-1" />
                Compartilhar perfil
              </Button>
            </>
          ) : (
            <>
              <h3 className="mb-1 text-xl font-bold">
                {existingConversationId
                  ? `Conversa com ${nannyFirstName}`
                  : `Falar com ${nannyFirstName}`}
              </h3>
              <p className="mb-6 text-fuchsia-100">
                {existingConversationId
                  ? 'Continue a conversa de onde parou!'
                  : 'Envie uma mensagem para conhecer melhor'}
              </p>
              <Button
                size="lg"
                variant="secondary"
                className="mb-3 w-full text-base"
                onClick={handleStartChat}
                disabled={isStartingChat}
              >
                <PiChat size={22} className="mr-1.5" />
                {isStartingChat
                  ? 'Carregando...'
                  : existingConversationId
                    ? 'Continuar Conversa'
                    : 'Enviar Mensagem'}
              </Button>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="flex-1 text-white hover:bg-fuchsia-600/50"
                  onClick={handleShare}
                >
                  <PiShareNetwork size={18} className="mr-1" />
                  Compartilhar perfil
                </Button>
                <ReportButton
                  targetType="NANNY"
                  targetId={nannyId}
                  targetName={nannyFirstName || 'Babá'}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-fuchsia-600/50 hover:text-red-200"
                  showLabel={false}
                />
              </div>
            </>
          )}
        </div>
      </Card>

      <PremiumUpsellModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        feature="contact"
      />
    </>
  );
}
