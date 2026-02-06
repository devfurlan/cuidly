import LogoCuidly from '@/components/LogoCuidly';
import { Button } from '@/components/ui/shadcn/button';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex h-screen items-center bg-linear-to-br from-fuchsia-50 to-white">
      <main className="mx-auto w-full max-w-7xl px-6 pt-10 pb-16 sm:pb-24 lg:px-8">
        <LogoCuidly className="mx-auto h-10 w-auto sm:h-12" />

        <div className="mx-auto mt-22 max-w-2xl text-center sm:mt-28">
          <p className="text-base/8 font-semibold text-fuchsia-600">ERRO 404</p>
          <h1 className="mt-4 text-5xl font-semibold tracking-tight text-balance text-gray-950 sm:text-6xl">
            Essa página não existe
          </h1>
          <p className="mt-6 text-lg font-medium text-pretty text-gray-500 sm:text-xl/8">
            Essa página não foi encontrada ou está indisponível no momento.
          </p>
        </div>

        <div className="mx-auto mt-14 flow-root max-w-lg sm:mt-16">
          <div className="flex justify-center">
            <Button variant={'default'} asChild>
              <Link href="/">
                <span aria-hidden="true">&larr;</span> Voltar para a página
                inicial
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
