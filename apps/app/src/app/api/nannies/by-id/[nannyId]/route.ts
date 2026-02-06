/**
 * API Route: Nanny by ID
 * GET /api/nannies/[nannyId] - Get nanny details (requer autenticação - apenas próprio perfil ou admin)
 * PUT /api/nannies/[nannyId] - Update nanny profile
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { phoneToE164 } from '@/helpers/validators';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ nannyId: string }> }
) {
  try {
    // Verificar autenticação
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { nannyId: nannyIdStr } = await params;
    const nannyId = parseInt(nannyIdStr);

    if (isNaN(nannyId)) {
      return NextResponse.json(
        { error: 'ID da baba invalido' },
        { status: 400 }
      );
    }

    // Verificar se o usuário é dono do perfil
    if (currentUser.type !== 'nanny' || currentUser.nanny.id !== nannyId) {
      return NextResponse.json(
        { error: 'Acesso negado - você só pode acessar seu próprio perfil' },
        { status: 403 }
      );
    }

    const nanny = await prisma.nanny.findUnique({
      where: { id: nannyId },
      select: {
        id: true,
        name: true,
        slug: true,
        cpf: true,
        phoneNumber: true,
        emailAddress: true,
        gender: true,
        birthDate: true,
        photoUrl: true,
        motherName: true,
        birthCity: true,
        birthState: true,
        specialtiesJson: true,
        experienceYears: true,
        hourlyRate: true,
        dailyRate: true,
        monthlyRate: true,
        minChildAge: true,
        maxChildAge: true,
        availabilityJson: true,
        serviceTypesJson: true,
        attendanceModesJson: true,
        skillsJson: true,
        pixKey: true,
        pixType: true,
        aboutMe: true,
        status: true,
        createdAt: true,
        // New V2.0 fields
        maxTravelDistance: true,
        ageRangesExperience: true,
        hasSpecialNeedsExperience: true,
        specialNeedsExperienceDescription: true,
        certifications: true,
        languages: true,
        childTypePreference: true,
        strengths: true,
        careMethodology: true,
        hasVehicle: true,
        comfortableWithPets: true,
        petsDescription: true,
        acceptedActivities: true,
        environmentPreference: true,
        parentPresencePreference: true,
        hasReferences: true,
        referencesVerified: true,
        // Additional fields
        isSmoker: true,
        maritalStatus: true,
        hasChildren: true,
        hasCnh: true,
        nannyTypes: true,
        contractRegimes: true,
        hourlyRateRange: true,
        activitiesNotAccepted: true,
        maxChildrenCare: true,
        acceptsHolidayWork: true,
        specialNeedsSpecialties: true,
        isProfilePublic: true,
        // Validation fields
        documentValidated: true,
        documentExpirationDate: true,
        personalDataValidated: true,
        criminalBackgroundValidated: true,
        address: {
          select: {
            streetName: true,
            number: true,
            complement: true,
            neighborhood: true,
            city: true,
            state: true,
            zipCode: true,
          },
        },
        documents: {
          select: {
            id: true,
            documentType: true,
            identifier: true,
            fileUrl: true,
            createdAt: true,
          },
          where: {
            status: 'ACTIVE',
          },
        },
        references: {
          select: {
            id: true,
            name: true,
            phone: true,
            relationship: true,
            verified: true,
          },
        },
        availability: true,
      },
    });

    if (!nanny) {
      return NextResponse.json(
        { error: 'Nanny not found' },
        { status: 404 }
      );
    }

    // Parse JSON fields for easier client consumption
    const nannyWithParsedFields = {
      ...nanny,
      specialties: nanny.specialtiesJson,
      availability: nanny.availabilityJson,
      serviceTypes: nanny.serviceTypesJson,
      attendanceModes: nanny.attendanceModesJson,
      skills: nanny.skillsJson,
    };

    return NextResponse.json(nannyWithParsedFields);
  } catch (error) {
    console.error('Get nanny error:', error);
    return NextResponse.json(
      { error: 'Falha ao buscar baba' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ nannyId: string }> }
) {
  try {
    const { nannyId: nannyIdStr } = await params;
    const nannyId = parseInt(nannyIdStr);

    if (isNaN(nannyId)) {
      return NextResponse.json(
        { error: 'ID da baba invalido' },
        { status: 400 }
      );
    }

    // Verify authentication
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user owns this nanny profile
    if (currentUser.type !== 'nanny' || currentUser.nanny.id !== nannyId) {
      return NextResponse.json(
        { error: 'Forbidden - You can only edit your own profile' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Convert phone to E.164 format if provided
    if (body.phoneNumber) {
      body.phoneNumber = phoneToE164(body.phoneNumber);
    }

    // Extract address fields and array fields
    const {
      zipCode,
      streetName,
      number,
      complement,
      neighborhood,
      city,
      state,
      specialties,
      availabilitySchedules,
      serviceTypes,
      attendanceModes,
      skills,
      hourlyRate,
      dailyRate,
      monthlyRate,
      birthDate,
      slug: _slug, // Extract and ignore slug - it should never be updated
      // New V2.0 fields
      aboutMe,
      maxTravelDistance,
      ageRangesExperience,
      hasSpecialNeedsExperience,
      specialNeedsExperienceDescription,
      certifications,
      languages,
      childTypePreference,
      strengths,
      careMethodology,
      hasVehicle,
      comfortableWithPets,
      petsDescription,
      acceptedActivities,
      environmentPreference,
      parentPresencePreference,
      // Additional fields
      isSmoker,
      maritalStatus,
      hasChildren,
      hasCnh,
      nannyTypes,
      contractRegimes,
      hourlyRateRange,
      activitiesNotAccepted,
      maxChildrenCare,
      acceptsHolidayWork,
      specialNeedsSpecialties,
      isProfilePublic,
      ...nannyData
    } = body;

    // Update nanny record
    const updatedNanny = await prisma.nanny.update({
      where: { id: nannyId },
      data: {
        ...nannyData,
        specialtiesJson: specialties ? specialties : undefined,
        availabilityJson: availabilitySchedules ? availabilitySchedules : undefined,
        serviceTypesJson: serviceTypes ? serviceTypes : undefined,
        attendanceModesJson: attendanceModes ? attendanceModes : undefined,
        skillsJson: skills ? skills : undefined,
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : undefined,
        dailyRate: dailyRate ? parseFloat(dailyRate) : undefined,
        monthlyRate: monthlyRate ? parseFloat(monthlyRate) : undefined,
        birthDate: birthDate ? new Date(birthDate) : undefined,
        // New V2.0 fields
        aboutMe: aboutMe !== undefined ? aboutMe : undefined,
        maxTravelDistance: maxTravelDistance !== undefined ? maxTravelDistance : undefined,
        ageRangesExperience: ageRangesExperience !== undefined ? ageRangesExperience : undefined,
        hasSpecialNeedsExperience: hasSpecialNeedsExperience !== undefined ? hasSpecialNeedsExperience : undefined,
        specialNeedsExperienceDescription: specialNeedsExperienceDescription !== undefined ? specialNeedsExperienceDescription : undefined,
        certifications: certifications !== undefined ? certifications : undefined,
        languages: languages !== undefined ? languages : undefined,
        childTypePreference: childTypePreference !== undefined ? childTypePreference : undefined,
        strengths: strengths !== undefined ? strengths : undefined,
        careMethodology: careMethodology !== undefined ? careMethodology : undefined,
        hasVehicle: hasVehicle !== undefined ? hasVehicle : undefined,
        comfortableWithPets: comfortableWithPets !== undefined ? comfortableWithPets : undefined,
        petsDescription: petsDescription !== undefined ? petsDescription : undefined,
        acceptedActivities: acceptedActivities !== undefined ? acceptedActivities : undefined,
        environmentPreference: environmentPreference !== undefined ? environmentPreference : undefined,
        parentPresencePreference: parentPresencePreference !== undefined ? parentPresencePreference : undefined,
        // Additional fields
        isSmoker: isSmoker !== undefined ? isSmoker : undefined,
        maritalStatus: maritalStatus !== undefined ? maritalStatus : undefined,
        hasChildren: hasChildren !== undefined ? hasChildren : undefined,
        hasCnh: hasCnh !== undefined ? hasCnh : undefined,
        nannyTypes: nannyTypes !== undefined ? nannyTypes : undefined,
        contractRegimes: contractRegimes !== undefined ? contractRegimes : undefined,
        hourlyRateRange: hourlyRateRange !== undefined ? hourlyRateRange : undefined,
        activitiesNotAccepted: activitiesNotAccepted !== undefined ? activitiesNotAccepted : undefined,
        maxChildrenCare: maxChildrenCare !== undefined ? maxChildrenCare : undefined,
        acceptsHolidayWork: acceptsHolidayWork !== undefined ? acceptsHolidayWork : undefined,
        specialNeedsSpecialties: specialNeedsSpecialties !== undefined ? specialNeedsSpecialties : undefined,
        isProfilePublic: isProfilePublic !== undefined ? isProfilePublic : undefined,
        address: {
          update: {
            zipCode,
            streetName,
            number,
            complement: complement || null,
            neighborhood,
            city,
            state,
          },
        },
      },
      include: {
        address: true,
      },
    });

    return NextResponse.json({
      message: 'Profile updated successfully',
      nanny: updatedNanny,
    });
  } catch (error) {
    console.error('Update nanny error:', error);
    return NextResponse.json(
      { error: 'Falha ao atualizar perfil da baba' },
      { status: 500 }
    );
  }
}
