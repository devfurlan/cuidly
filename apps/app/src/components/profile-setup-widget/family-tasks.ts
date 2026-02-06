export interface FamilyTaskConfig {
  id: string;
  label: string;
  description?: string;
  href: string;
  requiresPro?: boolean;
}

export const FAMILY_TASK_CONFIGS: Record<string, FamilyTaskConfig> = {
  'basic-profile': {
    id: 'basic-profile',
    label: 'Completar perfil básico',
    description: 'Nome e foto',
    href: '/app/perfil',
  },
  'children': {
    id: 'children',
    label: 'Adicionar filhos',
    href: '/app/filhos',
  },
  'address': {
    id: 'address',
    label: 'Configurar endereço',
    href: '/app/perfil',
  },
  'job-created': {
    id: 'job-created',
    label: 'Criar vaga',
    href: '/app/vagas/criar',
  },
  'family-presentation': {
    id: 'family-presentation',
    label: 'Apresentação da família',
    href: '/app/perfil',
  },
  'job-description': {
    id: 'job-description',
    label: 'Descrição da vaga',
    href: '/app/perfil',
  },
  'job-photos': {
    id: 'job-photos',
    label: 'Adicionar fotos da vaga',
    href: '/app/perfil',
  },
  'email-verified': {
    id: 'email-verified',
    label: 'Verificar e-mail',
    href: '/app/configuracoes',
  },
};
