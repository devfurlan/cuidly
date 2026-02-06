'use client';

/**
 * StartConversationButton Component
 *
 * Botão para iniciar uma conversa com uma babá
 * Inclui verificação de assinatura Premium e modal de paywall
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PiChatCircle, PiCrown, PiSpinner } from 'react-icons/pi';

import { Button } from '@/components/ui/shadcn/button';
import { PaywallModal } from '@/components/subscription/paywall-modal';
import { useApiError } from '@/hooks/useApiError';

interface StartConversationButtonProps {
  /** ID do usuário da babá (recipientId) */
  recipientUserId: string;
  /** Nome da babá (para o modal de paywall) */
  nannyName: string;
  /** Se o usuário atual pode contatar (tem plano Premium) */
  canContact: boolean;
  /** Se o usuário está logado */
  isLoggedIn: boolean;
  /** ID da babá para registro de contato */
  nannyId?: number;
  /** Variante do botão */
  variant?: 'default' | 'outline' | 'ghost';
  /** Tamanho do botão */
  size?: 'default' | 'sm' | 'lg';
  /** Classes CSS adicionais */
  className?: string;
  /** Texto do botão */
  children?: React.ReactNode;
}

export function StartConversationButton({
  recipientUserId,
  nannyName,
  canContact,
  isLoggedIn,
  nannyId,
  variant = 'default',
  size = 'default',
  className = '',
  children,
}: StartConversationButtonProps) {
  const router = useRouter();
  const { showError, showSuccess } = useApiError();
  const [isLoading, setIsLoading] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  const handleClick = async () => {
    // Se não está logado ou não tem Premium, mostrar paywall
    if (!isLoggedIn || !canContact) {
      setShowPaywall(true);
      return;
    }

    setIsLoading(true);

    try {
      // Criar ou buscar conversa existente
      const response = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientId: recipientUserId }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Verificar se é erro de Premium
        if (response.status === 403 && data.code === 'PREMIUM_REQUIRED') {
          setShowPaywall(true);
          return;
        }
        throw new Error(data.error || 'Erro ao iniciar conversa');
      }

      // Registrar contato (analytics)
      if (nannyId) {
        fetch('/api/contacts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nannyId, type: 'SEND_MESSAGE' }),
        }).catch(console.error);
      }

      // Redirecionar para a conversa
      if (data.conversation.isExisting) {
        showSuccess('Abrindo conversa existente...');
      }

      router.push(`/app/mensagens/${data.conversation.id}`);
    } catch (error) {
      console.error('Error starting conversation:', error);
      showError(error, 'Erro ao iniciar conversa');
    } finally {
      setIsLoading(false);
    }
  };

  const buttonContent = children || (
    <>
      <PiChatCircle className="mr-2 size-5" />
      Enviar Mensagem
    </>
  );

  // Se não pode contatar, mostrar ícone de Premium
  const showPremiumIndicator = isLoggedIn && !canContact;

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={`${className} ${showPremiumIndicator ? 'relative' : ''}`}
        onClick={handleClick}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <PiSpinner className="mr-2 size-5 animate-spin" />
            Iniciando...
          </>
        ) : (
          <>
            {buttonContent}
            {showPremiumIndicator && (
              <PiCrown className="ml-2 size-4 text-yellow-500" />
            )}
          </>
        )}
      </Button>

      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        isLoggedIn={isLoggedIn}
        feature="contact"
        nannyName={nannyName}
      />
    </>
  );
}
