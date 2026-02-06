export type UserType = 'family' | 'nanny';

export interface Benefit {
  icon: string;
  title: string;
  description: string;
}

export const benefits: Record<UserType, Benefit[]> = {
  family: [
    {
      icon: '💬',
      title: 'Chat ilimitado',
      description: 'Converse com quantas babás precisar',
    },
    {
      icon: '🎯',
      title: 'Matching inteligente',
      description: 'Encontre babás compatíveis automaticamente',
    },
    {
      icon: '📋',
      title: 'Até 3 vagas ativas',
      description: 'Publique mais vagas simultaneamente',
    },
    {
      icon: '⭐',
      title: 'Avaliações completas',
      description: 'Veja todas as avaliações das babás',
    },
    {
      icon: '🚀',
      title: '1 Boost por mês',
      description: 'Destaque suas vagas nas buscas',
    },
  ],
  nanny: [
    {
      icon: '✨',
      title: 'Perfil em destaque',
      description: 'Apareça primeiro nas buscas',
    },
    {
      icon: '🛡️',
      title: 'Selos de verificação',
      description: 'Transmita mais confiança às famílias',
    },
    {
      icon: '💬',
      title: 'Mensagens ilimitadas',
      description: 'Converse sem restrições após candidatura',
    },
    {
      icon: '🎯',
      title: 'Matching prioritário',
      description: 'Receba recomendações para mais vagas',
    },
  ],
};

// Alias for backwards compatibility
export const benefitsByUserType = benefits;
