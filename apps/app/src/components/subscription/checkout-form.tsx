'use client';

import {
  BillingInterval,
  getDiscountPercentage,
  getMonthlyEquivalentPrice,
  getPlanPrice,
  PLAN_LABELS,
  type PaidPlan,
} from '@cuidly/core';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  PiCheck,
  PiCheckCircle,
  PiCircleNotch,
  PiCopy,
  PiCreditCard,
  PiCrown,
  PiLock,
  PiPixLogo,
  PiTag,
  PiWarningCircle,
  PiX,
} from 'react-icons/pi';
import { z } from 'zod';

import { Button } from '@/components/ui/shadcn/button';
import { Checkbox } from '@/components/ui/shadcn/checkbox';
import { Input } from '@/components/ui/shadcn/input';
import { Label } from '@/components/ui/shadcn/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/shadcn/radio-group';
import { cn } from '@cuidly/shared';
import { toast } from 'sonner';

// Schema de validação do cartão
const creditCardSchema = z
  .object({
    number: z
      .string()
      .min(13, 'Número do cartão inválido')
      .max(19, 'Número do cartão inválido'),
    expiry: z
      .string()
      .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Validade inválida (MM/AA)'),
    ccv: z.string().regex(/^\d{3,4}$/, 'CVV inválido'),
    differentHolder: z.boolean().optional(),
    holderName: z.string().optional(),
    holderCpf: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.differentHolder) {
        return (
          data.holderName &&
          data.holderName.length >= 3 &&
          data.holderCpf &&
          data.holderCpf.length >= 11
        );
      }
      return true;
    },
    {
      message:
        'Nome e CPF do titular são obrigatórios quando o cartão é de outra pessoa',
      path: ['holderName'],
    },
  );

type CreditCardFormData = z.infer<typeof creditCardSchema>;

interface CouponValidation {
  isValid: boolean;
  discountAmount?: number;
  originalAmount?: number;
  finalAmount?: number;
  message?: string;
  isFreeTrial?: boolean;
  trialDays?: number;
  requiresCreditCard?: boolean;
}

interface PixData {
  qrCodeImage: string;
  copyPaste: string;
  expiresAt: string;
}

export type CheckoutPlan = PaidPlan;
export type CheckoutBillingInterval = BillingInterval;

export interface CheckoutFormProps {
  plan?: CheckoutPlan;
  defaultBillingInterval?: CheckoutBillingInterval;
  defaultCouponCode?: string;
  onSuccess?: () => void;
  className?: string;
}

// Re-export PLAN_LABELS as PLAN_NAMES for backwards compatibility
export const PLAN_NAMES = PLAN_LABELS;

export function CheckoutForm({
  plan = 'FAMILY_PLUS',
  defaultBillingInterval = 'QUARTER',
  defaultCouponCode,
  onSuccess,
  className,
}: CheckoutFormProps) {

  const [billingInterval, setBillingInterval] =
    useState<CheckoutBillingInterval>(defaultBillingInterval);
  const [paymentMethod, setPaymentMethod] = useState<'CREDIT_CARD' | 'PIX'>(
    'CREDIT_CARD',
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [pixData, setPixData] = useState<PixData | null>(null);
  const [copied, setCopied] = useState(false);

  // Cupom
  const [showCouponInput, setShowCouponInput] = useState(!!defaultCouponCode);
  const [couponCode, setCouponCode] = useState(defaultCouponCode || '');
  const [couponValidation, setCouponValidation] =
    useState<CouponValidation | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  // Billing intervals disponíveis por plano
  const availableIntervals =
    plan === 'FAMILY_PLUS'
      ? (['MONTH', 'QUARTER'] as const)
      : (['MONTH', 'YEAR'] as const);

  const basePrice = getPlanPrice(plan, billingInterval) ?? 94;
  const finalPrice = couponValidation?.finalAmount ?? basePrice;
  const monthlyPrice =
    billingInterval === 'QUARTER'
      ? finalPrice / 3
      : billingInterval === 'YEAR'
        ? finalPrice / 12
        : finalPrice;

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    control,
  } = useForm<CreditCardFormData>({
    resolver: zodResolver(creditCardSchema),
  });

  // Validar cupom automaticamente se vier por default
  useEffect(() => {
    if (defaultCouponCode) {
      handleValidateCoupon();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Revalidar cupom quando mudar o billing interval
  useEffect(() => {
    if (couponValidation?.isValid && couponCode) {
      handleValidateCoupon();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [billingInterval]);

  // Cardless trial: free trial coupon that does NOT require credit card
  const isCardlessTrial = couponValidation?.isValid &&
    couponValidation.isFreeTrial &&
    couponValidation.requiresCreditCard === false;

  const handleActivateTrial = async () => {
    setIsProcessing(true);

    try {
      const response = await fetch('/api/subscription/activate-trial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan,
          billingInterval,
          couponCode: couponCode.trim().toUpperCase(),
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success(result.message || 'Período de teste ativado com sucesso!');
        onSuccess?.();
      } else {
        toast.error(result.error || 'Erro ao ativar período de teste');
      }
    } catch {
      toast.error('Erro ao ativar período de teste. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) return;

    setIsValidatingCoupon(true);
    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode.trim().toUpperCase(),
          planId: plan,
          billingInterval,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setCouponValidation({
          isValid: true,
          discountAmount: data.discountAmount,
          originalAmount: data.originalAmount,
          finalAmount: data.finalAmount,
          isFreeTrial: data.isFreeTrial,
          trialDays: data.trialDays,
          requiresCreditCard: data.requiresCreditCard,
        });
        setShowCouponInput(false);
      } else {
        setCouponValidation({
          isValid: false,
          message: data.message || data.error || 'Cupom inválido',
        });
      }
    } catch {
      setCouponValidation({
        isValid: false,
        message: 'Erro ao validar cupom',
      });
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setCouponCode('');
    setCouponValidation(null);
    setShowCouponInput(false);
  };

  const handleCreditCardPayment = async (data: CreditCardFormData) => {
    setIsProcessing(true);

    try {
      // Separar mês e ano da validade (MM/AA)
      const [expiryMonth, expiryYearShort] = data.expiry.split('/');
      const expiryYear = `20${expiryYearShort}`;

      const payload: Record<string, unknown> = {
        paymentMethod: 'CREDIT_CARD',
        plan,
        billingInterval,
        couponCode: couponValidation?.isValid ? couponCode : undefined,
        creditCard: {
          number: data.number.replace(/\s/g, ''),
          expiryMonth,
          expiryYear,
          ccv: data.ccv,
        },
      };

      if (data.differentHolder && data.holderName && data.holderCpf) {
        payload.creditCardHolderInfo = {
          name: data.holderName,
          cpfCnpj: data.holderCpf.replace(/\D/g, ''),
        };
      }

      const response = await fetch('/api/subscription/transparent-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success('Assinatura ativada com sucesso!');
        onSuccess?.();
      } else {
        toast.error(result.error || 'Erro ao processar pagamento');
      }
    } catch {
      toast.error('Erro ao processar pagamento. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePixPayment = async () => {
    setIsProcessing(true);

    try {
      const response = await fetch('/api/subscription/transparent-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethod: 'PIX',
          plan,
          billingInterval,
          couponCode: couponValidation?.isValid ? couponCode : undefined,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setPixData(result.pixData);
        toast.success('QR Code PIX gerado!');
      } else {
        toast.error(result.error || 'Erro ao gerar PIX');
      }
    } catch {
      toast.error('Erro ao gerar PIX. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyPixCode = async () => {
    if (!pixData?.copyPaste) return;

    try {
      await navigator.clipboard.writeText(pixData.copyPaste);
      setCopied(true);
      toast.success('Código PIX copiado!');
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast.error('Erro ao copiar código');
    }
  };

  const formatCardNumber = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{4})/g, '$1 ')
      .trim()
      .slice(0, 19);
  };

  const getBillingIntervalLabel = (interval: CheckoutBillingInterval) => {
    switch (interval) {
      case 'MONTH':
        return { name: 'Mensal', renewal: 'Renovado mensalmente' };
      case 'QUARTER':
        return { name: 'Trimestral', renewal: 'Renovado a cada 3 meses' };
      case 'YEAR':
        return { name: 'Anual', renewal: 'Renovado anualmente' };
    }
  };

  // Componente do Footer (botão + texto segurança)
  const PaymentFooter = ({ isCard = false }: { isCard?: boolean }) => (
    <div className="shrink-0 bg-white px-4 py-4 sm:px-6">
      <div className="mb-3 flex items-center justify-center gap-2 text-xs text-gray-400">
        <PiLock className="size-3" />
        Pagamento processado de forma segura
      </div>
      {isCard ? (
        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-fuchsia-500 to-fuchsia-600 py-6 text-white hover:from-fuchsia-600 hover:to-fuchsia-700"
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <PiCircleNotch className="mr-2 size-4 animate-spin" />
              Processando...
            </>
          ) : (
            <>Pagar {formatCurrency(finalPrice)}</>
          )}
        </Button>
      ) : (
        <Button
          type="button"
          className="w-full bg-gradient-to-r from-fuchsia-500 to-fuchsia-600 py-6 text-white hover:from-fuchsia-600 hover:to-fuchsia-700"
          onClick={handlePixPayment}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <PiCircleNotch className="mr-2 size-4 animate-spin" />
              Gerando PIX...
            </>
          ) : (
            <>
              <PiPixLogo className="mr-2 size-4" />
              Gerar PIX de {formatCurrency(finalPrice)}
            </>
          )}
        </Button>
      )}
    </div>
  );

  return (
    <div
      className={cn(
        'flex h-full flex-col overflow-y-auto lg:flex-row lg:overflow-hidden',
        className,
      )}
    >
      {/* Coluna Esquerda - Formulário de Pagamento */}
      <div className="order-2 flex min-h-0 flex-col lg:order-1 lg:flex-1 lg:overflow-hidden">
        {/* Header - apenas desktop */}
        <div className="hidden items-center gap-3 px-4 py-4 sm:px-6 lg:flex">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 to-fuchsia-600">
            <PiCrown className="size-5 text-white" />
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold">
              Assinar {PLAN_LABELS[plan]}
            </h2>
            <p className="text-sm text-gray-500">
              {isCardlessTrial ? 'Ative seu período de teste' : 'Escolha como prefere pagar'}
            </p>
          </div>
        </div>

        {isCardlessTrial ? (
          /* Cardless trial - no payment needed */
          <div className="flex min-h-0 flex-col lg:flex-1">
            <div className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6">
              <div className="max-w-sm space-y-4 text-center">
                <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-green-100">
                  <PiCheckCircle className="size-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Período de teste gratuito
                </h3>
                <p className="text-sm text-gray-600">
                  Este cupom ativa seu período de teste gratuito de{' '}
                  <strong>{couponValidation?.trialDays} dias</strong>.
                  Nenhum pagamento será cobrado.
                </p>
                <p className="text-xs text-gray-400">
                  Após o período de teste, você poderá assinar normalmente para continuar com acesso ao plano.
                </p>
              </div>
            </div>
            <div className="shrink-0 bg-white px-4 py-4 sm:px-6">
              <Button
                type="button"
                className="w-full bg-gradient-to-r from-fuchsia-500 to-fuchsia-600 py-6 text-white hover:from-fuchsia-600 hover:to-fuchsia-700"
                onClick={handleActivateTrial}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <PiCircleNotch className="mr-2 size-4 animate-spin" />
                    Ativando...
                  </>
                ) : (
                  'Ativar Período de Teste Gratuito'
                )}
              </Button>
            </div>
          </div>
        ) : (
          /* Normal payment flow */
          <>
        {/* Tabs de método de pagamento */}
        <div className="px-4 pb-3 sm:px-6">
          <div className="flex rounded-lg border bg-gray-50 p-1">
            <button
              type="button"
              onClick={() => {
                setPaymentMethod('CREDIT_CARD');
                setPixData(null);
              }}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium transition-all',
                paymentMethod === 'CREDIT_CARD'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700',
              )}
            >
              <PiCreditCard className="size-4" />
              Cartão
            </button>
            <button
              type="button"
              onClick={() => {
                setPaymentMethod('PIX');
                setPixData(null);
              }}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium transition-all',
                paymentMethod === 'PIX'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700',
              )}
            >
              <PiPixLogo className="size-4" />
              PIX
            </button>
          </div>
        </div>

        {/* Conteúdo */}
        {paymentMethod === 'CREDIT_CARD' ? (
          <form
            onSubmit={handleSubmit(handleCreditCardPayment)}
            className="flex min-h-0 flex-col lg:flex-1"
          >
            <div className="space-y-4 px-4 py-4 sm:px-6 lg:flex-1 lg:overflow-y-auto">
              <div className="space-y-2">
                <Label htmlFor="number">Número do cartão</Label>
                <div className="relative">
                  <PiCreditCard className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="number"
                    {...register('number')}
                    placeholder="0000 0000 0000 0000"
                    onChange={(e) => {
                      e.target.value = formatCardNumber(e.target.value);
                    }}
                    maxLength={19}
                    className="pl-10"
                  />
                </div>
                {errors.number && (
                  <p className="text-xs text-red-500">
                    {errors.number.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div className="space-y-2">
                  <Label htmlFor="expiry">Validade</Label>
                  <Input
                    id="expiry"
                    {...register('expiry')}
                    placeholder="MM/AA"
                    maxLength={5}
                    onChange={(e) => {
                      let value = e.target.value.replace(/\D/g, '');
                      if (value.length >= 2) {
                        value = value.slice(0, 2) + '/' + value.slice(2, 4);
                      }
                      e.target.value = value;
                    }}
                  />
                  {errors.expiry && (
                    <p className="text-xs text-red-500">
                      {errors.expiry.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ccv">CVV</Label>
                  <Input
                    id="ccv"
                    {...register('ccv')}
                    placeholder="123"
                    maxLength={4}
                    inputMode="numeric"
                  />
                  {errors.ccv && (
                    <p className="text-xs text-red-500">{errors.ccv.message}</p>
                  )}
                </div>
              </div>

              {/* Checkbox para cartão de outra pessoa */}
              <Controller
                name="differentHolder"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="differentHolder"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <Label
                      htmlFor="differentHolder"
                      className="text-sm font-normal text-gray-600"
                    >
                      Cartão em nome de outra pessoa
                    </Label>
                  </div>
                )}
              />

              {watch('differentHolder') && (
                <div className="space-y-3 rounded-lg border border-gray-100 bg-gray-50/40 p-3">
                  <p className="text-xs text-gray-500">
                    Dados do titular do cartão
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="holderName">Nome completo</Label>
                    <Input
                      id="holderName"
                      {...register('holderName')}
                      placeholder="Nome como está no cartão"
                    />
                    {errors.holderName && (
                      <p className="text-xs text-red-500">
                        {errors.holderName.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="holderCpf">CPF do titular</Label>
                    <Input
                      id="holderCpf"
                      {...register('holderCpf')}
                      placeholder="000.000.000-00"
                      maxLength={14}
                    />
                    {errors.holderCpf && (
                      <p className="text-xs text-red-500">
                        {errors.holderCpf.message}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer - Cartão */}
            <PaymentFooter isCard />
          </form>
        ) : (
          <div className="flex min-h-0 flex-col lg:flex-1">
            <div className="px-4 py-4 sm:px-6 lg:flex-1 lg:overflow-y-auto">
              {pixData ? (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="rounded-lg border bg-white p-4">
                      <img
                        src={`data:image/png;base64,${pixData.qrCodeImage}`}
                        alt="QR Code PIX"
                        className="size-40 sm:size-48"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>PIX Copia e Cola</Label>
                    <div className="flex gap-2">
                      <Input
                        value={pixData.copyPaste}
                        readOnly
                        className="flex-1 text-xs"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={copyPixCode}
                      >
                        {copied ? (
                          <PiCheck className="size-4 text-green-500" />
                        ) : (
                          <PiCopy className="size-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <p className="text-center text-xs text-gray-500">
                    Após o pagamento, sua assinatura será ativada
                    automaticamente.
                  </p>
                </div>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
                    <PiPixLogo className="mx-auto mb-3 size-10 text-gray-400" />
                    <p className="text-sm text-gray-600">
                      Clique no botão abaixo para gerar o QR Code PIX
                    </p>
                  </div>
                </div>
              )}
            </div>
            {/* Footer - PIX */}
            {!pixData && <PaymentFooter isCard={false} />}
          </div>
        )}
          </>
        )}
      </div>

      {/* Coluna Direita - Resumo do Pedido */}
      <div className="order-1 w-full shrink-0 bg-fuchsia-50/80 p-4 sm:p-6 lg:order-2 lg:w-80 lg:overflow-y-auto lg:border-l">
        {/* Header mobile */}
        <div className="mb-4 flex items-center gap-3 lg:hidden">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 to-fuchsia-600">
            <PiCrown className="size-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">
              Assinar {PLAN_LABELS[plan]}
            </h2>
            <p className="text-sm text-gray-500">Escolha seu plano</p>
          </div>
        </div>

        <h3 className="mb-3 font-semibold text-gray-900 lg:mb-4">
          Período de cobrança
        </h3>

        {/* Seleção de plano */}
        <RadioGroup
          value={billingInterval}
          onValueChange={(value) =>
            setBillingInterval(value as CheckoutBillingInterval)
          }
          className="mb-4 space-y-2 lg:mb-6"
        >
          {availableIntervals.map((interval) => {
            const price = getPlanPrice(plan, interval) ?? 0;
            const label = getBillingIntervalLabel(interval);
            const discount = getDiscountPercentage(plan, interval) ?? 0;
            const monthlyEquivalent =
              getMonthlyEquivalentPrice(plan, interval) ?? price;
            const showDiscount = interval !== 'MONTH' && discount > 0;

            return (
              <Label
                key={interval}
                htmlFor={interval}
                className={cn(
                  'relative flex cursor-pointer items-center justify-between rounded-lg border-2 p-3 transition-all',
                  billingInterval === interval
                    ? 'border-fuchsia-500 bg-fuchsia-50'
                    : 'border-gray-200 bg-white hover:border-gray-300',
                )}
              >
                {showDiscount && (
                  <span className="absolute -top-2 left-3 rounded-full bg-green-500 px-2 py-0.5 text-2xs font-medium text-white">
                    Economize {discount}%
                  </span>
                )}
                <div>
                  <div className="text-sm font-medium">{label.name}</div>
                  <div className="text-xs text-gray-500">
                    {interval === 'MONTH'
                      ? `${formatCurrency(price)}/mês`
                      : `${formatCurrency(monthlyEquivalent)}/mês`}
                  </div>
                </div>
                <RadioGroupItem value={interval} id={interval} />
              </Label>
            );
          })}
        </RadioGroup>

        {/* Resumo */}
        <div className="space-y-3 border-t pt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              1 assinatura {PLAN_LABELS[plan]}
            </span>
            <span>{formatCurrency(basePrice)}</span>
          </div>

          {couponValidation?.isValid && couponValidation.discountAmount && (
            <div className="flex items-center justify-between text-sm text-green-600">
              <span>Desconto ({couponCode})</span>
              <span>-{formatCurrency(couponValidation.discountAmount)}</span>
            </div>
          )}

          {/* Campo de cupom */}
          <div className="py-2">
            {couponValidation?.isValid ? (
              <div className="flex items-center justify-between rounded-lg bg-green-100 px-3 py-2">
                <div className="flex items-center gap-2">
                  <PiCheckCircle className="size-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700">
                    {couponCode}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={removeCoupon}
                  className="text-green-600 hover:text-green-700"
                >
                  <PiX className="size-4" />
                </button>
              </div>
            ) : showCouponInput ? (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={couponCode}
                    onChange={(e) =>
                      setCouponCode(e.target.value.toUpperCase())
                    }
                    placeholder="Código"
                    disabled={isValidatingCoupon}
                    className="flex-1 bg-white uppercase"
                    autoFocus
                  />
                  <Button
                    variant="outline"
                    onClick={handleValidateCoupon}
                    disabled={!couponCode.trim() || isValidatingCoupon}
                    className="w-20"
                  >
                    {isValidatingCoupon ? (
                      <PiCircleNotch className="size-4 animate-spin" />
                    ) : (
                      'Aplicar'
                    )}
                  </Button>
                </div>
                {couponValidation && !couponValidation.isValid && (
                  <p className="flex items-center gap-1 text-xs text-red-500">
                    <PiWarningCircle className="size-3" />
                    {couponValidation.message}
                  </p>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowCouponInput(true)}
                className="flex items-center gap-2 text-sm text-fuchsia-400 hover:text-fuchsia-600"
              >
                <PiTag className="size-4" />
                Adicionar cupom
              </button>
            )}
          </div>

          <div className="border-t pt-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Total hoje</span>
              <div className="text-right">
                {isCardlessTrial ? (
                  <span className="text-xl font-bold text-green-600">
                    Grátis
                  </span>
                ) : couponValidation?.isValid &&
                couponValidation.discountAmount ? (
                  <>
                    <span className="text-sm text-gray-400 line-through">
                      {formatCurrency(basePrice)}
                    </span>
                    <span className="ml-2 text-xl font-bold text-green-600">
                      {formatCurrency(finalPrice)}
                    </span>
                  </>
                ) : (
                  <span className="text-xl font-bold">
                    {formatCurrency(finalPrice)}
                  </span>
                )}
              </div>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              {isCardlessTrial
                ? `Teste gratuito por ${couponValidation?.trialDays} dias`
                : billingInterval === 'MONTH'
                  ? 'Renovado mensalmente'
                  : `Equivale a ${formatCurrency(monthlyPrice)}/mês · ${getBillingIntervalLabel(billingInterval).renewal}`}
            </p>
          </div>
        </div>

        {/* Cancelamento */}
        <p className="mt-4 text-xs text-gray-400 lg:mt-6">
          {isCardlessTrial
            ? 'Após o período de teste, você poderá assinar normalmente para continuar com acesso ao plano.'
            : 'Para sua comodidade, as próximas cobranças acontecerão de forma automática nesta mesma data. Você poderá cancelar seu plano a qualquer momento que desejar.'}
        </p>
      </div>
    </div>
  );
}
