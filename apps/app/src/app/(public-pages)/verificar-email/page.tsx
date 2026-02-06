'use client';

import { PiCheck, PiCircleNotch, PiX } from 'react-icons/pi';

import { Button } from '@/components/ui/shadcn/button';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const initialStatus = token ? 'verifying' : 'error';
  const initialMessage = token ? '' : 'Token de verificação não encontrado';

  const [status, setStatus] = useState<
    'verifying' | 'success' | 'error' | 'already_verified'
  >(initialStatus);
  const [message, setMessage] = useState(initialMessage);

  useEffect(() => {
    if (!token) return;

    const doVerifyEmail = async () => {
      try {
        const response = await fetch(`/api/email/verify-token?token=${token}`);
        const data = await response.json();

        if (response.ok) {
          if (data.already_verified) {
            setStatus('already_verified');
            setMessage('Seu e-mail já foi verificado anteriormente');
          } else {
            setStatus('success');
            setMessage('E-mail verificado com sucesso!');
          }
        } else {
          setStatus('error');
          setMessage(data.message || 'Não foi possível verificar seu e-mail');
        }
      } catch (error) {
        console.error('Error verifying email:', error);
        setStatus('error');
        setMessage('Erro ao verificar e-mail. Tente novamente mais tarde.');
      }
    };

    doVerifyEmail();
  }, [token]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-fuchsia-50 via-white to-purple-50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
        {status === 'verifying' && (
          <>
            <div className="mb-6">
              <PiCircleNotch className="mx-auto h-16 w-16 animate-spin text-fuchsia-600" />
            </div>
            <h1 className="mb-2 text-2xl font-bold text-gray-900">
              Verificando e-mail...
            </h1>
            <p className="text-gray-600">
              Aguarde enquanto validamos seu e-mail
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="mb-6">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <PiCheck className="h-10 w-10 text-green-600" />
              </div>
            </div>
            <h1 className="mb-2 text-2xl font-bold text-gray-900">
              E-mail verificado! 🎉
            </h1>
            <p className="mb-6 text-gray-600">{message}</p>
            <Button
              onClick={() => router.push('/app/perfil')}
              className="w-full bg-fuchsia-600 text-white hover:bg-fuchsia-700"
            >
              Ir para o Perfil
            </Button>
          </>
        )}

        {status === 'already_verified' && (
          <>
            <div className="mb-6">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                <PiCheck className="h-10 w-10 text-blue-600" />
              </div>
            </div>
            <h1 className="mb-2 text-2xl font-bold text-gray-900">
              E-mail já verificado
            </h1>
            <p className="mb-6 text-gray-600">{message}</p>
            <Button
              onClick={() => router.push('/app/perfil')}
              className="w-full bg-fuchsia-600 text-white hover:bg-fuchsia-700"
            >
              Ir para o Perfil
            </Button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="mb-6">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <PiX className="h-10 w-10 text-red-600" />
              </div>
            </div>
            <h1 className="mb-2 text-2xl font-bold text-gray-900">
              Não foi possível verificar
            </h1>
            <p className="mb-6 text-gray-600">{message}</p>
            <div className="space-y-3">
              <Button
                onClick={() => router.push('/app/perfil')}
                className="w-full bg-fuchsia-600 text-white hover:bg-fuchsia-700"
              >
                Ir para o Perfil
              </Button>
              <p className="text-sm text-gray-500">
                Você pode solicitar um novo código no dashboard
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-fuchsia-50 via-white to-purple-50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
            <div className="mb-6">
              <PiCircleNotch className="mx-auto h-16 w-16 animate-spin text-fuchsia-600" />
            </div>
            <h1 className="mb-2 text-2xl font-bold text-gray-900">
              Carregando...
            </h1>
          </div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
