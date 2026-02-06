import Link from 'next/link';
import { PiMagnifyingGlass, PiHouse } from 'react-icons/pi';

export default function NannyNotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-fuchsia-100">
          <PiMagnifyingGlass className="h-10 w-10 text-fuchsia-600" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Perfil não encontrado
        </h1>

        <p className="mx-auto mt-3 max-w-md text-gray-600">
          Este perfil não existe ou não está mais disponível. A babá pode ter
          desativado seu perfil temporariamente.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/buscar"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-fuchsia-600 px-6 py-3 font-medium text-white transition-colors hover:bg-fuchsia-700"
          >
            <PiMagnifyingGlass className="h-5 w-5" />
            Buscar babás
          </Link>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            <PiHouse className="h-5 w-5" />
            Voltar para home
          </Link>
        </div>
      </div>
    </div>
  );
}
