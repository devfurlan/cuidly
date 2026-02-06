'use client';

/**
 * Reset Password Page
 * /(auth)/redefinir-senha
 *
 * Page where users land after clicking the reset link in email
 */

import { PiArrowLeft, PiCheck, PiWarningCircle } from 'react-icons/pi';

export const dynamic = 'force-dynamic';

import { PasswordValidationIndicator } from '@/app/(auth)/cadastro/_components/PasswordValidationIndicator';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Alert, AlertDescription } from '@/components/ui/shadcn/alert';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { Button } from '@/components/ui/shadcn/button';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/shadcn/field';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

function ResetPasswordForm() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isOnboarding = searchParams.get('onboarding') === 'true';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);

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
      'New password should be different from the old password':
        'A nova senha deve ser diferente da senha anterior',
      'Password is known to be weak and easy to guess, please choose a different one.':
        'Esta senha é conhecida por ser fraca e fácil de adivinhar, por favor escolha outra diferente.',
    };

    return translations[errorMessage] || errorMessage;
  };

  // Password validation states
  const passwordValidations = {
    minLength: password.length >= 8,
    hasLowerCase: /[a-z]/.test(password),
    hasUpperCase: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSymbol: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    passwordsMatch: password === confirmPassword && confirmPassword.length > 0,
  };

  useEffect(() => {
    // Processar código de troca ou hash fragment legado
    const processToken = async () => {
      // Primeiro, verificar código de troca seguro (novo fluxo)
      const urlParams = new URLSearchParams(window.location.search);
      const exchangeCode = urlParams.get('code');

      if (exchangeCode) {
        try {
          // Trocar código pelo token real via API
          const response = await fetch(
            `/api/auth/exchange-reset-token?code=${encodeURIComponent(exchangeCode)}`,
          );

          if (!response.ok) {
            console.error('Código de troca inválido ou expirado');
            setIsValidToken(false);
            return;
          }

          const { token, type } = await response.json();

          // Usar verifyOtp para processar o token de recuperação
          const { error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: type as 'recovery',
          });

          if (error) {
            console.error('Erro ao verificar token:', error);
            setIsValidToken(false);
            return;
          }

          // Limpar parâmetros da URL para segurança
          window.history.replaceState(null, '', window.location.pathname);

          setIsValidToken(true);
          return;
        } catch (err) {
          console.error('Erro ao processar código de troca:', err);
          setIsValidToken(false);
          return;
        }
      }

      // Fallback: verificar hash fragment legado (#access_token=...&type=recovery)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const type = hashParams.get('type');

      if (accessToken && type === 'recovery') {
        try {
          // Usar verifyOtp para processar o token de recuperação
          const { error } = await supabase.auth.verifyOtp({
            token_hash: accessToken,
            type: 'recovery',
          });

          if (error) {
            console.error('Erro ao verificar token:', error);
            setIsValidToken(false);
            return;
          }

          // Limpar hash da URL
          window.history.replaceState(null, '', window.location.pathname);

          setIsValidToken(true);
        } catch (err) {
          console.error('Erro ao processar token:', err);
          setIsValidToken(false);
        }
      } else {
        // Verificar se já existe sessão válida
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          setIsValidToken(false);
        } else {
          setIsValidToken(true);
        }
      }
    };

    processToken();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password) {
      setError('Digite sua nova senha');
      return;
    }

    if (password.length < 8) {
      setError('A senha deve ter no mínimo 8 caracteres');
      return;
    }

    if (!/[a-z]/.test(password)) {
      setError('A senha deve conter pelo menos uma letra minúscula');
      return;
    }

    if (!/[A-Z]/.test(password)) {
      setError('A senha deve conter pelo menos uma letra maiúscula');
      return;
    }

    if (!/[0-9]/.test(password)) {
      setError('A senha deve conter pelo menos um número');
      return;
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      setError('A senha deve conter pelo menos um símbolo especial');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) throw updateError;

      // Marcar email como verificado após definir senha
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        await fetch('/api/email/verify-after-password-reset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id }),
        });
      }

      setSuccess(true);

      // Se for onboarding, redirecionar após 2 segundos
      if (isOnboarding) {
        setTimeout(() => {
          router.push('/onboarding');
        }, 2000);
      }
    } catch (err) {
      console.error('Password update error:', err);
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao atualizar senha';
      setError(translateError(errorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidToken === null) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-fuchsia-500"></div>
        <p className="text-gray-600">Verificando...</p>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="flex flex-col gap-6">
        <Alert variant="destructive">
          <PiWarningCircle className="h-4 w-4" />
          <AlertDescription>
            Link inválido ou expirado. Por favor, solicite um novo link de
            recuperação.
          </AlertDescription>
        </Alert>
        <Link href="/recuperar-senha">
          <Button className="w-full">Solicitar Novo Link</Button>
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col gap-6 text-center">
        <div className="flex justify-center">
          <div className="rounded-full bg-green-100 p-4">
            <PiCheck size={48} className="text-green-600" />
          </div>
        </div>

        <div>
          <h2 className="mb-2 text-2xl font-bold">Senha Atualizada!</h2>
          <p className="text-muted-foreground">
            Sua senha foi alterada com sucesso
          </p>
        </div>

        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-gray-700">
            Agora você pode fazer login com sua nova senha
          </AlertDescription>
        </Alert>

        <Link href="/login">
          <Button className="w-full">Ir para o Login</Button>
        </Link>
      </div>
    );
  }

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
      <FieldGroup>
        {/* Header */}
        <div className="flex flex-col items-start gap-1">
          <h1 className="text-2xl font-bold">Nova Senha</h1>
          <p className="text-muted-foreground text-sm">
            Digite sua nova senha abaixo
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <Alert variant="destructive">
            <PiWarningCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Password Field */}
        <Field>
          <FieldLabel htmlFor="password">Nova senha</FieldLabel>
          <PasswordInput
            id="password"
            placeholder="Digite sua nova senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            autoComplete="new-password"
          />
          {password.length > 0 && (
            <div className="space-y-1">
              <PasswordValidationIndicator
                isValid={passwordValidations.minLength}
                label="Mínimo 8 caracteres"
              />
              <PasswordValidationIndicator
                isValid={passwordValidations.hasLowerCase}
                label="Pelo menos 1 letra minúscula"
              />
              <PasswordValidationIndicator
                isValid={passwordValidations.hasUpperCase}
                label="Pelo menos 1 letra maiúscula"
              />
              <PasswordValidationIndicator
                isValid={passwordValidations.hasNumber}
                label="Pelo menos 1 número"
              />
              <PasswordValidationIndicator
                isValid={passwordValidations.hasSymbol}
                label="Pelo menos 1 símbolo especial (!@#$%^&*)"
              />
            </div>
          )}
        </Field>

        {/* Confirm Password Field */}
        <Field>
          <FieldLabel htmlFor="confirm-password">
            Confirme a nova senha
          </FieldLabel>
          <PasswordInput
            id="confirm-password"
            placeholder="Digite a senha novamente"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={isLoading}
            autoComplete="new-password"
          />
          {confirmPassword.length > 0 && (
            <div>
              <PasswordValidationIndicator
                isValid={passwordValidations.passwordsMatch}
                label={
                  passwordValidations.passwordsMatch
                    ? 'As senhas coincidem'
                    : 'As senhas não coincidem'
                }
                variant="error"
              />
            </div>
          )}
        </Field>

        {/* Submit Button */}
        <Field>
          <LoadingButton
            type="submit"
            size={'lg'}
            isLoading={isLoading}
            loadingText="Atualizando..."
          >
            Atualizar Senha
          </LoadingButton>
        </Field>

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
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-fuchsia-500"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
