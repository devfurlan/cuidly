import type { Metadata } from 'next';
import Link from 'next/link';
import {
  PiCheckCircle,
  PiChatCircle,
  PiMedal,
  PiShieldCheck,
  PiTrendUp,
  PiStar,
  PiGift,
  PiTimer,
} from 'react-icons/pi';
import { Button } from '@/components/ui/shadcn/button';
import { Card } from '@/components/ui/shadcn/card';

const COUPON_CODE = 'VIP30';
const CHECKOUT_URL = `/app/assinatura/checkout?plan=NANNY_PRO&interval=YEAR&coupon=${COUPON_CODE}`;

export const metadata: Metadata = {
  title: 'Destaque seu Perfil — 1 Mês Grátis de Pro | Cuidly',
  description:
    'Aproveite 1 mês grátis do Cuidly Pro. Perfil em destaque, matching prioritário, mensagens ilimitadas e selos de verificação para aumentar suas chances de contratação.',
};

export default function PromoBabasPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-linear-to-br from-fuchsia-50 to-purple-50 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-fuchsia-200 bg-fuchsia-100 px-4 py-2 text-sm font-semibold text-fuchsia-700">
              <PiGift className="size-5" />
              Oferta de lançamento
            </div>
            <h1 className="mb-6 text-4xl font-bold text-gray-900 md:text-5xl">
              Destaque seu perfil
              <span className="block text-fuchsia-600">1 mês grátis de Pro</span>
            </h1>
            <p className="mb-8 text-xl text-gray-600">
              Perfil em destaque, matching prioritário e mensagens ilimitadas.
              Aumente suas chances de contratação com o Cuidly Pro.
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
              Tudo que o Pro oferece para sua carreira
            </h2>
            <p className="text-gray-600">
              Mais visibilidade, mais conversas, mais contratações
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <Card className="border-2 border-fuchsia-500/20 p-6 text-center">
              <PiTrendUp className="mx-auto mb-4 size-12 text-fuchsia-600" />
              <h3 className="mb-2 text-xl font-bold">Perfil em destaque</h3>
              <p className="text-gray-600">
                Seu perfil aparece primeiro nas buscas das famílias. Mais visibilidade, mais oportunidades.
              </p>
            </Card>

            <Card className="border-2 border-fuchsia-500/20 p-6 text-center">
              <PiStar className="mx-auto mb-4 size-12 text-fuchsia-600" />
              <h3 className="mb-2 text-xl font-bold">Matching prioritário</h3>
              <p className="text-gray-600">
                Receba vagas compatíveis com seu perfil antes das outras babás.
              </p>
            </Card>

            <Card className="border-2 border-fuchsia-500/20 p-6 text-center">
              <PiChatCircle className="mx-auto mb-4 size-12 text-fuchsia-600" />
              <h3 className="mb-2 text-xl font-bold">Mensagens ilimitadas</h3>
              <p className="text-gray-600">
                Converse livremente com as famílias após se candidatar. Sem limites.
              </p>
            </Card>

            <Card className="border-2 border-fuchsia-500/20 p-6 text-center">
              <PiShieldCheck className="mx-auto mb-4 size-12 text-fuchsia-600" />
              <h3 className="mb-2 text-xl font-bold">Selo Verificada</h3>
              <p className="text-gray-600">
                Validação facial e verificação de segurança. Destaque-se da concorrência.
              </p>
            </Card>

            <Card className="border-2 border-fuchsia-500/20 p-6 text-center">
              <PiMedal className="mx-auto mb-4 size-12 text-fuchsia-600" />
              <h3 className="mb-2 text-xl font-bold">Selo Confiável</h3>
              <p className="text-gray-600">
                Com 3+ avaliações positivas e o Pro ativo, ganhe o selo mais alto da plataforma.
              </p>
            </Card>

            <Card className="border-2 border-fuchsia-500/20 p-6 text-center">
              <PiGift className="mx-auto mb-4 size-12 text-fuchsia-600" />
              <h3 className="mb-2 text-xl font-bold">30 dias grátis</h3>
              <p className="text-gray-600">
                Aproveite todos os recursos do Pro sem pagar nada durante 1 mês inteiro.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold">Básico vs Pro</h2>
            <p className="text-gray-600">
              Veja o que muda com o Cuidly Pro
            </p>
          </div>
          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
            <Card className="p-6">
              <h3 className="mb-4 text-xl font-bold text-gray-500">Cuidly Básico</h3>
              <ul className="space-y-3">
                <ComparisonItem included>Perfil completo</ComparisonItem>
                <ComparisonItem included>Selo Identificada</ComparisonItem>
                <ComparisonItem included>Ver vagas</ComparisonItem>
                <ComparisonItem included>Candidatar-se a vagas</ComparisonItem>
                <ComparisonItem included>Responder no chat</ComparisonItem>
                <ComparisonItem>Mensagens ilimitadas</ComparisonItem>
                <ComparisonItem>Perfil em destaque</ComparisonItem>
                <ComparisonItem>Matching prioritário</ComparisonItem>
                <ComparisonItem>Selo Verificada</ComparisonItem>
                <ComparisonItem>Selo Confiável</ComparisonItem>
              </ul>
            </Card>

            <Card className="border-2 border-fuchsia-500 p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-bold text-fuchsia-600">Cuidly Pro</h3>
                <span className="rounded-full bg-fuchsia-100 px-3 py-1 text-xs font-semibold text-fuchsia-700">
                  1 mês grátis
                </span>
              </div>
              <ul className="space-y-3">
                <ComparisonItem included>Perfil completo</ComparisonItem>
                <ComparisonItem included>Selo Identificada</ComparisonItem>
                <ComparisonItem included>Ver vagas</ComparisonItem>
                <ComparisonItem included>Candidatar-se a vagas</ComparisonItem>
                <ComparisonItem included highlight>Mensagens ilimitadas</ComparisonItem>
                <ComparisonItem included highlight>Perfil em destaque</ComparisonItem>
                <ComparisonItem included highlight>Matching prioritário</ComparisonItem>
                <ComparisonItem included highlight>Selo Verificada</ComparisonItem>
                <ComparisonItem included highlight>Selo Confiável</ComparisonItem>
                <ComparisonItem included>Avaliar famílias</ComparisonItem>
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
            Como aproveitar a oferta
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-fuchsia-600 text-xl font-bold text-white">
                1
              </div>
              <h3 className="mb-2 font-bold">Crie sua conta</h3>
              <p className="text-sm text-gray-600">
                Cadastro rápido e gratuito. Complete seu perfil para ser encontrada.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-fuchsia-600 text-xl font-bold text-white">
                2
              </div>
              <h3 className="mb-2 font-bold">Ative seu mês grátis</h3>
              <p className="text-sm text-gray-600">
                Use o cupom de lançamento no checkout para ativar 30 dias grátis de Pro.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-fuchsia-600 text-xl font-bold text-white">
                3
              </div>
              <h3 className="mb-2 font-bold">Destaque-se e seja contratada</h3>
              <p className="text-sm text-gray-600">
                Seu perfil aparece primeiro. Receba vagas compatíveis e converse sem limites.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
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
                <h3 className="mb-2 font-bold">Vou ganhar o selo Verificada durante o trial?</h3>
                <p className="text-gray-600">
                  Sim! Com o Pro ativo (mesmo no período grátis), você pode conquistar
                  os selos Verificada e Confiável normalmente.
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
      <section className="bg-linear-to-br from-fuchsia-600 to-purple-600 py-20 text-white">
        <div className="container mx-auto px-4 text-center">
          <PiTimer className="mx-auto mb-4 size-12" />
          <h2 className="mb-4 text-4xl font-bold">
            Oferta por tempo limitado
          </h2>
          <p className="mb-8 text-xl opacity-90">
            1 mês grátis de Cuidly Pro. Aumente suas chances de contratação agora.
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
        <PiCheckCircle className={`size-5 shrink-0 ${highlight ? 'text-fuchsia-600' : 'text-green-500'}`} />
      ) : (
        <span className="flex size-5 shrink-0 items-center justify-center text-gray-300">—</span>
      )}
      <span className={highlight ? 'font-medium text-gray-900' : 'text-gray-600'}>
        {children}
      </span>
    </li>
  );
}
