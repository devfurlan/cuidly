'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/shadcn/accordion';

const faqs = [
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
    question: 'Posso ver avaliações de outras famílias?',
    answer:
      'Sim. Nosso sistema de avaliações é transparente, similar ao Airbnb. Você pode ler comentários e experiências de outras famílias que já contrataram a babá.',
  },
  {
    question: 'Como funciona o contato com as babás?',
    answer:
      'O contato é feito pelo chat dentro do app Cuidly. Não há intermediários. Você pode tirar dúvidas, agendar entrevistas e negociar valores diretamente com a profissional de forma segura.',
  },
  {
    question: 'Posso criar vagas de trabalho?',
    answer:
      'Sim. Com o plano pago, você pode criar vagas descrevendo suas necessidades específicas (horários, dias, idade das crianças, requisitos especiais). As babás interessadas se candidatam e você recebe as candidaturas no seu dashboard.',
  },
  // {
  //   question: 'Quais são os planos disponíveis?',
  //   answer:
  //     'Plano Grátis: ver até 3 perfis de babás e busca básica. Plano Mensal (R$ 49/mês): perfis ilimitados, criar vagas de trabalho, contato direto via WhatsApp e busca avançada com filtros. Plano Trimestral (R$ 99 a cada 3 meses): tudo do plano mensal mais destaque nas suas vagas (aparecem primeiro para babás).',
  // },
  {
    question: 'Como funciona o pagamento da babá?',
    answer:
      'O pagamento é negociado diretamente entre você e a babá. A Cuidly não processa pagamentos nem intermediamos valores. Você combina forma de pagamento, valor e frequência diretamente com a profissional.',
  },
  {
    question: 'Posso salvar babás favoritas?',
    answer:
      'Sim. Você pode salvar babás favoritas e acessá-las facilmente depois na sua lista de favoritos.',
  },
  {
    question: 'Como cancelo minha assinatura?',
    answer:
      'Você pode cancelar sua assinatura a qualquer momento pelo dashboard, na seção de configurações. O cancelamento é imediato e você não será cobrado no próximo ciclo.',
  },
  {
    question: 'A Cuidly faz contratos ou agendamentos?',
    answer:
      'Não. A Cuidly é uma plataforma de conexão. Contratos, agendamentos e acordos são feitos diretamente entre você e a babá.',
  },
  {
    question: 'Como adiciono informações dos meus filhos?',
    answer:
      'No seu dashboard, você pode adicionar e gerenciar informações dos seus filhos (nome e idade). Isso ajuda as babás a entenderem melhor suas necessidades.',
  },
  // {
  //   question: 'Posso editar meu perfil depois de criado?',
  //   answer:
  //     'Sim. Você pode editar seu perfil a qualquer momento pelo dashboard.',
  // },
  {
    question:
      'Como sei se uma babá tem experiência com necessidades especiais?',
    answer:
      'No perfil da babá, você pode ver as especialidades listadas (autismo/TEA, TDAH, Síndrome de Down, etc.). Também pode filtrar sua busca por essas especialidades.',
  },
  // {
  //   question: 'Quantas vagas posso criar?',
  //   answer:
  //     'Com o plano pago, você pode criar vagas ilimitadas. Cada vaga pode descrever necessidades diferentes (por exemplo, uma vaga para finais de semana e outra para dias de semana).',
  // },
  {
    question: 'Como funciona o destaque nas vagas?',
    answer:
      'Com o plano trimestral, suas vagas aparecem em destaque (no topo) quando babás buscam por oportunidades, aumentando a visibilidade e o número de candidaturas.',
  },
  // {
  //   question: 'Posso usar a Cuidly em qualquer cidade?',
  //   answer:
  //     'Sim. A Cuidly funciona em todo o Brasil. A busca por localização mostra babás próximas a você.',
  // },
  // {
  //   question: 'Preciso de cartão de crédito para o plano grátis?',
  //   answer:
  //     'Não. O plano grátis não exige cartão de crédito nem dados de pagamento.',
  // },
  {
    question: 'Como vejo quem se candidatou às minhas vagas?',
    answer:
      'No seu dashboard, na seção "Minhas Vagas", você pode ver todas as candidaturas recebidas, com acesso aos perfis completos das babás que se candidataram.',
  },
];

export default function FAQ() {
  return (
    <section className="bg-white px-4 py-20 pb-0 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mx-auto mb-10 max-w-2xl lg:text-center">
          <h2 className="mt-2 font-mono text-4xl font-bold tracking-tight text-pretty text-blue-600 sm:text-5xl lg:text-balance">
            Perguntas Frequentes
          </h2>
          <p className="mt-6 text-lg/8 text-gray-700">
            Tire suas dúvidas sobre a plataforma
          </p>
        </div>

        <Accordion type="single" collapsible defaultValue="item-0">
          {faqs.map((faq, index) => (
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
