/**
 * Create test users in Supabase Auth + Prisma database.
 *
 * Usage: dotenv -e .env.test -- tsx scripts/create-test-users.ts
 *
 * Creates deterministic test users defined in seed/test-seed.ts,
 * plus additional data needed for E2E tests (addresses, children,
 * nanny profiles, jobs, conversations).
 *
 * Idempotent — skips records that already exist.
 */

import { createClient } from '@supabase/supabase-js';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { TEST_USERS } from '../seed/test-seed';

const TEST_PROJECT_REF = 'wvhlgotaloagdfsxpqal';

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;

  if (!supabaseUrl || !serviceRoleKey || !dbUrl) {
    console.error(
      '❌ Missing required env vars: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, DATABASE_URL',
    );
    process.exit(1);
  }

  // Safety check
  const isTestDb =
    dbUrl.includes(TEST_PROJECT_REF) ||
    dbUrl.includes('test') ||
    dbUrl.includes('staging') ||
    dbUrl.includes('localhost');

  if (!isTestDb) {
    console.error('❌ ABORT: DATABASE_URL does not match the test project!');
    console.error(`   Expected project ref "${TEST_PROJECT_REF}" in the URL.`);
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const adapter = new PrismaPg({ connectionString: dbUrl });
  const prisma = new PrismaClient({ adapter });

  // ─── Step 1: Create Supabase auth users ────────────────────────
  console.log('👤 Creating test users...');

  const authIds: Record<string, string> = {};

  const { data: existingUsers } = await supabase.auth.admin.listUsers();

  for (const [key, user] of Object.entries(TEST_USERS)) {
    try {
      const existing = existingUsers?.users?.find(
        (u) => u.email === user.email,
      );

      if (existing) {
        authIds[key] = existing.id;
        console.log(`  ⏭️  ${key}: Supabase user exists (${existing.id})`);
      } else {
        const { data: newUser, error: createError } =
          await supabase.auth.admin.createUser({
            email: user.email,
            password: user.password,
            email_confirm: true,
          });

        if (createError) {
          console.error(`  ❌ ${key}: ${createError.message}`);
          continue;
        }

        authIds[key] = newUser.user.id;
        console.log(`  ✅ ${key}: Created Supabase user (${newUser.user.id})`);
      }
    } catch (error) {
      console.error(`  ❌ ${key}: Error:`, error);
    }
  }

  // ─── Step 2: Create addresses ──────────────────────────────────
  console.log('\n📍 Creating addresses...');

  const spAddress = await prisma.address.upsert({
    where: { id: 1 },
    update: {},
    create: {
      zipCode: '01310100',
      streetName: 'Avenida Paulista',
      number: '1000',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP',
      country: 'Brazil',
      latitude: -23.5614,
      longitude: -46.6558,
      status: 'ACTIVE',
    },
  });

  const spAddress2 = await prisma.address.upsert({
    where: { id: 2 },
    update: {},
    create: {
      zipCode: '04543011',
      streetName: 'Rua Funchal',
      number: '500',
      neighborhood: 'Vila Olímpia',
      city: 'São Paulo',
      state: 'SP',
      country: 'Brazil',
      latitude: -23.5939,
      longitude: -46.6861,
      status: 'ACTIVE',
    },
  });

  console.log(`  ✅ Addresses created (ids: ${spAddress.id}, ${spAddress2.id})`);

  // ─── Step 3: Create Prisma records ─────────────────────────────
  console.log('\n👨‍👩‍👧 Creating Prisma records...');

  // --- Nannies ---
  const nannyData = {
    nanny: {
      slug: 'ana-test-nanny',
      plan: 'NANNY_FREE' as const,
      addressId: spAddress.id,
      extra: {
        birthDate: new Date('1995-03-15'),
        gender: 'FEMALE' as const,
        experienceYears: 5,
        aboutMe: 'Olá! Sou a Ana, babá dedicada com 5 anos de experiência.',
        isProfilePublic: true,
        hourlyRate: 35,
        dailyRate: 200,
        monthlyRate: 3000,
        maxChildrenCare: 3,
        maxTravelDistance: 'UP_TO_10KM' as const,
        nannyTypes: ['FIXED', 'SUBSTITUTE'],
        contractRegimes: ['CLT', 'MEI'],
        hourlyRateRange: 'FROM_31_TO_40',
        ageRangesExperience: ['NEWBORN', 'BABY', 'TODDLER'],
        strengths: ['PATIENT', 'CREATIVE', 'ORGANIZED'],
        acceptedActivities: ['COOK_MEALS', 'HELP_HOMEWORK', 'LIGHT_CLEANING'],
        certifications: ['FIRST_AID'],
        languages: ['PORTUGUESE_NATIVE'],
        careMethodology: 'MONTESSORI',
        comfortableWithPets: 'YES_ANY' as const,
        parentPresencePreference: 'NO_PREFERENCE' as const,
        acceptsHolidayWork: 'YES' as const,
      },
    },
    nannyPro: {
      slug: 'maria-test-nannypro',
      plan: 'NANNY_PRO' as const,
      addressId: spAddress2.id,
      extra: {
        birthDate: new Date('1990-08-20'),
        gender: 'FEMALE' as const,
        experienceYears: 10,
        aboutMe: 'Sou a Maria, babá profissional com mais de 10 anos de experiência.',
        isProfilePublic: true,
        hourlyRate: 50,
        dailyRate: 300,
        monthlyRate: 5000,
        maxChildrenCare: 4,
        maxTravelDistance: 'UP_TO_20KM' as const,
        nannyTypes: ['FIXED', 'SUBSTITUTE', 'OCCASIONAL'],
        contractRegimes: ['CLT', 'MEI', 'DAILY_WORKER'],
        hourlyRateRange: 'FROM_41_TO_50',
        ageRangesExperience: ['NEWBORN', 'BABY', 'TODDLER', 'PRESCHOOL', 'SCHOOL_AGE'],
        strengths: ['PATIENT', 'CREATIVE', 'ORGANIZED', 'COMMUNICATIVE'],
        acceptedActivities: ['COOK_MEALS', 'HELP_HOMEWORK', 'LIGHT_CLEANING', 'TAKE_TO_SCHOOL'],
        certifications: ['FIRST_AID', 'PEDAGOGY'],
        languages: ['PORTUGUESE_NATIVE', 'ENGLISH_INTERMEDIATE'],
        careMethodology: 'MONTESSORI',
        comfortableWithPets: 'YES_ANY' as const,
        parentPresencePreference: 'NO_PREFERENCE' as const,
        acceptsHolidayWork: 'SOMETIMES' as const,
        hasSpecialNeedsExperience: true,
        specialNeedsExperienceDescription: 'Experiência com crianças com TEA.',
        documentValidated: true,
        documentValidationDate: new Date(),
      },
    },
  };

  const nannyRecords: Record<string, { id: number }> = {};

  for (const [key, config] of Object.entries(nannyData)) {
    const authId = authIds[key];
    if (!authId) continue;

    const user = TEST_USERS[key as keyof typeof TEST_USERS];
    const existing = await prisma.nanny.findFirst({ where: { authId } });

    if (existing) {
      // Update with additional data if needed
      await prisma.nanny.update({
        where: { id: existing.id },
        data: {
          addressId: config.addressId,
          isProfilePublic: true,
          slug: config.slug,
          ...config.extra,
        },
      });
      nannyRecords[key] = existing;
      console.log(`  ⏭️  ${key}: Nanny updated (${existing.id})`);
    } else {
      const nanny = await prisma.nanny.create({
        data: {
          authId,
          emailAddress: user.email,
          name: user.name,
          status: 'ACTIVE',
          onboardingCompleted: true,
          slug: config.slug,
          addressId: config.addressId,
          ...config.extra,
        },
      });

      await prisma.subscription.create({
        data: {
          nannyId: nanny.id,
          plan: config.plan,
          status: 'ACTIVE',
          billingInterval: 'MONTH',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });

      nannyRecords[key] = nanny;
      console.log(`  ✅ ${key}: Created Nanny + ${config.plan} subscription`);
    }
  }

  // Create nanny availability
  for (const [key, record] of Object.entries(nannyRecords)) {
    const existingAvail = await prisma.nannyAvailability.findUnique({
      where: { nannyId: record.id },
    });

    if (!existingAvail) {
      await prisma.nannyAvailability.create({
        data: {
          nannyId: record.id,
          jobTypes: ['FIXED', 'SUBSTITUTE'],
          schedule: {
            monday: { morning: true, afternoon: true, evening: false, overnight: false },
            tuesday: { morning: true, afternoon: true, evening: false, overnight: false },
            wednesday: { morning: true, afternoon: true, evening: true, overnight: false },
            thursday: { morning: true, afternoon: true, evening: false, overnight: false },
            friday: { morning: true, afternoon: true, evening: false, overnight: false },
            saturday: { morning: false, afternoon: false, evening: false, overnight: false },
            sunday: { morning: false, afternoon: false, evening: false, overnight: false },
          },
          schedulePreference: 'FLEXIBLE',
          acceptsOvernight: key === 'nannyPro' ? 'OCCASIONALLY' : 'NO',
          availableFrom: new Date(),
          monthlyRate: key === 'nannyPro' ? 5000 : 3000,
          hourlyRate: key === 'nannyPro' ? 50 : 35,
          dailyRate: key === 'nannyPro' ? 300 : 200,
          preferredContractTypes: ['CLT', 'MEI'],
          allowsMultipleJobs: 'YES',
        },
      });
      console.log(`  ✅ ${key}: Created availability`);
    } else {
      console.log(`  ⏭️  ${key}: Availability exists`);
    }
  }

  // --- Families ---
  const familyRecords: Record<string, { id: number }> = {};

  for (const key of ['family', 'familyPaid'] as const) {
    const authId = authIds[key];
    if (!authId) continue;

    const user = TEST_USERS[key];
    const existing = await prisma.family.findFirst({ where: { authId } });

    if (existing) {
      await prisma.family.update({
        where: { id: existing.id },
        data: { addressId: spAddress.id },
      });
      familyRecords[key] = existing;
      console.log(`  ⏭️  ${key}: Family updated (${existing.id})`);
    } else {
      const family = await prisma.family.create({
        data: {
          authId,
          emailAddress: user.email,
          name: user.name,
          status: 'ACTIVE',
          onboardingCompleted: true,
          addressId: spAddress.id,
          numberOfChildren: 2,
          housingType: 'APARTMENT_WITH_ELEVATOR',
          hasPets: false,
          nannyType: 'MENSALISTA',
          contractRegime: 'CLT',
        },
      });

      const plan = key === 'familyPaid' ? 'FAMILY_PLUS' : 'FAMILY_FREE';
      await prisma.subscription.create({
        data: {
          familyId: family.id,
          plan,
          status: 'ACTIVE',
          billingInterval: 'MONTH',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });

      familyRecords[key] = family;
      console.log(`  ✅ ${key}: Created Family + ${plan} subscription`);
    }
  }

  // ─── Step 4: Create children for families ──────────────────────
  console.log('\n👶 Creating children...');

  for (const [key, familyRecord] of Object.entries(familyRecords)) {
    const existingChildren = await prisma.childFamily.findMany({
      where: { familyId: familyRecord.id },
    });

    if (existingChildren.length === 0) {
      const child1 = await prisma.child.create({
        data: {
          name: 'Lucas',
          birthDate: new Date('2022-06-15'),
          gender: 'MALE',
          status: 'ACTIVE',
        },
      });

      const child2 = await prisma.child.create({
        data: {
          name: 'Sofia',
          birthDate: new Date('2020-01-10'),
          gender: 'FEMALE',
          status: 'ACTIVE',
        },
      });

      await prisma.childFamily.createMany({
        data: [
          { childId: child1.id, familyId: familyRecord.id, relationshipType: 'PARENT', isMain: true },
          { childId: child2.id, familyId: familyRecord.id, relationshipType: 'PARENT', isMain: false },
        ],
      });

      console.log(`  ✅ ${key}: Created 2 children`);
    } else {
      console.log(`  ⏭️  ${key}: Children exist (${existingChildren.length})`);
    }
  }

  // ─── Step 5: Create a job from familyPaid ──────────────────────
  console.log('\n📋 Creating test job...');

  const familyPaid = familyRecords.familyPaid;
  if (familyPaid) {
    const existingJob = await prisma.job.findFirst({
      where: { familyId: familyPaid.id, status: 'ACTIVE' },
    });

    if (!existingJob) {
      // Get children IDs for the job
      const familyChildren = await prisma.childFamily.findMany({
        where: { familyId: familyPaid.id },
        select: { childId: true },
      });

      await prisma.job.create({
        data: {
          familyId: familyPaid.id,
          title: 'Babá fixa para 2 crianças em São Paulo',
          description:
            'Procuramos uma babá fixa e carinhosa para cuidar de duas crianças (2 e 4 anos) no período da manhã. A babá deve ter experiência com crianças pequenas.',
          jobType: 'FIXED',
          schedule: {
            monday: { enabled: true, startTime: '08:00', endTime: '17:00' },
            tuesday: { enabled: true, startTime: '08:00', endTime: '17:00' },
            wednesday: { enabled: true, startTime: '08:00', endTime: '17:00' },
            thursday: { enabled: true, startTime: '08:00', endTime: '17:00' },
            friday: { enabled: true, startTime: '08:00', endTime: '17:00' },
            saturday: { enabled: false },
            sunday: { enabled: false },
          },
          requiresOvernight: 'NO',
          contractType: 'CLT',
          paymentType: 'MONTHLY',
          budgetMin: 3000,
          budgetMax: 4500,
          childrenIds: familyChildren.map((c) => c.childId),
          mandatoryRequirements: ['FIRST_AID'],
          startDate: new Date(),
          status: 'ACTIVE',
        },
      });

      console.log('  ✅ Created test job from familyPaid');
    } else {
      console.log(`  ⏭️  Job already exists (id: ${existingJob.id})`);
    }
  }

  // ─── Step 6: Create job application from nannyPro ──────────────
  console.log('\n📝 Creating test job application...');

  const nannyPro = nannyRecords.nannyPro;
  if (familyPaid && nannyPro) {
    const job = await prisma.job.findFirst({
      where: { familyId: familyPaid.id, status: 'ACTIVE' },
    });

    if (job) {
      const existingApp = await prisma.jobApplication.findFirst({
        where: { jobId: job.id, nannyId: nannyPro.id },
      });

      if (!existingApp) {
        await prisma.jobApplication.create({
          data: {
            jobId: job.id,
            nannyId: nannyPro.id,
            status: 'PENDING',
            matchScore: 85,
            message:
              'Olá! Tenho muita experiência com crianças pequenas e adoraria cuidar dos seus filhos.',
          },
        });
        console.log('  ✅ Created job application from nannyPro');
      } else {
        console.log('  ⏭️  Job application already exists');
      }
    }
  }

  // ─── Step 7: Create a conversation ─────────────────────────────
  console.log('\n💬 Creating test conversation...');

  if (familyPaid && nannyPro) {
    const job = await prisma.job.findFirst({
      where: { familyId: familyPaid.id, status: 'ACTIVE' },
    });

    const existingConversation = await prisma.participant.findFirst({
      where: {
        familyId: familyPaid.id,
        conversation: {
          participants: { some: { nannyId: nannyPro.id } },
        },
      },
    });

    if (!existingConversation) {
      const conversation = await prisma.conversation.create({
        data: {
          jobId: job?.id,
          lastMessagePreview: 'Olá! Vi que você se candidatou à vaga.',
          lastMessageAt: new Date(),
          participants: {
            create: [
              { familyId: familyPaid.id },
              { nannyId: nannyPro.id },
            ],
          },
          messages: {
            create: [
              {
                senderFamilyId: familyPaid.id,
                body: 'Olá! Vi que você se candidatou à vaga. Podemos conversar?',
                seq: 1,
              },
              {
                senderNannyId: nannyPro.id,
                body: 'Olá! Claro, estou disponível para conversar. Quando seria melhor?',
                seq: 2,
              },
            ],
          },
        },
      });

      console.log(`  ✅ Created conversation (${conversation.id}) with 2 messages`);
    } else {
      console.log('  ⏭️  Conversation already exists');
    }
  }

  // ─── Step 8: Create test coupons ──────────────────────────────
  console.log('\n🏷️  Creating test coupons...');

  const now = new Date();
  const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
  const twoYearsAgo = new Date(now.getFullYear() - 2, now.getMonth(), now.getDate());
  const oneYearFromNow = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
  const twoYearsFromNow = new Date(now.getFullYear() + 2, now.getMonth(), now.getDate());

  const testCoupons = [
    {
      code: 'TESTE20',
      discountType: 'PERCENTAGE' as const,
      discountValue: 20,
      applicableTo: 'ALL' as const,
      startDate: oneYearAgo,
      endDate: oneYearFromNow,
      isActive: true,
    },
    {
      code: 'TESTE50CAP',
      discountType: 'PERCENTAGE' as const,
      discountValue: 50,
      maxDiscount: 10,
      applicableTo: 'ALL' as const,
      startDate: oneYearAgo,
      endDate: oneYearFromNow,
      isActive: true,
    },
    {
      code: 'FIXO15',
      discountType: 'FIXED' as const,
      discountValue: 15,
      applicableTo: 'ALL' as const,
      startDate: oneYearAgo,
      endDate: oneYearFromNow,
      isActive: true,
    },
    {
      code: 'FIXO999',
      discountType: 'FIXED' as const,
      discountValue: 999,
      applicableTo: 'ALL' as const,
      startDate: oneYearAgo,
      endDate: oneYearFromNow,
      isActive: true,
    },
    {
      code: 'TRIAL7',
      discountType: 'FREE_TRIAL_DAYS' as const,
      discountValue: 7,
      applicableTo: 'ALL' as const,
      startDate: oneYearAgo,
      endDate: oneYearFromNow,
      isActive: true,
    },
    {
      code: 'TRIAL90NOCARD',
      discountType: 'FREE_TRIAL_DAYS' as const,
      discountValue: 90,
      applicableTo: 'NANNIES' as const,
      requiresCreditCard: false,
      startDate: oneYearAgo,
      endDate: oneYearFromNow,
      isActive: true,
    },
    {
      code: 'INATIVO',
      discountType: 'PERCENTAGE' as const,
      discountValue: 10,
      applicableTo: 'ALL' as const,
      startDate: oneYearAgo,
      endDate: oneYearFromNow,
      isActive: false,
    },
    {
      code: 'EXPIRADO',
      discountType: 'PERCENTAGE' as const,
      discountValue: 10,
      applicableTo: 'ALL' as const,
      startDate: twoYearsAgo,
      endDate: oneYearAgo,
      isActive: true,
    },
    {
      code: 'FUTURO',
      discountType: 'PERCENTAGE' as const,
      discountValue: 10,
      applicableTo: 'ALL' as const,
      startDate: oneYearFromNow,
      endDate: twoYearsFromNow,
      isActive: true,
    },
    {
      code: 'LIMITADO',
      discountType: 'PERCENTAGE' as const,
      discountValue: 10,
      applicableTo: 'ALL' as const,
      startDate: oneYearAgo,
      endDate: oneYearFromNow,
      isActive: true,
      usageLimit: 1,
      usageCount: 1,
    },
    {
      code: 'FAMILIA10',
      discountType: 'PERCENTAGE' as const,
      discountValue: 10,
      applicableTo: 'FAMILIES' as const,
      startDate: oneYearAgo,
      endDate: oneYearFromNow,
      isActive: true,
    },
    {
      code: 'BABA10',
      discountType: 'PERCENTAGE' as const,
      discountValue: 10,
      applicableTo: 'NANNIES' as const,
      startDate: oneYearAgo,
      endDate: oneYearFromNow,
      isActive: true,
    },
    {
      code: 'PLUSONLY',
      discountType: 'PERCENTAGE' as const,
      discountValue: 15,
      applicableTo: 'SPECIFIC_PLAN' as const,
      applicablePlanIds: ['FAMILY_PLUS'],
      startDate: oneYearAgo,
      endDate: oneYearFromNow,
      isActive: true,
    },
    {
      code: 'MIN100',
      discountType: 'PERCENTAGE' as const,
      discountValue: 10,
      applicableTo: 'ALL' as const,
      minPurchaseAmount: 100,
      startDate: oneYearAgo,
      endDate: oneYearFromNow,
      isActive: true,
    },
    {
      code: 'EXCLUSIVO',
      discountType: 'PERCENTAGE' as const,
      discountValue: 25,
      applicableTo: 'ALL' as const,
      hasUserRestriction: true,
      startDate: oneYearAgo,
      endDate: oneYearFromNow,
      isActive: true,
    },
  ];

  for (const coupon of testCoupons) {
    const { code, ...data } = coupon;
    await prisma.coupon.upsert({
      where: { code },
      update: {
        ...data,
      },
      create: {
        code,
        ...data,
      },
    });
    console.log(`  ✅ Coupon ${code} created/updated`);
  }

  // Create allowed email for EXCLUSIVO coupon
  const exclusivoCoupon = await prisma.coupon.findUnique({
    where: { code: 'EXCLUSIVO' },
  });

  if (exclusivoCoupon) {
    const allowedEmail = 'familia-teste@cuidly.com';
    await prisma.couponAllowedEmail.upsert({
      where: {
        couponId_email: {
          couponId: exclusivoCoupon.id,
          email: allowedEmail,
        },
      },
      update: {},
      create: {
        couponId: exclusivoCoupon.id,
        email: allowedEmail,
      },
    });
    console.log(`  ✅ Allowed email ${allowedEmail} added to EXCLUSIVO coupon`);
  }

  // ─── Step 9: Create SystemConfig for trigger trials ──────────
  console.log('\n⚙️  Creating SystemConfig entries...');

  const systemConfigs = [
    {
      key: 'trigger_trial_enabled',
      value: 'true',
      type: 'boolean',
      label: 'Trigger Trial Habilitado',
      description: 'Liga/desliga o sistema de trigger trials',
    },
    {
      key: 'trigger_trial_family_days',
      value: '7',
      type: 'number',
      label: 'Dias de Trial (Família)',
      description: 'Duração do trigger trial para famílias',
    },
    {
      key: 'trigger_trial_nanny_days',
      value: '7',
      type: 'number',
      label: 'Dias de Trial (Babá)',
      description: 'Duração do trigger trial para babás',
    },
  ];

  for (const config of systemConfigs) {
    await prisma.systemConfig.upsert({
      where: { key: config.key },
      update: { value: config.value },
      create: config,
    });
    console.log(`  ✅ SystemConfig ${config.key} = ${config.value}`);
  }

  await prisma.$disconnect();
  console.log('\n✅ Test data setup complete.');
}

main();
