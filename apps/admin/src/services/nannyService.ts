'use server';

import { sendEmail } from '@/lib/email/sendEmail';
import { getWelcomeNannyEmailTemplate } from '@/lib/email/templates';
import { geocodeAddress } from '@/lib/googleMaps';
import prisma from '@/lib/prisma';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { FormNanny } from '@/schemas/nannySchemas';
import { logAuditMany } from '@/utils/auditLog';
import { formatName } from '@/utils/formatName';
import { formatPixKeyForDatabase } from '@/utils/formatPixKeyForDatabase';
import { formatPixKeyForDisplay } from '@/utils/formatPixKeyForDisplay';
import { generatePassword } from '@/utils/generatePassword';
import { removeNonNumericCharacters } from '@/utils/removeNonNumericCharacters';
import { generateNannySlug } from '@cuidly/shared/utils/slug';
import { Address, Nanny } from '@prisma/client';

export interface NannyWithInfos extends Nanny {
  address: Address | null;
  documents: any[];
  viewsCount: number;
  sharesCount: number;
  favoritesCount: number;
}

export async function getNannies() {
  return await prisma.nanny.findMany({
    select: { id: true, name: true, photoUrl: true },
    orderBy: { name: 'asc' },
  });
}

export async function getNannyBySlug(
  slug: string,
): Promise<Partial<Nanny & { address?: Address | null }> | null> {
  const nanny = await prisma.nanny.findUniqueOrThrow({
    where: { slug },
    include: { address: true },
  });

  const serialized = JSON.parse(JSON.stringify(nanny));

  return {
    ...serialized,
    pixKey: nanny.pixKey
      ? formatPixKeyForDisplay(nanny.pixType, nanny.pixKey)
      : null,
  };
}

export async function getNannyWithInfosBySlug(
  slug: string,
): Promise<NannyWithInfos> {
  const nanny = await prisma.nanny.findUniqueOrThrow({
    where: { slug },
    include: {
      address: true,
    },
  });

  const documents = await prisma.document.findMany({
    where: { nannyId: nanny.id, status: 'ACTIVE' },
  });

  // Get profile analytics counts
  const viewsCount = await prisma.profileAnalytics.count({
    where: {
      nannyId: nanny.id,
      actionType: 'VIEW',
    },
  });

  const sharesCount = await prisma.profileAnalytics.count({
    where: {
      nannyId: nanny.id,
      actionType: 'SHARE',
    },
  });

  const favoritesCount = await prisma.favorite.count({
    where: {
      nannyId: nanny.id,
    },
  });

  const serialized = JSON.parse(JSON.stringify(nanny));

  return {
    ...serialized,
    pixKey: nanny.pixKey
      ? formatPixKeyForDisplay(nanny.pixType, nanny.pixKey)
      : null,
    documents,
    viewsCount,
    sharesCount,
    favoritesCount,
  };
}

export async function getNannyIdBySlug(
  slug: string,
): Promise<Partial<Nanny> | null> {
  return await prisma.nanny.findUniqueOrThrow({
    where: { slug },
    select: { id: true },
  });
}

export async function createNanny(
  data: FormNanny,
  imageUrl: string,
  slug?: string,
) {
  await checkIfNannyExistsByCpf(data.cpf as string);

  // Check if there's a deleted nanny with the same CPF and hard delete it
  const deletedNanny = await prisma.nanny.findFirst({
    where: {
      cpf: removeNonNumericCharacters(data.cpf as string),
      status: 'DELETED',
    },
  });

  if (deletedNanny) {
    if (deletedNanny.addressId) {
      await prisma.address.delete({
        where: { id: deletedNanny.addressId },
      });
    }

    await prisma.nanny.delete({
      where: { id: deletedNanny.id },
    });
  }

  // Verificar se o email já existe em outra nanny
  const existingNannyByEmail = await prisma.nanny.findFirst({
    where: {
      emailAddress: data.emailAddress,
      status: { not: 'DELETED' },
    },
  });

  if (existingNannyByEmail) {
    throw new Error('Já existe uma babá com este e-mail');
  }

  const addressData = {
    zipCode: removeNonNumericCharacters(data.address.zipCode),
    streetName: data.address.street,
    number: data.address.number,
    complement: data.address.complement,
    neighborhood: data.address.neighborhood,
    city: data.address.city,
    state: data.address.state,
  };

  const coords = await geocodeAddress(
    `${addressData.streetName ?? ''} ${addressData.number ?? ''}, ${addressData.city}, ${addressData.state}, ${addressData.zipCode}`,
  );
  if (coords) {
    Object.assign(addressData, {
      latitude: coords.latitude,
      longitude: coords.longitude,
    });
  }

  const address = await prisma.address.create({
    data: addressData,
  });

  const parsedName = formatName(data.name);
  const parsedSlug = slug || generateNannySlug(parsedName);

  // Gerar UUID para o authId (mesmo ID do Supabase Auth)
  const authId = crypto.randomUUID();

  const nannyData = {
    authId, // Novo campo para vincular ao Supabase Auth
    name: parsedName,
    slug: parsedSlug,
    birthDate: new Date(data.birthDate.split('/').reverse().join('-')),
    cpf: removeNonNumericCharacters(data.cpf as string),
    phoneNumber: data.phoneNumber,
    emailAddress: data.emailAddress,
    gender: data.gender === '' ? null : data.gender,
    photoUrl: imageUrl,
    isSmoker: data.isSmoker || false,
    pixKey: formatPixKeyForDatabase(data.pixType, data.pixKey),
    pixType: data.pixType !== 'null' ? data.pixType : null,
    status: data.status,
    address: {
      connect: { id: address.id },
    },
    // Personal data
    motherName: data.motherName || null,
    birthCity: data.birthCity || null,
    birthState: data.birthState || null,
    // Professional fields
    experienceYears: data.experienceYears || null,
    hourlyRate: data.hourlyRate ? parseFloat(String(data.hourlyRate)) : null,
    dailyRate: data.dailyRate ? parseFloat(String(data.dailyRate)) : null,
    monthlyRate: data.monthlyRate ? parseFloat(String(data.monthlyRate)) : null,
    minChildAge: data.minChildAge || null,
    maxChildAge: data.maxChildAge || null,
    specialtiesJson: data.specialties || [],
    availabilityJson: data.availabilitySchedules || [],
    serviceTypesJson: data.serviceTypes || [],
    attendanceModesJson: data.attendanceModes || [],
    skillsJson: data.skills || [],
    // Bio
    aboutMe: data.aboutMe || null,
    // New V2.0 fields
    maxTravelDistance: data.maxTravelDistance || null,
    ageRangesExperience: data.ageRangesExperience || [],
    hasSpecialNeedsExperience: data.hasSpecialNeedsExperience || false,
    specialNeedsExperienceDescription: data.specialNeedsExperienceDescription || null,
    certifications: data.certifications || [],
    languages: data.languages || null,
    childTypePreference: data.childTypePreference || [],
    strengths: data.strengths || [],
    careMethodology: data.careMethodology || null,
    hasVehicle: data.hasVehicle || false,
    comfortableWithPets: data.comfortableWithPets || null,
    petsDescription: data.petsDescription || null,
    acceptedActivities: data.acceptedActivities || [],
    environmentPreference: data.environmentPreference || null,
    parentPresencePreference: data.parentPresencePreference || null,
    hasReferences: data.hasReferences || false,
    referencesVerified: data.referencesVerified || false,
    acceptsHolidayWork: data.acceptsHolidayWork || null,
    hourlyRateReference: data.hourlyRateReference ? parseFloat(String(data.hourlyRateReference)) : null,
    // Personal/lifestyle fields
    maritalStatus: data.maritalStatus || null,
    hasChildren: data.hasChildren || false,
    hasCnh: data.hasCnh || false,
    // New onboarding fields
    nannyTypes: data.nannyTypes || [],
    contractRegimes: data.contractRegimes || [],
    hourlyRateRange: data.hourlyRateRange || null,
    activitiesNotAccepted: data.activitiesNotAccepted || [],
    maxChildrenCare: data.maxChildrenCare || null,
  };

  const nanny = await prisma.nanny.create({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: nannyData as any,
  });

  // Gerar senha aleatoria para a baba
  const temporaryPassword = generatePassword(12);

  // Criar usuario no Supabase Auth
  try {
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        id: authId,
        email: data.emailAddress,
        password: temporaryPassword,
        email_confirm: true,
        user_metadata: {
          full_name: parsedName,
          role: 'NANNY',
        },
      });

    if (authError) {
      console.error('Erro ao criar usuario no Supabase Auth:', authError);
      await prisma.nanny.delete({ where: { id: nanny.id } });
      await prisma.address.delete({ where: { id: address.id } });
      throw new Error(
        authError.message || 'Erro ao criar usuario no Supabase Auth',
      );
    }

    console.log(
      'Usuario criado com sucesso no Supabase Auth:',
      authData.user.id,
    );
  } catch (error) {
    console.error('Erro ao criar usuario no Auth:', error);
    await prisma.nanny.delete({ where: { id: nanny.id } });
    await prisma.address.delete({ where: { id: address.id } });
    throw new Error(
      error instanceof Error
        ? error.message
        : 'Erro ao criar usuario no Supabase Auth',
    );
  }

  await logAuditMany([
    {
      action: 'CREATE',
      table: 'addresses',
      recordId: address.id.toString(),
      data: addressData,
    },
    {
      action: 'CREATE',
      table: 'nannies',
      recordId: nanny.id.toString(),
      data: nannyData,
    },
  ]);

  // Enviar email de boas-vindas com credenciais
  try {
    const loginUrl = 'https://cuidly.com/login';
    const emailTemplate = getWelcomeNannyEmailTemplate({
      name: parsedName,
      email: data.emailAddress,
      password: temporaryPassword,
      loginUrl,
    });

    await sendEmail({
      to: data.emailAddress,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text,
    });

    console.log(`Email de boas-vindas enviado para ${data.emailAddress}`);
  } catch (emailError) {
    console.error('Erro ao enviar email de boas-vindas:', emailError);
  }

  return JSON.parse(JSON.stringify(nanny));
}

export async function updateNanny(
  id: number,
  data: FormNanny,
  imageUrl: string,
) {
  const nanny = await prisma.nanny.findUnique({
    where: { id },
    select: { addressId: true, emailAddress: true, authId: true },
  });

  if (!nanny) {
    throw new Error('Nanny not found');
  }

  if (nanny.addressId) {
    const addressData = {
      zipCode: removeNonNumericCharacters(data.address.zipCode),
      streetName: data.address.street,
      number: data.address.number,
      complement: data.address.complement,
      neighborhood: data.address.neighborhood,
      city: data.address.city,
      state: data.address.state,
    };

    const coords = await geocodeAddress(
      `${addressData.streetName ?? ''} ${addressData.number ?? ''}, ${addressData.city}, ${addressData.state}, ${addressData.zipCode}`,
    );
    if (coords) {
      Object.assign(addressData, {
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
    }

    await prisma.address.update({
      where: { id: nanny.addressId },
      data: addressData,
    });

    await logAuditMany([
      {
        action: 'UPDATE',
        table: 'addresses',
        recordId: nanny.addressId.toString(),
        data: addressData,
      },
    ]);
  }

  const parsedName = formatName(data.name);
  const emailAddress = data.emailAddress?.trim() || null;

  const nannyData = {
    name: parsedName,
    birthDate: new Date(data.birthDate.split('/').reverse().join('-')),
    cpf: removeNonNumericCharacters(data.cpf as string),
    phoneNumber: data.phoneNumber,
    emailAddress: emailAddress,
    gender: data.gender === '' ? null : data.gender,
    photoUrl: imageUrl,
    isSmoker: data.isSmoker || false,
    pixKey: formatPixKeyForDatabase(data.pixType, data.pixKey),
    pixType: data.pixType !== 'null' ? data.pixType : null,
    status: data.status,
    // Personal data
    motherName: data.motherName || null,
    birthCity: data.birthCity || null,
    birthState: data.birthState || null,
    // Professional fields
    experienceYears: data.experienceYears || null,
    hourlyRate: data.hourlyRate ? parseFloat(String(data.hourlyRate)) : null,
    dailyRate: data.dailyRate ? parseFloat(String(data.dailyRate)) : null,
    monthlyRate: data.monthlyRate ? parseFloat(String(data.monthlyRate)) : null,
    minChildAge: data.minChildAge || null,
    maxChildAge: data.maxChildAge || null,
    specialtiesJson: data.specialties || [],
    availabilityJson: data.availabilitySchedules || [],
    serviceTypesJson: data.serviceTypes || [],
    attendanceModesJson: data.attendanceModes || [],
    skillsJson: data.skills || [],
    // Bio
    aboutMe: data.aboutMe || null,
    // New V2.0 fields
    maxTravelDistance: data.maxTravelDistance || null,
    ageRangesExperience: data.ageRangesExperience || [],
    hasSpecialNeedsExperience: data.hasSpecialNeedsExperience || false,
    specialNeedsExperienceDescription: data.specialNeedsExperienceDescription || null,
    certifications: data.certifications || [],
    languages: data.languages || null,
    childTypePreference: data.childTypePreference || [],
    strengths: data.strengths || [],
    careMethodology: data.careMethodology || null,
    hasVehicle: data.hasVehicle || false,
    comfortableWithPets: data.comfortableWithPets || null,
    petsDescription: data.petsDescription || null,
    acceptedActivities: data.acceptedActivities || [],
    environmentPreference: data.environmentPreference || null,
    parentPresencePreference: data.parentPresencePreference || null,
    hasReferences: data.hasReferences || false,
    referencesVerified: data.referencesVerified || false,
    acceptsHolidayWork: data.acceptsHolidayWork || null,
    hourlyRateReference: data.hourlyRateReference ? parseFloat(String(data.hourlyRateReference)) : null,
    // Personal/lifestyle fields
    maritalStatus: data.maritalStatus || null,
    hasChildren: data.hasChildren || false,
    hasCnh: data.hasCnh || false,
    // New onboarding fields
    nannyTypes: data.nannyTypes || [],
    contractRegimes: data.contractRegimes || [],
    hourlyRateRange: data.hourlyRateRange || null,
    activitiesNotAccepted: data.activitiesNotAccepted || [],
    maxChildrenCare: data.maxChildrenCare || null,
  };

  const nannyUpdated = await prisma.nanny.update({
    where: { id },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: nannyData as any,
  });

  // Atualizar Supabase Auth se tiver authId
  if (nanny.authId) {
    try {
      const updateData: { email?: string; user_metadata: { full_name: string; role: string } } = {
        user_metadata: {
          full_name: parsedName,
          role: 'NANNY',
        },
      };

      if (emailAddress) {
        updateData.email = emailAddress;
      }

      await supabaseAdmin.auth.admin.updateUserById(nanny.authId, updateData);
    } catch (error) {
      console.error('Erro ao sincronizar com Supabase Auth:', error);
    }
  }

  await logAuditMany([
    {
      action: 'UPDATE',
      table: 'nannies',
      recordId: id.toString(),
      data: nannyData,
    },
  ]);

  return JSON.parse(JSON.stringify(nannyUpdated));
}

export async function deleteNanny(id: number) {
  const nanny = await prisma.nanny.findUnique({
    where: { id },
    select: { id: true, addressId: true, authId: true },
  });

  if (!nanny) {
    throw new Error('Nanny not found');
  }

  await prisma.nanny.update({
    where: { id },
    data: { status: 'DELETED', deletedAt: new Date() },
  });

  if (nanny.addressId) {
    await prisma.address.update({
      where: { id: nanny.addressId },
      data: { status: 'DELETED', deletedAt: new Date() },
    });
  }

  await prisma.document.updateMany({
    where: { nannyId: nanny.id },
    data: { status: 'DELETED', deletedAt: new Date() },
  });

  // Deletar do Supabase Auth se tiver authId
  if (nanny.authId) {
    try {
      await supabaseAdmin.auth.admin.deleteUser(nanny.authId);
    } catch (error) {
      console.error('Erro ao deletar do Supabase Auth:', error);
    }
  }

  await logAuditMany([
    {
      action: 'DELETE',
      table: 'nannies',
      recordId: id,
      data: { status: 'DELETED' },
    },
    {
      action: 'DELETE',
      table: 'addresses',
      recordId: nanny.addressId ?? '',
      data: { status: 'DELETED' },
    },
    {
      action: 'DELETE',
      table: 'documents',
      recordId: `nannyId:${nanny.id}`,
      data: { status: 'DELETED' },
    },
  ]);
}

export async function checkIfNannyExistsByCpf(cpf: string) {
  const existingNanny = await prisma.nanny.findFirst({
    where: {
      cpf: removeNonNumericCharacters(cpf),
      status: {
        not: 'DELETED',
      },
    },
  });

  if (existingNanny) {
    throw new Error('Nanny with this CPF already exists');
  }
}
