'use server';

import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { logAuditMany } from '@/utils/auditLog';
import { removeNonNumericCharacters } from '@/utils/removeNonNumericCharacters';

// Helper to parse BR date string (DD/MM/YYYY) to Date
function parseBRDateToDate(dateStr: string | Date | null | undefined): Date | null {
  if (!dateStr) return null;
  if (dateStr instanceof Date) return dateStr;
  // Parse DD/MM/YYYY format
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
      return new Date(year, month, day);
    }
  }
  return null;
}

// Flexible form data type that accepts both string and Date for date fields
interface FormFamilyData {
  name?: string;
  phoneNumber?: string | null;
  emailAddress?: string | null;
  status?: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'DELETED';
  cpf?: string | null;
  birthDate?: string | Date | null;
  gender?: string | null;
  housingType?: string | null;
  hasPets?: boolean;
  petsDescription?: string | null;
  parentPresence?: string | null;
  valuesInNanny?: string[];
  careMethodology?: string | null;
  languages?: string[];
  houseRules?: string[];
  domesticHelpExpected?: string[];
  nannyGenderPreference?: string | null;
  nannyAgePreference?: string | null;
  nannyType?: string | null;
  contractRegime?: string | null;
  familyPresentation?: string | null;
  jobDescription?: string | null;
  jobPhotos?: string[];
  neededDays?: string[];
  neededShifts?: string[];
  requiresNonSmoker?: boolean;
  requiresDriverLicense?: boolean;
  hourlyRateRange?: string | null;
  address?: {
    zipCode?: string;
    street?: string;
    number?: string;
    complement?: string | null;
    neighborhood?: string;
    city?: string;
    state?: string;
  } | null;
}

export async function getFamilies() {
  const families = await prisma.family.findMany({
    where: {
      status: { not: 'DELETED' },
    },
    select: {
      id: true,
      name: true,
      phoneNumber: true,
      emailAddress: true,
      status: true,
      address: {
        select: {
          city: true,
          state: true,
          neighborhood: true,
        },
      },
      children: {
        select: {
          child: {
            select: { id: true, name: true },
          },
        },
      },
      subscription: {
        select: {
          status: true,
          plan: true,
        },
      },
    },
    orderBy: { name: 'asc' },
  });

  return families.map((f) => ({
    id: f.id,
    name: f.name,
    phoneNumber: f.phoneNumber,
    emailAddress: f.emailAddress,
    status: f.status,
    address: f.address,
    children: f.children.map((c) => c.child),
    subscription: f.subscription || null,
  }));
}

export async function getFamilyById(id: number) {
  const family = await prisma.family.findUnique({
    where: { id },
    include: {
      address: true,
      children: {
        include: { child: true },
      },
      subscription: true,
      favorites: {
        include: {
          nanny: {
            select: { id: true, name: true, slug: true, photoUrl: true },
          },
        },
      },
    },
  });

  if (!family) return null;

  return {
    ...family,
    address: family.address,
    children: family.children.map((c) => ({
      ...c.child,
      relationshipType: c.relationshipType,
      isMain: c.isMain,
    })),
    favorites: family.favorites.map((f) => f.nanny),
    subscription: family.subscription || null,
  };
}

export async function createFamily(data: FormFamilyData) {
  let addressId: number | undefined;

  if (data.address) {
    const addressData = {
      zipCode: removeNonNumericCharacters(data.address.zipCode || ''),
      streetName: data.address.street || '',
      number: data.address.number || '',
      complement: data.address.complement,
      neighborhood: data.address.neighborhood || '',
      city: data.address.city || '',
      state: data.address.state || '',
    };

    const address = await prisma.address.create({
      data: addressData,
    });
    addressId = address.id;
  }

  const familyData: Prisma.FamilyCreateInput = {
    name: data.name || 'Família',
    phoneNumber: data.phoneNumber
      ? removeNonNumericCharacters(data.phoneNumber)
      : null,
    emailAddress: data.emailAddress || null,
    status: (data.status || 'ACTIVE') as Prisma.FamilyCreateInput['status'],
    ...(addressId && { address: { connect: { id: addressId } } }),
    // New fields: CPF, birth date, gender
    cpf: data.cpf ? removeNonNumericCharacters(data.cpf) : null,
    birthDate: parseBRDateToDate(data.birthDate),
    gender: data.gender as Prisma.FamilyCreateInput['gender'] ?? null,
    // New V2.0 fields
    housingType: data.housingType as Prisma.FamilyCreateInput['housingType'] ?? null,
    hasPets: data.hasPets || false,
    petsDescription: data.petsDescription || null,
    parentPresence: data.parentPresence as Prisma.FamilyCreateInput['parentPresence'] ?? null,
    valuesInNanny: data.valuesInNanny || [],
    careMethodology: data.careMethodology || null,
    languages: data.languages || [],
    houseRules: data.houseRules || [],
    domesticHelpExpected: data.domesticHelpExpected || [],
    nannyGenderPreference: data.nannyGenderPreference as Prisma.FamilyCreateInput['nannyGenderPreference'] ?? null,
    nannyAgePreference: data.nannyAgePreference as Prisma.FamilyCreateInput['nannyAgePreference'] ?? null,
    // New fields: nanny type, contract regime
    nannyType: data.nannyType as Prisma.FamilyCreateInput['nannyType'] ?? null,
    contractRegime: data.contractRegime as Prisma.FamilyCreateInput['contractRegime'] ?? null,
    // New fields: AI-generated content
    familyPresentation: data.familyPresentation || null,
    jobDescription: data.jobDescription || null,
    jobPhotos: data.jobPhotos || [],
    // New fields: availability and requirements
    neededDays: data.neededDays || [],
    neededShifts: data.neededShifts || [],
    requiresNonSmoker: data.requiresNonSmoker || false,
    requiresDriverLicense: data.requiresDriverLicense || false,
    hourlyRateRange: data.hourlyRateRange || null,
  };

  const result = await prisma.family.create({
    data: familyData,
  });

  await logAuditMany([
    {
      action: 'CREATE',
      table: 'families',
      recordId: result.id.toString(),
      data: familyData,
    },
  ]);

  return result;
}

export async function updateFamily(id: number, data: FormFamilyData) {
  const family = await prisma.family.findUnique({
    where: { id },
    select: { addressId: true },
  });

  if (!family) {
    throw new Error('Family not found');
  }

  if (family.addressId && data.address) {
    const addressData = {
      zipCode: removeNonNumericCharacters(data.address.zipCode || ''),
      streetName: data.address.street || '',
      number: data.address.number || '',
      complement: data.address.complement,
      neighborhood: data.address.neighborhood || '',
      city: data.address.city || '',
      state: data.address.state || '',
    };

    await prisma.address.update({
      where: { id: family.addressId },
      data: addressData,
    });
  }

  const familyData: Record<string, unknown> = {
    phoneNumber: data.phoneNumber
      ? removeNonNumericCharacters(data.phoneNumber)
      : null,
    emailAddress: data.emailAddress || null,
    status: data.status,
    // New fields: CPF, birth date, gender
    cpf: data.cpf ? removeNonNumericCharacters(data.cpf) : null,
    birthDate: parseBRDateToDate(data.birthDate),
    gender: data.gender || null,
    // New V2.0 fields
    housingType: data.housingType || null,
    hasPets: data.hasPets || false,
    petsDescription: data.petsDescription || null,
    parentPresence: data.parentPresence || null,
    valuesInNanny: data.valuesInNanny || [],
    careMethodology: data.careMethodology || null,
    languages: data.languages || [],
    houseRules: data.houseRules || [],
    domesticHelpExpected: data.domesticHelpExpected || [],
    nannyGenderPreference: data.nannyGenderPreference || null,
    nannyAgePreference: data.nannyAgePreference || null,
    // New fields: nanny type, contract regime
    nannyType: data.nannyType || null,
    contractRegime: data.contractRegime || null,
    // New fields: AI-generated content
    familyPresentation: data.familyPresentation || null,
    jobDescription: data.jobDescription || null,
    jobPhotos: data.jobPhotos || [],
    // New fields: availability and requirements
    neededDays: data.neededDays || [],
    neededShifts: data.neededShifts || [],
    requiresNonSmoker: data.requiresNonSmoker || false,
    requiresDriverLicense: data.requiresDriverLicense || false,
    hourlyRateRange: data.hourlyRateRange || null,
  };

  // Only update name if provided
  if (data.name) {
    familyData.name = data.name;
  }

  const result = await prisma.family.update({
    where: { id },
    data: familyData,
  });

  await logAuditMany([
    {
      action: 'UPDATE',
      table: 'families',
      recordId: id.toString(),
      data: familyData,
    },
  ]);

  return result;
}

export async function deleteFamily(id: number) {
  const family = await prisma.family.findUnique({
    where: { id },
    select: { addressId: true, authId: true },
  });

  if (!family) {
    throw new Error('Family not found');
  }

  await prisma.family.update({
    where: { id },
    data: {
      status: 'DELETED',
      deletedAt: new Date(),
    },
  });

  if (family.addressId) {
    await prisma.address.update({
      where: { id: family.addressId },
      data: {
        status: 'DELETED',
        deletedAt: new Date(),
      },
    });
  }

  // Deletar do Supabase Auth se tiver authId
  if (family.authId) {
    try {
      const { supabaseAdmin } = await import('@/lib/supabase/admin');
      await supabaseAdmin.auth.admin.deleteUser(family.authId);
    } catch (error) {
      console.error('Erro ao deletar do Supabase Auth:', error);
    }
  }

  await logAuditMany([
    {
      action: 'DELETE',
      table: 'families',
      recordId: id.toString(),
      data: { status: 'DELETED' },
    },
  ]);
}

// Subscription helpers
export async function getFamilySubscription(familyId: number) {
  return await prisma.subscription.findUnique({
    where: { familyId },
  });
}

export async function updateFamilySubscription(
  familyId: number,
  plan: 'FAMILY_FREE' | 'FAMILY_PLUS',
) {
  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  return await prisma.subscription.upsert({
    where: { familyId },
    update: {
      plan,
      status: 'ACTIVE',
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      billingInterval: 'MONTH',
    },
    create: {
      familyId,
      plan,
      status: 'ACTIVE',
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      billingInterval: 'MONTH',
    },
  });
}
