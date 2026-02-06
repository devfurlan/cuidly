'use client';

/**
 * Signup Page
 * /cadastro
 *
 * Signup page with email/password, Google and Facebook OAuth.
 * User type (Família/Babá) is selected during onboarding.
 */

export const dynamic = 'force-dynamic';

import { PiCircleNotch, PiWarningCircle } from 'react-icons/pi';

import { PasswordValidationIndicator } from '@/app/(auth)/cadastro/_components/PasswordValidationIndicator';
import { FacebookIcon } from '@/components/icons/FacebookIcon';
import { GoogleIcon } from '@/components/icons/GoogleIcon';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Alert, AlertDescription } from '@/components/ui/shadcn/alert';
import { Button } from '@/components/ui/shadcn/button';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '@/components/ui/shadcn/field';
import { Input } from '@/components/ui/shadcn/input';
import {
  TurnstileWidget,
  type TurnstileWidgetRef,
} from '@/components/auth/TurnstileWidget';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Suspense, useRef, useState } from 'react';

export default function SignupPage() {
  return (
    <Suspense fallback={<SignupFormSkeleton />}>
      <SignupForm />
    </Suspense>
  );
}

function SignupFormSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-6">
      <div className="h-8 w-1/3 rounded bg-gray-200"></div>
      <div className="h-4 w-2/3 rounded bg-gray-200"></div>
      <div className="space-y-4">
        <div className="h-10 rounded bg-gray-200"></div>
        <div className="h-10 rounded bg-gray-200"></div>
        <div className="h-10 rounded bg-gray-200"></div>
      </div>
    </div>
  );
}

function SignupForm() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isFacebookLoading, setIsFacebookLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileWidgetRef>(null);

  const isSocialLoading = isGoogleLoading || isFacebookLoading;

  const supabase = createClient();

  // Translate Supabase error messages to Portuguese
  const translateError = (errorMessage: string): string => {
    const translations: Record<string, string> = {
      'User already registered': 'Este e-mail já está cadastrado',
      'Invalid login credentials': 'Credenciais de login inválidas',
      'Email not confirmed': 'E-mail não confirmado',
      'Password should be at least 6 characters':
        'A senha deve ter pelo menos 6 caracteres',
      'Signup requires a valid password': 'O cadastro requer uma senha válida',
      'Unable to validate email address: invalid format':
        'Formato de e-mail inválido',
      'Email rate limit exceeded':
        'Limite de envio de e-mails excedido. Tente novamente mais tarde',
      'captcha verification process failed':
        'Erro na verificação de segurança. Tente novamente.',
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

  const isPasswordValid =
    passwordValidations.minLength &&
    passwordValidations.hasLowerCase &&
    passwordValidations.hasUpperCase &&
    passwordValidations.hasNumber &&
    passwordValidations.hasSymbol &&
    passwordValidations.passwordsMatch;

  // Handle Google OAuth signup
  const handleGoogleSignup = async () => {
    try {
      setIsGoogleLoading(true);
      setError(null);

      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (oauthError) throw oauthError;
    } catch (err) {
      console.error('Google signup error:', err);
      setError('Erro ao conectar com Google. Tente novamente.');
      setIsGoogleLoading(false);
    }
  };

  // Handle Facebook OAuth signup
  const handleFacebookSignup = async () => {
    try {
      setIsFacebookLoading(true);
      setError(null);

      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (oauthError) throw oauthError;
    } catch (err) {
      console.error('Facebook signup error:', err);
      setError('Erro ao conectar com Facebook. Tente novamente.');
      setIsFacebookLoading(false);
    }
  };

  // Handle email/password signup
  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setError('Digite seu e-mail');
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

      // Create auth user (no type - will be selected in onboarding)
      const { data: authData, error: signUpError } =
        await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            captchaToken: captchaToken ?? undefined,
          },
        });

      if (signUpError) throw signUpError;

      if (authData.user) {
        // Redirect to onboarding (type selection will be first step)
        router.push('/app/onboarding');
      }
    } catch (err) {
      console.error('Signup error:', err);
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao criar conta';
      setError(translateError(errorMessage));
      setIsLoading(false);
      turnstileRef.current?.reset();
      setCaptchaToken(null);
    }
  };

  return (
    <form className="flex flex-col gap-6" onSubmit={handleEmailSignup}>
      <FieldGroup>
        <div className="flex flex-col items-start gap-1">
          <h1 className="text-2xl font-bold">Crie sua conta</h1>
          <p className="text-sm text-muted-foreground">
            Preencha o formulário abaixo e faça parte da Cuidly
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <Alert variant="destructive">
            <PiWarningCircle className="size-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Social OAuth Buttons */}
        <Field className="space-y-3">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={handleGoogleSignup}
            disabled={isLoading || isSocialLoading}
            className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
          >
            {isGoogleLoading ? (
              <PiCircleNotch className="size-5 animate-spin" />
            ) : (
              <GoogleIcon className="size-5" />
            )}
            Cadastrar com Google
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={handleFacebookSignup}
            disabled={isLoading || isSocialLoading}
            className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
          >
            {isFacebookLoading ? (
              <PiCircleNotch className="size-5 animate-spin" />
            ) : (
              <FacebookIcon className="size-5" />
            )}
            Cadastrar com Facebook
          </Button>
        </Field>

        <FieldSeparator>ou</FieldSeparator>

        <Field>
          <FieldLabel htmlFor="email">E-mail</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading || isSocialLoading}
            autoComplete="email"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="password">Senha</FieldLabel>
          <PasswordInput
            id="password"
            placeholder="**********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading || isSocialLoading}
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

        <Field>
          <FieldLabel htmlFor="confirm-password">Confirmar Senha</FieldLabel>
          <PasswordInput
            id="confirm-password"
            placeholder="**********"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={isLoading || isSocialLoading}
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

        <TurnstileWidget
          ref={turnstileRef}
          onSuccess={(token) => setCaptchaToken(token)}
          onExpire={() => setCaptchaToken(null)}
          onError={() => setCaptchaToken(null)}
        />
        <Field>
          <LoadingButton
            size="lg"
            type="submit"
            className="w-full"
            disabled={!isPasswordValid || isSocialLoading}
            isLoading={isLoading}
            loadingText="Criando conta..."
          >
            Criar Conta
          </LoadingButton>
        </Field>

        <Field className="mt-2 text-center">
          <FieldDescription>
            Já tem uma conta?{' '}
            <Link
              href="/login"
              className="font-semibold text-fuchsia-500 hover:underline"
            >
              Fazer login
            </Link>
          </FieldDescription>
          <p className="mt-4 text-xs text-gray-400">
            Ao criar sua conta, você concorda com nossos{' '}
            <Link
              href="/termos/termos-de-uso"
              className="text-gray-500 underline underline-offset-4 hover:text-gray-700"
            >
              Termos de Uso
            </Link>{' '}
            e{' '}
            <Link
              href="/termos/politica-de-privacidade"
              className="text-gray-500 underline underline-offset-4 hover:text-gray-700"
            >
              Política de Privacidade
            </Link>
            , incluindo o uso de cookies.
          </p>
        </Field>
      </FieldGroup>
    </form>
  );
}
