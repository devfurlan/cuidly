import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { phoneToE164 } from '@/helpers/validators';
import { generateSlug } from '@/utils/slug';
import { encryptCpf, hashCpf } from '@/lib/crypto';

/**
 * Converts string "true"/"false" to boolean, or returns the value if already boolean
 */
function toBoolean(value: unknown): boolean | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return value === 'true';
  }
  return undefined;
}

/**
 * Converts string to number, or returns the value if already a number
 */
function toNumber(value: unknown): number | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? undefined : parsed;
  }
  return undefined;
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (currentUser.type !== 'nanny') {
      return NextResponse.json({ error: 'User is not a nanny' }, { status: 400 });
    }

    const body = await request.json();

    const {
      // Address fields (can be sent as individual fields or as nested object)
      address,
      zipCode: rawZipCode,
      streetName: rawStreetName,
      number: rawNumber,
      complement: rawComplement,
      neighborhood: rawNeighborhood,
      city: rawCity,
      state: rawState,
      // Nanny fields
      name,
      cpf,
      travelRadius,
      birthDate,
      phoneNumber,
      gender,
      experienceYears,
      childAgeExperiences,
      hasSpecialNeedsExperience,
      specialNeedsExperiences,
      specialNeedsDescription,
      // Step 5
      certifications,
      languages,
      // Step 6
      childTypePreference,
      strengths,
      maxChildrenCare,
      // Step 7/10
      aboutMe,
      // Step 8
      comfortableWithPets,
      petsDescription,
      acceptedActivities,
      // Step 9
      careMethodology,
      hasVehicle,
      isSmoker,
      parentPresencePreference,
      maritalStatus,
      hasChildren,
      hasCnh,
      // New onboarding fields
      nannyType,
      contractRegime,
      hourlyRateRange,
      activitiesNotAccepted,
      // Availability
      availability,
      // Preferences section (grouped CNH, smoker, pets)
      preferences,
    } = body;

    // Handle address - can be a nested object or individual fields
    const zipCode = address?.zipCode || rawZipCode;
    const streetName = address?.streetName || rawStreetName;
    const number = address?.number || rawNumber;
    const complement = address?.complement || rawComplement;
    const neighborhood = address?.neighborhood || rawNeighborhood;
    const city = address?.city || rawCity;
    const state = address?.state || rawState;

    // Prepare address data if provided
    const hasAddressData = zipCode || neighborhood || city || state;
    let addressId = null;

    if (hasAddressData) {
      if (currentUser.nanny.id) {
        // Get existing nanny to check for address
        const existingNanny = await prisma.nanny.findUnique({
          where: { id: currentUser.nanny.id },
          select: { addressId: true },
        });

        if (existingNanny?.addressId) {
          // Update existing address
          await prisma.address.update({
            where: { id: existingNanny.addressId },
            data: {
              zipCode: zipCode?.replace(/\D/g, '') || undefined,
              streetName: streetName || undefined,
              number: number || undefined,
              complement: complement || undefined,
              neighborhood: neighborhood || undefined,
              city: city || undefined,
              state: state || undefined,
            },
          });
          addressId = existingNanny.addressId;
        } else {
          // Create new address
          const newAddress = await prisma.address.create({
            data: {
              zipCode: zipCode?.replace(/\D/g, '') || '',
              streetName: streetName || '',
              number: number || '',
              complement: complement || '',
              neighborhood: neighborhood || '',
              city: city || '',
              state: state || '',
            },
          });
          addressId = newAddress.id;
        }
      } else {
        // Create new address for new nanny
        const newAddress = await prisma.address.create({
          data: {
            zipCode: zipCode?.replace(/\D/g, '') || '',
            streetName: streetName || '',
            number: number || '',
            complement: complement || '',
            neighborhood: neighborhood || '',
            city: city || '',
            state: state || '',
          },
        });
        addressId = newAddress.id;
      }
    }

    // Prepare nanny data
    const nannyData: Record<string, unknown> = {};

    if (addressId) {
      nannyData.addressId = addressId;
    }
    if (name !== undefined) {
      nannyData.name = name;
    }
    if (cpf !== undefined) {
      // Remove formatting from CPF (keep only digits)
      const cleanCpf = cpf.replace(/\D/g, '');
      const cpfHashValue = hashCpf(cleanCpf);

      // Check if CPF is already registered by another nanny (using hash for fast lookup)
      const existingNannyWithCpf = await prisma.nanny.findFirst({
        where: {
          cpfHash: cpfHashValue,
          NOT: { id: currentUser.nanny.id },
        },
      });

      if (existingNannyWithCpf) {
        return NextResponse.json(
          { error: 'Este CPF já está cadastrado em outra conta' },
          { status: 400 }
        );
      }

      // Check if CPF is already registered by a family (using hash for fast lookup)
      const existingFamilyWithCpf = await prisma.family.findFirst({
        where: { cpfHash: cpfHashValue },
      });

      if (existingFamilyWithCpf) {
        return NextResponse.json(
          { error: 'Este CPF já está cadastrado em outra conta' },
          { status: 400 }
        );
      }

      // Store encrypted CPF and hash
      nannyData.cpf = encryptCpf(cleanCpf);
      nannyData.cpfHash = cpfHashValue;
    }
    if (travelRadius !== undefined) {
      // travelRadius is now sent as enum value directly (e.g., 'UP_TO_10KM')
      nannyData.maxTravelDistance = travelRadius;
    }
    if (birthDate !== undefined) {
      // Parse DD/MM/YYYY to Date
      const [day, month, year] = birthDate.split('/');
      if (day && month && year) {
        nannyData.birthDate = new Date(`${year}-${month}-${day}`);
      }
    }
    if (phoneNumber !== undefined) {
      nannyData.phoneNumber = phoneToE164(phoneNumber);
    }
    if (gender !== undefined) {
      nannyData.gender = gender;
    }
    if (experienceYears !== undefined) {
      // Convert to number if it's a string (from radio button value)
      const parsedYears = toNumber(experienceYears);
      if (parsedYears !== undefined) {
        nannyData.experienceYears = parsedYears;
      }
    }
    if (childAgeExperiences !== undefined) {
      nannyData.ageRangesExperience = childAgeExperiences;
    }
    if (hasSpecialNeedsExperience !== undefined) {
      // Convert string "true"/"false" to boolean
      const parsedValue = toBoolean(hasSpecialNeedsExperience);
      if (parsedValue !== undefined) {
        nannyData.hasSpecialNeedsExperience = parsedValue;
      }
    }
    if (specialNeedsExperiences !== undefined) {
      // Store in the correct field for special needs specialties
      nannyData.specialNeedsSpecialties = specialNeedsExperiences;
    }
    if (specialNeedsDescription !== undefined) {
      nannyData.specialNeedsExperienceDescription = specialNeedsDescription;
    }
    // Step 5
    if (certifications !== undefined) {
      nannyData.certifications = certifications;
    }
    if (languages !== undefined) {
      nannyData.languages = languages;
    }
    // Step 6
    if (childTypePreference !== undefined) {
      nannyData.childTypePreference = childTypePreference;
    }
    if (strengths !== undefined) {
      nannyData.strengths = strengths;
    }
    if (maxChildrenCare !== undefined) {
      // Convert to number if it's a string
      const parsedValue = toNumber(maxChildrenCare);
      if (parsedValue !== undefined) {
        nannyData.maxChildrenCare = parsedValue;
      }
    }
    // Step 7/10
    if (aboutMe !== undefined) {
      nannyData.aboutMe = aboutMe;
    }
    // Step 8
    if (comfortableWithPets !== undefined) {
      // This is an enum: YES_ANY, ONLY_SOME, NO (not boolean)
      nannyData.comfortableWithPets = comfortableWithPets;
    }
    if (petsDescription !== undefined) {
      nannyData.petsDescription = petsDescription;
    }
    if (acceptedActivities !== undefined) {
      nannyData.acceptedActivities = acceptedActivities;
    }
    // Step 9
    if (careMethodology !== undefined) {
      nannyData.careMethodology = careMethodology;
    }
    if (hasVehicle !== undefined) {
      // Convert string "true"/"false" to boolean
      const parsedValue = toBoolean(hasVehicle);
      if (parsedValue !== undefined) {
        nannyData.hasVehicle = parsedValue;
      }
    }
    if (isSmoker !== undefined) {
      // Convert string "true"/"false" to boolean
      const parsedValue = toBoolean(isSmoker);
      if (parsedValue !== undefined) {
        nannyData.isSmoker = parsedValue;
      }
    }
    if (parentPresencePreference !== undefined) {
      nannyData.parentPresencePreference = parentPresencePreference;
    }
    if (maritalStatus !== undefined) {
      nannyData.maritalStatus = maritalStatus;
    }
    if (hasChildren !== undefined) {
      // Convert string "true"/"false" to boolean
      const parsedValue = toBoolean(hasChildren);
      if (parsedValue !== undefined) {
        nannyData.hasChildren = parsedValue;
      }
    }
    if (hasCnh !== undefined) {
      // Convert string "true"/"false" to boolean
      const parsedValue = toBoolean(hasCnh);
      if (parsedValue !== undefined) {
        nannyData.hasCnh = parsedValue;
      }
    }
    // New onboarding fields
    if (nannyType !== undefined) {
      nannyData.nannyTypes = nannyType;
    }
    if (contractRegime !== undefined) {
      nannyData.contractRegimes = contractRegime;
    }
    if (hourlyRateRange !== undefined) {
      nannyData.hourlyRateRange = hourlyRateRange;
    }
    if (activitiesNotAccepted !== undefined) {
      nannyData.activitiesNotAccepted = activitiesNotAccepted;
    }
    // Availability
    if (availability !== undefined) {
      nannyData.availabilityJson = availability;
    }
    // Preferences section (grouped fields)
    if (preferences !== undefined) {
      if (preferences.hasCnh !== undefined && preferences.hasCnh !== '') {
        nannyData.hasCnh = toBoolean(preferences.hasCnh);
      }
      if (preferences.isSmoker !== undefined && preferences.isSmoker !== '') {
        nannyData.isSmoker = toBoolean(preferences.isSmoker);
      }
      if (preferences.comfortableWithPets !== undefined && preferences.comfortableWithPets !== '') {
        nannyData.comfortableWithPets = preferences.comfortableWithPets;
      }
    }

    // Get existing nanny to check if slug needs to be generated
    const existingNanny = await prisma.nanny.findUnique({
      where: { id: currentUser.nanny.id },
      select: { slug: true, name: true },
    });

    // Generate slug when name is provided, valid, and nanny doesn't have a slug yet
    const cleanName = name?.trim();
    const hasValidName = cleanName && cleanName.length >= 2;
    if (hasValidName && !existingNanny?.slug) {
      nannyData.slug = generateSlug(cleanName);
    }

    // Also update nanny name if provided and valid
    if (hasValidName) {
      nannyData.name = cleanName;
    }

    // Update existing nanny
    const nanny = await prisma.nanny.update({
      where: { id: currentUser.nanny.id },
      data: nannyData,
    });

    return NextResponse.json({ success: true, nannyId: nanny.id });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002' &&
      (error.meta?.target as string[])?.includes('cpf_hash')
    ) {
      return NextResponse.json(
        { error: 'Este CPF já está cadastrado em outra conta' },
        { status: 400 }
      );
    }
    console.error('Error saving nanny partial data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
