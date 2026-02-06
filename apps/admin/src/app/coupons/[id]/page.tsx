import PageContent from '@/components/layout/PageContent';
import { requirePermission } from '@/lib/auth/checkPermission';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/Badge';
import {
  DISCOUNT_TYPE_LABELS,
  APPLICABLE_TO_LABELS,
  SUBSCRIPTION_PLAN_LABELS,
} from '@/schemas/couponSchemas';
import { getCouponStatus } from '../schema';

interface CouponDetailsPageProps {
  params: Promise<{ id: string }>;
}

async function getCouponWithDetails(id: string) {
  const coupon = await prisma.coupon.findFirst({
    where: {
      id,
      deletedAt: null,
    },
    include: {
      createdBy: {
        select: { id: true, name: true, email: true },
      },
      usages: {
        include: {
          nanny: {
            select: { id: true, name: true, emailAddress: true },
          },
          family: {
            select: { id: true, name: true, emailAddress: true },
          },
          subscription: {
            select: { id: true, plan: true },
          },
        },
        orderBy: { usedAt: 'desc' },
        take: 20,
      },
      allowedEmails: {
        include: {
          nanny: {
            select: { id: true, name: true, emailAddress: true },
          },
          family: {
            select: { id: true, name: true, emailAddress: true },
          },
        },
        orderBy: { addedAt: 'desc' },
      },
      _count: {
        select: { usages: true, allowedEmails: true },
      },
    },
  });

  if (!coupon) return null;

  const stats = await prisma.couponUsage.aggregate({
    where: { couponId: id },
    _sum: { discountAmount: true },
  });

  return {
    coupon,
    stats: {
      totalUsages: coupon._count.usages,
      totalDiscountGiven: stats._sum.discountAmount || 0,
    },
  };
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getStatusBadge(status: string) {
  const statusConfig: Record<string, { label: string; variant: 'teal' | 'muted' | 'red' | 'blue' }> = {
    active: { label: 'Ativo', variant: 'teal' },
    inactive: { label: 'Inativo', variant: 'muted' },
    expired: { label: 'Expirado', variant: 'red' },
    scheduled: { label: 'Agendado', variant: 'blue' },
  };

  const config = statusConfig[status] || statusConfig.inactive;
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export const metadata = {
  title: 'Detalhes do Cupom',
  description: 'Veja os detalhes e histórico de uso do cupom.',
};

export default async function CouponDetailsPage({
  params,
}: CouponDetailsPageProps) {
  await requirePermission('COUPONS');

  const { id } = await params;
  const data = await getCouponWithDetails(id);

  if (!data) {
    notFound();
  }

  const { coupon, stats } = data;
  const status = getCouponStatus({
    ...coupon,
    startDate: new Date(coupon.startDate),
    endDate: new Date(coupon.endDate),
    createdAt: new Date(coupon.createdAt),
    updatedAt: new Date(coupon.updatedAt),
  });

  return (
    <PageContent
      title={`Cupom: ${coupon.code}`}
      actions={
        <Button asChild variant="outline">
          <Link href={`/coupons/${coupon.id}/edit`}>Editar</Link>
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Status e Resumo */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Status</CardDescription>
            </CardHeader>
            <CardContent>{getStatusBadge(status)}</CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total de Usos</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {stats.totalUsages}
                {coupon.usageLimit && (
                  <span className="text-sm font-normal text-muted-foreground">
                    {' '}
                    / {coupon.usageLimit}
                  </span>
                )}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Desconto Total Concedido</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {formatCurrency(stats.totalDiscountGiven)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Desconto Médio</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {stats.totalUsages > 0
                  ? formatCurrency(stats.totalDiscountGiven / stats.totalUsages)
                  : formatCurrency(0)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detalhes do Cupom */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Cupom</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 md:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Código
                </dt>
                <dd className="font-mono text-lg font-semibold">
                  {coupon.code}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Tipo de Desconto
                </dt>
                <dd>
                  {coupon.discountType === 'PERCENTAGE'
                    ? `${coupon.discountValue}%`
                    : formatCurrency(coupon.discountValue)}
                  <span className="ml-2 text-muted-foreground">
                    ({DISCOUNT_TYPE_LABELS[coupon.discountType]})
                  </span>
                </dd>
              </div>

              {coupon.maxDiscount && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Desconto Máximo
                  </dt>
                  <dd>{formatCurrency(coupon.maxDiscount)}</dd>
                </div>
              )}

              {coupon.minPurchaseAmount && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Valor Minimo de Compra
                  </dt>
                  <dd>{formatCurrency(coupon.minPurchaseAmount)}</dd>
                </div>
              )}

              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Aplicável a
                </dt>
                <dd>{APPLICABLE_TO_LABELS[coupon.applicableTo]}</dd>
              </div>

              {coupon.applicableTo === 'SPECIFIC_PLAN' &&
                coupon.applicablePlanIds.length > 0 && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Planos
                    </dt>
                    <dd className="flex flex-wrap gap-1">
                      {coupon.applicablePlanIds.map((plan) => (
                        <Badge key={plan} variant="blue">
                          {SUBSCRIPTION_PLAN_LABELS[plan] || plan}
                        </Badge>
                      ))}
                    </dd>
                  </div>
                )}

              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Restrição de Usuários
                </dt>
                <dd>
                  {coupon.hasUserRestriction ? (
                    <Badge variant="orange">
                      Restrito a {coupon._count.allowedEmails} usuário
                      {coupon._count.allowedEmails !== 1 ? 's' : ''}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">
                      Sem restrição (todos podem usar)
                    </span>
                  )}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Período de Validade
                </dt>
                <dd>
                  {formatDate(coupon.startDate)} ate {formatDate(coupon.endDate)}
                </dd>
              </div>

              {coupon.description && (
                <div className="md:col-span-2">
                  <dt className="text-sm font-medium text-muted-foreground">
                    Descrição
                  </dt>
                  <dd>{coupon.description}</dd>
                </div>
              )}

              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Criado por
                </dt>
                <dd>{coupon.createdBy?.name || coupon.createdBy?.email || '-'}</dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Criado em
                </dt>
                <dd>{formatDate(coupon.createdAt)}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Usuários Permitidos */}
        {coupon.hasUserRestriction && coupon.allowedEmails.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Usuários Permitidos</CardTitle>
              <CardDescription>
                {coupon.allowedEmails.length} usuário
                {coupon.allowedEmails.length !== 1 ? 's' : ''} pode
                {coupon.allowedEmails.length === 1 ? '' : 'm'} usar este cupom
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 text-left font-medium">Tipo</th>
                      <th className="py-2 text-left font-medium">Nome</th>
                      <th className="py-2 text-left font-medium">E-mail</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coupon.allowedEmails.map((allowed) => (
                      <tr key={allowed.id} className="border-b">
                        <td className="py-2">
                          {allowed.nanny ? (
                            <Badge variant="purple" size="sm">
                              Babá
                            </Badge>
                          ) : allowed.family ? (
                            <Badge variant="blue" size="sm">
                              Família
                            </Badge>
                          ) : (
                            <Badge variant="default" size="sm">
                              Externo
                            </Badge>
                          )}
                        </td>
                        <td className="py-2">
                          {allowed.nanny?.name ||
                            allowed.family?.name ||
                            '-'}
                        </td>
                        <td className="py-2 font-mono text-xs">
                          {allowed.email}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Histórico de Uso */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Uso</CardTitle>
            <CardDescription>
              Últimos {coupon.usages.length} usos do cupom
            </CardDescription>
          </CardHeader>
          <CardContent>
            {coupon.usages.length === 0 ? (
              <p className="text-muted-foreground">
                Este cupom ainda não foi utilizado.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 text-left font-medium">Usuario</th>
                      <th className="py-2 text-left font-medium">Plano</th>
                      <th className="py-2 text-left font-medium">Desconto</th>
                      <th className="py-2 text-left font-medium">Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coupon.usages.map((usage) => (
                      <tr key={usage.id} className="border-b">
                        <td className="py-2">
                          {usage.nanny?.name || usage.family?.name || usage.nanny?.emailAddress || usage.family?.emailAddress || '-'}
                        </td>
                        <td className="py-2">
                          {usage.subscription?.plan
                            ? SUBSCRIPTION_PLAN_LABELS[usage.subscription.plan] ||
                              usage.subscription.plan
                            : '-'}
                        </td>
                        <td className="py-2">
                          {formatCurrency(usage.discountAmount)}
                        </td>
                        <td className="py-2">{formatDate(usage.usedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContent>
  );
}
