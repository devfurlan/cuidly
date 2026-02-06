import Link from 'next/link';
import { signInAction } from '@/app/(auth-pages)/actions';
import { Input } from '@/components/ui/input';
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

export default async function Login(props: { searchParams: Promise<Message> }) {
  const searchParams = await props.searchParams;
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Entrar</CardTitle>
        <CardDescription>
          Digite seu e-mail e senha para acessar o sistema
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
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Senha</Label>
                <Link
                  href="/forgot-password"
                  className="ml-auto inline-block text-sm underline"
                >
                  Esqueceu sua senha?
                </Link>
              </div>
              <PasswordInput
                id="password"
                name="password"
                placeholder="Sua senha"
                required
              />
            </div>
            <SubmitButton pendingText="Entrando..." formAction={signInAction}>
              Entrar
            </SubmitButton>
            {searchParams && Object.keys(searchParams).length > 0 && (
              <FormMessage message={searchParams} />
            )}
          </form>
        </div>
        {/* <div className="mt-4 text-center text-sm">
          Ainda não tem uma conta?{' '}
          <Link href="/register" className="underline">
            Cadastre-se
          </Link>
        </div> */}
      </CardContent>
    </Card>
  );
}
