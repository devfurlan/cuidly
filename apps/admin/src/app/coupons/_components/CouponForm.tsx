'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CouponFormSchema,
  CouponFormData,
  DISCOUNT_TYPE_LABELS,
  APPLICABLE_TO_LABELS,
  SUBSCRIPTION_PLAN_LABELS,
} from '@/schemas/couponSchemas';
import { useRouter } from 'next/navigation';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/useToast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/shadcn/utils';
import { UserMultiSelect } from './UserMultiSelect';
import { EmailImport } from './EmailImport';

interface InitialUser {
  id: number;
  name: string;
  email: string;
  type: 'NANNY' | 'FAMILY';
}

type CouponFormProps = {
  defaultValues?: Partial<CouponFormData>;
  couponId?: string;
  mode: 'create' | 'edit';
  initialUsers?: InitialUser[];
};

const SUBSCRIPTION_PLANS = [
  'FAMILY_MONTHLY',
  'FAMILY_QUARTERLY',
  'NANNY_PREMIUM_MONTHLY',
  'NANNY_PREMIUM_YEARLY',
];

export function CouponForm({
  defaultValues,
  couponId,
  mode,
  initialUsers = [],
}: CouponFormProps) {
  const router = useRouter();
  const [restrictionTab, setRestrictionTab] = useState<'users' | 'emails'>(
    'users',
  );

  const form = useForm<CouponFormData>({
    resolver: zodResolver(CouponFormSchema),
    defaultValues: {
      code: defaultValues?.code || '',
      description: defaultValues?.description || '',
      discountType: defaultValues?.discountType || 'PERCENTAGE',
      discountValue: defaultValues?.discountValue || 0,
      maxDiscount: defaultValues?.maxDiscount || null,
      minPurchaseAmount: defaultValues?.minPurchaseAmount || null,
      usageLimit: defaultValues?.usageLimit || null,
      applicableTo: defaultValues?.applicableTo || 'ALL',
      applicablePlanIds: defaultValues?.applicablePlanIds || [],
      hasUserRestriction: defaultValues?.hasUserRestriction || false,
      allowedUserIds: defaultValues?.allowedUserIds || {
        nannyIds: [],
        familyIds: [],
      },
      allowedEmails: defaultValues?.allowedEmails || [],
      startDate: defaultValues?.startDate
        ? new Date(defaultValues.startDate)
        : new Date(),
      endDate: defaultValues?.endDate
        ? new Date(defaultValues.endDate)
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isActive: defaultValues?.isActive ?? true,
      requiresCreditCard: defaultValues?.requiresCreditCard ?? true,
    },
  });

  const watchDiscountType = form.watch('discountType');
  const watchApplicableTo = form.watch('applicableTo');
  const watchHasUserRestriction = form.watch('hasUserRestriction');

  async function onSubmit(data: CouponFormData) {
    try {
      if (mode === 'create') {
        const response = await fetch('/api/coupons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Erro ao criar cupom');
        }

        toast({
          variant: 'success',
          title: 'Cupom criado com sucesso',
          description: `O cupom ${data.code} foi criado.`,
        });
      } else {
        const response = await fetch(`/api/coupons/${couponId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Erro ao atualizar cupom');
        }

        toast({
          variant: 'success',
          title: 'Cupom atualizado com sucesso',
          description: 'As alterações foram salvas.',
        });
      }

      router.push('/coupons');
      router.refresh();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: mode === 'create' ? 'Erro ao criar cupom' : 'Erro ao atualizar cupom',
        description:
          error instanceof Error ? error.message : 'Ocorreu um erro inesperado.',
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações do Cupom</CardTitle>
            <CardDescription>
              Configure o código e descrição do cupom
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código do Cupom</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="PROMO20"
                      {...field}
                      onChange={(e) =>
                        field.onChange(e.target.value.toUpperCase())
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    Código que os usuários vão digitar (será convertido para maiúsculas)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descrição interna do cupom..."
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormDescription>
                    Descrição para uso interno, não será exibida aos usuários
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Cupom Ativo</FormLabel>
                    <FormDescription>
                      Cupons inativos não podem ser utilizados
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tipo de Desconto</CardTitle>
            <CardDescription>
              Defina o tipo e valor do desconto
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="discountType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Tipo de Desconto</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      {Object.entries(DISCOUNT_TYPE_LABELS).map(
                        ([value, label]) => (
                          <div
                            key={value}
                            className="flex items-center space-x-3 space-y-0"
                          >
                            <RadioGroupItem value={value} id={value} />
                            <Label htmlFor={value}>{label}</Label>
                          </div>
                        )
                      )}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="discountValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {watchDiscountType === 'FREE_TRIAL_DAYS'
                      ? 'Número de Dias'
                      : `Valor do Desconto ${watchDiscountType === 'PERCENTAGE' ? '(%)' : '(R$)'}`}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step={watchDiscountType === 'PERCENTAGE' ? '1' : watchDiscountType === 'FREE_TRIAL_DAYS' ? '1' : '0.01'}
                      min={watchDiscountType === 'FREE_TRIAL_DAYS' ? '1' : '0'}
                      max={watchDiscountType === 'PERCENTAGE' ? '100' : watchDiscountType === 'FREE_TRIAL_DAYS' ? '365' : undefined}
                      placeholder={
                        watchDiscountType === 'PERCENTAGE' ? '20' : watchDiscountType === 'FREE_TRIAL_DAYS' ? '30' : '10.00'
                      }
                      {...field}
                      onChange={(e) => field.onChange(watchDiscountType === 'FREE_TRIAL_DAYS' ? parseInt(e.target.value) || 0 : parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  {watchDiscountType === 'FREE_TRIAL_DAYS' && (
                    <FormDescription>
                      Número de dias de teste grátis (ex: 30, 60, 90)
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchDiscountType === 'PERCENTAGE' && (
              <FormField
                control={form.control}
                name="maxDiscount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Desconto Máximo (R$) - Opcional</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="50.00"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? parseFloat(e.target.value) : null
                          )
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      Limite máximo do desconto em reais (ex: 20% até R$ 50)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {watchDiscountType === 'FREE_TRIAL_DAYS' && (
              <FormField
                control={form.control}
                name="requiresCreditCard"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Requer cartão de crédito
                      </FormLabel>
                      <FormDescription>
                        Se desativado, o usuário pode ativar o trial sem informar
                        cartão de crédito. A assinatura expira automaticamente ao
                        final do período.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}

            {watchDiscountType !== 'FREE_TRIAL_DAYS' && (
              <FormField
                control={form.control}
                name="minPurchaseAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Mínimo de Compra (R$) - Opcional</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? parseFloat(e.target.value) : null
                          )
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      Valor mínimo da compra para o cupom ser válido
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Restrições de Uso</CardTitle>
            <CardDescription>
              Defina quem pode usar e quantas vezes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="usageLimit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Limite de Usos - Opcional</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      placeholder="Ilimitado"
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? parseInt(e.target.value) : null
                        )
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    Número máximo de vezes que o cupom pode ser usado (vazio = ilimitado)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="applicableTo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Aplicável a</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione quem pode usar" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(APPLICABLE_TO_LABELS).map(
                        ([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchApplicableTo === 'SPECIFIC_PLAN' && (
              <FormField
                control={form.control}
                name="applicablePlanIds"
                render={() => (
                  <FormItem>
                    <FormLabel>Planos Aplicáveis</FormLabel>
                    <div className="space-y-2">
                      {SUBSCRIPTION_PLANS.map((plan) => (
                        <FormField
                          key={plan}
                          control={form.control}
                          name="applicablePlanIds"
                          render={({ field }) => (
                            <FormItem
                              key={plan}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(plan)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, plan])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== plan
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {SUBSCRIPTION_PLAN_LABELS[plan] || plan}
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Restrição de Usuários</CardTitle>
            <CardDescription>
              Limite quais usuários podem usar este cupom
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="hasUserRestriction"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Restringir a usuários específicos
                    </FormLabel>
                    <FormDescription>
                      Apenas usuários selecionados poderão usar este cupom
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {watchHasUserRestriction && (
              <div className="space-y-4">
                {/* Tabs para alternar entre usuários e e-mails */}
                <div className="flex gap-2 border-b pb-2">
                  <button
                    type="button"
                    onClick={() => setRestrictionTab('users')}
                    className={cn(
                      'px-4 py-2 text-sm font-medium transition-colors',
                      restrictionTab === 'users'
                        ? 'border-b-2 border-fuchsia-500 text-fuchsia-600'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    Selecionar usuários
                  </button>
                  <button
                    type="button"
                    onClick={() => setRestrictionTab('emails')}
                    className={cn(
                      'px-4 py-2 text-sm font-medium transition-colors',
                      restrictionTab === 'emails'
                        ? 'border-b-2 border-fuchsia-500 text-fuchsia-600'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    Importar e-mails
                  </button>
                </div>

                {/* Conteúdo das tabs */}
                {restrictionTab === 'users' && (
                  <FormField
                    control={form.control}
                    name="allowedUserIds"
                    render={({ field }) => (
                      <FormItem>
                        <FormDescription>
                          Busque e selecione babás e famílias cadastradas no
                          sistema
                        </FormDescription>
                        <FormControl>
                          <UserMultiSelect
                            selectedNannies={field.value?.nannyIds || []}
                            selectedFamilies={field.value?.familyIds || []}
                            onNanniesChange={(ids) =>
                              field.onChange({
                                ...field.value,
                                nannyIds: ids,
                              })
                            }
                            onFamiliesChange={(ids) =>
                              field.onChange({
                                ...field.value,
                                familyIds: ids,
                              })
                            }
                            initialUsers={initialUsers}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {restrictionTab === 'emails' && (
                  <FormField
                    control={form.control}
                    name="allowedEmails"
                    render={({ field }) => (
                      <FormItem>
                        <FormDescription>
                          Importe e-mails de usuários que ainda não têm conta
                          (pré-cadastros)
                        </FormDescription>
                        <FormControl>
                          <EmailImport
                            emails={field.value || []}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Período de Validade</CardTitle>
            <CardDescription>
              Defina quando o cupom estará ativo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Início</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        {...field}
                        value={
                          field.value
                            ? new Date(field.value).toISOString().slice(0, 16)
                            : ''
                        }
                        onChange={(e) =>
                          field.onChange(new Date(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Término</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        {...field}
                        value={
                          field.value
                            ? new Date(field.value).toISOString().slice(0, 16)
                            : ''
                        }
                        onChange={(e) =>
                          field.onChange(new Date(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/coupons')}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting
              ? mode === 'create'
                ? 'Criando...'
                : 'Salvando...'
              : mode === 'create'
                ? 'Criar cupom'
                : 'Salvar alterações'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
