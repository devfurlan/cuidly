export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQCategory {
  id: string;
  label: string;
  items: FAQItem[];
}

export const FAQ_CATEGORIES: FAQCategory[] = [
  {
    id: 'subscription',
    label: 'Assinatura e Pagamento',
    items: [
      {
        question: 'Quais são os planos disponíveis e quanto custam?',
        answer:
          'Para famílias: Plano Free (gratuito) com recursos básicos e Plano Plus a partir de R$ 47/mês com matching inteligente, chat ilimitado e até 3 vagas ativas. Para babás: Plano Básico (gratuito) para se candidatar a vagas e Plano Pro a partir de R$ 19/mês com mensagens liberadas, perfil em destaque e acesso aos selos Verificada e Confiável.',
      },
      {
        question: 'Como faço para assinar um plano pago?',
        answer:
          'Acesse a seção "Assinatura" no menu do seu perfil. Lá você encontra os planos disponíveis, pode comparar os recursos e escolher o que melhor atende às suas necessidades. O pagamento é processado de forma segura.',
      },
      {
        question: 'Quais formas de pagamento são aceitas?',
        answer:
          'Aceitamos cartão de crédito e PIX. O pagamento via PIX tem validade de 24 horas. Caso expire, você pode gerar um novo na página de assinatura.',
      },
      {
        question: 'Como cancelo minha assinatura?',
        answer:
          'Acesse "Assinatura" no menu do seu perfil e clique em "Cancelar assinatura". Você continuará com acesso aos recursos do plano pago até o final do período já pago.',
      },
      {
        question: 'Se eu cancelar, perco o acesso imediatamente?',
        answer:
          'Não. Ao cancelar, você mantém o acesso aos recursos do plano pago até o final do período de cobrança atual. Após esse período, seu plano volta para o gratuito automaticamente.',
      },
    ],
  },
  {
    id: 'how-it-works',
    label: 'Como Funciona',
    items: [
      {
        question: 'Como funciona a busca de babás e vagas?',
        answer:
          'Famílias podem buscar babás usando filtros como cidade, disponibilidade, tipo de cuidado e faixa de valor. Babás podem explorar vagas publicadas pelas famílias usando filtros similares. Com o plano pago, você tem acesso a todos os filtros disponíveis.',
      },
      {
        question: 'O que é o matching inteligente?',
        answer:
          'O matching inteligente é um algoritmo que calcula a compatibilidade entre famílias e babás com base em localização, disponibilidade, experiência, faixa etária das crianças e outros critérios. Disponível no Plano Plus (famílias) e Plano Pro (babás).',
      },
      {
        question: 'Como funciona o chat da plataforma?',
        answer:
          'O chat permite a comunicação entre famílias e babás dentro da plataforma. No plano gratuito, famílias podem iniciar 1 conversa e babás podem responder quando a família inicia. Nos planos pagos, as mensagens são ilimitadas.',
      },
      {
        question: 'Quantas vagas posso criar?',
        answer:
          'No Plano Free, famílias podem criar 1 vaga ativa (expira em 7 dias). No Plano Plus, é possível ter até 3 vagas ativas simultaneamente, cada uma com validade de 30 dias.',
      },
      {
        question: 'Como funciona a candidatura a vagas?',
        answer:
          'Babás podem se candidatar a vagas publicadas pelas famílias. Ao se candidatar, você pode enviar uma mensagem de apresentação. A família recebe uma notificação e pode aceitar ou recusar a candidatura.',
      },
    ],
  },
  {
    id: 'seals',
    label: 'Selos e Verificação',
    items: [
      {
        question: 'O que são os selos Identificada, Verificada e Confiável?',
        answer:
          'São níveis de confiança do perfil da babá. Identificada: perfil completo + documento de identidade + e-mail verificado. Verificada: Identificada + validação facial + verificação de segurança (requer Plano Pro). Confiável: Verificada + pelo menos 3 avaliações positivas (requer Plano Pro).',
      },
      {
        question: 'Como obter o selo Identificada?',
        answer:
          'Complete todas as seções do seu perfil (informações pessoais, experiência, trabalho e disponibilidade), envie seu documento de identidade (RG ou CNH) para validação e verifique seu e-mail. O selo Identificada é gratuito.',
      },
      {
        question: 'Como funciona a validação de documentos?',
        answer:
          'A validação é feita de forma segura e automatizada. Você envia a foto do documento (frente e verso) e uma selfie para confirmação. O processo verifica a autenticidade do documento e a correspondência facial.',
      },
      {
        question: 'Como obter os selos Verificada e Confiável?',
        answer:
          'Para o selo Verificada, você precisa ter o selo Identificada, assinar o Plano Pro e passar pela validação facial e verificação de segurança. Para o selo Confiável, além de ser Verificada, você precisa ter pelo menos 3 avaliações de famílias.',
      },
    ],
  },
  {
    id: 'security',
    label: 'Segurança e Privacidade',
    items: [
      {
        question: 'Meus dados pessoais estão protegidos?',
        answer:
          'Sim. Utilizamos criptografia para proteger seus dados sensíveis (CPF, documentos). Seguimos a LGPD e nossa política de privacidade detalha como seus dados são tratados. Você pode consultar nossa Política de Privacidade nos Termos do aplicativo.',
      },
      {
        question: 'As babás passam por verificação de antecedentes?',
        answer:
          'Babás com o selo Verificada passaram por verificação de documentos, validação facial e verificação de antecedentes criminais (esferas estadual e federal). Famílias podem identificar essas babás pelo selo no perfil.',
      },
      {
        question: 'Como posso denunciar um perfil ou comportamento inadequado?',
        answer:
          'Você pode denunciar qualquer perfil ou vaga diretamente pela plataforma. Acesse o perfil ou vaga em questão e utilize a opção de denúncia. Nossa equipe analisa todas as denúncias e toma as medidas necessárias.',
      },
      {
        question: 'Posso ocultar meu perfil das buscas?',
        answer:
          'Sim. Nas configurações de privacidade, você pode desativar a visibilidade do seu perfil nas buscas. Enquanto oculto, seu perfil não aparecerá nos resultados de busca, mas você ainda poderá se candidatar a vagas normalmente.',
      },
    ],
  },
];
