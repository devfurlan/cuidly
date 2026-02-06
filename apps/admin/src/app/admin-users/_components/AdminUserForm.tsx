'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormAdminUserSchema, FormAdminUser } from '@/schemas/adminUserSchemas';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/useToast';
import { PermissionsCheckboxGroup } from './PermissionsCheckboxGroup';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  WarningIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowClockwiseIcon,
} from '@phosphor-icons/react';
import { ALL_PERMISSIONS } from '@/lib/permissions';
import { convertBlobUrlToFile } from '@/utils/convertBlobUrlToFile';
import { uploadPublicImage, deleteFile } from '@/lib/supabase/storage/client';
import { formatSlug } from '@/utils/formatSlug';
import { PhotoUploadField } from '@/components/PhotoUploadField';
import { generatePassword } from '@/utils/generatePassword';

type AdminUserFormProps = {
  defaultValues?: Partial<FormAdminUser>;
  adminUserId?: string;
  isSuperAdmin?: boolean;
  mode: 'create' | 'edit';
};

export function AdminUserForm({
  defaultValues,
  adminUserId,
  isSuperAdmin = false,
  mode,
}: AdminUserFormProps) {
  const router = useRouter();
  // Keep imageUrl as relative path for consistency
  const [imageUrl, setImageUrl] = useState<string>(
    defaultValues?.photoUrl || '',
  );
  const [oldAvatarUrl, setOldAvatarUrl] = useState<string>(
    defaultValues?.photoUrl || '',
  );
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<FormAdminUser>({
    resolver: zodResolver(FormAdminUserSchema),
    defaultValues: {
      name: defaultValues?.name || '',
      email: defaultValues?.email || '',
      password: '',
      photoUrl: defaultValues?.photoUrl || '',
      permissions: defaultValues?.permissions || [],
      isSuperAdmin: defaultValues?.isSuperAdmin || false,
      status: defaultValues?.status || 'ACTIVE',
      notifyFailedPayments: defaultValues?.notifyFailedPayments ?? true,
    },
  });

  // Observar mudanças no campo isSuperAdmin
  const watchIsSuperAdmin = form.watch('isSuperAdmin');

  // Quando superadmin é marcado, marcar todas as permissões automaticamente
  useEffect(() => {
    if (watchIsSuperAdmin) {
      form.setValue('permissions', ALL_PERMISSIONS);
    }
  }, [watchIsSuperAdmin, form]);

  // Função para gerar senha aleatória
  const handleGeneratePassword = () => {
    const newPassword = generatePassword(12);
    form.setValue('password', newPassword);
    setShowPassword(true);
    toast({
      title: 'Senha gerada',
      description: 'Uma senha segura foi gerada automaticamente.',
    });
  };

  async function onSubmit(data: FormAdminUser) {
    let uploadedUrl = '';

    try {
      // Deletar foto antiga se uma nova foi selecionada
      if (
        oldAvatarUrl &&
        (imageUrl.startsWith('blob:') || imageUrl.startsWith('data:'))
      ) {
        try {
          await deleteFile(oldAvatarUrl);
        } catch (error) {
          console.error('Erro ao deletar avatar antigo:', error);
        }
      }

      // Upload da nova imagem
      if (
        imageUrl &&
        (imageUrl.startsWith('blob:') || imageUrl.startsWith('data:'))
      ) {
        const { file } = await convertBlobUrlToFile(imageUrl);

        const { imageUrl: newImageUrl, error } = await uploadPublicImage({
          file: file,
          folder: `admin-users/${formatSlug(data.name)}/`,
          nameCustom: 'avatar',
        });

        if (error) {
          console.error(error);
          toast({
            variant: 'destructive',
            title: 'Erro ao enviar imagem',
            description: 'Falha no upload da imagem. Tente novamente.',
          });
          return;
        }

        uploadedUrl = newImageUrl;
        data.photoUrl = uploadedUrl;
        // Keep imageUrl as relative path, not full URL
        setImageUrl(newImageUrl);
        setOldAvatarUrl(newImageUrl);
      } else if (
        !imageUrl.startsWith('blob:') &&
        !imageUrl.startsWith('data:')
      ) {
        // Mantém a URL existente se não foi alterada
        data.photoUrl = oldAvatarUrl;
        uploadedUrl = oldAvatarUrl;
      } else if (!imageUrl) {
        // Se removeu a foto
        data.photoUrl = '';
      }

      if (mode === 'create') {
        if (!data.password) {
          toast({
            variant: 'destructive',
            title: 'Senha é obrigatória',
            description: 'Por favor, informe uma senha para o novo usuário.',
          });
          return;
        }

        const response = await fetch('/api/admin-users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Erro ao criar usuário');
        }

        toast({
          variant: 'success',
          title: 'Usuário criado com sucesso',
          description: 'O novo administrador foi criado.',
        });
      } else {
        const response = await fetch(`/api/admin-users/${adminUserId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Erro ao atualizar usuário');
        }

        toast({
          variant: 'success',
          title: 'Usuário atualizado com sucesso',
          description: 'As alterações foram salvas.',
        });
      }

      router.push('/admin-users');
      router.refresh();
    } catch (error) {
      // Se houve erro e fez upload, deletar a nova imagem
      if (uploadedUrl) {
        await deleteFile(uploadedUrl);
      }

      toast({
        variant: 'destructive',
        title:
          mode === 'create'
            ? 'Erro ao criar usuário'
            : 'Erro ao atualizar usuário',
        description:
          error instanceof Error
            ? error.message
            : 'Ocorreu um erro inesperado.',
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {isSuperAdmin && mode === 'edit' && (
          <Alert variant="default" className="border-yellow-500 bg-yellow-50">
            <WarningIcon className="size-4 leading-none text-yellow-600!" />
            <AlertDescription className="mb-0 text-yellow-800">
              Este é um usuário <strong>superadmin</strong>. Não pode ser
              deletado e suas permissões não podem ser removidas.
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
            <CardDescription>
              Dados de identificação do administrador
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <PhotoUploadField
              imageUrl={imageUrl}
              onImageChange={setImageUrl}
              name={form.watch('name')}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome completo</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nome do administrador"
                      {...field}
                      disabled={isSuperAdmin && mode === 'edit'}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="email@exemplo.com"
                      {...field}
                      disabled={isSuperAdmin && mode === 'edit'}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {mode === 'create' ? 'Senha' : 'Nova senha (opcional)'}
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder={
                          mode === 'create'
                            ? 'Senha do usuário'
                            : 'Deixe em branco para não alterar'
                        }
                        {...field}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="size-4" />
                        ) : (
                          <EyeIcon className="size-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormDescription className="flex items-center justify-between">
                    <span>
                      {mode === 'create'
                        ? 'Senha deve ter no mínimo 6 caracteres'
                        : 'Apenas preencha se desejar alterar a senha atual'}
                    </span>
                    {mode === 'create' && (
                      <button
                        type="button"
                        onClick={handleGeneratePassword}
                        className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        <ArrowClockwiseIcon className="size-3" />
                        Gerar senha
                      </button>
                    )}
                  </FormDescription>
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
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isSuperAdmin && mode === 'edit'}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Ativo</SelectItem>
                      <SelectItem value="INACTIVE">Inativo</SelectItem>
                      <SelectItem value="SUSPENDED">Suspenso</SelectItem>
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
            <CardTitle>Permissões</CardTitle>
            <CardDescription>
              {watchIsSuperAdmin
                ? 'Superadmin tem acesso automático a todas as funcionalidades do sistema'
                : 'Selecione as funcionalidades que este administrador pode acessar'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="isSuperAdmin"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-blue-200 bg-blue-50 p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isSuperAdmin && mode === 'edit'}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <Label className="font-semibold text-blue-900">
                      Superadmin
                    </Label>
                    <FormDescription className="text-blue-800">
                      Usuário superadmin tem acesso total ao sistema
                      automaticamente e não pode ser editado ou deletado por
                      outros administradores.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="permissions"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <PermissionsCheckboxGroup
                      value={field.value}
                      onChange={field.onChange}
                      disabled={
                        (isSuperAdmin && mode === 'edit') || watchIsSuperAdmin
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notificações</CardTitle>
            <CardDescription>
              Configure quais notificações este administrador receberá por e-mail
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="notifyFailedPayments"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div
                    className="space-y-1 leading-none flex-1 cursor-pointer"
                    onClick={() => field.onChange(!field.value)}
                  >
                    <Label className="font-medium cursor-pointer">
                      Notificar sobre pagamentos que falharam
                    </Label>
                    <FormDescription>
                      Receber e-mail quando um pagamento falhar e precisar de atenção.
                      Esta notificação só é enviada para administradores com permissão de PAYMENTS.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin-users')}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting
              ? mode === 'create'
                ? 'Criando...'
                : 'Salvando...'
              : mode === 'create'
                ? 'Criar usuário'
                : 'Salvar alterações'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
