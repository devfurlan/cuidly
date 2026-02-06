'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  CreatePlanSchema,
  CreatePlanData,
  PLAN_TYPE_LABELS,
  BILLING_CYCLE_LABELS,
  FEATURE_LABELS,
  DEFAULT_FEATURES,
  PlanFeatures,
} from '@/schemas/planSchemas';
import { CurrencyInput } from '@/components/CurrencyInput';

interface PlanFormProps {
  plan?: {
    id: number;
    name: string;
    type: 'FAMILY' | 'NANNY';
    price: number;
    billingCycle: 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'ONE_TIME';
    features: PlanFeatures;
    isActive: boolean;
  };
}

export function PlanForm({ plan }: PlanFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!plan;

  const form = useForm<CreatePlanData>({
    resolver: zodResolver(CreatePlanSchema),
    defaultValues: {
      name: plan?.name || '',
      type: plan?.type || 'FAMILY',
      price: plan?.price || 0,
      billingCycle: plan?.billingCycle || 'MONTHLY',
      features: plan?.features || DEFAULT_FEATURES,
      isActive: plan?.isActive ?? true,
    },
  });

  const onSubmit = async (data: CreatePlanData) => {
    setIsSubmitting(true);
    try {
      const url = isEditing
        ? `/api/admin/plans/${plan.id}`
        : '/api/admin/plans';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao salvar plano');
      }

      toast.success(isEditing ? 'Plano atualizado com sucesso!' : 'Plano criado com sucesso!');
      router.push('/plans/manage');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar plano');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Informações Básicas */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Plano</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Premium Mensal" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(PLAN_TYPE_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Define se o plano e para familias ou babas
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="billingCycle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ciclo de Cobranca</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o ciclo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(BILLING_CYCLE_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preco (R$)</FormLabel>
                    <FormControl>
                      <CurrencyInput
                        value={field.value}
                        onChange={(value) => field.onChange(value)}
                        placeholder="0,00"
                      />
                    </FormControl>
                    <FormDescription>
                      Valor cobrado por ciclo de cobranca
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Plano Ativo</FormLabel>
                      <FormDescription>
                        Planos inativos não aparecem para novos usuários
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Features Numericas */}
        <Card>
          <CardHeader>
            <CardTitle>Limites e Quantidades</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="features.viewProfiles"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{FEATURE_LABELS.viewProfiles.label}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      {FEATURE_LABELS.viewProfiles.description}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="features.startConversations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{FEATURE_LABELS.startConversations.label}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      {FEATURE_LABELS.startConversations.description}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="features.boostPerMonth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{FEATURE_LABELS.boostPerMonth.label}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      {FEATURE_LABELS.boostPerMonth.description}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Features Booleanas */}
        <Card>
          <CardHeader>
            <CardTitle>Recursos do Plano</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="features.accessPhone"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>{FEATURE_LABELS.accessPhone.label}</FormLabel>
                      <FormDescription className="text-xs">
                        {FEATURE_LABELS.accessPhone.description}
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="features.accessWhatsapp"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>{FEATURE_LABELS.accessWhatsapp.label}</FormLabel>
                      <FormDescription className="text-xs">
                        {FEATURE_LABELS.accessWhatsapp.description}
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="features.accessChat"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>{FEATURE_LABELS.accessChat.label}</FormLabel>
                      <FormDescription className="text-xs">
                        {FEATURE_LABELS.accessChat.description}
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="features.highlightInSearch"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>{FEATURE_LABELS.highlightInSearch.label}</FormLabel>
                      <FormDescription className="text-xs">
                        {FEATURE_LABELS.highlightInSearch.description}
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="features.prioritySupport"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>{FEATURE_LABELS.prioritySupport.label}</FormLabel>
                      <FormDescription className="text-xs">
                        {FEATURE_LABELS.prioritySupport.description}
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="features.unlimitedSearches"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>{FEATURE_LABELS.unlimitedSearches.label}</FormLabel>
                      <FormDescription className="text-xs">
                        {FEATURE_LABELS.unlimitedSearches.description}
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Separator />

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/plans/manage')}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? 'Salvando...'
              : isEditing
              ? 'Atualizar Plano'
              : 'Criar Plano'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
