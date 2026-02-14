import type { Metadata } from 'next';
import Link from 'next/link';
import {
  PiCheckCircle,
  PiChatCircle,
  PiMagnifyingGlass,
  PiStar,
  PiShieldCheck,
  PiHeart,
  PiGift,
  PiCalendarCheck,
  PiTimer,
} from 'react-icons/pi';
import { Button } from '@/components/ui/shadcn/button';
import { Card } from '@/components/ui/shadcn/card';

const COUPON_CODE = 'VIP30';
const CHECKOUT_URL = `/app/assinatura/checkout?plan=FAMILY_PLUS&interval=QUARTER&coupon=${COUPON_CODE}`;

export const metadata: Metadata = {
  title: 'Encontre a Babá Ideal — 1 Mês Grátis | Cuidly',
  description:
    'Aproveite 1 mês grátis do Cuidly Plus. Chat ilimitado, matching inteligente e até 3 vagas ativas para encontrar a babá perfeita para sua família.',
};

export default function PromoFamiliasPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-linear-to-br from-amber-50 to-pink-50 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-700">
              <PiGift className="size-5" />
              Oferta de lançamento
            </div>
            <h1 className="mb-6 text-4xl font-bold text-gray-900 md:text-5xl">
              Encontre a babá ideal
              <span className="block text-pink">1 mês grátis de Plus</span>
            </h1>
            <p className="mb-8 text-xl text-gray-600">
              Chat ilimitado, matching inteligente e até 3 vagas ativas.
              Experimente todos os recursos do Cuidly Plus sem compromisso.
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href={CHECKOUT_URL}>
                <Button size="lg" className="w-full sm:w-auto">
                  Começar 1 mês grátis
                </Button>
              </Link>
              <Link href="/cadastro">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Criar conta grátis
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-sm text-gray-500">
              Cancele quando quiser. Sem compromisso.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold">
              Tudo que você precisa para encontrar a babá perfeita
            </h2>
            <p className="text-gray-600">
              O Cuidly Plus desbloqueia todos os recursos para facilitar sua busca
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <Card className="border-2 border-pink/20 p-6 text-center">
              <PiChatCircle className="mx-auto mb-4 size-12 text-pink" />
              <h3 className="mb-2 text-xl font-bold">Chat ilimitado</h3>
              <p className="text-gray-600">
                Converse com quantas babás precisar. Sem limites de mensagens ou conversas.
              </p>
            </Card>

            <Card className="border-2 border-pink/20 p-6 text-center">
              <PiMagnifyingGlass className="mx-auto mb-4 size-12 text-pink" />
              <h3 className="mb-2 text-xl font-bold">Matching inteligente</h3>
              <p className="text-gray-600">
                Nosso algoritmo sugere babás compatíveis com o perfil da sua família automaticamente.
              </p>
            </Card>

            <Card className="border-2 border-pink/20 p-6 text-center">
              <PiCalendarCheck className="mx-auto mb-4 size-12 text-pink" />
              <h3 className="mb-2 text-xl font-bold">Até 3 vagas ativas</h3>
              <p className="text-gray-600">
                Crie mais vagas para diferentes necessidades. Cada vaga fica ativa por 30 dias.
              </p>
            </Card>

            <Card className="border-2 border-pink/20 p-6 text-center">
              <PiStar className="mx-auto mb-4 size-12 text-pink" />
              <h3 className="mb-2 text-xl font-bold">Avaliações completas</h3>
              <p className="text-gray-600">
                Veja todas as avaliações de cada babá para tomar a melhor decisão.
              </p>
            </Card>

            <Card className="border-2 border-pink/20 p-6 text-center">
              <PiShieldCheck className="mx-auto mb-4 size-12 text-pink" />
              <h3 className="mb-2 text-xl font-bold">Babás verificadas</h3>
              <p className="text-gray-600">
                Veja os selos de verificação de identidade e antecedentes criminais.
              </p>
            </Card>

            <Card className="border-2 border-pink/20 p-6 text-center">
              <PiHeart className="mx-auto mb-4 size-12 text-pink" />
              <h3 className="mb-2 text-xl font-bold">Favoritar babás</h3>
              <p className="text-gray-600">
                Salve perfis que você gostou e volte a eles quando precisar.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold">Free vs Plus</h2>
            <p className="text-gray-600">
              Veja o que muda com o Cuidly Plus
            </p>
          </div>
          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
            <Card className="p-6">
              <h3 className="mb-4 text-xl font-bold text-gray-500">Cuidly Free</h3>
              <ul className="space-y-3">
                <ComparisonItem included>Ver perfis de babás</ComparisonItem>
                <ComparisonItem included>1 vaga ativa (7 dias)</ComparisonItem>
                <ComparisonItem included>1 conversa</ComparisonItem>
                <ComparisonItem included>1 avaliação por babá</ComparisonItem>
                <ComparisonItem>Matching inteligente</ComparisonItem>
                <ComparisonItem>Chat ilimitado</ComparisonItem>
                <ComparisonItem>Até 3 vagas (30 dias)</ComparisonItem>
                <ComparisonItem>Avaliações completas</ComparisonItem>
              </ul>
            </Card>

            <Card className="border-2 border-pink p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-bold text-pink">Cuidly Plus</h3>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                  1 mês grátis
                </span>
              </div>
              <ul className="space-y-3">
                <ComparisonItem included>Ver perfis de babás</ComparisonItem>
                <ComparisonItem included highlight>Até 3 vagas ativas (30 dias)</ComparisonItem>
                <ComparisonItem included highlight>Chat ilimitado</ComparisonItem>
                <ComparisonItem included highlight>Avaliações completas</ComparisonItem>
                <ComparisonItem included highlight>Matching inteligente</ComparisonItem>
                <ComparisonItem included>Notificações de candidaturas</ComparisonItem>
                <ComparisonItem included>Favoritar babás</ComparisonItem>
                <ComparisonItem included>Selos de verificação</ComparisonItem>
              </ul>
              <Link href={CHECKOUT_URL} className="mt-6 block">
                <Button className="w-full">Começar 1 mês grátis</Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">
            Como funciona
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-pink text-xl font-bold text-white">
                1
              </div>
              <h3 className="mb-2 font-bold">Crie sua conta</h3>
              <p className="text-sm text-gray-600">
                Cadastro rápido e gratuito. Leva menos de 2 minutos.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-pink text-xl font-bold text-white">
                2
              </div>
              <h3 className="mb-2 font-bold">Ative seu mês grátis</h3>
              <p className="text-sm text-gray-600">
                Use o cupom de lançamento no checkout para ativar 30 dias grátis de Plus.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-pink text-xl font-bold text-white">
                3
              </div>
              <h3 className="mb-2 font-bold">Encontre sua babá</h3>
              <p className="text-sm text-gray-600">
                Use o matching inteligente, crie vagas e converse sem limites.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Urgency / FAQ */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl">
            <h2 className="mb-8 text-center text-3xl font-bold">Perguntas frequentes</h2>
            <div className="space-y-6">
              <div>
                <h3 className="mb-2 font-bold">Preciso colocar meu cartão de crédito?</h3>
                <p className="text-gray-600">
                  Sim, para ativar o período grátis. Você pode cancelar a qualquer momento
                  durante os 30 dias e não será cobrado.
                </p>
              </div>
              <div>
                <h3 className="mb-2 font-bold">O que acontece depois dos 30 dias?</h3>
                <p className="text-gray-600">
                  Após o período grátis, seu plano será renovado automaticamente.
                  Se preferir não continuar, basta cancelar antes do fim do período.
                </p>
              </div>
              <div>
                <h3 className="mb-2 font-bold">Posso cancelar a qualquer momento?</h3>
                <p className="text-gray-600">
                  Sim! Não tem fidelidade nem multa. Cancele quando quiser pelo painel da sua conta.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="bg-pink py-20 text-white">
        <div className="container mx-auto px-4 text-center">
          <PiTimer className="mx-auto mb-4 size-12" />
          <h2 className="mb-4 text-4xl font-bold">
            Oferta por tempo limitado
          </h2>
          <p className="mb-8 text-xl opacity-90">
            1 mês grátis de Cuidly Plus. Aproveite antes que acabe.
          </p>
          <Link href={CHECKOUT_URL}>
            <Button size="lg" variant="secondary">
              Começar 1 mês grátis
            </Button>
          </Link>
          <p className="mt-4 text-sm opacity-75">
            Cancele quando quiser. Sem compromisso.
          </p>
        </div>
      </section>
    </>
  );
}

function ComparisonItem({
  children,
  included = false,
  highlight = false,
}: {
  children: React.ReactNode;
  included?: boolean;
  highlight?: boolean;
}) {
  return (
    <li className="flex items-center gap-2 text-sm">
      {included ? (
        <PiCheckCircle className={`size-5 shrink-0 ${highlight ? 'text-pink' : 'text-green-500'}`} />
      ) : (
        <span className="flex size-5 shrink-0 items-center justify-center text-gray-300">—</span>
      )}
      <span className={highlight ? 'font-medium text-gray-900' : 'text-gray-600'}>
        {children}
      </span>
    </li>
  );
}
