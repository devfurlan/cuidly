'use client';

/**
 * Unified Settings Page
 * /app/configuracoes
 *
 * Settings page that renders content based on user role (FAMILY or NANNY)
 * - Account: Email, password change
 * - Notifications: Toggle preferences (role-specific options)
 * - Privacy: Profile visibility, data export (LGPD), delete account
 */

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import {
  PiBell,
  PiEnvelope,
  PiLock,
  PiShieldCheck,
  PiTrash,
  PiWarningCircle,
} from 'react-icons/pi';

import { PasswordValidationIndicator } from '@/app/(auth)/cadastro/_components/PasswordValidationIndicator';
import { PageTitle } from '@/components/PageTitle';
import { PasswordInput } from '@/components/ui/PasswordInput';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/shadcn/alert-dialog';
import { Badge } from '@/components/ui/shadcn/badge';
import { Button } from '@/components/ui/shadcn/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/shadcn/card';
import { Input } from '@/components/ui/shadcn/input';
import { Label } from '@/components/ui/shadcn/label';
import { Skeleton } from '@/components/ui/shadcn/skeleton';
import { Switch } from '@/components/ui/shadcn/switch';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/shadcn/tabs';
import { useUser } from '@/contexts/UserContext';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';

interface SettingsData {
  email: string;
  // Notification preferences
  notifyNewMessages: boolean;
  notifyNewReviews: boolean;
  notifyNewJobs?: boolean; // nanny only
  notifyNewApplicants?: boolean; // family only
  // Privacy
  isProfilePublic: boolean;
}

export default function ConfiguracoesPage() {
  const { user } = useUser();
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');

  const isNanny = user?.role === 'NANNY';
  const isFamily = user?.role === 'FAMILY';

  // Handle tab change and update URL
  const handleTabChange = useCallback(
    (newTab: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('tab', newTab);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  // Settings state
  const [settings, setSettings] = useState<SettingsData>({
    email: user?.email || '',
    notifyNewMessages: true,
    notifyNewReviews: true,
    notifyNewJobs: true,
    notifyNewApplicants: true,
    isProfilePublic: true,
  });

  // Password change state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Delete account state
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Profile visibility state
  const [isSavingVisibility, setIsSavingVisibility] = useState(false);

  // Load nanny profile data (for isProfilePublic)
  const loadNannySettings = useCallback(async () => {
    if (!isNanny || !user?.nannyId) return;

    try {
      const response = await fetch(`/api/nannies/by-id/${user.nannyId}`);
      if (response.ok) {
        const data = await response.json();
        setSettings((prev) => ({
          ...prev,
          isProfilePublic: data.isProfilePublic ?? true,
        }));
      }
    } catch (error) {
      console.error('Error loading nanny settings:', error);
    }
  }, [isNanny, user?.nannyId]);

  useEffect(() => {
    loadNannySettings();
  }, [loadNannySettings]);

  // Password validation
  const hasMinLength = newPassword.length >= 8;
  const hasUpperCase = /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const passwordsMatch =
    newPassword === confirmPassword && newPassword.length > 0;
  const isPasswordValid =
    hasMinLength && hasUpperCase && hasNumber && passwordsMatch;

  // Handle password change
  const handleChangePassword = async () => {
    if (!isPasswordValid) return;

    setIsChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw error;
      }

      toast.success('Senha alterada com sucesso!');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Erro ao alterar senha. Tente novamente.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Handle profile visibility toggle
  const handleVisibilityChange = async (checked: boolean) => {
    if (!isNanny || !user?.nannyId) return;

    setSettings({ ...settings, isProfilePublic: checked });
    setIsSavingVisibility(true);

    try {
      const response = await fetch(`/api/nannies/by-id/${user.nannyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isProfilePublic: checked }),
      });

      if (!response.ok) {
        throw new Error('Erro ao salvar');
      }

      toast.success(
        checked
          ? 'Seu perfil está visível nas buscas'
          : 'Seu perfil foi ocultado das buscas',
      );
    } catch (error) {
      console.error('Error saving visibility:', error);
      setSettings({ ...settings, isProfilePublic: !checked });
      toast.error('Erro ao alterar visibilidade. Tente novamente.');
    } finally {
      setIsSavingVisibility(false);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'EXCLUIR') {
      toast.error('Digite EXCLUIR para confirmar');
      return;
    }

    setIsDeletingAccount(true);
    try {
      const response = await fetch('/api/user/delete-account', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erro ao excluir conta');
      }

      toast.success('Conta excluída com sucesso');
      await supabase.auth.signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Erro ao excluir conta. Tente novamente.');
    } finally {
      setIsDeletingAccount(false);
    }
  };

  // Loading state
  if (!user) {
    return (
      <>
        <PageTitle title="Configurações - Cuidly" />
        <div className="space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      </>
    );
  }

  return (
    <>
      <PageTitle title="Configurações - Cuidly" />
      <Tabs
        value={tabParam || 'conta'}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList variant="underline" className="mb-6">
          <TabsTrigger variant="underline" value="conta">
            Conta
          </TabsTrigger>
          <TabsTrigger variant="underline" value="notificacoes">
            Notificações
          </TabsTrigger>
          <TabsTrigger variant="underline" value="privacidade">
            Privacidade
          </TabsTrigger>
        </TabsList>

        {/* Tab: Conta */}
        <TabsContent variant="underline" value="conta" className="space-y-6">
          {/* Email */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PiEnvelope className="size-5" />
                E-mail
              </CardTitle>
              <CardDescription>
                Seu e-mail de acesso à plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user.email ?? ''}
                    disabled
                    className="mt-1"
                  />
                </div>
                <Badge variant="outline" className="mt-6">
                  Verificado
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PiLock className="size-5" />
                Alterar Senha
              </CardTitle>
              <CardDescription>
                Mantenha sua conta segura alterando sua senha periodicamente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nova senha</Label>
                <PasswordInput
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Digite sua nova senha"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
                <PasswordInput
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirme sua nova senha"
                />
              </div>

              {/* Password requirements */}
              {newPassword && (
                <div className="space-y-1 rounded-lg bg-gray-50 p-3">
                  <p className="mb-2 text-xs font-medium text-gray-700">
                    Requisitos da senha:
                  </p>
                  <PasswordValidationIndicator
                    isValid={hasMinLength}
                    label="Mínimo de 8 caracteres"
                  />
                  <PasswordValidationIndicator
                    isValid={hasUpperCase}
                    label="Pelo menos uma letra maiúscula"
                  />
                  <PasswordValidationIndicator
                    isValid={hasNumber}
                    label="Pelo menos um número"
                  />
                  <PasswordValidationIndicator
                    isValid={passwordsMatch}
                    label="As senhas coincidem"
                    variant={
                      confirmPassword && !passwordsMatch ? 'error' : 'default'
                    }
                  />
                </div>
              )}

              <Button
                onClick={handleChangePassword}
                disabled={!isPasswordValid || isChangingPassword}
              >
                {isChangingPassword ? 'Alterando...' : 'Alterar Senha'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Notificações */}
        <TabsContent
          variant="underline"
          value="notificacoes"
          className="space-y-6"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PiBell className="size-5" />
                Preferências de Notificação
              </CardTitle>
              <CardDescription>
                Escolha quais notificações você deseja receber por email
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Nanny-specific notifications */}
              {isNanny && (
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label className="text-base">Novas vagas compatíveis</Label>
                    <p className="text-sm text-gray-500">
                      Receba alertas quando novas vagas compatíveis com seu
                      perfil forem publicadas
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifyNewJobs}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, notifyNewJobs: checked })
                    }
                  />
                </div>
              )}

              {/* Family-specific notifications */}
              {isFamily && (
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label className="text-base">Novas candidaturas</Label>
                    <p className="text-sm text-gray-500">
                      Receba alertas quando babás se candidatarem às suas vagas
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifyNewApplicants}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, notifyNewApplicants: checked })
                    }
                  />
                </div>
              )}

              {/* Common notifications */}
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Novas mensagens</Label>
                  <p className="text-sm text-gray-500">
                    Receba alertas quando receber novas mensagens
                  </p>
                </div>
                <Switch
                  checked={settings.notifyNewMessages}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, notifyNewMessages: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Novas avaliações</Label>
                  <p className="text-sm text-gray-500">
                    Receba alertas quando receber novas avaliações
                  </p>
                </div>
                <Switch
                  checked={settings.notifyNewReviews}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, notifyNewReviews: checked })
                  }
                />
              </div>

              <p className="text-xs text-gray-500">
                Nota: As preferências de notificação serão implementadas em
                breve. Por enquanto, todas as notificações estão ativas.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Privacidade */}
        <TabsContent
          variant="underline"
          value="privacidade"
          className="space-y-6"
        >
          {/* Profile Visibility */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PiShieldCheck className="size-5" />
                Visibilidade do Perfil
              </CardTitle>
              <CardDescription>
                Controle quem pode ver seu perfil na plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Perfil público</Label>
                  <p className="text-sm text-gray-500">
                    {isNanny
                      ? 'Seu perfil aparecerá nas buscas das famílias'
                      : 'Seu perfil aparecerá para as babás'}
                  </p>
                </div>
                <Switch
                  checked={settings.isProfilePublic}
                  onCheckedChange={handleVisibilityChange}
                  disabled={isSavingVisibility || !isNanny}
                />
              </div>
              {!isNanny && (
                <p className="mt-2 text-xs text-gray-500">
                  Esta configuração está disponível apenas para babás.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Delete Account */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <PiTrash className="size-5" />
                Excluir Conta
              </CardTitle>
              <CardDescription>
                Exclua permanentemente sua conta e todos os dados associados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <div className="flex gap-3">
                  <PiWarningCircle className="size-5 shrink-0 text-red-600" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-red-800">
                      Esta ação é irreversível
                    </p>
                    <p className="text-sm text-red-700">
                      Ao excluir sua conta, todos os seus dados serão
                      permanentemente removidos, incluindo perfil, mensagens,
                      avaliações e histórico.
                    </p>
                  </div>
                </div>
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="mt-4">
                    <PiTrash className="mr-2 size-4" />
                    Excluir Minha Conta
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Tem certeza que deseja excluir sua conta?
                    </AlertDialogTitle>
                    <AlertDialogDescription asChild>
                      <div className="space-y-4 text-sm text-gray-800">
                        <p>
                          Esta ação não pode ser desfeita. Todos os seus dados
                          serão permanentemente removidos de nossos servidores.
                        </p>
                        <div className="space-y-2">
                          <Label htmlFor="deleteConfirm">
                            Digite <strong>EXCLUIR</strong> para confirmar:
                          </Label>
                          <Input
                            id="deleteConfirm"
                            value={deleteConfirmText}
                            onChange={(e) =>
                              setDeleteConfirmText(e.target.value.toUpperCase())
                            }
                            placeholder="EXCLUIR"
                          />
                        </div>
                      </div>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setDeleteConfirmText('')}>
                      Cancelar
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      disabled={
                        deleteConfirmText !== 'EXCLUIR' || isDeletingAccount
                      }
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {isDeletingAccount
                        ? 'Excluindo...'
                        : 'Confirmar Exclusão'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
