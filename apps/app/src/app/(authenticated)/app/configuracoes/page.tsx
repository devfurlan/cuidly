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
  PiBriefcase,
  PiChatCircle,
  PiCheck,
  PiEnvelope,
  PiLock,
  PiMagnifyingGlass,
  PiNote,
  PiRocket,
  PiShieldCheck,
  PiSparkle,
  PiStar,
  PiTrash,
  PiUserCircle,
  PiWarningCircle,
} from 'react-icons/pi';

import { PasswordValidationIndicator } from '@/app/(auth)/cadastro/_components/PasswordValidationIndicator';
import { PageTitle } from '@/components/PageTitle';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Badge } from '@/components/ui/shadcn/badge';
import { Button } from '@/components/ui/shadcn/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/shadcn/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/shadcn/dialog';
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

type DeleteStep = 'retention' | 'confirm';

const FAMILY_DELETE_LOSSES = [
  { icon: PiBriefcase, text: 'Suas vagas serão encerradas' },
  { icon: PiChatCircle, text: 'Todas as conversas serão excluídas' },
  { icon: PiStar, text: 'Suas avaliações serão removidas' },
  { icon: PiMagnifyingGlass, text: 'Matching inteligente e filtros avançados' },
  { icon: PiRocket, text: 'Boost de vaga e benefícios do plano' },
];

const NANNY_DELETE_LOSSES = [
  { icon: PiNote, text: 'Suas candidaturas serão perdidas' },
  { icon: PiChatCircle, text: 'Todas as conversas serão excluídas' },
  { icon: PiUserCircle, text: 'Seu perfil será removido das buscas' },
  { icon: PiShieldCheck, text: 'Seus selos e verificações serão perdidos' },
  { icon: PiSparkle, text: 'Destaque, matching e benefícios do plano' },
];

interface SettingsData {
  email: string;
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
    isProfilePublic: true,
  });

  // Password change state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Delete account state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteStep, setDeleteStep] = useState<DeleteStep>('retention');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const deleteLosses = isNanny
    ? NANNY_DELETE_LOSSES
    : FAMILY_DELETE_LOSSES;

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeleteStep('retention');
    setDeleteConfirmText('');
  };

  // Profile visibility state
  const [isSavingVisibility, setIsSavingVisibility] = useState(false);

  // Email verification state
  const [isEmailVerified, setIsEmailVerified] = useState<boolean | null>(null);
  const [showVerificationCodeInput, setShowVerificationCodeInput] =
    useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);

  useEffect(() => {
    async function loadEmailStatus() {
      try {
        const res = await fetch('/api/user/me');
        if (res.ok) {
          const data = await res.json();
          setIsEmailVerified(data.emailVerified ?? false);
        }
      } catch {
        // ignore
      }
    }
    loadEmailStatus();
  }, []);

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

  // Handle sending verification code
  const handleSendVerificationCode = async () => {
    setIsSendingCode(true);
    try {
      const response = await fetch('/api/email/resend-verification', {
        method: 'POST',
      });
      const data = await response.json();
      if (response.ok) {
        toast.success('Código enviado! Verifique seu e-mail.');
        setShowVerificationCodeInput(true);
      } else {
        toast.error(data.message || 'Erro ao enviar código de verificação.');
      }
    } catch (error) {
      console.error('Error sending verification code:', error);
      toast.error('Erro ao enviar código. Tente novamente.');
    } finally {
      setIsSendingCode(false);
    }
  };

  // Handle verifying the 6-digit code
  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.trim().length !== 6) {
      toast.error('Digite um código válido de 6 dígitos');
      return;
    }

    setIsVerifying(true);
    try {
      const response = await fetch('/api/email/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: verificationCode.trim() }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success('E-mail verificado com sucesso!');
        setIsEmailVerified(true);
        setShowVerificationCodeInput(false);
        setVerificationCode('');
      } else {
        toast.error(data.message || 'Código inválido');
      }
    } catch (error) {
      console.error('Error verifying email:', error);
      toast.error('Erro ao verificar e-mail. Tente novamente.');
    } finally {
      setIsVerifying(false);
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
            <CardContent className="space-y-4">
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
                {isEmailVerified !== null && (
                  <Badge
                    variant={isEmailVerified ? 'success' : 'warning'}
                    className="mt-6"
                  >
                    {isEmailVerified ? 'Verificado' : 'Não verificado'}
                  </Badge>
                )}
              </div>

              {isEmailVerified === false && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <p className="mb-3 text-sm text-amber-800">
                    Seu e-mail ainda não foi verificado. Verifique para ter
                    acesso completo à plataforma.
                  </p>

                  {!showVerificationCodeInput ? (
                    <Button
                      size="sm"
                      onClick={handleSendVerificationCode}
                      disabled={isSendingCode}
                    >
                      {isSendingCode
                        ? 'Enviando...'
                        : 'Enviar código de verificação'}
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          placeholder="Código de 6 dígitos"
                          value={verificationCode}
                          onChange={(e) =>
                            setVerificationCode(
                              e.target.value.replace(/\D/g, '').slice(0, 6),
                            )
                          }
                          maxLength={6}
                          className="max-w-xs font-mono text-lg tracking-wider"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleVerifyCode();
                            }
                          }}
                        />
                        <Button
                          onClick={handleVerifyCode}
                          disabled={
                            isVerifying || verificationCode.length !== 6
                          }
                          variant="success"
                        >
                          {isVerifying ? (
                            'Verificando...'
                          ) : (
                            <>
                              <PiCheck />
                              Verificar
                            </>
                          )}
                        </Button>
                      </div>
                      <button
                        onClick={handleSendVerificationCode}
                        disabled={isSendingCode}
                        className="text-xs text-amber-700 underline hover:text-amber-900"
                      >
                        {isSendingCode
                          ? 'Enviando...'
                          : 'Não recebeu? Reenviar código'}
                      </button>
                    </div>
                  )}
                </div>
              )}
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
                  <Switch checked disabled />
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
                  <Switch checked disabled />
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
                <Switch checked disabled />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Novas avaliações</Label>
                  <p className="text-sm text-gray-500">
                    Receba alertas quando receber novas avaliações
                  </p>
                </div>
                <Switch checked disabled />
              </div>

              <p className="text-xs text-gray-500">
                As preferências de notificação serão implementadas em breve. Por
                enquanto, todas as notificações estão ativas.
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

          {/* Delete Account - discrete button */}
          <div className="mt-6 flex justify-start">
            <Button
              variant="ghost"
              className="text-sm text-gray-400 hover:text-red-600"
              onClick={() => setIsDeleteModalOpen(true)}
            >
              Excluir conta
            </Button>
          </div>

          {/* Delete Account Modal */}
          <Dialog
            open={isDeleteModalOpen}
            onOpenChange={handleCloseDeleteModal}
          >
            <DialogContent className="max-w-[calc(100%-3rem)] overflow-hidden rounded-2xl border-0 p-0 sm:max-w-md">
              {/* Step 1: Retention */}
              {deleteStep === 'retention' && (
                <>
                  <div className="relative bg-linear-to-br from-amber-500 via-orange-500 to-orange-600 px-4 pt-8 pb-6 text-center sm:px-6 sm:pt-10 sm:pb-8">
                    <div className="pointer-events-none absolute inset-0 overflow-hidden">
                      <div className="absolute -top-4 -right-4 size-24 rounded-full bg-white/10" />
                      <div className="absolute bottom-0 -left-8 size-32 rounded-full bg-white/5" />
                    </div>
                    <div className="relative mx-auto mb-3 flex size-14 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm sm:mb-4 sm:size-16">
                      <PiWarningCircle className="size-7 text-white sm:size-8" />
                    </div>
                    <DialogTitle className="mb-2 text-xl font-bold text-white sm:text-2xl">
                      Tem certeza?
                    </DialogTitle>
                    <DialogDescription className="text-sm text-orange-100 sm:text-base">
                      Ao excluir sua conta, você perderá acesso a tudo isso:
                    </DialogDescription>
                  </div>

                  <div className="bg-white p-4 sm:p-6">
                    <div className="mb-6 space-y-3">
                      {deleteLosses.map((benefit, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-100">
                            <benefit.icon className="size-5 text-red-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            {benefit.text}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="mb-6 rounded-lg bg-amber-50 p-4">
                      <p className="text-sm text-amber-800">
                        Se você possui uma assinatura ativa, perderá o acesso
                        imediatamente.
                      </p>
                    </div>

                    <Button
                      onClick={handleCloseDeleteModal}
                      className="w-full bg-linear-to-r from-fuchsia-500 to-purple-600 text-white hover:from-fuchsia-600 hover:to-purple-700"
                      size="lg"
                    >
                      Manter minha conta
                    </Button>

                    <Button
                      variant="ghost"
                      onClick={() => setDeleteStep('confirm')}
                      className="mt-3 w-full text-gray-400 hover:text-gray-600"
                    >
                      Continuar com a exclusão
                    </Button>
                  </div>
                </>
              )}

              {/* Step 2: Confirmation */}
              {deleteStep === 'confirm' && (
                <>
                  <div className="relative bg-linear-to-br from-gray-600 via-gray-700 to-gray-800 px-4 pt-8 pb-6 text-center sm:px-6 sm:pt-10 sm:pb-8">
                    <DialogTitle className="mb-2 text-xl font-bold text-white sm:text-2xl">
                      Excluir conta
                    </DialogTitle>
                    <DialogDescription className="text-sm text-gray-300 sm:text-base">
                      Esta ação é permanente e irreversível
                    </DialogDescription>
                  </div>

                  <div className="bg-white p-4 sm:p-6">
                    <p className="mb-4 text-sm text-gray-600">
                      Todos os seus dados serão permanentemente removidos,
                      incluindo perfil, mensagens, avaliações e histórico.
                    </p>

                    <div className="mb-6 space-y-2">
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

                    <div className="flex flex-col gap-3">
                      <Button
                        onClick={() => setDeleteStep('retention')}
                        className="w-full bg-linear-to-r from-fuchsia-500 to-purple-600 text-white hover:from-fuchsia-600 hover:to-purple-700"
                        size="lg"
                      >
                        Voltar e manter minha conta
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleDeleteAccount}
                        disabled={
                          deleteConfirmText !== 'EXCLUIR' || isDeletingAccount
                        }
                        className="w-full"
                      >
                        {isDeletingAccount
                          ? 'Excluindo...'
                          : 'Excluir minha conta'}
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </>
  );
}
