'use client';

import { MissingFieldsBanner } from '@/components/profile/missing-fields-banner';
import { ProfilePhotoUpload } from '@/components/profile/profile-photo-upload';
import {
  EmptyValue,
  FieldGrid,
  FieldItem,
  SettingsSection,
} from '@/components/profile/settings-section';
import { formatPhoneDisplay, maskCEP, maskCPF } from '@/helpers/formatters';
import { getGenderLabel, getMaritalStatusLabel } from '@/helpers/label-getters';
import { sanitizeHtml } from '@/lib/sanitize-html';

import type { BasicDataTabProps } from '../types';

function calculateAge(birthDate: Date | string): number {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export function BasicDataTab({
  nannyData,
  missingFields,
  onEditClick,
  onPhotoChange,
}: BasicDataTabProps) {
  // Handler para Informações Pessoais
  const handleEditPersonal = () => {
    onEditClick('personal', {
      name: nannyData.name,
      cpf: nannyData.cpf ? maskCPF(nannyData.cpf) : '',
      motherName: nannyData.motherName,
      birthDate: nannyData.birthDate
        ? new Date(nannyData.birthDate).toLocaleDateString('pt-BR')
        : '',
      gender: nannyData.gender,
      isSmoker: nannyData.isSmoker,
      maritalStatus: nannyData.maritalStatus,
      hasChildren: nannyData.hasChildren,
      hasCnh: nannyData.hasCnh,
    });
  };

  // Handler para Contato (e-mail e telefone)
  const handleEditContact = () => {
    onEditClick('contact', {
      emailAddress: nannyData.emailAddress || '',
      phoneNumber: nannyData.phoneNumber
        ? formatPhoneDisplay(nannyData.phoneNumber)
        : '',
    });
  };

  // Handler para Endereço
  const handleEditAddress = () => {
    onEditClick('address', {
      zipCode: nannyData.address?.zipCode || '',
      streetName: nannyData.address?.streetName || '',
      number: nannyData.address?.number || '',
      complement: nannyData.address?.complement || '',
      neighborhood: nannyData.address?.neighborhood || '',
      city: nannyData.address?.city || '',
      state: nannyData.address?.state || '',
    });
  };

  return (
    <div className="space-y-0">
      <MissingFieldsBanner
        fields={missingFields.basic}
        title="Complete seu perfil básico"
      />

      {/* Seção: Informações pessoais */}
      <SettingsSection
        title="Informações pessoais"
        description="Seus dados principais para identificação no seu perfil"
        onEdit={handleEditPersonal}
        isFirst
      >
        {/* Foto de perfil */}
        <div className="mb-6">
          <ProfilePhotoUpload
            currentPhotoUrl={nannyData.photoUrl}
            userName={nannyData.name ?? undefined}
            onPhotoChange={onPhotoChange}
            size="lg"
            horizontal
          />
        </div>

        <FieldGrid>
          <FieldItem label="Nome completo">
            {nannyData.name || <EmptyValue />}
          </FieldItem>
          <FieldItem label="CPF">
            {nannyData.cpf ? maskCPF(nannyData.cpf) : <EmptyValue />}
          </FieldItem>
          <FieldItem label="Nascimento">
            {nannyData.birthDate ? (
              `${new Date(nannyData.birthDate).toLocaleDateString('pt-BR')} (${calculateAge(nannyData.birthDate)} anos)`
            ) : (
              <EmptyValue />
            )}
          </FieldItem>
          <FieldItem label="Gênero">
            {getGenderLabel(nannyData.gender) || <EmptyValue />}
          </FieldItem>
          <FieldItem label="Nome da mãe">
            {nannyData.motherName || <EmptyValue />}
          </FieldItem>
          <FieldItem label="Estado civil">
            {getMaritalStatusLabel(
              nannyData.maritalStatus,
              nannyData.gender,
            ) || <EmptyValue />}
          </FieldItem>
          <FieldItem label="Tem filhos">
            {nannyData.hasChildren === true ? (
              'Sim'
            ) : nannyData.hasChildren === false ? (
              'Não'
            ) : (
              <EmptyValue />
            )}
          </FieldItem>
          <FieldItem label="Fumante">
            {nannyData.isSmoker ? 'Sim' : 'Não'}
          </FieldItem>
          <FieldItem label="CNH">
            {nannyData.hasCnh === true ? (
              'Sim'
            ) : nannyData.hasCnh === false ? (
              'Não'
            ) : (
              <EmptyValue />
            )}
          </FieldItem>
        </FieldGrid>
      </SettingsSection>

      {/* Seção: Contato */}
      <SettingsSection
        title="Contato"
        description="Suas informações de contato"
        onEdit={handleEditContact}
      >
        <FieldGrid>
          <FieldItem label="E-mail">
            {nannyData.emailAddress || <EmptyValue />}
          </FieldItem>
          <FieldItem label="Telefone">
            {nannyData.phoneNumber ? (
              formatPhoneDisplay(nannyData.phoneNumber)
            ) : (
              <EmptyValue />
            )}
          </FieldItem>
        </FieldGrid>
      </SettingsSection>

      {/* Seção: Endereço */}
      <SettingsSection
        title="Endereço"
        description="Onde você mora"
        onEdit={handleEditAddress}
      >
        <FieldGrid>
          <FieldItem label="Endereço" fullWidth>
            {nannyData.address?.streetName ? (
              `${nannyData.address.streetName}${nannyData.address.number ? `, ${nannyData.address.number}` : ''}${nannyData.address.complement ? ` - ${nannyData.address.complement}` : ''}`
            ) : (
              <EmptyValue />
            )}
          </FieldItem>
          <FieldItem label="Bairro">
            {nannyData.address?.neighborhood || <EmptyValue />}
          </FieldItem>
          <FieldItem label="Cidade">
            {nannyData.address?.city && nannyData.address?.state
              ? `${nannyData.address.city} - ${nannyData.address.state}`
              : nannyData.address?.city || <EmptyValue />}
          </FieldItem>
          <FieldItem label="CEP">
            {nannyData.address?.zipCode ? (
              maskCEP(nannyData.address.zipCode)
            ) : (
              <EmptyValue />
            )}
          </FieldItem>
        </FieldGrid>
      </SettingsSection>

      {/* Seção: Sobre mim */}
      <SettingsSection
        title="Sobre mim"
        description="Sua apresentação para as famílias"
        onEdit={() =>
          onEditClick('about', {
            aboutMe: nannyData.aboutMe,
          })
        }
      >
        {nannyData.aboutMe ? (
          <div
            className="max-w-none leading-relaxed text-gray-600"
            dangerouslySetInnerHTML={{
              __html: sanitizeHtml(nannyData.aboutMe),
            }}
          />
        ) : (
          <p className="text-sm text-gray-400 italic">
            Adicione uma descrição sobre você para atrair mais famílias.
          </p>
        )}
      </SettingsSection>
    </div>
  );
}
