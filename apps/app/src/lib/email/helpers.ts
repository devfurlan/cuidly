/**
 * Helper functions for email templates
 */

/**
 * Calcula a idade em anos a partir da data de nascimento
 */
function calculateAge(birthDate: Date | null | undefined): number | null {
  if (!birthDate) return null;

  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

/**
 * Formata as idades das crianças para exibição em e-mails
 * Ex: "3 anos", "3 e 5 anos", "2, 4 e 6 anos"
 */
export function formatChildrenAges(children: any[]): string {
  if (!children || children.length === 0) return '';

  const ages = children
    .map((child) => calculateAge(child.birthDate))
    .filter((age): age is number => age !== null)
    .sort((a, b) => a - b);

  if (ages.length === 0) return '';
  if (ages.length === 1) return `${ages[0]} ano${ages[0] > 1 ? 's' : ''}`;

  const lastAge = ages.pop()!;
  return `${ages.join(', ')} e ${lastAge} anos`;
}

/**
 * Formata o tipo de vaga para exibição em português
 */
export function formatJobType(jobType: string): string {
  const types: Record<string, string> = {
    OCCASIONAL: 'Folguista',
    DAILY: 'Diarista',
    MONTHLY: 'Mensalista',
    LIVE_IN: 'Babá residente',
  };
  return types[jobType] || jobType;
}

/**
 * Formata o horário da vaga de forma resumida para e-mail
 * Ex: "Seg-Sex, 8h-18h"
 */
export function formatSchedule(job: any): string {
  // TODO: Implementar baseado na estrutura de schedule do Job
  // Por enquanto retornando string genérica
  if (job.schedule) {
    // Se tiver dados de schedule estruturado, formatar aqui
    return 'Segunda a sexta-feira';
  }
  return 'Horário a combinar';
}

/**
 * Retorna os selos da babá baseado em seus dados de validação
 */
export function getNannySeals(nanny: any): string[] {
  const seals: string[] = [];

  if (nanny.documentValidated) {
    seals.push('Identificada');
  }

  if (nanny.validationApproved) {
    seals.push('Verificada');
  }

  // Selo Confiável requer 3 ou mais avaliações
  const reviewCount = nanny.reviewCount || nanny._count?.reviews || 0;
  if (reviewCount >= 3) {
    seals.push('Confiável');
  }

  return seals;
}
