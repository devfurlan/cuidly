'use client';

import Link from 'next/link';
import {
  PiArrowRight,
  PiCheckCircle,
  PiCrown,
  PiSpinner,
  PiWarningCircle,
} from 'react-icons/pi';

import { CertificateSection } from '@/components/profile/certificate-section';
import { ReferenceSection } from '@/components/profile/reference-section';
import { SettingsSection } from '@/components/profile/settings-section';
import { Button } from '@/components/ui/shadcn/button';

import type { TrustTabProps } from '../types';

export function TrustTab({
  nannyData,
  certificates,
  isDocumentExpired,
  isDocumentValid,
  isResendingEmail,
  onResendEmailVerification,
  onOpenDocumentValidation,
  onOpenSelfieValidation,
  onOpenBackgroundCheck,
  onRefresh,
  onCertificatesUpdate,
}: TrustTabProps) {
  return (
    <div className="space-y-0">
      {/* Seção: Validações */}
      <SettingsSection
        title="Validações"
        description="Complete as validações para aumentar a confiança do seu perfil"
        showEditButton={false}
        isFirst
      >
        <div className="space-y-3">
          {/* Email Verification */}
          <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-3">
            <div className="flex items-center gap-3">
              {nannyData.emailVerified ? (
                <PiCheckCircle className="size-5 text-green-500" />
              ) : (
                <PiWarningCircle className="size-5 text-amber-500" />
              )}
              <div>
                <p className="text-sm font-medium text-gray-900">E-mail</p>
                <p className="text-xs text-gray-500">
                  {nannyData.emailVerified ? 'Verificado' : 'Pendente'}
                </p>
              </div>
            </div>
            {!nannyData.emailVerified && (
              <Button
                variant="outline"
                size="sm"
                onClick={onResendEmailVerification}
                disabled={isResendingEmail}
              >
                {isResendingEmail ? (
                  <PiSpinner className="size-4 animate-spin" />
                ) : (
                  'Verificar'
                )}
              </Button>
            )}
          </div>

          {/* Document Validation */}
          <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-stone-50 p-3">
            <div className="flex items-center gap-3">
              {isDocumentValid ? (
                <PiCheckCircle className="size-5 text-green-500" />
              ) : isDocumentExpired ? (
                <PiWarningCircle className="size-5 text-red-500" />
              ) : (
                <PiWarningCircle className="size-5 text-amber-500" />
              )}
              <div>
                <p className="text-sm font-medium text-gray-900">Documento</p>
                <p className="text-xs text-gray-500">
                  {isDocumentValid
                    ? 'Verificado'
                    : isDocumentExpired
                      ? 'Expirado'
                      : 'Pendente'}
                </p>
              </div>
            </div>
            {(!nannyData.documentValidated || isDocumentExpired) && (
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenDocumentValidation}
              >
                Validar
              </Button>
            )}
          </div>

          {/* Facial Validation (Pro) */}
          <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-3">
            <div className="flex items-center gap-3">
              {nannyData.personalDataValidated ? (
                <PiCheckCircle className="size-5 text-green-500" />
              ) : (
                <PiWarningCircle className="size-5 text-amber-500" />
              )}
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Validação Facial
                </p>
                <p className="text-xs text-gray-500">
                  {nannyData.personalDataValidated ? 'Verificado' : 'Pendente'}
                </p>
              </div>
            </div>
            {!nannyData.personalDataValidated && (
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenSelfieValidation}
                className="gap-1.5"
              >
                <PiCrown className="size-3.5 text-amber-500" />
                Pro
              </Button>
            )}
          </div>

          {/* Background Check (Pro) */}
          <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-3">
            <div className="flex items-center gap-3">
              {nannyData.criminalBackgroundValidated ? (
                <PiCheckCircle className="size-5 text-green-500" />
              ) : (
                <PiWarningCircle className="size-5 text-amber-500" />
              )}
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Verificação de Segurança
                </p>
                <p className="text-xs text-gray-500">
                  {nannyData.criminalBackgroundValidated
                    ? 'Verificado'
                    : 'Pendente'}
                </p>
              </div>
            </div>
            {!nannyData.criminalBackgroundValidated && (
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenBackgroundCheck}
                className="gap-1.5"
              >
                <PiCrown className="size-3.5 text-amber-500" />
                Pro
              </Button>
            )}
          </div>
        </div>
      </SettingsSection>

      {/* Seção: Referências */}
      <SettingsSection
        title="Referências"
        description="Contatos de pessoas que podem atestar seu trabalho"
        showEditButton={false}
      >
        <ReferenceSection
          references={nannyData.references || []}
          onUpdate={onRefresh}
        />
      </SettingsSection>

      {/* Seção: Certificados */}
      <SettingsSection
        title="Certificados"
        description="Formação acadêmica e cursos profissionais"
        showEditButton={false}
      >
        <CertificateSection
          nannyId={nannyData.id}
          certificates={certificates}
          onUpdate={onCertificatesUpdate ?? onRefresh}
        />
      </SettingsSection>

      {/* Seção: Avaliações */}
      <SettingsSection
        title="Avaliações"
        description="Veja as avaliações que você recebeu das famílias"
        showEditButton={false}
      >
        <Button variant="outline" size="sm" asChild>
          <Link href="/app/avaliacoes">
            Ver Avaliações
            <PiArrowRight className="ml-1.5 size-4" />
          </Link>
        </Button>
      </SettingsSection>
    </div>
  );
}
