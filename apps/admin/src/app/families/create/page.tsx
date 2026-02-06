'use client';

import { useForm, useFieldArray } from 'react-hook-form';
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
import { useRouter, useSearchParams } from 'next/navigation';
import { brazilianStates } from '@/constants/brazilianStates';
import { maskAlphanumeric } from '@/utils/maskAlphanumeric';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import React from 'react';
import { toast } from '@/hooks/useToast';
import { PlusIcon, TrashIcon } from '@phosphor-icons/react';
import { Textarea } from '@/components/ui/textarea';
import { z } from 'zod';
import { createFamily } from '../../../services/familyService';

// Form schema for family with children
const FormFamilyWithChildrenSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  phoneNumber: z.string().optional().nullable(),
  emailAddress: z.string().email('E-mail inválido').optional().nullable().or(z.literal('')),
  status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING', 'DELETED']).default('ACTIVE'),
  address: z
    .object({
      zipCode: z.string().min(8, 'CEP inválido'),
      street: z.string().optional(),
      number: z.string().optional(),
      complement: z.string().optional().nullable(),
      neighborhood: z.string().min(2, 'Bairro inválido'),
      city: z.string().min(2, 'Cidade inválida'),
      state: z.string().length(2, 'Estado deve ter 2 letras'),
    })
    .optional()
    .nullable(),
  children: z.array(
    z.object({
      name: z.string().min(2, 'Nome da criança é obrigatório'),
      birthDate: z.string().optional(),
      gender: z.enum(['MALE', 'FEMALE', 'OTHER', '']).optional().nullable(),
      allergies: z.string().optional(),
      specialNeeds: z.string().optional(),
      notes: z.string().optional(),
    }),
  ).optional(),
});

type FormFamilyWithChildren = z.infer<typeof FormFamilyWithChildrenSchema>;

export default function CreateFamilyPage() {
  const router = useRouter();
  const form = useForm<FormFamilyWithChildren>({
    resolver: zodResolver(FormFamilyWithChildrenSchema),
    defaultValues: {
      name: '',
      phoneNumber: '',
      emailAddress: '',
      status: 'ACTIVE',
      address: {
        zipCode: '',
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: '',
      },
      children: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'children',
  });

  async function onSubmit(data: FormFamilyWithChildren) {
    try {
      await createFamily(data);
      toast({
        variant: 'success',
        title: 'Família criada',
        description: 'A família foi criada com sucesso.',
      });
      router.push('/families');
      router.refresh();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao criar família',
        description:
          error instanceof Error
            ? error.message
            : 'Por favor, tente novamente.',
      });
    }
  }

  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'family-data';
  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('tab', value);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  return (
    <PageContent title="Adicionar familia">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Tabs
            className="mb-8 flex w-full items-start gap-8"
            defaultValue="family-data"
            value={currentTab}
            onValueChange={handleTabChange}
          >
            <TabsList className="flex h-auto w-[320px] flex-col justify-start">
              <TabsTrigger
                value="family-data"
                className="w-full justify-start font-medium"
              >
                Dados da familia
              </TabsTrigger>
              <TabsTrigger
                value="address"
                className="w-full justify-start font-medium"
              >
                Endereco
              </TabsTrigger>
              <TabsTrigger
                value="children"
                className="w-full justify-start font-medium"
              >
                Criancas
              </TabsTrigger>
            </TabsList>

            <div className="w-full md:w-1/2 md:max-w-[600px]">
              <TabsContent value="family-data">
                <div className="grid gap-4">
                  <FormField
                    name="name"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome da família</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Família Silva"
                            {...field}
                            required
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="phoneNumber"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel isOptional>Telefone</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="(11) 91234-5678"
                            {...field}
                            value={field.value || ''}
                            onChange={(e) =>
                              form.setValue(
                                'phoneNumber',
                                maskAlphanumeric(
                                  e.target.value,
                                  '(##) #####-####',
                                ),
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="emailAddress"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel isOptional>E-mail</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="família@email.com"
                            {...field}
                            value={field.value || ''}
                            type="email"
                          />
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
              </TabsContent>

              <TabsContent value="address">
                <div className="grid gap-4">
                  <FormField
                    name="address.zipCode"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CEP</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="12345-678"
                            {...field}
                            value={field.value || ''}
                            onChange={(e) =>
                              form.setValue(
                                'address.zipCode',
                                maskAlphanumeric(e.target.value, '#####-###'),
                              )
                            }
                            onBlur={async (e) => {
                              const cep = e.target.value.replace(/\D/g, '');
                              if (cep.length === 8) {
                                try {
                                  const response = await fetch(
                                    `https://brasilapi.com.br/api/cep/v2/${cep}`,
                                  );
                                  if (response.ok) {
                                    const data = await response.json();
                                    form.setValue('address.street', data.street);
                                    form.setValue('address.neighborhood', data.neighborhood);
                                    form.setValue('address.city', data.city);
                                    form.setValue('address.state', data.state);
                                  }
                                } catch (error) {
                                  console.error('Error fetching address data:', error);
                                }
                              }
                            }}
                            required
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="address.street"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel isOptional>Rua</FormLabel>
                        <FormControl>
                          <Input placeholder="Rua Exemplo" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="address.number"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel isOptional>Número</FormLabel>
                        <FormControl>
                          <Input placeholder="123" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="address.complement"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel isOptional>Complemento</FormLabel>
                        <FormControl>
                          <Input placeholder="Apto 101" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="address.neighborhood"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bairro</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Bairro Exemplo"
                            {...field}
                            value={field.value || ''}
                            required
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="address.city"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cidade</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Cidade Exemplo"
                            {...field}
                            value={field.value || ''}
                            required
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="address.state"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || ''}
                            defaultValue={field.value || ''}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um estado" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(brazilianStates).map(
                                ([key, value]) => (
                                  <SelectItem key={key} value={key}>
                                    {value}
                                  </SelectItem>
                                ),
                              )}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="children">
                <div className="mb-4 grid gap-4">
                  {fields.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      Nenhuma crianca adicionada ainda. Clique no botao abaixo para adicionar.
                    </p>
                  ) : (
                    fields.map((fieldItem, index) => (
                      <React.Fragment key={fieldItem.id}>
                        <Card>
                          <CardContent className="grid gap-4 pt-6">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">Crianca {index + 1}</h4>
                              <Button
                                type="button"
                                variant="destructive"
                                size={'sm'}
                                onClick={() => remove(index)}
                              >
                                <TrashIcon />
                              </Button>
                            </div>

                            <FormField
                              name={`children.${index}.name` as const}
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
                              name={`children.${index}.birthDate` as const}
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
                                        form.setValue(
                                          `children.${index}.birthDate`,
                                          maskedValue,
                                        );
                                      }}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              name={`children.${index}.gender` as const}
                              control={form.control}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel isOptional>Sexo</FormLabel>
                                  <Select
                                    onValueChange={(value) =>
                                      field.onChange(value === 'NONE' ? null : value)
                                    }
                                    value={field.value ?? 'NONE'}
                                    defaultValue={field.value || ''}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Selecione um sexo" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="NONE">Nenhum</SelectItem>
                                      <SelectItem value="MALE">Masculino</SelectItem>
                                      <SelectItem value="FEMALE">Feminino</SelectItem>
                                      <SelectItem value="OTHER">Outro</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              name={`children.${index}.allergies` as const}
                              control={form.control}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel isOptional>Alergias</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      placeholder="Liste as alergias da crianca"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              name={`children.${index}.specialNeeds` as const}
                              control={form.control}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel isOptional>Necessidades especiais</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      placeholder="Descreva necessidades especiais"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              name={`children.${index}.notes` as const}
                              control={form.control}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel isOptional>Observacoes</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      placeholder="Outras observacoes importantes"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </CardContent>
                        </Card>
                      </React.Fragment>
                    ))
                  )}
                </div>

                <Button
                  type="button"
                  variant="secondary"
                  className="w-full"
                  onClick={() =>
                    append({
                      name: '',
                      birthDate: '',
                      gender: '',
                      allergies: '',
                      specialNeeds: '',
                      notes: '',
                    })
                  }
                >
                  <PlusIcon /> Adicionar crianca
                </Button>
              </TabsContent>
            </div>
          </Tabs>

          <div className="fixed bottom-0 right-0 m-8">
            <Button
              type="submit"
              className="mt-4"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? 'Adicionando...' : 'Adicionar'}
            </Button>
          </div>
        </form>
      </Form>
    </PageContent>
  );
}
