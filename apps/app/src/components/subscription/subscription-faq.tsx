/**
 * Subscription FAQ Component
 *
 * Displays frequently asked questions about subscription plans
 * for Families and Nannies using an Accordion component.
 */

'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/shadcn/accordion';
import { cn } from '@cuidly/shared';

type UserType = 'FAMILY' | 'NANNY';

interface SubscriptionFAQProps {
  userType: UserType;
  className?: string;
}

interface FAQItem {
  question: string;
  answer: string;
}

const familyFAQs: FAQItem[] = [
  {
    question: 'Como funciona o período de teste?',
    answer:
      'Não oferecemos período de teste, mas você pode começar com o Plano Básico gratuito e fazer upgrade a qualquer momento.',
  },
  {
    question: 'Posso cancelar a qualquer momento?',
    answer:
      'Sim! Você pode cancelar sua assinatura a qualquer momento. O acesso continuará até o final do período pago.',
  },
  {
    question: 'O que acontece se eu cancelar?',
    answer:
      'Você voltará para o Plano Básico e poderá visualizar até 3 perfis de babás, mas não poderá criar vagas ou iniciar conversas.',
  },
  {
    question: 'O que é o Matching inteligente?',
    answer:
      'É um algoritmo que calcula a compatibilidade entre sua família e as babás com base em localização, idade dos filhos, disponibilidade, certificados e avaliação.',
  },
  {
    question: 'Quantas vagas posso criar?',
    answer:
      'Você pode ter até 3 vagas ativas simultaneamente. Ao encerrar uma vaga, pode criar outra.',
  },
  {
    question: 'Como funciona o chat?',
    answer:
      'Assinantes dos planos pagos podem iniciar conversas com as babás pelo chat integrado. O contato direto (WhatsApp/Telefone) é liberado após aceite da proposta.',
  },
];

const nannyFAQs: FAQItem[] = [
  {
    question: 'Quais selos posso ter no meu perfil?',
    answer:
      'Selo Identificada: perfil completo + documento + e-mail verificado (gratuito). Selo Verificada: Identificada + validação facial + background check (requer Plano Pro). Selo Confiável: Verificada + 3 avaliações positivas.',
  },
  {
    question: 'O que é a Validação Completa?',
    answer:
      'A Validação Completa inclui verificação de documentos (RG/CNH), validação facial, prova de vida e antecedentes criminais (estadual + federal). Ela está INCLUSA no Plano Pro (R$ 12,90/mês).',
  },
  {
    question: 'Posso me candidatar a vagas no plano gratuito?',
    answer:
      'Sim! Você pode candidatar-se a vagas e enviar uma mensagem de apresentação. No Plano Pro, você tem mensagens ilimitadas após candidatura.',
  },
  {
    question: 'Vale a pena assinar o Plano Pro?',
    answer:
      'Sim! Babás com Plano Pro têm mensagens ilimitadas, validação completa inclusa e têm acesso aos Selos Verificada e Confiável.',
  },
  {
    question: 'Posso cancelar a qualquer momento?',
    answer:
      'Sim! Você pode cancelar a qualquer momento. O acesso ao Plano Pro continuará até o final do período pago, depois você voltará para o Plano Básico.',
  },
];

export function SubscriptionFAQ({ userType, className }: SubscriptionFAQProps) {
  const faqs = userType === 'FAMILY' ? familyFAQs : nannyFAQs;

  return (
    <div className={cn('w-full', className)}>
      <h2 className="mb-6 text-center text-xl font-bold text-gray-900">
        Perguntas Frequentes
      </h2>

      <div className="mx-auto max-w-3xl">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, idx) => (
            <AccordionItem key={idx} value={`item-${idx}`}>
              <AccordionTrigger className="text-left text-gray-900 hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
