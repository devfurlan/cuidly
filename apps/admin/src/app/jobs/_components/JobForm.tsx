'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toast } from '@/hooks/useToast';
import { JOB_STATUS_LABELS } from '../schema';
import { JobStatus } from '@prisma/client';

const JobFormSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'PAUSED', 'CLOSED']),
  moderationReason: z.string().optional(),
});

type JobFormData = z.infer<typeof JobFormSchema>;

interface JobFormProps {
  mode: 'edit';
  jobId: number;
  defaultValues: {
    title: string;
    description: string | null;
    status: JobStatus;
  };
}

export function JobForm({ jobId, defaultValues }: JobFormProps) {
  const router = useRouter();

  const form = useForm<JobFormData>({
    resolver: zodResolver(JobFormSchema),
    defaultValues: {
      title: defaultValues.title,
      description: defaultValues.description || '',
      status: defaultValues.status,
      moderationReason: '',
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit(data: JobFormData) {
    try {
      const response = await fetch(`/api/admin/jobs/${jobId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao atualizar vaga');
      }

      toast({
        variant: 'success',
        title: 'Vaga atualizada',
        description: 'As alteracoes foram salvas com sucesso.',
      });

      router.push(`/jobs/${jobId}`);
      router.refresh();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar vaga',
        description:
          error instanceof Error ? error.message : 'Por favor, tente novamente.',
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações da Vaga</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Título da vaga" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descrição da vaga"
                      rows={5}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(JOB_STATUS_LABELS).map(([value, label]) => (
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Auditoria</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="moderationReason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motivo da alteracao (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Informe o motivo da moderacao ou alteracao..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : 'Salvar alteracoes'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
