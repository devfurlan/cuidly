'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/shadcn/accordion';
import { ReactNode } from 'react';

interface FAQItem {
  question: string;
  answer: ReactNode;
}

interface FAQProps {
  items?: FAQItem[];
  title?: string;
  subtitle?: string;
}

const defaultFaqs: FAQItem[] = [
  {
    question: 'O que é a Cuidly?',
    answer:
      'A Cuidly é uma plataforma online para encontrar babás verificadas. Você pode buscar perfis por localização, experiência e especialidades, ver avaliações de outras famílias e entrar em contato diretamente pelo chat do app.',
  },
  {
    question: 'Como funciona a busca de babás?',
    answer:
      'Você pode buscar babás usando filtros como localização (cidade, bairro ou endereço), experiência (anos de trabalho), disponibilidade (dias e horários), especialidades (autismo, TDAH, Síndrome de Down, recém-nascidos, etc.) e idade da babá. Nosso sistema de matching inteligente mostra as babás mais adequadas ao seu perfil.',
  },
  {
    question: 'As babás são verificadas?',
    answer:
      'Sim. Todas as babás passam por validação de documento (RG/CNH) e e-mail (Selo Identificada). Babás com plano Pro têm validação completa, incluindo validação facial e antecedentes criminais (Selo Verificada). Perfis com Selo Confiável são Verificadas com 3+ avaliações positivas.',
  },
  {
    question: 'Como funciona o contato com as babás?',
    answer:
      'O contato é feito pelo chat dentro do app Cuidly. Não há intermediários. Você pode tirar dúvidas, agendar entrevistas e negociar valores diretamente com a profissional de forma segura.',
  },
  {
    question: 'Posso criar vagas de trabalho?',
    answer:
      'Sim. No plano grátis, você pode criar 1 vaga ativa (expira em 7 dias). Com o plano Plus, você pode criar até 3 vagas simultâneas (30 dias cada). As babás interessadas se candidatam e você recebe as candidaturas no seu dashboard.',
  },
  {
    question: 'Como funciona o pagamento da babá?',
    answer:
      'O pagamento é negociado diretamente entre você e a babá. A Cuidly não processa pagamentos nem intermediamos valores. Você combina forma de pagamento, valor e frequência diretamente com a profissional.',
  },
  {
    question: 'A Cuidly faz contratos ou agendamentos?',
    answer:
      'Não. A Cuidly é uma plataforma de conexão. Contratos, agendamentos e acordos são feitos diretamente entre você e a babá.',
  },
  {
    question: 'Como vejo quem se candidatou às minhas vagas?',
    answer:
      'No seu dashboard, na seção "Minhas Vagas", você pode ver todas as candidaturas recebidas, com acesso aos perfis completos das babás que se candidataram.',
  },
];

export default function FAQ({
  items = defaultFaqs,
  title = 'Perguntas Frequentes',
  subtitle = 'Tire suas dúvidas sobre a plataforma',
}: FAQProps) {
  return (
    <section className="bg-white px-4 py-20 pb-0 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mx-auto mb-10 max-w-2xl lg:text-center">
          <h2 className="mt-2 font-mono text-4xl font-bold tracking-tight text-pretty text-blue-600 sm:text-5xl lg:text-balance">
            {title}
          </h2>
          <p className="mt-6 text-lg/8 text-gray-700">{subtitle}</p>
        </div>

        <Accordion type="single" collapsible defaultValue="item-0">
          {items.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent className="text-base text-gray-600">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
