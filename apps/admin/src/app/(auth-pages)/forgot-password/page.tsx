import Link from 'next/link';
import { forgotPasswordAction } from '@/app/(auth-pages)/actions';
import { Input } from '@/components/ui/input';
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

export default async function ForgotPassword(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Recuperar senha</CardTitle>
        <CardDescription>
          Digite seu e-mail para receber as instruções de recuperação de senha
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <form className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="seu@email.com"
                required
              />
            </div>
            <SubmitButton
              pendingText="Enviando..."
              formAction={forgotPasswordAction}
            >
              Enviar instruções
            </SubmitButton>
            {searchParams && Object.keys(searchParams).length > 0 && (
              <FormMessage message={searchParams} />
            )}
          </form>
        </div>
        <div className="mt-4 text-center text-sm">
          Lembrou sua senha?{' '}
          <Link href="/login" className="underline">
            Voltar para o login
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
