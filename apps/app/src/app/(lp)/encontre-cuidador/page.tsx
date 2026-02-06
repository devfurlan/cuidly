import HomePage from '@/app/(public-pages)/page';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cuidly - Babás Verificadas para o Melhor Cuidado',
  description:
    'Encontre babás qualificadas e confiáveis próximas de você. Compare perfis, leia avaliações e contrate com segurança a babá ideal para suas crianças.',
};

export default function Page() {
  return <HomePage />;
}
