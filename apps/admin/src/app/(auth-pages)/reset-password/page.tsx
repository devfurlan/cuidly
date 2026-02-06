'use client';

import { useState } from 'react';
import Link from 'next/link';
import { resetPasswordAction } from '@/app/(auth-pages)/actions';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { FormMessage, Message } from '@/components/FormMessage';
import { SubmitButton } from '@/components/SubmitButton';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function ResetPassword(props: {
  searchParams: Promise<Message>;
}) {
  // Como estamos usando 'use client', precisamos resolver a Promise
  const [searchParams, setSearchParams] = useState<Message | undefined>(
    undefined,
  );

  // Resolver searchParams no lado do cliente
  useState(() => {
    props.searchParams.then(setSearchParams);
  });

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Redefinir senha</CardTitle>
        <CardDescription>Digite sua nova senha abaixo</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <form className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="password">Nova senha</Label>
              <PasswordInput
                id="password"
                name="password"
                placeholder="Digite sua nova senha"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirmar senha</Label>
              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Confirme sua nova senha"
                required
              />
            </div>
            <SubmitButton
              pendingText="Redefinindo..."
              formAction={resetPasswordAction}
            >
              Redefinir senha
            </SubmitButton>
            {searchParams && Object.keys(searchParams).length > 0 && (
              <FormMessage message={searchParams} />
            )}
          </form>
        </div>
        <div className="mt-4 text-center text-sm">
          <Link href="/login" className="underline">
            Voltar para o login
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
