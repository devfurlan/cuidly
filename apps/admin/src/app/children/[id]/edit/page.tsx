'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import PageContent from '@/components/layout/PageContent';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { maskAlphanumeric } from '@/utils/maskAlphanumeric';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import { toast } from '@/hooks/useToast';
import { parseDateToBR } from '@/utils/parseDateToBR';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ArrowRightIcon } from '@phosphor-icons/react';
import Link from 'next/link';
import { FormChildSchema, FormChild } from '@/schemas/childSchemas';
import { getChildById, updateChild } from '@/services/childService';

export default function EditChildPage() {
  const { id } = useParams();
  const router = useRouter();
  const [child, setChild] = useState<any>(null);

  const form = useForm<FormChild>({
    resolver: zodResolver(FormChildSchema),
    defaultValues: async () => {
      const childData = await getChildById(Number(id));

      if (!childData) {
        router.push('/404');
        return {} as FormChild;
      }

      setChild(childData);

      return {
        name: childData.name || '',
        birthDate: childData.birthDate
          ? parseDateToBR(
              new Date(childData.birthDate).toISOString().split('T')[0],
            )
          : '',
        gender: childData.gender || '',
        status: childData.status || 'ACTIVE',
        allergies: childData.allergies || '',
        specialNeeds: childData.specialNeeds || '',
        notes: childData.notes || '',
      } as FormChild;
    },
  });

  async function onSubmit(data: FormChild) {
    try {
      await updateChild(Number(id), data);
      toast({
        variant: 'success',
        title: 'Crianca atualizada',
        description: 'Os dados da crianca foram atualizados com sucesso.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar crianca',
        description:
          error instanceof Error
            ? error.message
            : 'Por favor, tente novamente.',
      });
    }
  }

  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'personal-data';
  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('tab', value);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  return (
    <PageContent title={`Editar: ${child?.name || 'Crianca'}`}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Tabs
            className="mb-8 flex w-full items-start gap-8"
            defaultValue="personal-data"
            value={currentTab}
            onValueChange={handleTabChange}
          >
            <TabsList className="flex h-auto w-[320px] flex-col justify-start">
              <TabsTrigger
                value="personal-data"
                className="w-full justify-start font-medium"
              >
                Dados pessoais
              </TabsTrigger>
              <TabsTrigger
                value="health-data"
                className="w-full justify-start font-medium"
              >
                Saude e observacoes
              </TabsTrigger>
              <Separator className="my-2" />
              <TabsTrigger
                value="view"
                className="group w-full justify-start font-medium"
                asChild
              >
                <Link href={`/children/${id}`}>
                  Ver perfil <ArrowRightIcon className="ml-2 size-4 transition-all duration-500 group-hover:ml-3.5" />
                </Link>
              </TabsTrigger>
            </TabsList>

            <div className="w-full md:w-1/2 md:max-w-[600px]">
              <TabsContent value="personal-data">
                <div className="grid gap-4">
                  <FormField
                    name="name"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome da crianca</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Joao Pedro"
                            {...field}
                            required
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="birthDate"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel isOptional>Data de nascimento</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="05/11/2020"
                            {...field}
                            onChange={(e) => {
                              const maskedValue = maskAlphanumeric(
                                e.target.value,
                                '##/##/####',
                              );
                              field.onChange(maskedValue);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="gender"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel isOptional>Sexo</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={(value) =>
                              field.onChange(value === 'NONE' ? null : value)
                            }
                            value={field.value ?? 'NONE'}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="NONE">Nenhum</SelectItem>
                              <SelectItem value="MALE">Masculino</SelectItem>
                              <SelectItem value="FEMALE">Feminino</SelectItem>
                              <SelectItem value="OTHER">Outro</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="status"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ACTIVE">Ativo</SelectItem>
                              <SelectItem value="PENDING">Pendente</SelectItem>
                              <SelectItem value="INACTIVE">Inativo</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="fixed bottom-0 right-0 m-8">
                  <Button type="submit" className="mt-4" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? 'Editando...' : 'Editar'}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="health-data">
                <div className="grid gap-4">
                  <FormField
                    name="allergies"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel isOptional>Alergias</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Liste as alergias da crianca (alimentos, medicamentos, etc)"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="specialNeeds"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel isOptional>Necessidades especiais</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Descreva necessidades especiais ou condicoes de saude"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="notes"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel isOptional>Observações gerais</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Outras informações importantes sobre a criança"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="fixed bottom-0 right-0 m-8">
                  <Button type="submit" className="mt-4" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? 'Editando...' : 'Editar'}
                  </Button>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </form>
      </Form>
    </PageContent>
  );
}
