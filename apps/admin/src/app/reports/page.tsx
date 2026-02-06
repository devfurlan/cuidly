import PageContent from '@/components/layout/PageContent';
import { ReportCard } from './_components/ReportCard';
import { Users, CreditCard, Receipt } from '@phosphor-icons/react/dist/ssr';

const userFilters = [
  {
    name: 'Tipo de Usuário',
    param: 'role',
    options: [
      { value: 'all', label: 'Todos' },
      { value: 'FAMILY', label: 'Famílias' },
      { value: 'NANNY', label: 'Babás' },
    ],
  },
  {
    name: 'Status',
    param: 'status',
    options: [
      { value: 'all', label: 'Todos' },
      { value: 'ACTIVE', label: 'Ativo' },
      { value: 'INACTIVE', label: 'Inativo' },
      { value: 'PENDING', label: 'Pendente' },
      { value: 'SUSPENDED', label: 'Suspenso' },
    ],
  },
];

const subscriptionFilters = [
  {
    name: 'Plano',
    param: 'plan',
    options: [
      { value: 'all', label: 'Todos' },
      { value: 'FREE', label: 'Gratuito' },
      { value: 'FAMILY_MONTHLY', label: 'Família Mensal' },
      { value: 'FAMILY_QUARTERLY', label: 'Família Trimestral' },
      { value: 'NANNY_BASIC', label: 'Babá Básico' },
      { value: 'NANNY_PREMIUM_MONTHLY', label: 'Babá Premium Mensal' },
      { value: 'NANNY_PREMIUM_YEARLY', label: 'Babá Premium Anual' },
    ],
  },
  {
    name: 'Status',
    param: 'status',
    options: [
      { value: 'all', label: 'Todos' },
      { value: 'ACTIVE', label: 'Ativo' },
      { value: 'CANCELED', label: 'Cancelado' },
      { value: 'PAST_DUE', label: 'Atrasado' },
      { value: 'TRIALING', label: 'Trial' },
      { value: 'EXPIRED', label: 'Expirado' },
    ],
  },
];

const paymentFilters = [
  {
    name: 'Status',
    param: 'status',
    options: [
      { value: 'all', label: 'Todos' },
      { value: 'PENDING', label: 'Pendente' },
      { value: 'PAID', label: 'Pago' },
      { value: 'CONFIRMED', label: 'Confirmado' },
      { value: 'FAILED', label: 'Falhou' },
      { value: 'CANCELED', label: 'Cancelado' },
      { value: 'REFUNDED', label: 'Reembolsado' },
      { value: 'OVERDUE', label: 'Vencido' },
    ],
  },
];

export default function ReportsPage() {
  return (
    <PageContent title="Relatórios">
      <p className="text-muted-foreground mb-6">
        Gere e exporte relatórios em formato CSV para análise externa.
      </p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ReportCard
          title="Usuários"
          description="Exportar lista de usuários cadastrados na plataforma"
          endpoint="/api/admin/reports/users/export"
          filters={userFilters}
          icon={<Users className="h-5 w-5" />}
        />

        <ReportCard
          title="Assinaturas"
          description="Exportar lista de assinaturas e seus detalhes"
          endpoint="/api/admin/reports/subscriptions/export"
          filters={subscriptionFilters}
          icon={<CreditCard className="h-5 w-5" />}
        />

        <ReportCard
          title="Pagamentos"
          description="Exportar histórico de pagamentos e transações"
          endpoint="/api/admin/reports/payments/export"
          filters={paymentFilters}
          icon={<Receipt className="h-5 w-5" />}
        />
      </div>
    </PageContent>
  );
}
