'use client';

/**
 * Signup Page
 * /cadastro
 *
 * Signup page with email/password and user type selection
 */

export const dynamic = 'force-dynamic';

import {
  PiCheckCircleFill,
  PiUserCheckDuotone,
  PiUsersDuotone,
  PiWarningCircle,
} from 'react-icons/pi';

import { PasswordValidationIndicator } from '@/app/(auth)/cadastro/_components/PasswordValidationIndicator';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Alert, AlertDescription } from '@/components/ui/shadcn/alert';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/shadcn/field';
import { Input } from '@/components/ui/shadcn/input';
import { cn } from '@cuidly/shared';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

type UserType = 'FAMILY' | 'NANNY';

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
  const searchParams = useSearchParams();

  // Get type from URL parameter
  const typeParam = searchParams.get('type')?.toUpperCase() as
    | UserType
    | undefined;
  const hasTypeParam = typeParam === 'FAMILY' || typeParam === 'NANNY';

  const [userType, setUserType] = useState<UserType>(
    hasTypeParam ? typeParam : 'FAMILY',
  );

  // Update userType if URL param changes
  useEffect(() => {
    if (hasTypeParam) {
      setUserType(typeParam);
    }
  }, [typeParam, hasTypeParam]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      // Create auth user
      const { data: authData, error: signUpError } = await supabase.auth.signUp(
        {
          email,
          password,
          options: {
            data: {
              user_type: userType,
            },
            emailRedirectTo: `${window.location.origin}/auth/callback?type=${userType.toLowerCase()}`,
          },
        },
      );

      if (signUpError) throw signUpError;

      if (authData.user) {
        // Create nanny or family record in database
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            authId: authData.user.id,
            email: authData.user.email,
            type: userType,
          }),
        });

        if (!response.ok) {
          const result = await response.json();
          throw new Error(result.error || 'Erro ao criar usuário');
        }

        // Redirect to onboarding
        router.push('/app/onboarding');
      }
    } catch (err) {
      console.error('Signup error:', err);
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao criar conta';
      setError(translateError(errorMessage));
      setIsLoading(false);
    }
  };

  return (
    <form className="flex flex-col gap-6" onSubmit={handleEmailSignup}>
      <FieldGroup>
        <div className="flex flex-col items-start gap-1">
          <h1 className="text-2xl font-bold">Crie sua conta</h1>
          <p className="text-sm text-muted-foreground">
            {hasTypeParam
              ? userType === 'NANNY'
                ? 'Cadastre-se como babá e encontre famílias que precisam de você'
                : 'Cadastre-se como família e encontre a babá ideal'
              : 'Preencha o formulário abaixo e faça parte da Cuidly'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <Alert variant="destructive">
            <PiWarningCircle className="size-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* User Type Selection - only show if type not in URL */}
        {!hasTypeParam && (
          <Field>
            <FieldLabel>Eu sou</FieldLabel>
            <div className="mt-0 grid gap-3">
              <button
                type="button"
                onClick={() => setUserType('FAMILY')}
                disabled={isLoading}
                className={cn(
                  'flex items-center justify-between rounded-lg border-2 bg-white/60 p-4 text-left transition-all',
                  userType === 'FAMILY'
                    ? 'border-fuchsia-500 bg-white'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
                  isLoading && 'cursor-not-allowed opacity-50',
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'flex size-10 items-center justify-center rounded-full',
                      userType === 'FAMILY' ? 'bg-fuchsia-100' : 'bg-gray-100',
                    )}
                  >
                    <PiUsersDuotone
                      className={cn(
                        'size-5',
                        userType === 'FAMILY'
                          ? 'text-fuchsia-600'
                          : 'text-gray-500',
                      )}
                    />
                  </div>
                  <div>
                    <span
                      className={cn(
                        'text-base font-medium',
                        userType === 'FAMILY'
                          ? 'text-fuchsia-900'
                          : 'text-gray-700',
                      )}
                    >
                      Sou uma família
                    </span>
                    <p
                      className={cn(
                        'text-xs',
                        userType === 'FAMILY'
                          ? 'text-fuchsia-600'
                          : 'text-gray-500',
                      )}
                    >
                      Procuro uma babá para meus filhos
                    </p>
                  </div>
                </div>
                {userType === 'FAMILY' && (
                  <PiCheckCircleFill className="ml-3 size-6 shrink-0 text-fuchsia-500" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setUserType('NANNY')}
                disabled={isLoading}
                className={cn(
                  'flex items-center justify-between rounded-lg border-2 bg-white/60 p-4 text-left transition-all',
                  userType === 'NANNY'
                    ? 'border-fuchsia-500 bg-white'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
                  isLoading && 'cursor-not-allowed opacity-50',
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'flex size-10 items-center justify-center rounded-full',
                      userType === 'NANNY' ? 'bg-fuchsia-100' : 'bg-gray-100',
                    )}
                  >
                    <PiUserCheckDuotone
                      className={cn(
                        'size-5',
                        userType === 'NANNY'
                          ? 'text-fuchsia-600'
                          : 'text-gray-500',
                      )}
                    />
                  </div>
                  <div>
                    <span
                      className={cn(
                        'text-base font-medium',
                        userType === 'NANNY'
                          ? 'text-fuchsia-900'
                          : 'text-gray-700',
                      )}
                    >
                      Sou uma babá
                    </span>
                    <p
                      className={cn(
                        'text-xs',
                        userType === 'NANNY'
                          ? 'text-fuchsia-600'
                          : 'text-gray-500',
                      )}
                    >
                      Procuro famílias para trabalhar
                    </p>
                  </div>
                </div>
                {userType === 'NANNY' && (
                  <PiCheckCircleFill className="ml-3 size-6 shrink-0 text-fuchsia-500" />
                )}
              </button>
            </div>
          </Field>
        )}

        <Field>
          <FieldLabel htmlFor="email">E-mail</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
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

        <Field>
          <FieldLabel htmlFor="confirm-password">Confirmar Senha</FieldLabel>
          <PasswordInput
            id="confirm-password"
            placeholder="**********"
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

        <Field>
          <LoadingButton
            size={'lg'}
            type="submit"
            className="w-full"
            disabled={!isPasswordValid}
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
        </Field>
      </FieldGroup>
    </form>
  );
}
