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
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { brazilianStates } from '@/constants/brazilianStates';
import { maskAlphanumeric } from '@/utils/maskAlphanumeric';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import React, { useState } from 'react';
import { toast } from '@/hooks/useToast';
import { parseDateToBR } from '@/utils/parseDateToBR';
import { ArrowRightIcon, PlusIcon, TrashIcon } from '@phosphor-icons/react';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { z } from 'zod';
import { getFamilyById, updateFamily } from '@/services/familyService';
import Link from 'next/link';
import {
  FAMILY_NANNY_TYPE_OPTIONS,
  FAMILY_CONTRACT_REGIME_OPTIONS,
  RESPONSIBLE_GENDER_OPTIONS,
} from '@/constants/familyOptions';

// Form schema for family with children
const FormFamilyWithChildrenSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  phoneNumber: z.string().optional().nullable(),
  emailAddress: z.string().email('E-mail inválido').optional().nullable().or(z.literal('')),
  status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING', 'DELETED']).default('ACTIVE'),
  // New fields
  cpf: z.string().optional().nullable(),
  birthDate: z.string().optional().nullable(),
  gender: z.enum(['FEMALE', 'MALE', 'OTHER', '']).optional().nullable(),
  // Job fields
  nannyType: z.enum(['FOLGUISTA', 'DIARISTA', 'MENSALISTA', '']).optional().nullable(),
  contractRegime: z.enum(['AUTONOMA', 'PJ', 'CLT', '']).optional().nullable(),
  familyPresentation: z.string().optional().nullable(),
  jobDescription: z.string().optional().nullable(),
  // Address
  address: z
    .object({
      zipCode: z.string().optional(),
      street: z.string().optional(),
      number: z.string().optional(),
      complement: z.string().optional().nullable(),
      neighborhood: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
    })
    .optional()
    .nullable(),
  children: z.array(
    z.object({
      id: z.number().optional(),
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

export default function EditFamilyPage() {
  const { id } = useParams();
  const router = useRouter();
  const [family, setFamily] = useState<any>(null);

  const form = useForm<FormFamilyWithChildren>({
    resolver: zodResolver(FormFamilyWithChildrenSchema),
    defaultValues: async () => {
      const familyData = await getFamilyById(Number(id));

      if (!familyData) {
        router.push('/404');
        return {} as FormFamilyWithChildren;
      }

      setFamily(familyData);

      return {
        name: familyData.name || '',
        phoneNumber: familyData.phoneNumber || '',
        emailAddress: familyData.emailAddress || '',
        status: familyData.status || 'ACTIVE',
        // New fields
        cpf: familyData.cpf || '',
        birthDate: familyData.birthDate
          ? parseDateToBR(
              new Date(familyData.birthDate).toISOString().split('T')[0],
            )
          : '',
        gender: familyData.gender || '',
        // Job fields
        nannyType: familyData.nannyType || '',
        contractRegime: familyData.contractRegime || '',
        familyPresentation: familyData.familyPresentation || '',
        jobDescription: familyData.jobDescription || '',
        // Address
        address: familyData.address ? {
          zipCode: familyData.address.zipCode ? maskAlphanumeric(familyData.address.zipCode, '#####-###') : '',
          street: familyData.address.streetName || '',
          number: familyData.address.number || '',
          complement: familyData.address.complement || '',
          neighborhood: familyData.address.neighborhood || '',
          city: familyData.address.city || '',
          state: familyData.address.state || '',
        } : {
          zipCode: '',
          street: '',
          number: '',
          complement: '',
          neighborhood: '',
          city: '',
          state: '',
        },
        children: familyData.children?.map((child: any) => ({
          id: child.id,
          name: child.name,
          birthDate: child.birthDate
            ? parseDateToBR(
                typeof child.birthDate === 'string'
                  ? child.birthDate.split('T')[0]
                  : child.birthDate.toISOString().split('T')[0],
              )
            : '',
          gender: child.gender || '',
          allergies: child.allergies || '',
          specialNeeds: child.specialNeeds || '',
          notes: child.notes || '',
        })) || [],
      } as FormFamilyWithChildren;
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'children',
  });

  async function onSubmit(data: FormFamilyWithChildren) {
    try {
      await updateFamily(Number(id), data);
      toast({
        variant: 'success',
        title: 'Família atualizada',
        description: 'A família foi atualizada com sucesso.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar família',
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
    <PageContent title={`Editar: ${family?.name || 'Família'}`}>
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
                Dados da família
              </TabsTrigger>
              <TabsTrigger
                value="address"
                className="w-full justify-start font-medium"
              >
                Endereço
              </TabsTrigger>
              <TabsTrigger
                value="children"
                className="w-full justify-start font-medium"
              >
                Crianças
              </TabsTrigger>
              <TabsTrigger
                value="job"
                className="w-full justify-start font-medium"
              >
                Vaga
              </TabsTrigger>
              <Separator className="my-2" />
              <TabsTrigger
                value="profile"
                className="group w-full justify-start font-medium"
                asChild
              >
                <Link href={`/families/${id}`}>
                  Ver perfil <ArrowRightIcon className="ml-2 size-4 transition-all duration-500 group-hover:ml-3.5" />
                </Link>
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

                <div className="fixed bottom-0 right-0 m-8">
                  <Button type="submit" className="mt-4" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? 'Editando...' : 'Editar'}
                  </Button>
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
                        <FormLabel>Rua</FormLabel>
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
                        <FormLabel isOptional>Bairro</FormLabel>
                        <FormControl>
                          <Input placeholder="Bairro Exemplo" {...field} value={field.value || ''} />
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
                        <FormLabel isOptional>Cidade</FormLabel>
                        <FormControl>
                          <Input placeholder="Cidade Exemplo" {...field} value={field.value || ''} />
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
                        <FormLabel isOptional>Estado</FormLabel>
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

                <div className="fixed bottom-0 right-0 m-8">
                  <Button type="submit" className="mt-4" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? 'Editando...' : 'Editar'}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="children">
                <div className="mb-4 grid gap-4">
                  {fields.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      Nenhuma criança adicionada ainda. Clique no botão abaixo para adicionar.
                    </p>
                  ) : (
                    fields.map((fieldItem, index) => (
                      <React.Fragment key={fieldItem.id}>
                        <Card>
                          <CardContent className="grid gap-4 pt-6">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">Criança {index + 1}</h4>
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
                                  <FormLabel>Nome da criança</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="João Pedro"
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
                                      placeholder="Liste as alergias da criança"
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
                                  <FormLabel isOptional>Observações</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      placeholder="Outras observações importantes"
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
                  <PlusIcon /> Adicionar criança
                </Button>

                <div className="fixed bottom-0 right-0 m-8">
                  <Button type="submit" className="mt-4" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? 'Editando...' : 'Editar'}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="job">
                <div className="grid gap-4">
                  <FormField
                    name="cpf"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel isOptional>CPF do responsável</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="000.000.000-00"
                            {...field}
                            value={field.value || ''}
                            onChange={(e) =>
                              form.setValue(
                                'cpf',
                                maskAlphanumeric(e.target.value, '###.###.###-##'),
                              )
                            }
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
                            placeholder="05/11/1985"
                            {...field}
                            value={field.value || ''}
                            onChange={(e) => {
                              const maskedValue = maskAlphanumeric(
                                e.target.value,
                                '##/##/####',
                              );
                              form.setValue('birthDate', maskedValue);
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
                        <FormLabel isOptional>Gênero do responsável</FormLabel>
                        <Select
                          onValueChange={(value) =>
                            field.onChange(value === 'NONE' ? null : value)
                          }
                          value={field.value ?? 'NONE'}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="NONE">Nenhum</SelectItem>
                            {RESPONSIBLE_GENDER_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Separator className="my-2" />

                  <FormField
                    name="nannyType"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel isOptional>Tipo de babá</FormLabel>
                        <Select
                          onValueChange={(value) =>
                            field.onChange(value === 'NONE' ? null : value)
                          }
                          value={field.value ?? 'NONE'}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="NONE">Nenhum</SelectItem>
                            {FAMILY_NANNY_TYPE_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="contractRegime"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel isOptional>Regime de contratação</FormLabel>
                        <Select
                          onValueChange={(value) =>
                            field.onChange(value === 'NONE' ? null : value)
                          }
                          value={field.value ?? 'NONE'}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="NONE">Nenhum</SelectItem>
                            {FAMILY_CONTRACT_REGIME_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Separator className="my-2" />

                  <FormField
                    name="familyPresentation"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel isOptional>Apresentação da família</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Texto de apresentação da família..."
                            {...field}
                            value={field.value || ''}
                            rows={4}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="jobDescription"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel isOptional>Descrição da vaga</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Descrição detalhada da vaga..."
                            {...field}
                            value={field.value || ''}
                            rows={6}
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
