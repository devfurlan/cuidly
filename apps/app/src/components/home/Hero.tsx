import { PiArrowRight } from 'react-icons/pi';
import { Button } from '@/components/ui/shadcn/button';
import imgHero from '@/images/family-hero.png';
import Image from 'next/image';
import Link from 'next/link';

export default function Hero({ linkFormFamily }: { linkFormFamily: string }) {
  return (
    <div className="bg-linear-to-br from-white to-fuchsia-100">
      <div className="container mx-auto grid gap-8 px-8 py-16 md:grid-cols-2">
        <div className="flex flex-col items-start justify-center">
          <h1 className="mb-6 text-4xl leading-none font-bold text-gray-950 lg:text-6xl">
            Suas crianças bem cuidadas, sua vida mais leve
          </h1>
          <p className="mb-8 text-lg text-gray-700 lg:text-xl">
            Na Cuidly, você não precisa buscar uma babá por conta própria. Nós
            selecionamos, <strong>validamos</strong> e acompanhamos babás{' '}
            <strong>certificadas</strong> que se encaixam na sua rotina e{' '}
            <strong>no perfil da sua família</strong>. Tudo com{' '}
            <strong>segurança</strong>, carinho e apoio do nosso time em cada
            etapa.
          </p>
          <Button id="form_family_hero" size={'lg'} asChild>
            <Link href={linkFormFamily}>
              Solicite orçamento
              <PiArrowRight className="ms-1 size-6!" />
            </Link>
          </Button>
        </div>
        <div style={{ height: '-webkit-fill-available' }}>
          <Image
            src={imgHero}
            alt="Babá brincando com crianças"
            className="rounded-lg object-cover md:h-[640px]"
            priority={true}
            fetchPriority="high"
          />
        </div>
      </div>
    </div>
  );
}
