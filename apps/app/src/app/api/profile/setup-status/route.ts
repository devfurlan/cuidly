import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser, getSubscriptionParams } from '@/lib/auth/getCurrentUser';
import { getSubscription } from '@/services/subscription/subscription-service';

interface TaskDefinition {
  id: string;
  label: string;
  description?: string;
  requiresPro?: boolean;
}

// Nanny task definitions (requisitos para Selo Identificada)
const NANNY_TASKS: TaskDefinition[] = [
  { id: 'basic-profile', label: 'Completar perfil', description: 'Preencha todos os dados do seu perfil' },
  { id: 'document-verification', label: 'Validar documento', description: 'Envie seu RG ou CNH' },
  { id: 'email-verified', label: 'Verificar e-mail', description: 'Confirme seu endereço de e-mail' },
];

// Family task definitions
const FAMILY_TASKS: TaskDefinition[] = [
  { id: 'basic-profile', label: 'Completar perfil básico', description: 'Nome e foto' },
  { id: 'children', label: 'Adicionar filhos' },
  { id: 'address', label: 'Configurar endereço' },
  { id: 'job-created', label: 'Criar vaga' },
  { id: 'family-presentation', label: 'Apresentação da família' },
  { id: 'job-description', label: 'Descrição da vaga' },
  { id: 'job-photos', label: 'Adicionar fotos da vaga' },
  { id: 'email-verified', label: 'Verificar e-mail' },
];

function checkNannyTaskCompletion(
  nanny: {
    name: string | null;
    cpf: string | null;
    birthDate: Date | null;
    gender: string | null;
    photoUrl: string | null;
    address: {
      city: string | null;
      state: string | null;
      neighborhood: string | null;
      streetName: string | null;
      zipCode: string | null;
    } | null;
    aboutMe: string | null;
    experienceYears: number | null;
    ageRangesExperience: string[];
    strengths: string[];
    acceptedActivities: string[];
    nannyTypes: string[];
    contractRegimes: string[];
    hourlyRateRange: string | null;
    maxChildrenCare: number | null;
    maxTravelDistance: string | null;
    availabilityJson: unknown;
    documentValidated: boolean;
    emailVerified: boolean;
  },
  hasProSubscription: boolean
): Map<string, { completed: boolean; locked: boolean }> {
  const results = new Map<string, { completed: boolean; locked: boolean }>();

  // Basic profile: all required onboarding fields
  const hasBasicProfile = !!(
    // Identificação
    nanny.name &&
    nanny.cpf &&
    nanny.birthDate &&
    nanny.gender &&
    nanny.photoUrl &&
    // Endereço
    nanny.address?.city &&
    nanny.address?.state &&
    nanny.address?.neighborhood &&
    nanny.address?.streetName &&
    nanny.address?.zipCode &&
    // Sobre mim
    nanny.aboutMe &&
    // Experiência
    nanny.experienceYears !== null &&
    nanny.ageRangesExperience?.length > 0 &&
    nanny.strengths?.length > 0 &&
    nanny.acceptedActivities?.length > 0 &&
    // Trabalho
    nanny.nannyTypes?.length > 0 &&
    nanny.contractRegimes?.length > 0 &&
    nanny.hourlyRateRange &&
    nanny.maxChildrenCare &&
    nanny.maxTravelDistance &&
    // Disponibilidade
    nanny.availabilityJson
  );
  results.set('basic-profile', { completed: hasBasicProfile, locked: false });

  // Document verification (RG/CNH via Documentoscopia)
  results.set('document-verification', {
    completed: nanny.documentValidated,
    locked: false,
  });

  // Email verified
  results.set('email-verified', {
    completed: nanny.emailVerified,
    locked: false,
  });

  return results;
}

function checkFamilyTaskCompletion(
  family: {
    name: string | null;
    photoUrl: string | null;
    address: { city: string | null } | null;
    familyPresentation: string | null;
    jobDescription: string | null;
    jobPhotos: string[];
    emailVerified: boolean;
  },
  childrenCount: number,
  activeJobsCount: number
): Map<string, { completed: boolean; locked: boolean }> {
  const results = new Map<string, { completed: boolean; locked: boolean }>();

  // Basic profile: name, photoUrl
  results.set('basic-profile', {
    completed: !!(family.name && family.photoUrl),
    locked: false,
  });

  // Children
  results.set('children', {
    completed: childrenCount > 0,
    locked: false,
  });

  // Address
  results.set('address', {
    completed: !!family.address?.city,
    locked: false,
  });

  // Job created
  results.set('job-created', {
    completed: activeJobsCount > 0,
    locked: false,
  });

  // Family presentation
  results.set('family-presentation', {
    completed: !!(family.familyPresentation && family.familyPresentation.length > 0),
    locked: false,
  });

  // Job description
  results.set('job-description', {
    completed: !!(family.jobDescription && family.jobDescription.length > 0),
    locked: false,
  });

  // Job photos
  results.set('job-photos', {
    completed: family.jobPhotos && family.jobPhotos.length > 0,
    locked: false,
  });

  // Email verified
  results.set('email-verified', {
    completed: family.emailVerified,
    locked: false,
  });

  return results;
}

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const subscriptionParams = getSubscriptionParams(currentUser);
    const subscription = await getSubscription(subscriptionParams);
    const hasProSubscription =
      (subscription?.status === 'ACTIVE' || subscription?.status === 'TRIALING') &&
      (subscription.plan === 'NANNY_PRO' || subscription.plan === 'FAMILY_PLUS');

    if (currentUser.type === 'nanny') {
      const nanny = await prisma.nanny.findUnique({
        where: { id: currentUser.nanny.id },
        select: {
          name: true,
          cpf: true,
          birthDate: true,
          gender: true,
          photoUrl: true,
          aboutMe: true,
          experienceYears: true,
          ageRangesExperience: true,
          strengths: true,
          acceptedActivities: true,
          nannyTypes: true,
          contractRegimes: true,
          hourlyRateRange: true,
          maxChildrenCare: true,
          maxTravelDistance: true,
          availabilityJson: true,
          documentValidated: true,
          emailVerified: true,
          address: {
            select: {
              city: true,
              state: true,
              neighborhood: true,
              streetName: true,
              zipCode: true,
            },
          },
        },
      });

      if (!nanny) {
        return NextResponse.json({ error: 'Nanny not found' }, { status: 404 });
      }

      const taskResults = checkNannyTaskCompletion(nanny, hasProSubscription);

      const tasks = NANNY_TASKS.map((task) => {
        const result = taskResults.get(task.id) || { completed: false, locked: false };
        return {
          id: task.id,
          label: task.label,
          description: task.description,
          status: result.locked ? 'locked' : result.completed ? 'completed' : 'pending',
          requiresPro: task.requiresPro,
        };
      });

      const completedCount = tasks.filter((t) => t.status === 'completed').length;
      const totalCount = tasks.length;
      const percentComplete = Math.round((completedCount / totalCount) * 100);

      return NextResponse.json({
        success: true,
        data: {
          userType: 'nanny',
          completedTasks: completedCount,
          totalTasks: totalCount,
          percentComplete,
          tasks,
          hasProSubscription,
        },
      });
    }

    if (currentUser.type === 'family') {
      const family = await prisma.family.findUnique({
        where: { id: currentUser.family.id },
        select: {
          name: true,
          photoUrl: true,
          familyPresentation: true,
          jobDescription: true,
          jobPhotos: true,
          emailVerified: true,
          address: {
            select: { city: true },
          },
          _count: {
            select: {
              children: true,
              jobs: {
                where: { status: 'ACTIVE' },
              },
            },
          },
        },
      });

      if (!family) {
        return NextResponse.json({ error: 'Family not found' }, { status: 404 });
      }

      const childrenCount = family._count.children;
      const activeJobsCount = family._count.jobs;
      const taskResults = checkFamilyTaskCompletion(family, childrenCount, activeJobsCount);

      const tasks = FAMILY_TASKS.map((task) => {
        const result = taskResults.get(task.id) || { completed: false, locked: false };
        return {
          id: task.id,
          label: task.label,
          description: task.description,
          status: result.locked ? 'locked' : result.completed ? 'completed' : 'pending',
          requiresPro: task.requiresPro,
        };
      });

      const completedCount = tasks.filter((t) => t.status === 'completed').length;
      const totalCount = tasks.length;
      const percentComplete = Math.round((completedCount / totalCount) * 100);

      return NextResponse.json({
        success: true,
        data: {
          userType: 'family',
          completedTasks: completedCount,
          totalTasks: totalCount,
          percentComplete,
          tasks,
          hasProSubscription,
        },
      });
    }

    return NextResponse.json({ error: 'Invalid user type' }, { status: 400 });
  } catch (error) {
    console.error('Error fetching profile setup status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
