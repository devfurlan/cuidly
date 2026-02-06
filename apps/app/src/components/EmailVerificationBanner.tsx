'use client';

import { PiCheck, PiEnvelope, PiWarningCircle, PiX } from 'react-icons/pi';

import { Button } from '@/components/ui/shadcn/button';
import { Input } from '@/components/ui/shadcn/input';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export function EmailVerificationBanner() {
  const [isEmailVerified, setIsEmailVerified] = useState<boolean | null>(null);
  const [showVerificationForm, setShowVerificationForm] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    checkEmailVerification();
  }, []);

  const checkEmailVerification = async () => {
    try {
      // Fetch user data from database to check emailVerified
      const response = await fetch('/api/user/me');
      if (response.ok) {
        const data = await response.json();
        setIsEmailVerified(data.emailVerified || false);
      }
    } catch (error) {
      console.error('Error checking email verification:', error);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.trim().length !== 6) {
      toast.error('Digite um código válido de 6 dígitos');
      return;
    }

    setIsVerifying(true);

    try {
      const response = await fetch('/api/email/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: verificationCode.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('E-mail verificado com sucesso! 🎉');
        setIsEmailVerified(true);
        setShowVerificationForm(false);
        setVerificationCode('');
      } else {
        toast.error(data.message || 'Código inválido');
      }
    } catch (error) {
      console.error('Error verifying email:', error);
      toast.error('Erro ao verificar e-mail');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);

    try {
      const response = await fetch('/api/email/resend-verification', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Código reenviado com sucesso! Verifique seu e-mail');
      } else {
        toast.error(data.message || 'Erro ao reenviar código');
      }
    } catch (error) {
      console.error('Error resending code:', error);
      toast.error('Erro ao reenviar código');
    } finally {
      setIsResending(false);
    }
  };

  // Don't show banner if email is verified or dismissed
  if (isEmailVerified === null || isEmailVerified || isDismissed) {
    return null;
  }

  return (
    <div className="mb-6 w-full rounded-lg border-l-4 border-yellow-400 bg-linear-to-r from-yellow-50 to-orange-50 p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <PiWarningCircle className="mt-0.5 h-5 w-5 shrink-0 text-yellow-600" />

        <div className="flex-1">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-yellow-900">
              Verifique seu e-mail para aproveitar todos os benefícios
            </h3>
            <button
              onClick={() => setIsDismissed(true)}
              className="text-yellow-600 transition-colors hover:text-yellow-800"
              aria-label="Fechar"
            >
              <PiX className="h-4 w-4" />
            </button>
          </div>

          <p className="mb-3 text-sm text-yellow-800">
            Enviamos um código de verificação para seu e-mail. Confirme para ter
            acesso completo à plataforma.
          </p>

          {!showVerificationForm ? (
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => setShowVerificationForm(true)}
                className="bg-yellow-600 text-white hover:bg-yellow-700"
              >
                <PiEnvelope className="h-4 w-4" />
                Verificar agora
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleResendCode}
                disabled={isResending}
                className="border-yellow-600 text-yellow-700 hover:bg-yellow-50"
              >
                {isResending ? 'Enviando...' : 'Reenviar código'}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Digite o código de 6 dígitos"
                  value={verificationCode}
                  onChange={(e) =>
                    setVerificationCode(
                      e.target.value.replace(/\D/g, '').slice(0, 6),
                    )
                  }
                  maxLength={6}
                  className="max-w-xs font-mono text-lg tracking-wider"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleVerifyCode();
                    }
                  }}
                />
                <Button
                  onClick={handleVerifyCode}
                  disabled={isVerifying || verificationCode.length !== 6}
                  className="bg-green-600 text-white hover:bg-green-700"
                >
                  {isVerifying ? (
                    'Verificando...'
                  ) : (
                    <>
                      <PiCheck className="mr-2 h-4 w-4" />
                      Verificar
                    </>
                  )}
                </Button>
              </div>

              <div className="flex gap-2 text-xs">
                <button
                  onClick={handleResendCode}
                  disabled={isResending}
                  className="text-yellow-700 underline hover:text-yellow-900"
                >
                  {isResending ? 'Enviando...' : 'Não recebeu? Reenviar código'}
                </button>
                <span className="text-yellow-600">•</span>
                <button
                  onClick={() => setShowVerificationForm(false)}
                  className="text-yellow-700 underline hover:text-yellow-900"
                >
                  Fechar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
