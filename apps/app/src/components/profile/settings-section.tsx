'use client';

import { Button } from '@/components/ui/shadcn/button';
import { PiPencilSimpleDuotone } from 'react-icons/pi';

interface SettingsSectionProps {
  /** Título da seção */
  title: string;
  /** Descrição da seção */
  description: string;
  /** Callback ao clicar em editar */
  onEdit?: () => void;
  /** Se deve mostrar o botão de editar */
  showEditButton?: boolean;
  /** Se é a primeira seção (sem border-top) */
  isFirst?: boolean;
  /** Conteúdo da seção */
  children: React.ReactNode;
}

/**
 * Componente de seção no padrão settings (2 colunas)
 * - Coluna esquerda: título e descrição
 * - Coluna direita: conteúdo com botão de editar opcional
 */
export function SettingsSection({
  title,
  description,
  onEdit,
  showEditButton = true,
  isFirst = false,
  children,
}: SettingsSectionProps) {
  return (
    <section
      className={`grid grid-cols-1 gap-x-8 gap-y-6 py-8 md:grid-cols-3 ${
        isFirst ? '' : 'border-t border-gray-900/5'
      }`}
    >
      <div>
        <p className="font-medium text-gray-900">{title}</p>
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      </div>
      <div className="md:col-span-2">
        {showEditButton && onEdit && (
          <div className="mb-4 flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-gray-700"
              onClick={onEdit}
            >
              <PiPencilSimpleDuotone />
              Editar
            </Button>
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

interface FieldItemProps {
  /** Label do campo */
  label: string;
  /** Se ocupa 2 colunas no grid */
  fullWidth?: boolean;
  /** Conteúdo do campo */
  children: React.ReactNode;
}

/**
 * Componente de campo individual (dt/dd)
 */
export function FieldItem({
  label,
  fullWidth = false,
  children,
}: FieldItemProps) {
  return (
    <div className={fullWidth ? 'sm:col-span-2' : ''}>
      <dt className="text-sm text-gray-400">{label}</dt>
      <dd className="mt-1 text-gray-900">{children}</dd>
    </div>
  );
}

interface FieldGridProps {
  /** Número de colunas no grid (padrão: 2) */
  columns?: 2 | 3;
  /** Conteúdo do grid */
  children: React.ReactNode;
}

/**
 * Grid para agrupar FieldItems
 */
export function FieldGrid({ columns = 2, children }: FieldGridProps) {
  const colsClass = columns === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2';
  return (
    <dl className={`grid grid-cols-1 gap-x-6 gap-y-5 ${colsClass}`}>
      {children}
    </dl>
  );
}

interface EmptyValueProps {
  /** Texto a ser exibido (padrão: "Não informado") */
  text?: string;
}

/**
 * Componente para exibir valor vazio/não preenchido
 */
export function EmptyValue({ text = 'Não informado' }: EmptyValueProps) {
  return <span className="text-gray-500 italic">{text}</span>;
}
