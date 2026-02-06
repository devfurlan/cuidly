import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { phoneToE164 } from '@/helpers/validators';
import { slotsToArrays } from '@/schemas/family-onboarding';
import type { WeeklySchedule } from '@/schemas/job';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { encryptCpf, hashCpf } from '@/lib/crypto';

// Helper to convert availability slots to Job schedule format
function slotsToJobSchedule(slots: string[]): WeeklySchedule {
  const dayMap: Record<string, keyof WeeklySchedule> = {
    MONDAY: 'monday',
    TUESDAY: 'tuesday',
    WEDNESDAY: 'wednesday',
    THURSDAY: 'thursday',
    FRIDAY: 'friday',
    SATURDAY: 'saturday',
    SUNDAY: 'sunday',
  };

  const shiftTimes: Record<string, { startTime: string; endTime: string }> = {
    MORNING: { startTime: '06:00', endTime: '12:00' },
    AFTERNOON: { startTime: '12:00', endTime: '18:00' },
    NIGHT: { startTime: '18:00', endTime: '23:00' },
  };

  // Initialize all days as disabled
  const schedule: WeeklySchedule = {
    monday: { enabled: false },
    tuesday: { enabled: false },
    wednesday: { enabled: false },
    thursday: { enabled: false },
    friday: { enabled: false },
    saturday: { enabled: false },
    sunday: { enabled: false },
  };

  // Group slots by day to find earliest start and latest end
  const daySlots: Record<string, string[]> = {};
  for (const slot of slots) {
    const lastUnderscore = slot.lastIndexOf('_');
    if (lastUnderscore > 0) {
      const day = slot.substring(0, lastUnderscore);
      const shift = slot.substring(lastUnderscore + 1);
      if (!daySlots[day]) daySlots[day] = [];
      daySlots[day].push(shift);
    }
  }

  // Set schedule for each day with slots
  for (const [day, shifts] of Object.entries(daySlots)) {
    const dayKey = dayMap[day];
    if (!dayKey) continue;

    // Find earliest start and latest end
    let startTime = '23:00';
    let endTime = '06:00';
    for (const shift of shifts) {
      const times = shiftTimes[shift];
      if (times) {
        if (times.startTime < startTime) startTime = times.startTime;
        if (times.endTime > endTime) endTime = times.endTime;
      }
    }

    schedule[dayKey] = {
      enabled: true,
      startTime,
      endTime,
    };
  }

  return schedule;
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (currentUser.type !== 'family') {
      return NextResponse.json({ error: 'User is not a family' }, { status: 400 });
    }

    const body = await request.json();

    // Validar campos obrigatórios
    if (!body.responsibleName || typeof body.responsibleName !== 'string' || body.responsibleName.trim().length < 3) {
      return NextResponse.json(
        { error: 'Nome do responsável é obrigatório', field: 'responsibleName' },
        { status: 400 }
      );
    }

    const {
      // Step 1: Personal data
      responsibleName, // Campo do formulário para o nome
      phone,
      email,
      // New fields: CPF, birth date, gender
      cpf,
      birthDate,
      gender,
      numberOfChildren,
      // Address fields (flat format - legacy)
      zipCode: flatZipCode,
      streetName: flatStreetName,
      number: flatNumber,
      complement: flatComplement,
      neighborhood: flatNeighborhood,
      city: flatCity,
      state: flatState,
      // Address as nested object (new format from onboarding flow)
      address,
      // Family fields
      housingType,
      hasPets,
      petTypes,
      petsDescription,
      parentPresence,
      houseRules,
      // New fields: nanny type, contract regime
      nannyType,
      contractRegime,
      // Step 8: Values
      values,
      valuesInNanny,
      // Step 9: Preferences
      careMethodology,
      languages,
      // Step 10: Domestic help
      domesticHelpDetails,
      domesticHelpExpected,
      domesticHelp,
      // New fields: photos and AI-generated content
      familyPhoto,
      familyPresentation,
      jobDescription,
      jobPhotos,
      // New fields: children, availability, requirements
      children,
      availability,
      mandatoryRequirements,
      hourlyRateRange,
    } = body;

    // Support both flat and nested address formats
    const zipCode = flatZipCode || address?.zipCode;
    const streetName = flatStreetName || address?.streetName;
    const number = flatNumber || address?.number;
    const complement = flatComplement || address?.complement;
    const neighborhood = flatNeighborhood || address?.neighborhood;
    const city = flatCity || address?.city;
    const state = flatState || address?.state;

    // Prepare address data if provided
    const hasAddressData = zipCode || neighborhood || city || state;
    let addressId = null;
    const familyId = currentUser.family.id;

    if (hasAddressData) {
      if (familyId) {
        // Get existing family to check for address
        const existingFamily = await prisma.family.findUnique({
          where: { id: familyId },
          select: { addressId: true },
        });

        if (existingFamily?.addressId) {
          // Update existing address
          await prisma.address.update({
            where: { id: existingFamily.addressId },
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
          addressId = existingFamily.addressId;
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
        // Create new address for new family
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

    // Prepare family data
    const familyData: Record<string, unknown> = {};

    // Step 1: Personal data - salvar nome diretamente no campo name
    if (responsibleName) {
      familyData.name = responsibleName;
    }
    if (phone !== undefined) {
      familyData.phoneNumber = phoneToE164(phone);
    }
    if (email !== undefined) {
      familyData.emailAddress = email;
    }
    // New fields: CPF (with encryption), birth date, gender
    if (cpf !== undefined) {
      // Store CPF - remove mask for storage
      const cleanCpf = cpf.replace(/\D/g, '');
      const cpfHashValue = hashCpf(cleanCpf);

      // Check if CPF is already registered by another family (using hash for fast lookup)
      const existingFamilyWithCpf = await prisma.family.findFirst({
        where: {
          cpfHash: cpfHashValue,
          ...(familyId && { NOT: { id: familyId } }),
        },
      });

      if (existingFamilyWithCpf) {
        return NextResponse.json(
          { error: 'Este CPF já está cadastrado em outra conta' },
          { status: 400 }
        );
      }

      // Check if CPF is already registered by a nanny (using hash for fast lookup)
      const existingNannyWithCpf = await prisma.nanny.findFirst({
        where: { cpfHash: cpfHashValue },
      });

      if (existingNannyWithCpf) {
        return NextResponse.json(
          { error: 'Este CPF já está cadastrado em outra conta' },
          { status: 400 }
        );
      }

      // Store encrypted CPF and hash
      familyData.cpf = encryptCpf(cleanCpf);
      familyData.cpfHash = cpfHashValue;
    }
    if (birthDate !== undefined) {
      // Parse DD/MM/YYYY format to Date
      const parts = birthDate.split('/');
      if (parts.length === 3) {
        const [day, month, year] = parts;
        familyData.birthDate = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
      }
    }
    if (gender !== undefined) {
      familyData.gender = gender;
    }
    if (numberOfChildren !== undefined) {
      familyData.numberOfChildren = parseInt(numberOfChildren, 10);
    }

    if (addressId) {
      familyData.addressId = addressId;
    }
    if (housingType !== undefined) {
      familyData.housingType = housingType;
    }
    if (hasPets !== undefined) {
      // Convert string to boolean if needed
      familyData.hasPets = hasPets === true || hasPets === 'true';
    }
    if (petTypes !== undefined) {
      familyData.petTypes = petTypes;
    }
    if (petsDescription !== undefined) {
      familyData.petsDescription = petsDescription;
    }
    if (parentPresence !== undefined) {
      familyData.parentPresence = parentPresence;
    }
    if (houseRules !== undefined) {
      familyData.houseRules = houseRules;
    }
    // Handle values - accept both old 'values' and new 'valuesInNanny' field names
    const valuesData = valuesInNanny || values;
    if (valuesData !== undefined) {
      familyData.valuesInNanny = valuesData;
    }
    if (careMethodology !== undefined) {
      familyData.careMethodology = careMethodology;
    }
    if (languages !== undefined) {
      familyData.languages = languages;
    }
    // Handle domestic help - accept both old 'domesticHelpDetails' and new 'domesticHelpExpected' field names
    const domesticHelpData = domesticHelpExpected || domesticHelpDetails;
    if (domesticHelpData !== undefined) {
      familyData.domesticHelpExpected = domesticHelpData;
    }
    // New fields: nanny type, contract regime
    if (nannyType !== undefined) {
      familyData.nannyType = nannyType;
    }
    if (contractRegime !== undefined) {
      familyData.contractRegime = contractRegime;
    }
    // New fields: photos and AI-generated content
    if (familyPhoto !== undefined) {
      familyData.photoUrl = familyPhoto;
    }
    if (familyPresentation !== undefined) {
      familyData.familyPresentation = familyPresentation;
    }
    if (jobDescription !== undefined) {
      familyData.jobDescription = jobDescription;
    }
    if (jobPhotos !== undefined) {
      familyData.jobPhotos = jobPhotos;
    }
    // New fields: availability (slots array)
    if (availability !== undefined) {
      if (availability.slots !== undefined) {
        // Convert slots to neededDays/neededShifts for database storage
        const { neededDays, neededShifts } = slotsToArrays(availability.slots);
        familyData.neededDays = neededDays;
        familyData.neededShifts = neededShifts;
      }
    }
    // New fields: mandatory requirements
    if (mandatoryRequirements !== undefined) {
      familyData.requiresNonSmoker = mandatoryRequirements.includes('NON_SMOKER');
      familyData.requiresDriverLicense = mandatoryRequirements.includes('DRIVER_LICENSE');
    }
    // New field: hourly rate range
    if (hourlyRateRange !== undefined) {
      familyData.hourlyRateRange = hourlyRateRange;
    }
    // Handle domesticHelp array (new format)
    if (domesticHelp !== undefined) {
      familyData.domesticHelpExpected = domesticHelp;
    }

    // Update existing family
    const family = await prisma.family.update({
      where: { id: familyId },
      data: familyData,
    });

    // Handle children array if provided
    if (children !== undefined && Array.isArray(children)) {
      // Validate expectedBirthDate for unborn children (must be in the future)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      for (const childData of children) {
        if (childData.unborn && childData.expectedBirthDate) {
          const expectedDate = new Date(childData.expectedBirthDate);
          if (expectedDate <= today) {
            return NextResponse.json(
              { error: 'Data prevista do parto deve ser no futuro' },
              { status: 400 }
            );
          }
        }
      }

      // Get existing children for this family
      const existingChildFamilies = await prisma.childFamily.findMany({
        where: { familyId: family.id },
        include: { child: true },
      });

      const existingChildIds = new Set(existingChildFamilies.map((cf) => cf.childId));
      const updatedChildIds = new Set<number>();

      for (const childData of children) {
        if (childData.id) {
          // Update existing child
          await prisma.child.update({
            where: { id: childData.id },
            data: {
              name: childData.name || null,
              gender: childData.gender,
              birthDate: childData.birthDate ? new Date(childData.birthDate) : null,
              expectedBirthDate: childData.expectedBirthDate ? new Date(childData.expectedBirthDate) : null,
              carePriorities: childData.carePriorities || [],
              hasSpecialNeeds: childData.hasSpecialNeeds || false,
              specialNeedsTypes: childData.specialNeedsTypes || [],
              specialNeedsDescription: childData.specialNeedsDescription || null,
              unborn: childData.unborn || false,
            },
          });
          updatedChildIds.add(childData.id);
        } else {
          // Create new child
          const newChild = await prisma.child.create({
            data: {
              name: childData.name || null,
              gender: childData.gender,
              birthDate: childData.birthDate ? new Date(childData.birthDate) : null,
              expectedBirthDate: childData.expectedBirthDate ? new Date(childData.expectedBirthDate) : null,
              carePriorities: childData.carePriorities || [],
              hasSpecialNeeds: childData.hasSpecialNeeds || false,
              specialNeedsTypes: childData.specialNeedsTypes || [],
              specialNeedsDescription: childData.specialNeedsDescription || null,
              unborn: childData.unborn || false,
            },
          });

          // Link child to family
          await prisma.childFamily.create({
            data: {
              childId: newChild.id,
              familyId: family.id,
              isMain: updatedChildIds.size === 0, // First child is main
            },
          });

          updatedChildIds.add(newChild.id);
        }
      }

      // Remove children that were not in the update (soft delete)
      for (const childId of existingChildIds) {
        if (!updatedChildIds.has(childId)) {
          // Remove the child-family relationship
          await prisma.childFamily.delete({
            where: {
              childId_familyId: {
                childId,
                familyId: family.id,
              },
            },
          });
        }
      }

      // Update numberOfChildren
      await prisma.family.update({
        where: { id: family.id },
        data: { numberOfChildren: children.length },
      });
    }

    // Create FAMILY_FREE subscription if user doesn't have one yet
    const existingSubscription = await prisma.subscription.findUnique({
      where: { familyId },
    });

    if (!existingSubscription) {
      await prisma.subscription.create({
        data: {
          familyId,
          plan: 'FAMILY_FREE',
          status: 'ACTIVE',
          billingInterval: 'MONTH',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        },
      });
    }

    // Create job automatically when family has all required data
    // Check if family has the minimum data needed for a job
    const hasJobData = availability?.slots?.length > 0 && children && children.length > 0;

    if (hasJobData) {
      // Get children IDs for this family
      const familyChildren = await prisma.childFamily.findMany({
        where: { familyId: family.id },
        select: { childId: true },
      });
      const childrenIds = familyChildren.map(c => c.childId);

      // Only create job if family has children and doesn't have an active job yet
      if (childrenIds.length > 0) {
        const existingActiveJob = await prisma.job.findFirst({
          where: {
            familyId: family.id,
            status: 'ACTIVE',
            deletedAt: null,
          },
        });

        if (!existingActiveJob) {
          // Map nannyType to JobType
          const jobTypeMap: Record<string, 'FIXED' | 'SUBSTITUTE' | 'OCCASIONAL'> = {
            MENSALISTA: 'FIXED',
            FOLGUISTA: 'SUBSTITUTE',
            DIARISTA: 'OCCASIONAL',
          };
          const jobType = nannyType ? (jobTypeMap[nannyType] || 'FIXED') : 'FIXED';

          // Map contractRegime to ContractType
          const contractTypeMap: Record<string, 'CLT' | 'DAILY_WORKER' | 'MEI' | 'TO_BE_DISCUSSED'> = {
            CLT: 'CLT',
            PJ: 'MEI',
            AUTONOMA: 'DAILY_WORKER',
          };
          const contractType = contractRegime ? (contractTypeMap[contractRegime] || 'TO_BE_DISCUSSED') : 'TO_BE_DISCUSSED';

          // Map hourlyRateRange to budget values
          const budgetMap: Record<string, { min: number; max: number }> = {
            UP_TO_20: { min: 15, max: 20 },
            '20_TO_30': { min: 20, max: 30 },
            '30_TO_40': { min: 30, max: 40 },
            '40_TO_50': { min: 40, max: 50 },
            ABOVE_50: { min: 50, max: 100 },
          };
          const budget = hourlyRateRange ? (budgetMap[hourlyRateRange] || { min: 20, max: 40 }) : { min: 20, max: 40 };

          // Convert availability slots to job schedule format
          const schedule = slotsToJobSchedule(availability.slots);

          // Build mandatory requirements array
          const jobMandatoryRequirements: string[] = [];
          if (mandatoryRequirements) {
            if (mandatoryRequirements.includes('NON_SMOKER')) {
              jobMandatoryRequirements.push('NON_SMOKER');
            }
            if (mandatoryRequirements.includes('DRIVER_LICENSE')) {
              jobMandatoryRequirements.push('HAS_VEHICLE');
            }
          }

          // Get the family name for job title
          const familyForTitle = await prisma.family.findUnique({
            where: { id: family.id },
            select: { name: true },
          });

          // Create the job
          await prisma.job.create({
            data: {
              familyId: family.id,
              title: `Vaga de Babá - ${familyForTitle?.name || 'Família'}`,
              description: jobDescription || null,
              jobType,
              schedule,
              requiresOvernight: 'NO',
              contractType,
              benefits: [],
              paymentType: 'HOURLY',
              budgetMin: budget.min,
              budgetMax: budget.max,
              childrenIds,
              mandatoryRequirements: jobMandatoryRequirements,
              startDate: new Date(),
              status: 'ACTIVE',
            },
          });
        }
      }
    }

    return NextResponse.json({ success: true, familyId: family.id });
  } catch (error) {
    console.error('Error saving family partial data:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
