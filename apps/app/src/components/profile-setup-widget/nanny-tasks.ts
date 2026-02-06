export interface NannyTaskConfig {
  id: string;
  label: string;
  description?: string;
  href: string;
  requiresPro?: boolean;
}

export const NANNY_TASK_CONFIGS: Record<string, NannyTaskConfig> = {
  'basic-profile': {
    id: 'basic-profile',
    label: 'Completar perfil',
    description: 'Preencha todos os dados do seu perfil',
    href: '/app/perfil?tab=info',
  },
  'document-verification': {
    id: 'document-verification',
    label: 'Validar documento',
    description: 'Envie seu RG ou CNH',
    href: '/app/perfil',
  },
  'email-verified': {
    id: 'email-verified',
    label: 'Verificar e-mail',
    description: 'Confirme seu endereço de e-mail',
    href: '/app/perfil?tab=info',
  },
};
