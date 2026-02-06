'use client';

/**
 * Password Recovery Page
 * /recuperar-senha
 *
 * Allows users to request a password reset email
 */

import { PiArrowLeft, PiCheck, PiWarningCircle } from 'react-icons/pi';

import { Alert, AlertDescription } from '@/components/ui/shadcn/alert';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/shadcn/field';
import { Input } from '@/components/ui/shadcn/input';
import Link from 'next/link';
import { useState } from 'react';

export default function PasswordRecoveryPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Translate Supabase error messages to Portuguese
  const translateError = (errorMessage: string): string => {
    const translations: Record<string, string> = {
      'Invalid login credentials': 'E-mail ou senha incorretos',
      'Email not confirmed': 'E-mail não confirmado',
      'User already registered': 'Este e-mail já está cadastrado',
      'Password should be at least 6 characters':
        'A senha deve ter pelo menos 6 caracteres',
      'Unable to validate email address: invalid format':
        'Formato de e-mail inválido',
      'Email rate limit exceeded':
        'Limite de envio de e-mails excedido. Tente novamente mais tarde',
      'User not found': 'Usuário não encontrado',
      'Password is known to be weak and easy to guess, please choose a different one.':
        'Esta senha é conhecida por ser fraca e fácil de adivinhar, por favor escolha outra diferente.',
      'Error sending recovery email':
        'Erro ao enviar e-mail de recuperação. Verifique se o e-mail está correto e tente novamente.',
      'For security purposes, you can only request this once every 60 seconds':
        'Por questões de segurança, você só pode solicitar isso uma vez a cada 60 segundos',
    };

    return translations[errorMessage] || errorMessage;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError('Digite seu e-mail');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Usar API customizada que envia email via Resend
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao enviar e-mail de recuperação');
      }

      setSuccess(true);
    } catch (err) {
      console.error('Password recovery error:', err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Erro ao enviar e-mail de recuperação';
      setError(translateError(errorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {!success ? (
        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          <FieldGroup>
            {/* Header */}
            <div className="flex flex-col items-start gap-1">
              <h1 className="text-2xl font-bold">Recuperar Senha</h1>
              <p className="text-muted-foreground text-sm">
                Digite seu e-mail e enviaremos um link para redefinir sua senha
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <Alert variant="destructive" className="mb-6">
                <PiWarningCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Field>
              <FieldLabel htmlFor="email">E-mail</FieldLabel>
              <Input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="email"
                autoFocus
              />
            </Field>

            <LoadingButton
              type="submit"
              size={'lg'}
              className="w-full"
              isLoading={isLoading}
              loadingText="Enviando..."
            >
              Enviar Link de Recuperação
            </LoadingButton>

            {/* Back to Login */}
            <div className="mt-4 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm text-gray-500 hover:underline"
              >
                <PiArrowLeft size={16} />
                Voltar para o login
              </Link>
            </div>
          </FieldGroup>
        </form>
      ) : (
        <>
          {/* Success State */}
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <div className="rounded-full bg-green-100 p-4">
                <PiCheck size={48} className="text-green-600" />
              </div>
            </div>

            <h2 className="mb-4 text-2xl font-bold text-gray-900">
              E-mail Enviado!
            </h2>

            <Alert className="mb-6 border-green-200 bg-green-50">
              <AlertDescription className="text-gray-700">
                Enviamos um link de recuperação para{' '}
                <span className="font-semibold">{email}</span>
              </AlertDescription>
            </Alert>

            <div className="mb-6 rounded-lg bg-gray-50 p-4 text-left">
              <h3 className="mb-4 font-semibold text-gray-900">
                Próximos passos:
              </h3>
              <ol className="space-y-4 text-base text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-fuchsia-500 font-mono text-xs font-semibold text-white">
                    1
                  </span>
                  <span>Verifique sua caixa de entrada</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-fuchsia-500 font-mono text-xs font-semibold text-white">
                    2
                  </span>
                  <span>Clique no link que enviamos por e-mail</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-fuchsia-500 font-mono text-xs font-semibold text-white">
                    3
                  </span>
                  <span>Crie sua nova senha</span>
                </li>
              </ol>
            </div>

            <p className="mb-6 text-sm text-gray-500">
              Não recebeu o e-mail? Verifique sua pasta de spam ou{' '}
              <button
                className="font-medium text-fuchsia-500 hover:text-fuchsia-800"
                onClick={() => setSuccess(false)}
              >
                tente novamente
              </button>
            </p>

            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900"
            >
              <PiArrowLeft size={16} />
              Voltar para o login
            </Link>
          </div>
        </>
      )}
    </>
  );
}
