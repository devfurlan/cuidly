'use client';

/**
 * Login Page
 * /login
 *
 * Universal login page with user type detection and redirect
 */

import { PiWarning } from 'react-icons/pi';

import { PasswordInput } from '@/components/ui/PasswordInput';
import { Alert, AlertDescription } from '@/components/ui/shadcn/alert';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/shadcn/field';
import { Input } from '@/components/ui/shadcn/input';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

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
      'Password is known to be weak and easy to guess, please choose a different one.':
        'Esta senha é conhecida por ser fraca e fácil de adivinhar, por favor escolha outra diferente.',
    };

    return translations[errorMessage] || errorMessage;
  };

  // Handle email/password login
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      setError(null);

      // Sign in with Supabase Auth
      const { data: authData, error: signInError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (signInError) throw signInError;

      if (authData.user) {
        // Get user data from database to determine type
        const response = await fetch('/api/user/me');

        if (!response.ok) {
          throw new Error('Erro ao buscar dados do usuário');
        }

        const userData = await response.json();

        // Check onboarding status first
        if (!userData.onboardingCompleted) {
          router.push('/app/onboarding');
          return;
        }

        // Redirect based on user role
        if (userData.role === 'ADMIN') {
          router.push('/admin');
        } else {
          router.push('/app');
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage =
        err instanceof Error ? err.message : 'E-mail ou senha incorretos';
      setError(translateError(errorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="flex flex-col gap-6" onSubmit={handleEmailLogin}>
      <FieldGroup>
        <div className="flex flex-col items-start gap-1">
          <h1 className="text-2xl font-bold">Que bom ver você novamente!</h1>
          {/* <p className="text-muted-foreground text-sm text-balance">
                      Faça login para entrar na sua conta
                    </p> */}
        </div>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            autoComplete="email"
            required
          />
        </Field>
        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Senha</FieldLabel>
            <Link
              href="/recuperar-senha"
              className="ml-auto text-sm text-gray-500 underline-offset-4 hover:underline"
              tabIndex={-1}
            >
              Esqueceu a senha?
            </Link>
          </div>
          <PasswordInput
            placeholder="Digite sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            autoComplete="current-password"
          />
        </Field>
        <Field>
          <LoadingButton
            type="submit"
            size={'lg'}
            isLoading={isLoading}
            loadingText="Entrando..."
          >
            Entrar
          </LoadingButton>
        </Field>
        {/* Error Message */}
        {error && (
          <Alert variant="destructive" className="mb-2">
            <PiWarning className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <Field>
          <div className="block pt-8 text-center text-sm text-gray-600">
            <span className="mb-2 block">Não tem uma conta?</span>
            <div className="flex flex-col gap-2">
              <Link
                href="/cadastro?type=nanny"
                className="underline underline-offset-4 hover:text-gray-900"
              >
                Cadastrar como Babá
              </Link>
              <Link
                href="/cadastro?type=family"
                className="underline underline-offset-4 hover:text-gray-900"
              >
                Cadastrar como Família
              </Link>
            </div>
          </div>
        </Field>
      </FieldGroup>
    </form>
  );
}
