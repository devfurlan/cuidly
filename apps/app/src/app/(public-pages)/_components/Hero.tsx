import { PiShieldCheck } from 'react-icons/pi';
import HeroSearchInput from './HeroSearchInput';

export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-white px-6">
      <svg
        aria-hidden="true"
        className="absolute inset-0 -z-10 size-full mask-[radial-gradient(100%_100%_at_top_right,white,transparent)] stroke-gray-200/60"
      >
        <defs>
          <pattern
            x="50%"
            y={-1}
            id="983e3e4c-de6d-4c3f-8d64-b9761d1534cc"
            width={150}
            height={150}
            patternUnits="userSpaceOnUse"
          >
            <path d="M.5 150V.5H150" fill="none" />
          </pattern>
        </defs>

        <svg x="50%" y={-1} className="overflow-visible fill-blue-50">
          <path
            d="M-150 0h151v151h-151Z M450 0h151v151h-151Z M-300 450h151v151h-151Z M150 600h151v151h-151Z"
            strokeWidth={0}
          />
        </svg>
        <rect
          fill="url(#983e3e4c-de6d-4c3f-8d64-b9761d1534cc)"
          width="100%"
          height="100%"
          strokeWidth={0}
        />
      </svg>
      <div
        aria-hidden="true"
        className="absolute top-10 left-[calc(50%-4rem)] -z-10 transform-gpu blur-3xl sm:left-[calc(50%-18rem)] lg:top-[calc(50%-30rem)] lg:left-48 xl:left-[calc(50%-24rem)]"
      >
        <div
          style={{
            clipPath:
              'polygon(73.6% 51.7%, 91.7% 11.8%, 100% 46.4%, 97.4% 82.2%, 92.5% 84.9%, 75.7% 64%, 55.3% 47.5%, 46.5% 49.4%, 45% 62.9%, 50.3% 87.2%, 21.3% 64.1%, 0.1% 100%, 5.4% 51.1%, 21.4% 63.9%, 58.9% 0.2%, 73.6% 51.7%)',
          }}
          className="aspect-1108/632 w-277 bg-linear-to-r from-primary to-secondary opacity-25"
        />
      </div>
      <div className="mx-auto max-w-2xl py-28 sm:py-48 lg:pt-40 lg:pb-20">
        <div className="hidden sm:mb-8 sm:flex sm:justify-center">
          <div className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-50/30 px-4 py-2 ring-1 ring-blue-600/30">
            <PiShieldCheck className="-mt-0.5 size-5 text-blue-600" />
            <span className="text-sm leading-0 font-medium text-gray-700">
              Babás Verificadas
            </span>
          </div>
        </div>
        <div className="text-center">
          <h1 className="font-mono text-5xl font-bold tracking-tight text-balance text-blue-700 sm:text-7xl">
            Escolher uma <span className="text-fuchsia-500">babá</span> não
            precisa ser complicado
          </h1>
          <p className="mt-8 text-lg text-pretty text-gray-500 sm:text-xl/8">
            Sugestões inteligentes de babás compatíveis, com mais segurança e
            menos tempo perdido.
          </p>

          {/* Search Input */}
          <div className="pt-10">
            <HeroSearchInput />
          </div>

          <div className="flex flex-col gap-6 pt-8 sm:flex-row">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                <div className="h-10 w-10 rounded-full border-2 border-white bg-linear-to-br from-fuchsia-400 to-pink-400"></div>
                <div className="h-10 w-10 rounded-full border-2 border-white bg-linear-to-br from-blue-400 to-cyan-400"></div>
                <div className="h-10 w-10 rounded-full border-2 border-white bg-linear-to-br from-green-400 to-emerald-400"></div>
                <div className="h-10 w-10 rounded-full border-2 border-white bg-linear-to-br from-orange-400 to-red-400"></div>
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">Babás</p>
                <p className="text-sm text-gray-600">Verificadas</p>
              </div>
            </div>

            {/* <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <PiStarFill key={i} className="h-5 w-5 text-yellow-400" />
                    ))}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Avaliações</p>
                    <p className="text-sm text-gray-600">Reais</p>
                  </div>
                </div> */}
          </div>
        </div>
      </div>
    </section>
  );
}
