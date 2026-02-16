import HomePage from '@/app/(public)/(shell)/page';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Encontre Babás Verificadas Perto de Você | Cuidly',
  description:
    'Busque babás qualificadas e verificadas na sua região. Compare perfis, leia avaliações e contrate com segurança a babá ideal para suas crianças.',
};

export default function Page() {
  return <HomePage />;
}
