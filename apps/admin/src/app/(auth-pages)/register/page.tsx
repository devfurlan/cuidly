'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Register() {
  const router = useRouter();

  useEffect(() => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  }, [router]);

  return null;
  // const searchParams = await props.searchParams;
  // if ('message' in searchParams) {
  //   return (
  //     <div className="flex h-screen w-full flex-1 items-center justify-center gap-2 p-4 sm:max-w-md">
  //       <FormMessage message={searchParams} />
  //     </div>
  //   );
  // }

  // return (
  //   <form>
  //     <Card className="mx-auto max-w-sm">
  //       <CardHeader>
  //         <CardTitle className="text-2xl">Cadastre-se</CardTitle>
  //         <CardDescription>
  //           Digite seu e-mail e senha para acessar o sistema
  //         </CardDescription>
  //       </CardHeader>
  //       <CardContent>
  //         <div className="grid gap-4">
  //           <div className="grid gap-2">
  //             <Label htmlFor="email">Nome completo</Label>
  //             <Input
  //               id="name"
  //               name="name"
  //               type="text"
  //               placeholder="Jonas Donizete Barbosa"
  //               required
  //             />
  //           </div>
  //           <div className="grid gap-2">
  //             <Label htmlFor="email">E-mail</Label>
  //             <Input
  //               id="email"
  //               name="email"
  //               type="email"
  //               placeholder="seu@email.com"
  //               required
  //             />
  //           </div>
  //           <div className="grid gap-2">
  //             <div className="flex items-center">
  //               <Label htmlFor="password">Senha</Label>
  //             </div>
  //             <Input
  //               id="password"
  //               name="password"
  //               type="password"
  //               placeholder="Sua senha"
  //               minLength={6}
  //               required
  //             />
  //           </div>
  //           <SubmitButton
  //             pendingText="Cadastrando..."
  //             formAction={signUpAction}
  //           >
  //             Cadastrar
  //           </SubmitButton>
  //           <FormMessage message={searchParams} />
  //         </div>
  //         <div className="mt-4 text-center text-sm">
  //           Já tem uma conta?{' '}
  //           <Link className="font-medium text-primary underline" href="/login">
  //             Entrar
  //           </Link>
  //         </div>
  //       </CardContent>
  //     </Card>
  //   </form>
  // );
}
