import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  ModerationAction,
  NotificationType,
  PrismaClient,
} from "@prisma/client";

/**
 * Gera um slug único para nanny
 * Formato: {primeiro-nome}-{4-chars-aleatórios}
 */
function generateNannySlug(name: string): string {
  const firstName = name.trim().split(/\s+/)[0];
  const firstNameSlug = firstName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
  const randomChars = Math.random()
    .toString(36)
    .substring(2, 6)
    .padEnd(4, "0");
  return `${firstNameSlug}-${randomChars}`;
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Iniciando seed do banco de dados...");

  // Limpar dados existentes (em ordem de dependências)
  console.log("🧹 Limpando dados existentes...");
  await prisma.message.deleteMany();
  await prisma.participant.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.moderationLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.review.deleteMany();
  await prisma.participant.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.jobApplication.deleteMany();
  await prisma.job.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.reference.deleteMany();
  await prisma.nannyAvailability.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.boost.deleteMany();
  await prisma.profileAnalytics.deleteMany();
  await prisma.childFamily.deleteMany();
  await prisma.child.deleteMany();
  await prisma.document.deleteMany();
  await prisma.adminUser.deleteMany();
  await prisma.family.deleteMany();
  await prisma.nanny.deleteMany();
  await prisma.address.deleteMany();

  // ============================================
  // CRIAR PLANOS
  // ============================================
  console.log("📋 Criando planos...");

  const planFree = await prisma.plan.create({
    data: {
      name: "FREE",
      type: "FAMILY",
      price: 0,
      billingCycle: "MONTHLY",
      features: {
        viewProfiles: -1, // unlimited profile views
        createJobs: 1, // 1 free job for families
        unlimitedContact: false,
        maxConversationsPerJob: 3, // max 3 distinct nannies per job
        jobExpirationDays: 7, // job expires in 7 days
        matching: false,
        seeReviews: 1, // 1 review per nanny
        favorite: true,
        seeVerificationSeals: true,
      },
      isActive: true,
    },
  });

  const planFamilyMonthly = await prisma.plan.create({
    data: {
      name: "FAMILY_MONTHLY",
      type: "FAMILY",
      price: 49.0,
      billingCycle: "MONTHLY",
      features: {
        viewProfiles: -1, // ilimitado
        createJobs: 3,
        unlimitedContact: true,
        matching: true,
        seeReviews: true,
        favorite: true,
        rateNannies: true,
        seeValidatedNannies: true,
      },
      isActive: true,
    },
  });

  const planFamilyQuarterly = await prisma.plan.create({
    data: {
      name: "FAMILY_QUARTERLY",
      type: "FAMILY",
      price: 99.0,
      billingCycle: "QUARTERLY",
      features: {
        viewProfiles: -1,
        createJobs: 3,
        unlimitedContact: true,
        matching: true,
        seeReviews: true,
        favorite: true,
        rateNannies: true,
        seeValidatedNannies: true,
        jobHighlight: true,
        boostPerMonth: 1,
      },
      isActive: true,
    },
  });

  const planNannyBasic = await prisma.plan.create({
    data: {
      name: "NANNY_BASIC",
      type: "NANNY",
      price: 0,
      billingCycle: "MONTHLY",
      features: {
        profileComplete: true,
        verifiedBadge: true,
        cpfValidation: true,
        viewJobs: true,
        applyToJobs: false, // Não pode candidatar-se no plano básico
        receiveContacts: true,
        rateFamilies: true,
      },
      isActive: true,
    },
  });

  const planNannyPremiumMonthly = await prisma.plan.create({
    data: {
      name: "NANNY_PREMIUM_MONTHLY",
      type: "NANNY",
      price: 12.9,
      billingCycle: "MONTHLY",
      features: {
        profileComplete: true,
        premiumBadge: true,
        completeValidation: true,
        profileHighlight: true,
        applyToJobs: true,
        receiveContacts: true,
        rateFamilies: true,
        priorityMatching: true,
        weeklyBoost: 1,
      },
      isActive: true,
    },
  });

  const planNannyPremiumYearly = await prisma.plan.create({
    data: {
      name: "NANNY_PREMIUM_YEARLY",
      type: "NANNY",
      price: 99.0,
      billingCycle: "YEARLY",
      features: {
        profileComplete: true,
        premiumBadge: true,
        completeValidation: true,
        profileHighlight: true,
        applyToJobs: true,
        receiveContacts: true,
        rateFamilies: true,
        priorityMatching: true,
        weeklyBoost: 1,
        twoMonthsFree: true,
      },
      isActive: true,
    },
  });

  console.log("✅ Planos criados");

  // ============================================
  // CRIAR ENDEREÇOS
  // ============================================
  console.log("📍 Criando endereços...");

  const addresses = await Promise.all([
    // São Paulo - Zona Sul
    prisma.address.create({
      data: {
        zipCode: "04538132",
        streetName: "Avenida Brigadeiro Faria Lima",
        number: "1000",
        neighborhood: "Jardim Paulistano",
        city: "São Paulo",
        state: "SP",
        latitude: -23.5745,
        longitude: -46.6899,
      },
    }),
    prisma.address.create({
      data: {
        zipCode: "04543906",
        streetName: "Rua dos Pinheiros",
        number: "500",
        neighborhood: "Pinheiros",
        city: "São Paulo",
        state: "SP",
        latitude: -23.5659,
        longitude: -46.6921,
      },
    }),
    prisma.address.create({
      data: {
        zipCode: "04551060",
        streetName: "Rua Joaquim Floriano",
        number: "800",
        neighborhood: "Itaim Bibi",
        city: "São Paulo",
        state: "SP",
        latitude: -23.5875,
        longitude: -46.6766,
      },
    }),
    // São Paulo - Zona Oeste
    prisma.address.create({
      data: {
        zipCode: "05428001",
        streetName: "Rua Girassol",
        number: "200",
        neighborhood: "Vila Madalena",
        city: "São Paulo",
        state: "SP",
        latitude: -23.5466,
        longitude: -46.6917,
      },
    }),
    prisma.address.create({
      data: {
        zipCode: "05435001",
        streetName: "Rua Harmonia",
        number: "300",
        neighborhood: "Vila Madalena",
        city: "São Paulo",
        state: "SP",
        latitude: -23.5489,
        longitude: -46.6892,
      },
    }),
    // São Paulo - Zona Norte
    prisma.address.create({
      data: {
        zipCode: "02012000",
        streetName: "Avenida Cruzeiro do Sul",
        number: "1500",
        neighborhood: "Santana",
        city: "São Paulo",
        state: "SP",
        latitude: -23.5074,
        longitude: -46.6279,
      },
    }),
    prisma.address.create({
      data: {
        zipCode: "02011000",
        streetName: "Rua Voluntários da Pátria",
        number: "2000",
        neighborhood: "Santana",
        city: "São Paulo",
        state: "SP",
        latitude: -23.5099,
        longitude: -46.6307,
      },
    }),
    // São Paulo - Centro
    prisma.address.create({
      data: {
        zipCode: "01310100",
        streetName: "Avenida Paulista",
        number: "1500",
        neighborhood: "Bela Vista",
        city: "São Paulo",
        state: "SP",
        latitude: -23.5629,
        longitude: -46.6544,
      },
    }),
    // São Paulo - Zona Leste
    prisma.address.create({
      data: {
        zipCode: "03162001",
        streetName: "Rua da Mooca",
        number: "1000",
        neighborhood: "Mooca",
        city: "São Paulo",
        state: "SP",
        latitude: -23.5492,
        longitude: -46.6011,
      },
    }),
    // Endereços para babás (mais espalhados) - 20 addresses for 20 nannies
    ...Array.from({ length: 20 }, (_, i) => {
      const neighborhoods = [
        { name: "Jardim Paulista", lat: -23.5629, lng: -46.6544 },
        { name: "Moema", lat: -23.6006, lng: -46.6651 },
        { name: "Vila Mariana", lat: -23.5881, lng: -46.6385 },
        { name: "Perdizes", lat: -23.5366, lng: -46.6722 },
        { name: "Tatuapé", lat: -23.5375, lng: -46.5742 },
        { name: "Ipiranga", lat: -23.5926, lng: -46.6101 },
        { name: "Butantã", lat: -23.5665, lng: -46.7235 },
        { name: "Lapa", lat: -23.5283, lng: -46.7019 },
      ];
      const neighborhood = neighborhoods[i % neighborhoods.length];
      // CEP must be exactly 8 characters (Char(8))
      const zipCode = String(1000000 + i * 1000).padStart(8, "0");
      return prisma.address.create({
        data: {
          zipCode,
          streetName: `Rua ${i + 1}`,
          number: `${(i + 1) * 100}`,
          neighborhood: neighborhood.name,
          city: "São Paulo",
          state: "SP",
          latitude: neighborhood.lat + (Math.random() - 0.5) * 0.02,
          longitude: neighborhood.lng + (Math.random() - 0.5) * 0.02,
        },
      });
    }),
  ]);

  console.log("✅ Endereços criados");

  // ============================================
  // CRIAR BABÁS (20)
  // ============================================
  console.log("👶 Criando babás...");

  const nannyData = [
    {
      name: "Maria Silva Santos",
      birthDate: new Date("1990-05-15"),
      phoneNumber: "(11) 98765-4321",
      emailAddress: "maria.silva@email.com",
      gender: "FEMALE" as const,
      experienceYears: 8,
      hourlyRate: 35.0,
      dailyRate: 250.0,
      monthlyRate: 3500.0,
      aboutMe:
        "Sou uma profissional dedicada ao cuidado infantil há mais de 8 anos. Tenho experiência com crianças de todas as idades, desde recém-nascidos até pré-adolescentes. Minha abordagem é baseada no respeito, paciência e criatividade. Adoro criar atividades lúdicas que estimulam o desenvolvimento cognitivo e emocional das crianças. Sou certificada em primeiros socorros e tenho formação em pedagogia.",
      maxTravelDistance: "UP_TO_10KM" as const,
      ageRangesExperience: ["NEWBORN", "BABY", "TODDLER", "PRESCHOOL"],
      hasSpecialNeedsExperience: true,
      specialNeedsExperienceDescription:
        "Experiência com crianças com autismo e TDAH",
      certifications: ["Primeiros Socorros", "Pedagogia"],
      languages: ["PORTUGUESE", "ENGLISH"],
      hasVehicle: false,
      hasCnh: false,
      comfortableWithPets: "YES_ANY" as const,
      acceptedActivities: [
        "CHILD_CARE",
        "COOKING",
        "LAUNDRY",
        "TRANSPORT",
        "HOMEWORK",
      ],
      isSmoker: false,
      parentPresencePreference: "NO_PREFERENCE" as const,
      hasReferences: true,
      documentValidated: true,
      documentExpirationDate: null,
      criminalBackgroundValidated: true,
      personalDataValidated: true,
      personalDataValidatedAt: new Date(),
      // New matching fields
      nannyTypes: ["MENSALISTA", "DIARISTA"],
      contractRegimes: ["CLT", "PJ"],
      hourlyRateRange: "FROM_31_TO_40" as const,
      maxChildrenCare: 3,
    },
    {
      name: "Ana Paula Oliveira",
      birthDate: new Date("1985-08-22"),
      phoneNumber: "(11) 97654-3210",
      emailAddress: "ana.oliveira@email.com",
      gender: "FEMALE" as const,
      experienceYears: 12,
      hourlyRate: 40.0,
      dailyRate: 300.0,
      monthlyRate: 4200.0,
      aboutMe:
        "Com mais de 12 anos de experiência, sou especializada no cuidado de bebês e recém-nascidos. Tenho certificação em primeiros socorros pediátricos e curso de doula. Minha paixão é acompanhar o desenvolvimento dos pequenos desde os primeiros dias de vida. Sou calma, organizada e muito atenciosa com as necessidades de cada família.",
      maxTravelDistance: "UP_TO_5KM" as const,
      ageRangesExperience: ["NEWBORN", "BABY", "TODDLER"],
      hasSpecialNeedsExperience: false,
      certifications: ["Primeiros Socorros Pediátricos", "Doula"],
      languages: ["PORTUGUESE"],
      hasVehicle: true,
      hasCnh: true,
      comfortableWithPets: "ONLY_SOME" as const,
      petsDescription: "Apenas gatos",
      acceptedActivities: ["CHILD_CARE", "COOKING", "BABY_CARE"],
      isSmoker: false,
      parentPresencePreference: "PRESENT" as const,
      hasReferences: true,
      documentValidated: true,
      documentExpirationDate: null,
      criminalBackgroundValidated: true,
      personalDataValidated: true,
      personalDataValidatedAt: new Date(),
      // New matching fields
      nannyTypes: ["MENSALISTA"],
      contractRegimes: ["CLT"],
      hourlyRateRange: "FROM_41_TO_50" as const,
      maxChildrenCare: 2,
    },
    {
      name: "Juliana Costa Ferreira",
      birthDate: new Date("1992-03-10"),
      phoneNumber: "(11) 96543-2109",
      emailAddress: "juliana.costa@email.com",
      gender: "FEMALE" as const,
      experienceYears: 6,
      hourlyRate: 30.0,
      dailyRate: 220.0,
      monthlyRate: 3000.0,
      aboutMe:
        "Sou babá bilíngue (português e inglês) com experiência de trabalho em famílias brasileiras e americanas. Adoro ensinar inglês para crianças de forma lúdica e natural. Tenho formação em letras e certificação TEFL. Sou dinâmica, criativa e adoro atividades ao ar livre.",
      maxTravelDistance: "UP_TO_15KM" as const,
      ageRangesExperience: ["PRESCHOOL", "SCHOOL_AGE"],
      hasSpecialNeedsExperience: false,
      certifications: ["TEFL", "Primeiros Socorros"],
      languages: ["PORTUGUESE", "ENGLISH"],
      hasVehicle: false,
      hasCnh: false,
      comfortableWithPets: "YES_ANY" as const,
      acceptedActivities: [
        "CHILD_CARE",
        "COOKING",
        "HOMEWORK",
        "TRANSPORT",
        "OUTDOOR",
      ],
      isSmoker: false,
      parentPresencePreference: "NO_PREFERENCE" as const,
      hasReferences: true,
      documentValidated: true,
      documentExpirationDate: null,
      criminalBackgroundValidated: true,
      personalDataValidated: true,
      personalDataValidatedAt: new Date(),
      // New matching fields
      nannyTypes: ["MENSALISTA", "DIARISTA", "FOLGUISTA"],
      contractRegimes: ["CLT", "PJ", "AUTONOMA"],
      hourlyRateRange: "FROM_21_TO_30" as const,
      maxChildrenCare: 4,
    },
    {
      name: "Carla Mendes Alves",
      birthDate: new Date("1988-11-05"),
      phoneNumber: "(11) 95432-1098",
      emailAddress: "carla.mendes@email.com",
      gender: "FEMALE" as const,
      experienceYears: 10,
      hourlyRate: 38.0,
      dailyRate: 280.0,
      monthlyRate: 3800.0,
      aboutMe:
        "Tenho 10 anos de experiência no cuidado de crianças com necessidades especiais, incluindo autismo, síndrome de Down e paralisia cerebral. Sou formada em terapia ocupacional e tenho pós-graduação em educação especial. Minha abordagem é individualizada e focada no desenvolvimento de cada criança.",
      maxTravelDistance: "UP_TO_10KM" as const,
      ageRangesExperience: ["BABY", "TODDLER", "PRESCHOOL", "SCHOOL_AGE"],
      hasSpecialNeedsExperience: true,
      specialNeedsExperienceDescription:
        "Autismo, Síndrome de Down, Paralisia Cerebral",
      specialNeedsSpecialties: ["AUTISM", "DOWN_SYNDROME", "CEREBRAL_PALSY"],
      certifications: [
        "Terapia Ocupacional",
        "Educação Especial",
        "Primeiros Socorros",
      ],
      languages: ["PORTUGUESE"],
      hasVehicle: false,
      hasCnh: false,
      comfortableWithPets: "YES_ANY" as const,
      acceptedActivities: [
        "CHILD_CARE",
        "COOKING",
        "SPECIAL_NEEDS_CARE",
        "THERAPEUTIC_ACTIVITIES",
      ],
      isSmoker: false,
      parentPresencePreference: "NO_PREFERENCE" as const,
      hasReferences: true,
      documentValidated: true,
      documentExpirationDate: null,
      criminalBackgroundValidated: true,
      personalDataValidated: true,
      personalDataValidatedAt: new Date(),
      // New matching fields
      nannyTypes: ["MENSALISTA"],
      contractRegimes: ["CLT"],
      hourlyRateRange: "FROM_31_TO_40" as const,
      maxChildrenCare: 2,
    },
    {
      name: "Fernanda Lima Souza",
      birthDate: new Date("1995-07-18"),
      phoneNumber: "(11) 94321-0987",
      emailAddress: "fernanda.lima@email.com",
      gender: "FEMALE" as const,
      experienceYears: 4,
      hourlyRate: 28.0,
      dailyRate: 200.0,
      monthlyRate: 2800.0,
      aboutMe:
        "Sou uma babá jovem e cheia de energia! Adoro brincar ao ar livre, fazer atividades esportivas e estimular a criatividade das crianças. Tenho formação em educação física e certificação em primeiros socorros. Meu objetivo é proporcionar momentos divertidos e saudáveis para as crianças.",
      maxTravelDistance: "UP_TO_10KM" as const,
      ageRangesExperience: ["PRESCHOOL", "SCHOOL_AGE", "TEENAGER"],
      hasSpecialNeedsExperience: false,
      certifications: ["Educação Física", "Primeiros Socorros"],
      languages: ["PORTUGUESE"],
      hasVehicle: false,
      hasCnh: false,
      comfortableWithPets: "YES_ANY" as const,
      acceptedActivities: [
        "CHILD_CARE",
        "OUTDOOR",
        "SPORTS",
        "TRANSPORT",
      ],
      isSmoker: false,
      parentPresencePreference: "ABSENT" as const,
      hasReferences: true,
      documentValidated: true,
      documentExpirationDate: null,
      criminalBackgroundValidated: true,
      personalDataValidated: true,
      personalDataValidatedAt: new Date(),
      // New matching fields
      nannyTypes: ["DIARISTA", "FOLGUISTA"],
      contractRegimes: ["AUTONOMA", "PJ"],
      hourlyRateRange: "FROM_21_TO_30" as const,
      maxChildrenCare: 4,
    },
    // Mais 15 babás com perfis variados
    ...Array.from({ length: 15 }, (_, i) => {
      const experienceYears = 3 + (i % 10);
      const hourlyRate = 25 + i * 2;
      const dailyRate = hourlyRate * 8;
      const monthlyRate = hourlyRate * 160;

      // Define age ranges based on profile variation
      const ageRangeOptions = [
        ["NEWBORN", "BABY", "TODDLER"],
        ["PRESCHOOL", "SCHOOL_AGE"],
        ["TODDLER", "PRESCHOOL", "SCHOOL_AGE"],
        ["BABY", "TODDLER", "PRESCHOOL"],
        ["SCHOOL_AGE", "TEENAGER"],
      ];

      // Define nanny types based on profile variation
      const nannyTypeOptions = [
        ["MENSALISTA"],
        ["MENSALISTA", "DIARISTA"],
        ["DIARISTA", "FOLGUISTA"],
        ["MENSALISTA", "DIARISTA", "FOLGUISTA"],
        ["FOLGUISTA"],
      ];

      // Define contract regimes based on profile variation
      const contractRegimeOptions = [
        ["CLT"],
        ["CLT", "PJ"],
        ["PJ", "AUTONOMA"],
        ["CLT", "PJ", "AUTONOMA"],
        ["AUTONOMA"],
      ];

      // Define hourly rate range based on index
      const hourlyRateRangeOptions = [
        "UP_TO_20",
        "FROM_21_TO_30",
        "FROM_31_TO_40",
        "FROM_41_TO_50",
        "FROM_51_TO_70",
      ];

      // Define accepted activities
      const activityOptions = [
        ["CHILD_CARE", "COOKING"],
        ["CHILD_CARE", "COOKING", "LAUNDRY"],
        ["CHILD_CARE", "TRANSPORT", "HOMEWORK"],
        ["CHILD_CARE", "OUTDOOR", "SPORTS"],
        ["CHILD_CARE", "COOKING", "TRANSPORT", "HOMEWORK"],
      ];

      return {
        name: `Babá ${i + 6}`,
        birthDate: new Date(1985 + (i % 15), (i % 12) + 1, (i % 28) + 1),
        phoneNumber: `(11) 9${9000 + i}-${1000 + i}`,
        emailAddress: `baba${i + 6}@email.com`,
        gender: i % 10 === 0 ? ("MALE" as const) : ("FEMALE" as const),
        experienceYears,
        hourlyRate,
        dailyRate,
        monthlyRate,
        aboutMe: `Sou uma profissional dedicada ao cuidado infantil há ${experienceYears} anos. Tenho experiência com crianças de diversas idades e perfis. Minha abordagem é baseada no respeito, paciência e carinho. Adoro criar atividades que estimulam o desenvolvimento das crianças de forma lúdica e educativa.`,
        maxTravelDistance: [
          "UP_TO_5KM",
          "UP_TO_10KM",
          "UP_TO_15KM",
          "UP_TO_20KM",
        ][i % 4] as any,
        ageRangesExperience: ageRangeOptions[i % 5],
        hasSpecialNeedsExperience: i % 5 === 0,
        specialNeedsExperienceDescription:
          i % 5 === 0 ? "Experiência com autismo" : undefined,
        specialNeedsSpecialties: i % 5 === 0 ? ["AUTISM"] : undefined,
        certifications: i % 2 === 0 ? ["Primeiros Socorros"] : [],
        languages:
          i % 3 === 0 ? ["PORTUGUESE", "ENGLISH"] : ["PORTUGUESE"],
        hasVehicle: i % 4 === 0,
        hasCnh: i % 4 === 0,
        comfortableWithPets: ["YES_ANY", "ONLY_SOME", "NO"][i % 3] as any,
        petsDescription: i % 3 === 1 ? "Apenas cães pequenos" : undefined,
        acceptedActivities: activityOptions[i % 5],
        isSmoker: i % 7 === 0, // Some are smokers
        parentPresencePreference: ["PRESENT", "ABSENT", "NO_PREFERENCE"][
          i % 3
        ] as any,
        hasReferences: i % 2 === 0,
        documentValidated: true,
        documentExpirationDate: null,
        criminalBackgroundValidated: i % 2 === 0, // Some have criminal background validated
        personalDataValidated: i % 3 !== 0, // Some have personal data validated
        // New matching fields
        nannyTypes: nannyTypeOptions[i % 5],
        contractRegimes: contractRegimeOptions[i % 5],
        hourlyRateRange: hourlyRateRangeOptions[i % 5] as any,
        maxChildrenCare: 2 + (i % 3), // 2-4 children
      };
    }),
  ];

  const nannies = await Promise.all(
    nannyData.map(async (data, index) => {
      const nanny = await prisma.nanny.create({
        data: {
          ...data,
          slug: generateNannySlug(data.name),
          addressId: addresses[9 + index].id,
          status: "ACTIVE",
        },
      });

      // Criar disponibilidade para cada babá
      // Schedule uses the new format: { enabled: boolean, periods: string[] }
      const scheduleVariations = [
        // Variation 1: Full weekdays, morning and afternoon
        {
          MONDAY: { enabled: true, periods: ["MORNING", "AFTERNOON"] },
          TUESDAY: { enabled: true, periods: ["MORNING", "AFTERNOON"] },
          WEDNESDAY: { enabled: true, periods: ["MORNING", "AFTERNOON"] },
          THURSDAY: { enabled: true, periods: ["MORNING", "AFTERNOON"] },
          FRIDAY: { enabled: true, periods: ["MORNING", "AFTERNOON"] },
          SATURDAY: { enabled: false, periods: [] },
          SUNDAY: { enabled: false, periods: [] },
        },
        // Variation 2: Weekdays with some evenings
        {
          MONDAY: { enabled: true, periods: ["AFTERNOON", "NIGHT"] },
          TUESDAY: { enabled: true, periods: ["AFTERNOON", "NIGHT"] },
          WEDNESDAY: { enabled: true, periods: ["AFTERNOON", "NIGHT"] },
          THURSDAY: { enabled: true, periods: ["AFTERNOON", "NIGHT"] },
          FRIDAY: { enabled: true, periods: ["AFTERNOON", "NIGHT"] },
          SATURDAY: { enabled: true, periods: ["MORNING", "AFTERNOON"] },
          SUNDAY: { enabled: false, periods: [] },
        },
        // Variation 3: Mornings only
        {
          MONDAY: { enabled: true, periods: ["MORNING"] },
          TUESDAY: { enabled: true, periods: ["MORNING"] },
          WEDNESDAY: { enabled: true, periods: ["MORNING"] },
          THURSDAY: { enabled: true, periods: ["MORNING"] },
          FRIDAY: { enabled: true, periods: ["MORNING"] },
          SATURDAY: { enabled: true, periods: ["MORNING"] },
          SUNDAY: { enabled: false, periods: [] },
        },
        // Variation 4: Full availability including weekends
        {
          MONDAY: { enabled: true, periods: ["MORNING", "AFTERNOON", "NIGHT"] },
          TUESDAY: { enabled: true, periods: ["MORNING", "AFTERNOON", "NIGHT"] },
          WEDNESDAY: { enabled: true, periods: ["MORNING", "AFTERNOON", "NIGHT"] },
          THURSDAY: { enabled: true, periods: ["MORNING", "AFTERNOON", "NIGHT"] },
          FRIDAY: { enabled: true, periods: ["MORNING", "AFTERNOON", "NIGHT"] },
          SATURDAY: { enabled: true, periods: ["MORNING", "AFTERNOON"] },
          SUNDAY: { enabled: true, periods: ["MORNING", "AFTERNOON"] },
        },
        // Variation 5: Weekend only (for folguistas)
        {
          MONDAY: { enabled: false, periods: [] },
          TUESDAY: { enabled: false, periods: [] },
          WEDNESDAY: { enabled: false, periods: [] },
          THURSDAY: { enabled: false, periods: [] },
          FRIDAY: { enabled: false, periods: [] },
          SATURDAY: { enabled: true, periods: ["MORNING", "AFTERNOON", "NIGHT"] },
          SUNDAY: { enabled: true, periods: ["MORNING", "AFTERNOON", "NIGHT"] },
        },
      ];

      await prisma.nannyAvailability.create({
        data: {
          nannyId: nanny.id,
          jobTypes:
            index % 3 === 0
              ? ["FIXED"]
              : index % 3 === 1
              ? ["FIXED", "SUBSTITUTE"]
              : ["OCCASIONAL"],
          schedule: scheduleVariations[index % 5],
          schedulePreference: index % 2 === 0 ? "FIXED" : "FLEXIBLE",
          acceptsOvernight:
            index % 3 === 0 ? "YES" : index % 3 === 1 ? "OCCASIONALLY" : "NO",
          availableFrom: new Date(),
          monthlyRate: data.monthlyRate,
          hourlyRate: data.hourlyRate,
          dailyRate: data.dailyRate,
          preferredContractTypes: index % 2 === 0 ? ["CLT"] : ["CLT", "MEI"],
          allowsMultipleJobs:
            index % 3 === 0 ? "YES" : index % 3 === 1 ? "DEPENDS" : "NO",
        },
      });

      // Criar referências para babás que têm
      if (data.hasReferences) {
        await prisma.reference.create({
          data: {
            nannyId: nanny.id,
            name: `Referência ${index + 1}`,
            phone: `(11) 9${8000 + index}-${2000 + index}`,
            relationship: "Família anterior",
            verified: index % 2 === 0,
          },
        });
      }

      // Criar assinatura para algumas babás
      if (index < 5) {
        // Primeiras 5 babás têm plano premium
        await prisma.subscription.create({
          data: {
            nannyId: nanny.id,
            plan: "NANNY_PRO",
            billingInterval: index % 2 === 0 ? "MONTH" : "YEAR",
            status: "ACTIVE",
            paymentGateway: "ASAAS",
            externalCustomerId: `asaas_customer_nanny_${nanny.id}`,
            externalSubscriptionId: `asaas_sub_nanny_${nanny.id}`,
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(
              Date.now() + (index % 2 === 0 ? 30 : 365) * 24 * 60 * 60 * 1000
            ),
          },
        });
      }
      // Babás sem plano premium ficam com NANNY_FREE por padrão (não precisa criar subscription)

      return nanny;
    })
  );

  console.log("✅ Babás criadas");

  // ============================================
  // CRIAR FAMÍLIAS (5)
  // ============================================
  console.log("👨‍👩‍👧‍👦 Criando famílias...");

  const familyData = [
    {
      name: "Família Silva",
      phoneNumber: "(11) 91234-5678",
      emailAddress: "joao.silva@email.com",
      numberOfChildren: 2,
      housingType: "APARTMENT_WITH_ELEVATOR" as const,
      hasPets: true,
      petsDescription: "1 cachorro pequeno (Yorkshire)",
      parentPresence: "SOMETIMES" as const,
      valuesInNanny: [
        "Paciência",
        "Experiência com crianças agitadas",
        "Criatividade",
      ],
      careMethodology: "Montessori",
      languages: ["Português", "Inglês"],
      houseRules: ["Limite de tela: 1h/dia", "Rotina de sono às 20h"],
      domesticHelpExpected: ["MEAL_PREP", "CHILD_LAUNDRY"],
      nannyGenderPreference: "NO_PREFERENCE" as const,
      nannyAgePreference: "NO_PREFERENCE" as const,
      // New matching fields
      nannyType: "MENSALISTA" as const,
      contractRegime: "CLT" as const,
      hourlyRateRange: "30_TO_40" as const,
      neededDays: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
      neededShifts: ["MORNING", "AFTERNOON"],
    },
    {
      name: "Família Oliveira",
      phoneNumber: "(11) 92345-6789",
      emailAddress: "maria.oliveira@email.com",
      numberOfChildren: 1,
      housingType: "HOUSE" as const,
      hasPets: false,
      parentPresence: "RARELY" as const,
      valuesInNanny: [
        "Conhecimento em primeiros socorros",
        "Experiência com bebês",
        "Paciência",
      ],
      careMethodology: "Tradicional",
      languages: ["Português"],
      houseRules: ["Sem TV", "Rotina de sono às 19h"],
      domesticHelpExpected: ["MEAL_PREP", "BABY_CARE"],
      nannyGenderPreference: "FEMALE" as const,
      nannyAgePreference: "AGE_26_35" as const,
      // New matching fields
      nannyType: "MENSALISTA" as const,
      contractRegime: "CLT" as const,
      hourlyRateRange: "40_TO_50" as const,
      neededDays: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
      neededShifts: ["MORNING", "AFTERNOON"],
    },
    {
      name: "Família Costa",
      phoneNumber: "(11) 93456-7890",
      emailAddress: "pedro.costa@email.com",
      numberOfChildren: 3,
      housingType: "CONDOMINIUM" as const,
      hasPets: true,
      petsDescription: "2 gatos",
      parentPresence: "ALWAYS" as const,
      valuesInNanny: ["Bilíngue", "Criatividade", "Energia"],
      careMethodology: "Waldorf",
      languages: ["Português", "Inglês"],
      houseRules: ["Brincadeiras ao ar livre diariamente", "Sem açúcar"],
      domesticHelpExpected: ["MEAL_PREP", "HOMEWORK_HELP", "SCHOOL_PICKUP"],
      nannyGenderPreference: "NO_PREFERENCE" as const,
      nannyAgePreference: "AGE_18_25" as const,
      // New matching fields
      nannyType: "MENSALISTA" as const,
      contractRegime: "CLT" as const,
      hourlyRateRange: "40_TO_50" as const,
      neededDays: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
      neededShifts: ["AFTERNOON", "NIGHT"],
    },
    {
      name: "Família Mendes",
      phoneNumber: "(11) 94567-8901",
      emailAddress: "ana.mendes@email.com",
      numberOfChildren: 1,
      housingType: "APARTMENT_NO_ELEVATOR" as const,
      hasPets: false,
      parentPresence: "NEVER" as const,
      valuesInNanny: [
        "Experiência com necessidades especiais",
        "Paciência",
        "Especialização",
      ],
      careMethodology: "Individualizada",
      languages: ["Português"],
      houseRules: ["Rotina estruturada", "Atividades terapêuticas"],
      domesticHelpExpected: ["MEAL_PREP", "SPECIAL_NEEDS_CARE", "THERAPEUTIC_ACTIVITIES"],
      nannyGenderPreference: "FEMALE" as const,
      nannyAgePreference: "AGE_26_35" as const,
      // New matching fields
      nannyType: "MENSALISTA" as const,
      contractRegime: "CLT" as const,
      hourlyRateRange: "ABOVE_50" as const,
      neededDays: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
      neededShifts: ["AFTERNOON"],
    },
    {
      name: "Família Lima",
      phoneNumber: "(11) 95678-9012",
      emailAddress: "carlos.lima@email.com",
      numberOfChildren: 2,
      housingType: "HOUSE" as const,
      hasPets: true,
      petsDescription: "1 cachorro grande (Labrador)",
      parentPresence: "SOMETIMES" as const,
      valuesInNanny: ["Esportes", "Energia", "Criatividade"],
      careMethodology: "Livre",
      languages: ["Português"],
      houseRules: ["Atividades esportivas diárias", "Brincadeiras ao ar livre"],
      domesticHelpExpected: ["MEAL_PREP", "OUTDOOR_ACTIVITIES", "SPORTS_ACTIVITIES"],
      nannyGenderPreference: "NO_PREFERENCE" as const,
      nannyAgePreference: "NO_PREFERENCE" as const,
      // New matching fields
      nannyType: "DIARISTA" as const,
      contractRegime: "AUTONOMA" as const,
      hourlyRateRange: "20_TO_30" as const,
      neededDays: ["SATURDAY", "SUNDAY"],
      neededShifts: ["MORNING", "AFTERNOON"],
    },
  ];

  const families = await Promise.all(
    familyData.map(async (data, index) => {
      const family = await prisma.family.create({
        data: {
          ...data,
          addressId: addresses[index].id,
          status: "ACTIVE",
        },
      });

      // Criar assinatura para algumas famílias
      if (index < 3) {
        // Primeiras 3 famílias têm plano pago
        await prisma.subscription.create({
          data: {
            familyId: family.id,
            plan: "FAMILY_PLUS",
            billingInterval: index % 2 === 0 ? "MONTH" : "QUARTER",
            status: "ACTIVE",
            paymentGateway: "ASAAS",
            externalCustomerId: `asaas_customer_family_${family.id}`,
            externalSubscriptionId: `asaas_sub_family_${family.id}`,
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(
              Date.now() + (index % 2 === 0 ? 30 : 90) * 24 * 60 * 60 * 1000
            ),
          },
        });
      }
      // Famílias sem plano pago ficam com FAMILY_FREE por padrão (não precisa criar subscription)

      return family;
    })
  );

  console.log("✅ Famílias criadas");

  // ============================================
  // CRIAR FILHOS
  // ============================================
  console.log("👶 Criando filhos...");

  const childrenData = [
    // Família Silva (2 filhos)
    {
      familyId: families[0].id,
      name: "Lucas Silva",
      birthDate: new Date("2019-03-15"),
      gender: "MALE" as const,
      carePriorities: ["HIGH_ENERGY", "PLAY_STIMULATION", "SAFETY_SUPERVISION"],
      hasSpecialNeeds: false,
      routine:
        "Acorda às 7h, café às 7h30, brincadeiras das 9h às 11h, almoço ao meio-dia, soneca das 13h às 15h, lanche às 16h, jantar às 19h, sono às 20h",
    },
    {
      familyId: families[0].id,
      name: "Sofia Silva",
      birthDate: new Date("2021-07-20"),
      gender: "FEMALE" as const,
      carePriorities: ["ATTENTION_PATIENCE", "EMOTIONAL_CARE", "STRUCTURED_ROUTINE"],
      hasSpecialNeeds: false,
      routine:
        "Acorda às 7h30, café às 8h, brincadeiras das 9h às 11h, almoço ao meio-dia, soneca das 13h às 15h30, lanche às 16h, jantar às 19h, sono às 20h",
    },
    // Família Oliveira (1 filho)
    {
      familyId: families[1].id,
      name: "Miguel Oliveira",
      birthDate: new Date("2023-05-10"),
      gender: "MALE" as const,
      carePriorities: ["BABY_CARE", "SLEEP_ROUTINE", "FEEDING_SUPPORT"],
      hasSpecialNeeds: false,
      allergies: "Lactose",
      routine:
        "Acorda às 6h, mamadeira às 6h30, soneca das 9h às 10h30, almoço às 12h, soneca das 14h às 16h, lanche às 17h, jantar às 18h30, sono às 19h",
    },
    // Família Costa (3 filhos)
    {
      familyId: families[2].id,
      name: "Pedro Costa",
      birthDate: new Date("2016-11-05"),
      gender: "MALE" as const,
      carePriorities: ["HIGH_ENERGY", "SCHOOL_SUPPORT", "AUTONOMY"],
      hasSpecialNeeds: false,
      routine:
        "Escola das 7h às 12h, almoço ao meio-dia, lição de casa das 14h às 15h, atividades esportivas das 16h às 17h, jantar às 19h, sono às 21h",
    },
    {
      familyId: families[2].id,
      name: "Julia Costa",
      birthDate: new Date("2018-02-14"),
      gender: "FEMALE" as const,
      carePriorities: ["PLAY_STIMULATION", "STRUCTURED_ROUTINE"],
      hasSpecialNeeds: false,
      routine:
        "Escola das 7h às 12h, almoço ao meio-dia, soneca das 13h às 14h, atividades criativas das 15h às 17h, jantar às 19h, sono às 20h",
    },
    {
      familyId: families[2].id,
      name: "Gabriel Costa",
      birthDate: new Date("2020-09-22"),
      gender: "MALE" as const,
      carePriorities: ["HIGH_ENERGY", "PLAY_STIMULATION", "SAFETY_SUPERVISION"],
      hasSpecialNeeds: false,
      routine:
        "Acorda às 7h, café às 7h30, brincadeiras das 9h às 11h, almoço ao meio-dia, soneca das 13h às 15h, lanche às 16h, jantar às 19h, sono às 20h",
    },
    // Família Mendes (1 filho)
    {
      familyId: families[3].id,
      name: "Rafael Mendes",
      birthDate: new Date("2017-04-18"),
      gender: "MALE" as const,
      carePriorities: ["ATTENTION_PATIENCE", "STRUCTURED_ROUTINE", "EMOTIONAL_CARE"],
      hasSpecialNeeds: true,
      specialNeedsDescription: "Autismo (TEA) - nível 1",
      routine:
        "Rotina estruturada: Acorda às 7h, café às 7h30, escola das 8h às 12h, almoço ao meio-dia, atividades terapêuticas das 14h às 16h, lanche às 16h30, jantar às 18h30, sono às 20h",
    },
    // Família Lima (2 filhos)
    {
      familyId: families[4].id,
      name: "Bruno Lima",
      birthDate: new Date("2015-08-30"),
      gender: "MALE" as const,
      carePriorities: ["HIGH_ENERGY", "SCHOOL_SUPPORT", "RESPECTFUL_DISCIPLINE"],
      hasSpecialNeeds: false,
      routine:
        "Escola das 7h às 12h, almoço ao meio-dia, treino de futebol das 15h às 17h, lanche às 17h30, jantar às 19h30, sono às 21h",
    },
    {
      familyId: families[4].id,
      name: "Carolina Lima",
      birthDate: new Date("2018-12-12"),
      gender: "FEMALE" as const,
      carePriorities: ["PLAY_STIMULATION", "HIGH_ENERGY", "AUTONOMY"],
      hasSpecialNeeds: false,
      routine:
        "Escola das 7h às 12h, almoço ao meio-dia, aula de dança das 15h às 16h, brincadeiras das 16h30 às 18h, jantar às 19h, sono às 20h",
    },
  ];

  const children = await Promise.all(
    childrenData.map(async (data) => {
      const child = await prisma.child.create({
        data: {
          name: data.name,
          birthDate: data.birthDate,
          gender: data.gender,
          carePriorities: data.carePriorities,
          hasSpecialNeeds: data.hasSpecialNeeds,
          specialNeedsDescription: data.specialNeedsDescription,
          allergies: data.allergies,
          routine: data.routine,
          status: "ACTIVE",
        },
      });

      // Criar relacionamento com a família
      await prisma.childFamily.create({
        data: {
          childId: child.id,
          familyId: data.familyId,
          relationshipType: "PARENT",
          isMain: true,
        },
      });

      return child;
    })
  );

  console.log("✅ Filhos criados");

  // ============================================
  // CRIAR VAGAS
  // ============================================
  console.log("💼 Criando vagas...");

  const jobsData = [
    // Família Silva - Vaga para 2 filhos (Lucas e Sofia)
    {
      familyId: families[0].id,
      title: "Babá para 2 crianças (5 e 3 anos) - Zona Sul",
      description:
        "Procuramos uma babá experiente e criativa para cuidar de nossos dois filhos. O Lucas é agitado e curioso, enquanto a Sofia é mais calma e tímida. Valorizamos muito a paciência e a criatividade. Temos um cachorro pequeno em casa.",
      jobType: "FIXED" as const,
      schedule: {
        monday: { start: "08:00", end: "18:00" },
        tuesday: { start: "08:00", end: "18:00" },
        wednesday: { start: "08:00", end: "18:00" },
        thursday: { start: "08:00", end: "18:00" },
        friday: { start: "08:00", end: "18:00" },
        saturday: { start: null, end: null },
        sunday: { start: null, end: null },
      },
      requiresOvernight: "NO" as const,
      contractType: "CLT" as const,
      benefits: ["Vale transporte", "Vale refeição"],
      paymentType: "MONTHLY" as const,
      budgetMin: 3200.0,
      budgetMax: 3800.0,
      childrenIds: [children[0].id, children[1].id],
      mandatoryRequirements: [
        "Experiência com crianças agitadas",
        "Conforto com pets",
      ],
      allowsMultipleJobs: false,
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Daqui a 1 semana
      status: "ACTIVE" as const,
    },
    // Família Oliveira - Vaga para bebê (Miguel)
    {
      familyId: families[1].id,
      title: "Babá especializada em bebês (1 ano) - Pinheiros",
      description:
        "Buscamos uma babá com muita experiência em cuidados com bebês. O Miguel tem 1 ano e é alérgico a lactose. Precisamos de alguém calmo, organizado e com conhecimento em primeiros socorros. Preferimos babá do sexo feminino.",
      jobType: "FIXED" as const,
      schedule: {
        monday: { start: "07:00", end: "17:00" },
        tuesday: { start: "07:00", end: "17:00" },
        wednesday: { start: "07:00", end: "17:00" },
        thursday: { start: "07:00", end: "17:00" },
        friday: { start: "07:00", end: "17:00" },
        saturday: { start: null, end: null },
        sunday: { start: null, end: null },
      },
      requiresOvernight: "NO" as const,
      contractType: "CLT" as const,
      benefits: ["Vale transporte", "Vale refeição", "Plano de saúde"],
      paymentType: "MONTHLY" as const,
      budgetMin: 3800.0,
      budgetMax: 4500.0,
      childrenIds: [children[2].id],
      mandatoryRequirements: [
        "Experiência com bebês (0-1 ano)",
        "Primeiros socorros",
        "Gênero feminino",
      ],
      allowsMultipleJobs: false,
      startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // Daqui a 2 semanas
      status: "ACTIVE" as const,
    },
    // Família Costa - Vaga para 3 filhos (Pedro, Julia, Gabriel)
    {
      familyId: families[2].id,
      title: "Babá bilíngue para 3 crianças (8, 6 e 4 anos) - Itaim Bibi",
      description:
        "Procuramos uma babá bilíngue (português e inglês) para cuidar de nossos 3 filhos. As crianças são muito ativas e adoram atividades ao ar livre e esportes. Valorizamos criatividade e energia. Temos 2 gatos em casa.",
      jobType: "FIXED" as const,
      schedule: {
        monday: { start: "12:00", end: "20:00" },
        tuesday: { start: "12:00", end: "20:00" },
        wednesday: { start: "12:00", end: "20:00" },
        thursday: { start: "12:00", end: "20:00" },
        friday: { start: "12:00", end: "20:00" },
        saturday: { start: null, end: null },
        sunday: { start: null, end: null },
      },
      requiresOvernight: "NO" as const,
      contractType: "CLT" as const,
      benefits: ["Vale transporte", "Vale refeição"],
      paymentType: "MONTHLY" as const,
      budgetMin: 4000.0,
      budgetMax: 5000.0,
      childrenIds: [children[3].id, children[4].id, children[5].id],
      mandatoryRequirements: [
        "Bilíngue (inglês)",
        "Conforto com pets",
        "Energia",
      ],
      allowsMultipleJobs: false,
      startDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // Daqui a 3 semanas
      status: "ACTIVE" as const,
    },
    // Família Mendes - Vaga para criança com autismo (Rafael)
    {
      familyId: families[3].id,
      title: "Babá especializada em autismo (7 anos) - Vila Madalena",
      description:
        "Buscamos uma babá com experiência comprovada em cuidados com crianças autistas (TEA). O Rafael tem 7 anos e autismo nível 1. Precisa de rotina estruturada e atividades terapêuticas. Preferimos babá do sexo feminino com formação na área.",
      jobType: "FIXED" as const,
      schedule: {
        monday: { start: "12:00", end: "18:00" },
        tuesday: { start: "12:00", end: "18:00" },
        wednesday: { start: "12:00", end: "18:00" },
        thursday: { start: "12:00", end: "18:00" },
        friday: { start: "12:00", end: "18:00" },
        saturday: { start: null, end: null },
        sunday: { start: null, end: null },
      },
      requiresOvernight: "NO" as const,
      contractType: "CLT" as const,
      benefits: ["Vale transporte", "Vale refeição", "Plano de saúde"],
      paymentType: "MONTHLY" as const,
      budgetMin: 4500.0,
      budgetMax: 5500.0,
      childrenIds: [children[6].id],
      mandatoryRequirements: [
        "Experiência com autismo (TEA)",
        "Formação em educação especial ou terapia ocupacional",
        "Gênero feminino",
      ],
      allowsMultipleJobs: false,
      startDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // Daqui a 10 dias
      status: "ACTIVE" as const,
    },
    // Família Lima - Vaga eventual para 2 filhos (Bruno e Carolina)
    {
      familyId: families[4].id,
      title: "Babá eventual para 2 crianças (9 e 6 anos) - Santana",
      description:
        "Procuramos uma babá para trabalhos eventuais (finais de semana e feriados). As crianças adoram esportes e atividades ao ar livre. Temos um cachorro grande (Labrador) em casa.",
      jobType: "OCCASIONAL" as const,
      schedule: {
        monday: { start: null, end: null },
        tuesday: { start: null, end: null },
        wednesday: { start: null, end: null },
        thursday: { start: null, end: null },
        friday: { start: null, end: null },
        saturday: { start: "09:00", end: "18:00" },
        sunday: { start: "09:00", end: "18:00" },
      },
      requiresOvernight: "SOMETIMES" as const,
      contractType: "DAILY_WORKER" as const,
      benefits: [],
      paymentType: "DAILY" as const,
      budgetMin: 200.0,
      budgetMax: 300.0,
      childrenIds: [children[7].id, children[8].id],
      mandatoryRequirements: [
        "Conforto com pets (cachorro grande)",
        "Disponibilidade para finais de semana",
      ],
      allowsMultipleJobs: true,
      startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // Daqui a 5 dias
      status: "ACTIVE" as const,
    },
  ];

  const jobs = await Promise.all(
    jobsData.map(async (data) => {
      return await prisma.job.create({
        data,
      });
    })
  );

  console.log("✅ Vagas criadas");

  // ============================================
  // CRIAR CANDIDATURAS (MATCHES)
  // ============================================
  console.log("🤝 Criando candidaturas (matches)...");

  // Vaga 1 (Família Silva - 2 filhos agitados + pets): Maria (match perfeito), Fernanda (bom match), Babá 10 (match médio)
  await prisma.jobApplication.create({
    data: {
      jobId: jobs[0].id,
      nannyId: nannies[0].id, // Maria - match perfeito (experiência com agitados, pets, Montessori)
      status: "PENDING",
      matchScore: 95.0,
      message:
        "Olá! Tenho 8 anos de experiência e adoro crianças agitadas. Tenho certificação em Montessori e me dou muito bem com pets!",
    },
  });

  await prisma.jobApplication.create({
    data: {
      jobId: jobs[0].id,
      nannyId: nannies[4].id, // Fernanda - bom match (energia, criatividade)
      status: "PENDING",
      matchScore: 78.0,
      message:
        "Oi! Sou muito energética e adoro criar atividades divertidas para crianças. Tenho experiência com pets também!",
    },
  });

  await prisma.jobApplication.create({
    data: {
      jobId: jobs[0].id,
      nannyId: nannies[10].id, // Babá 10 - match médio
      status: "PENDING",
      matchScore: 65.0,
    },
  });

  // Vaga 2 (Família Oliveira - bebê + primeiros socorros): Ana (match perfeito), Babá 6 (bom match)
  await prisma.jobApplication.create({
    data: {
      jobId: jobs[1].id,
      nannyId: nannies[1].id, // Ana - match perfeito (especialista em bebês, primeiros socorros)
      status: "ACCEPTED",
      matchScore: 98.0,
      message:
        "Olá! Sou especializada em bebês e tenho certificação em primeiros socorros pediátricos. Tenho 12 anos de experiência!",
    },
  });

  await prisma.jobApplication.create({
    data: {
      jobId: jobs[1].id,
      nannyId: nannies[6].id, // Babá 6 - bom match
      status: "PENDING",
      matchScore: 75.0,
    },
  });

  // Vaga 3 (Família Costa - 3 filhos + bilíngue): Juliana (match perfeito), Babá 8 (match médio)
  await prisma.jobApplication.create({
    data: {
      jobId: jobs[2].id,
      nannyId: nannies[2].id, // Juliana - match perfeito (bilíngue, energia, Waldorf)
      status: "PENDING",
      matchScore: 92.0,
      message:
        "Hi! Im bilingual and I love teaching English to kids through play. I have experience with multiple children and pets!",
    },
  });

  await prisma.jobApplication.create({
    data: {
      jobId: jobs[2].id,
      nannyId: nannies[8].id, // Babá 8 - match médio
      status: "PENDING",
      matchScore: 68.0,
    },
  });

  // Vaga 4 (Família Mendes - autismo): Carla (match perfeito), Babá 5 (match baixo - não tem experiência)
  await prisma.jobApplication.create({
    data: {
      jobId: jobs[3].id,
      nannyId: nannies[3].id, // Carla - match perfeito (especialista em necessidades especiais)
      status: "PENDING",
      matchScore: 99.0,
      message:
        "Olá! Sou terapeuta ocupacional com 10 anos de experiência em autismo. Tenho pós-graduação em educação especial e adoro trabalhar com rotinas estruturadas!",
    },
  });

  await prisma.jobApplication.create({
    data: {
      jobId: jobs[3].id,
      nannyId: nannies[5].id, // Babá 5 - match baixo (não tem experiência com autismo)
      status: "REJECTED",
      matchScore: 35.0,
      message: "Olá! Gostaria de aprender a trabalhar com crianças autistas.",
    },
  });

  // Vaga 5 (Família Lima - eventual + esportes): Fernanda (bom match), Babá 12 (bom match)
  await prisma.jobApplication.create({
    data: {
      jobId: jobs[4].id,
      nannyId: nannies[4].id, // Fernanda - bom match (energia, esportes)
      status: "PENDING",
      matchScore: 85.0,
      message:
        "Oi! Adoro trabalhos eventuais e tenho formação em educação física. Sou muito energética e me dou bem com cachorros!",
    },
  });

  await prisma.jobApplication.create({
    data: {
      jobId: jobs[4].id,
      nannyId: nannies[12].id, // Babá 12 - bom match
      status: "PENDING",
      matchScore: 80.0,
    },
  });

  console.log("✅ Candidaturas criadas");

  // ============================================
  // CRIAR FAVORITOS
  // ============================================
  console.log("⭐ Criando favoritos...");

  await prisma.favorite.create({
    data: {
      familyId: families[0].id,
      nannyId: nannies[0].id, // Família Silva favoritou Maria
    },
  });

  await prisma.favorite.create({
    data: {
      familyId: families[1].id,
      nannyId: nannies[1].id, // Família Oliveira favoritou Ana
    },
  });

  await prisma.favorite.create({
    data: {
      familyId: families[2].id,
      nannyId: nannies[2].id, // Família Costa favoritou Juliana
    },
  });

  console.log("✅ Favoritos criados");

  // ============================================
  // CRIAR BOOSTS
  // ============================================
  console.log("🚀 Criando boosts...");

  // Boost ativo para Maria (perfil de babá)
  await prisma.boost.create({
    data: {
      nannyId: nannies[0].id,
      type: "NANNY_PROFILE",
      source: "PLAN_INCLUDED", // Incluído no plano Premium
      startDate: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 horas atrás
      endDate: new Date(Date.now() + 12 * 60 * 60 * 1000), // Mais 12 horas (24h total)
      isActive: true,
    },
  });

  // Boost expirado para Ana (perfil de babá)
  await prisma.boost.create({
    data: {
      nannyId: nannies[1].id,
      type: "NANNY_PROFILE",
      source: "PLAN_INCLUDED",
      startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 dias atrás
      endDate: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000), // 9 dias atrás (expirado)
      isActive: false,
    },
  });

  // Boost ativo para vaga da Família Oliveira
  await prisma.boost.create({
    data: {
      jobId: jobs[1].id, // Vaga da Família Oliveira
      type: "JOB",
      source: "PLAN_INCLUDED", // Incluído no plano Trimestral
      startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 dias atrás
      endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // Mais 4 dias (7 dias total)
      isActive: true,
    },
  });

  // Boost expirado para vaga da Família Silva
  await prisma.boost.create({
    data: {
      jobId: jobs[0].id, // Vaga da Família Silva
      type: "JOB",
      source: "PLAN_INCLUDED",
      startDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 dias atrás
      endDate: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000), // 13 dias atrás (expirado)
      isActive: false,
    },
  });

  console.log("✅ Boosts criados");

  // ============================================
  // ADICIONAR MAIS FAVORITOS
  // ============================================
  console.log("⭐ Adicionando mais favoritos...");

  // Família Silva favoritou Ana e Juliana também
  await prisma.favorite.create({
    data: {
      familyId: families[0].id,
      nannyId: nannies[1].id, // Ana
    },
  });

  await prisma.favorite.create({
    data: {
      familyId: families[0].id,
      nannyId: nannies[2].id, // Juliana
    },
  });

  // Família Oliveira favoritou Carla e Fernanda
  await prisma.favorite.create({
    data: {
      familyId: families[1].id,
      nannyId: nannies[3].id, // Carla
    },
  });

  await prisma.favorite.create({
    data: {
      familyId: families[1].id,
      nannyId: nannies[4].id, // Fernanda
    },
  });

  // Família Costa favoritou Maria
  await prisma.favorite.create({
    data: {
      familyId: families[2].id,
      nannyId: nannies[0].id, // Maria
    },
  });

  console.log("✅ Mais favoritos adicionados");

  // ============================================
  // CRIAR VALIDAÇÕES (ValidationRequest)
  // ============================================
  console.log("🔐 Criando validações...");

  // Validação completa para Maria (Premium)
  await prisma.validationRequest.create({
    data: {
      nannyId: nannies[0].id,
      cpf: "12345678901",
      rg: "123456789",
      rgIssuingState: "SP",
      name: "Maria Silva Santos",
      motherName: "Ana Silva",
      birthDate: new Date("1990-05-15"),
      level: "PREMIUM",
      status: "COMPLETED",
      bigidValid: true,
      facematchScore: 98.5,
      livenessScore: 99.2,
      bigidResult: {
        documentValid: true,
        faceMatch: true,
        liveness: true,
      },
      basicDataResult: {
        cpfValid: true,
        name: "Maria Silva Santos",
        birthDate: "1990-05-15",
      },
      civilRecordResult: {
        hasRecords: false,
        clean: true,
      },
      federalRecordResult: {
        hasRecords: false,
        clean: true,
      },
      completedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    },
  });

  // Validação completa para Ana (Premium)
  await prisma.validationRequest.create({
    data: {
      nannyId: nannies[1].id,
      cpf: "98765432100",
      rg: "987654321",
      rgIssuingState: "SP",
      name: "Ana Oliveira Costa",
      motherName: "Carla Oliveira",
      birthDate: new Date("1988-08-20"),
      level: "PREMIUM",
      status: "COMPLETED",
      bigidValid: true,
      facematchScore: 96.8,
      livenessScore: 97.5,
      bigidResult: {
        documentValid: true,
        faceMatch: true,
        liveness: true,
      },
      basicDataResult: {
        cpfValid: true,
        name: "Ana Oliveira Costa",
        birthDate: "1988-08-20",
      },
      civilRecordResult: {
        hasRecords: false,
        clean: true,
      },
      federalRecordResult: {
        hasRecords: false,
        clean: true,
      },
      completedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    },
  });

  // Validação básica para Juliana (Premium)
  await prisma.validationRequest.create({
    data: {
      nannyId: nannies[2].id,
      cpf: "11122233344",
      name: "Juliana Costa Mendes",
      motherName: "Paula Costa",
      birthDate: new Date("1992-03-10"),
      level: "BASIC",
      status: "COMPLETED",
      basicDataResult: {
        cpfValid: true,
        name: "Juliana Costa Mendes",
        birthDate: "1992-03-10",
      },
      completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
  });

  // Validação pendente para Carla (Premium)
  await prisma.validationRequest.create({
    data: {
      nannyId: nannies[3].id,
      cpf: "55566677788",
      name: "Carla Mendes Lima",
      motherName: "Fernanda Mendes",
      birthDate: new Date("1985-11-25"),
      level: "PREMIUM",
      status: "PROCESSING",
    },
  });

  // Validação básica para babá 6 (Básico - sem Premium)
  await prisma.validationRequest.create({
    data: {
      nannyId: nannies[5].id,
      cpf: "99988877766",
      name: "Babá 6",
      level: "BASIC",
      status: "COMPLETED",
      basicDataResult: {
        cpfValid: true,
      },
      completedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    },
  });

  console.log("✅ Validações criadas");

  // ============================================
  // CRIAR CONVERSAS (para habilitar avaliações)
  // ============================================
  console.log("💬 Criando conversas...");

  const conversations = [];

  // Helper function to create a conversation between family and nanny
  async function createConversation(
    familyId: number,
    nannyId: number,
    daysAgo: number
  ) {
    const conversation = await prisma.conversation.create({
      data: {
        createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
        participants: {
          create: [
            { familyId },
            { nannyId },
          ],
        },
        messages: {
          create: [
            {
              senderFamilyId: familyId,
              body: "Olá! Estou interessada em seus serviços de babá.",
              createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
            },
          ],
        },
      },
    });
    return conversation;
  }

  // Família Silva conversou com Maria, Ana e Juliana
  conversations.push(
    await createConversation(
      families[0].id,
      nannies[0].id,
      20 // 20 dias atrás
    )
  );

  conversations.push(
    await createConversation(
      families[0].id,
      nannies[1].id,
      15 // 15 dias atrás
    )
  );

  conversations.push(
    await createConversation(
      families[0].id,
      nannies[2].id,
      10 // 10 dias atrás
    )
  );

  // Família Oliveira conversou com Ana e Carla
  conversations.push(
    await createConversation(
      families[1].id,
      nannies[1].id,
      18 // 18 dias atrás
    )
  );

  conversations.push(
    await createConversation(
      families[1].id,
      nannies[3].id,
      8 // 8 dias atrás
    )
  );

  // Família Costa conversou com Juliana e Fernanda
  conversations.push(
    await createConversation(
      families[2].id,
      nannies[2].id,
      12 // 12 dias atrás
    )
  );

  conversations.push(
    await createConversation(
      families[2].id,
      nannies[4].id,
      5 // 5 dias atrás
    )
  );

  console.log("✅ Conversas criadas");

  // ============================================
  // CRIAR AVALIAÇÕES
  // ============================================
  console.log("⭐ Criando avaliações...");

  const reviews = [];

  // Família Silva avalia Maria (publicada)
  reviews.push(
    await prisma.review.create({
      data: {
        familyId: families[0].id,
        nannyId: nannies[0].id,
        type: "FAMILY_TO_NANNY",
        overallRating: 5.0,
        punctuality: 5,
        care: 5,
        communication: 5,
        reliability: 5,
        comment:
          "Excelente profissional! Maria é extremamente atenciosa e carinhosa com as crianças. Meus filhos adoram ela e sempre ficam animados quando sabem que ela virá. Super recomendo!",
        photos: [],
        isPublished: true,
        isVisible: true,
        isReported: false,
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      },
    })
  );

  // Maria avalia Família Silva (publicada)
  reviews.push(
    await prisma.review.create({
      data: {
        familyId: families[0].id,
        nannyId: nannies[0].id,
        type: "NANNY_TO_FAMILY",
        overallRating: 5.0,
        communication: 5,
        respect: 5,
        environment: 5,
        payment: 5,
        comment:
          "Família maravilhosa! Ambiente acolhedor e respeitoso. As crianças são educadas e os pais são muito comunicativos. Pagamento sempre em dia. Recomendo!",
        photos: [],
        isPublished: true,
        isVisible: true,
        isReported: false,
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      },
    })
  );

  // Família Oliveira avalia Ana (publicada)
  reviews.push(
    await prisma.review.create({
      data: {
        familyId: families[1].id,
        nannyId: nannies[1].id,
        type: "FAMILY_TO_NANNY",
        overallRating: 4.8,
        punctuality: 5,
        care: 5,
        communication: 4,
        reliability: 5,
        comment:
          "Ana é muito profissional e dedicada. Minha filha se adaptou muito bem a ela. Única observação é que às vezes demora um pouco para responder mensagens, mas nada que atrapalhe.",
        photos: [],
        isPublished: true,
        isVisible: true,
        isReported: false,
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
    })
  );

  // Ana responde avaliação
  await prisma.review.update({
    where: { id: reviews[2].id },
    data: {
      response:
        "Muito obrigada pelo feedback! Vou melhorar minha comunicação. É um prazer cuidar da sua família!",
      respondedAt: new Date(),
    },
  });

  // Família Costa avalia Juliana (pendente - aguardando Juliana avaliar)
  reviews.push(
    await prisma.review.create({
      data: {
        familyId: families[2].id,
        nannyId: nannies[2].id,
        type: "FAMILY_TO_NANNY",
        overallRating: 4.5,
        punctuality: 4,
        care: 5,
        communication: 4,
        reliability: 5,
        comment:
          "Juliana é muito carinhosa e paciente. Meu filho adora brincar com ela. Às vezes chega uns minutinhos atrasada, mas sempre avisa.",
        photos: [],
        isPublished: false, // Aguardando Juliana avaliar
        isVisible: true,
        isReported: false,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
    })
  );

  // Avaliação reportada (linguagem inapropriada)
  reviews.push(
    await prisma.review.create({
      data: {
        familyId: families[3].id,
        nannyId: nannies[5].id,
        type: "FAMILY_TO_NANNY",
        overallRating: 1.0,
        punctuality: 1,
        care: 1,
        communication: 1,
        reliability: 1,
        comment:
          "Péssima profissional! Não recomendo de jeito nenhum. Totalmente irresponsável e desrespeitosa.",
        photos: [],
        isPublished: true,
        isVisible: true,
        isReported: true, // Reportada
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
    })
  );

  console.log("✅ Avaliações criadas");

  // ============================================
  // CRIAR NOTIFICAÇÕES
  // ============================================
  console.log("🔔 Criando notificações...");

  // Notificação para Maria (avaliação publicada)
  await prisma.notification.create({
    data: {
      nannyId: nannies[0].id,
      type: NotificationType.REVIEW_PUBLISHED,
      title: "Sua avaliação foi publicada",
      message:
        "Sua avaliação de João Silva foi publicada e agora está visível no perfil dele.",
      link: `/app/perfil/${families[0].id}`,
      reviewId: reviews[1].id,
      isRead: true,
      readAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    },
  });

  // Notificação para Família Silva (avaliação publicada)
  await prisma.notification.create({
    data: {
      familyId: families[0].id,
      type: NotificationType.REVIEW_PUBLISHED,
      title: "Sua avaliação foi publicada",
      message:
        "Sua avaliação de Maria Silva foi publicada e agora está visível no perfil dela.",
      link: `/app/perfil/${nannies[0].id}`,
      reviewId: reviews[0].id,
      isRead: true,
      readAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    },
  });

  // Notificação para Família Oliveira (resposta à avaliação)
  await prisma.notification.create({
    data: {
      familyId: families[1].id,
      type: NotificationType.REVIEW_RESPONSE,
      title: "Ana respondeu sua avaliação",
      message: "Ana Oliveira respondeu à avaliação que você deixou.",
      link: `/app/perfil/${nannies[1].id}`,
      reviewId: reviews[2].id,
      isRead: false,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  });

  // Notificação para Juliana (lembrete para avaliar)
  await prisma.notification.create({
    data: {
      nannyId: nannies[2].id,
      type: NotificationType.REVIEW_REMINDER,
      title: "Lembre-se de avaliar Pedro Costa",
      message:
        "Você tem 7 dias para avaliar Pedro Costa. Sua opinião é importante!",
      link: `/app/avaliacoes`,
      isRead: false,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  });

  console.log("✅ Notificações criadas");

  // ============================================
  // CRIAR ADMIN E LOGS DE MODERAÇÃO
  // ============================================
  console.log("👤 Criando admin e logs de moderação...");

  // Criar usuário admin
  const adminUser = await prisma.adminUser.create({
    data: {
      email: "admin@cuidly.com",
      name: "Admin Cuidly",
      isSuperAdmin: true,
      permissions: [
        "NANNIES",
        "FAMILIES",
        "CHILDREN",
        "SUBSCRIPTIONS",
        "ADMIN_USERS",
        "REVIEWS",
      ],
      status: "ACTIVE",
    },
  });

  // Log de moderação: Admin aprovou avaliação de Maria
  await prisma.moderationLog.create({
    data: {
      moderatorId: adminUser.id,
      reviewId: reviews[0].id,
      action: ModerationAction.APPROVED,
      reason: "Avaliação positiva e construtiva.",
      reviewSnapshot: {
        id: reviews[0].id,
        overallRating: reviews[0].overallRating,
        comment: reviews[0].comment,
        reviewer: { name: "João Silva" },
        reviewed: { name: "Maria Silva" },
      },
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    },
  });

  // Log de moderação: Admin ocultou avaliação reportada
  await prisma.moderationLog.create({
    data: {
      moderatorId: adminUser.id,
      reviewId: reviews[4].id,
      action: ModerationAction.HIDDEN,
      reason: "Linguagem inapropriada e ofensiva.",
      reviewSnapshot: {
        id: reviews[4].id,
        overallRating: reviews[4].overallRating,
        comment: reviews[4].comment,
        reviewer: { name: "Ana Mendes" },
        reviewed: { name: "Babá 6" },
      },
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  });

  // Ocultar a avaliação reportada
  await prisma.review.update({
    where: { id: reviews[4].id },
    data: {
      isVisible: false,
      isReported: false,
    },
  });

  console.log("✅ Admin e logs de moderação criados");

  // ============================================
  // CRIAR CONVERSAS E MENSAGENS DE CHAT
  // ============================================
  console.log("💬 Criando conversas e mensagens...");

  // Conversa 1: Família Silva negociando com Maria (match perfeito)
  // Esta é uma conversa completa que resultou em contratação
  const familySilvaId = families[0].id;
  const nannyMariaId = nannies[0].id;

  const conversation1 = await prisma.conversation.create({
    data: {
      createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.participant.createMany({
    data: [
      {
        conversationId: conversation1.id,
        familyId: familySilvaId,
        joinedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
      },
      {
        conversationId: conversation1.id,
        nannyId: nannyMariaId,
        joinedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  // Mensagens alternando entre família e babá
  await prisma.message.createMany({
    data: [
      {
        conversationId: conversation1.id,
        senderFamilyId: familySilvaId,
        body: "Olá Maria! Vi seu perfil na Cuidly e achei muito interessante. Estamos procurando uma babá para nossos dois filhos, Lucas (5 anos) e Sofia (3 anos). Vi que você tem experiência com a metodologia Montessori, que é algo que valorizamos muito!",
        createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
      },
      {
        conversationId: conversation1.id,
        senderNannyId: nannyMariaId,
        body: "Olá João! Que bom receber sua mensagem! Sim, tenho 8 anos de experiência e sou muito apaixonada pela metodologia Montessori. Adoro trabalhar com crianças nessa faixa etária. Pode me contar um pouco mais sobre a rotina e as necessidades das crianças?",
        createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
      },
      {
        conversationId: conversation1.id,
        senderFamilyId: familySilvaId,
        body: "Claro! O Lucas é bem agitado e curioso, adora brincar ao ar livre. A Sofia é mais tímida e gosta de atividades calmas como leitura e desenho. Precisamos de alguém de segunda a sexta, das 8h às 18h. Ah, temos um Yorkshire em casa, espero que não seja um problema!",
        createdAt: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000),
      },
      {
        conversationId: conversation1.id,
        senderNannyId: nannyMariaId,
        body: "Que ótimo! Adoro crianças com personalidades diferentes, é muito enriquecedor adaptar as atividades para cada uma. E pode ficar tranquilo quanto ao cachorro, amo animais! Tenho experiência com crianças agitadas e sei criar atividades que canalizam essa energia de forma positiva.",
        createdAt: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000),
      },
      {
        conversationId: conversation1.id,
        senderFamilyId: familySilvaId,
        body: "Perfeito! Qual seria sua pretensão salarial? Oferecemos CLT com vale transporte e vale refeição.",
        createdAt: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000),
      },
      {
        conversationId: conversation1.id,
        senderNannyId: nannyMariaId,
        body: "Minha pretensão é de R$ 3.500,00 mensais. Inclui preparar as refeições das crianças e organizar as roupinhas delas. O que acham?",
        createdAt: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
      },
      {
        conversationId: conversation1.id,
        senderFamilyId: familySilvaId,
        body: "Está dentro do nosso orçamento! Podemos marcar uma entrevista presencial? Gostaríamos que você conhecesse as crianças antes de fecharmos.",
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      },
      {
        conversationId: conversation1.id,
        senderNannyId: nannyMariaId,
        body: "Com certeza! Que tal quinta-feira às 14h? Assim posso conhecer os pequenos e vocês podem me conhecer melhor também. Pode ser na casa de vocês?",
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
      },
      {
        conversationId: conversation1.id,
        senderFamilyId: familySilvaId,
        body: "Perfeito! Quinta às 14h está ótimo. Vou te mandar o endereço por aqui: Av. Brigadeiro Faria Lima, 1000, apt 151 - Jardim Paulistano. Até lá!",
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      },
      {
        conversationId: conversation1.id,
        senderNannyId: nannyMariaId,
        body: "Anotado! Estarei lá. Muito obrigada pela oportunidade! Até quinta!",
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
      },
    ],
  });

  // Conversa 2: Família Oliveira negociando com Ana (especialista em bebês)
  // Conversa em andamento
  const familyOliveiraId = families[1].id;
  const nannyAnaId = nannies[1].id;

  const conversation2 = await prisma.conversation.create({
    data: {
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.participant.createMany({
    data: [
      {
        conversationId: conversation2.id,
        familyId: familyOliveiraId,
        joinedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
      {
        conversationId: conversation2.id,
        nannyId: nannyAnaId,
        joinedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  await prisma.message.createMany({
    data: [
      {
        conversationId: conversation2.id,
        senderFamilyId: familyOliveiraId,
        body: "Boa tarde, Ana! Sou a Maria Oliveira, mãe do Miguel de 1 aninho. Vi que você é especializada em bebês e recém-nascidos. Estamos precisando de uma babá com essa experiência específica.",
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
      {
        conversationId: conversation2.id,
        senderNannyId: nannyAnaId,
        body: "Boa tarde, Maria! Que bom falar com você! Sim, tenho 12 anos de experiência com bebês, é minha especialidade. Como está o Miguel? Qual a rotina dele atualmente?",
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
      },
      {
        conversationId: conversation2.id,
        senderFamilyId: familyOliveiraId,
        body: "O Miguel é um amor, bem calminho. Ele tem alergia a lactose, então preciso de alguém que entenda bem sobre alimentação. A rotina dele é bem certinha: acorda às 6h, soneca às 9h, almoço às 12h, soneca à tarde e dorme às 19h.",
        createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
      },
      {
        conversationId: conversation2.id,
        senderNannyId: nannyAnaId,
        body: "Entendo perfeitamente! Já cuidei de bebês com intolerância à lactose antes. Sei preparar papinhas e lanchinhos adequados. Também tenho certificação em primeiros socorros pediátricos, o que me deixa mais segura para qualquer eventualidade.",
        createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
      },
      {
        conversationId: conversation2.id,
        senderFamilyId: familyOliveiraId,
        body: "Isso é muito importante para nós! Você tem disponibilidade de segunda a sexta, das 7h às 17h?",
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      },
      {
        conversationId: conversation2.id,
        senderNannyId: nannyAnaId,
        body: "Tenho sim! Esse horário é perfeito para mim. Moro em Pinheiros, então consigo chegar tranquilamente às 7h. Qual região vocês moram?",
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000),
      },
      {
        conversationId: conversation2.id,
        senderFamilyId: familyOliveiraId,
        body: "Moramos em Pinheiros também! Na Rua dos Pinheiros. Super perto então. Sobre valores, estamos oferecendo entre R$ 3.800 e R$ 4.500, com CLT completa e plano de saúde.",
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        conversationId: conversation2.id,
        senderNannyId: nannyAnaId,
        body: "Que ótimo que é pertinho! Os valores estão dentro do que eu esperava. Minha pretensão seria R$ 4.200. Posso fazer um dia de experiência com o Miguel para vocês verem como trabalho?",
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
      },
      {
        conversationId: conversation2.id,
        senderFamilyId: familyOliveiraId,
        body: "Adorei a ideia! Que tal na próxima segunda-feira? Assim eu fico em casa trabalhando e posso observar. O Miguel pode se adaptar aos poucos.",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  // Conversa 3: Família Costa com Juliana (babá bilíngue)
  // Conversa inicial
  const familyCostaId = families[2].id;
  const nannyJulianaId = nannies[2].id;

  const conversation3 = await prisma.conversation.create({
    data: {
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.participant.createMany({
    data: [
      {
        conversationId: conversation3.id,
        familyId: familyCostaId,
        joinedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        conversationId: conversation3.id,
        nannyId: nannyJulianaId,
        joinedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  await prisma.message.createMany({
    data: [
      {
        conversationId: conversation3.id,
        senderFamilyId: familyCostaId,
        body: "Hi Juliana! I saw that you're bilingual and that caught my attention. We're looking for someone who can help our kids practice English while having fun!",
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        conversationId: conversation3.id,
        senderNannyId: nannyJulianaId,
        body: "Hello Pedro! That's wonderful! I love teaching English to children through games and activities. How old are your kids? I work with the Waldorf approach which values natural learning.",
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000),
      },
      {
        conversationId: conversation3.id,
        senderFamilyId: familyCostaId,
        body: "Temos 3 filhos: Pedro (8), Julia (6) e Gabriel (4). São bem ativos e adoram brincar ao ar livre. A gente alterna entre português e inglês em casa, então seria ótimo manter isso!",
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      },
      {
        conversationId: conversation3.id,
        senderNannyId: nannyJulianaId,
        body: "Perfect ages to learn! I can do story time in English, sing songs, play games - tudo de forma natural e divertida. Com 3 crianças ativas, minhas atividades ao ar livre vão ser perfeitas!",
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
      },
      {
        conversationId: conversation3.id,
        senderFamilyId: familyCostaId,
        body: "Sounds great! Precisamos de alguém das 12h às 20h, quando eles voltam da escola. Você teria essa disponibilidade?",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  // Conversa 4: Família Mendes com Carla (especialista em necessidades especiais)
  const familyMendesId = families[3].id;
  const nannyCarlaId = nannies[3].id;

  const conversation4 = await prisma.conversation.create({
    data: {
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.participant.createMany({
    data: [
      {
        conversationId: conversation4.id,
        familyId: familyMendesId,
        joinedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
      {
        conversationId: conversation4.id,
        nannyId: nannyCarlaId,
        joinedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  await prisma.message.createMany({
    data: [
      {
        conversationId: conversation4.id,
        senderFamilyId: familyMendesId,
        body: "Olá Carla! Sou a Ana Mendes, mãe do Rafael de 7 anos. Ele tem autismo (TEA nível 1) e estamos procurando uma profissional com experiência específica. Vi que você é terapeuta ocupacional!",
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
      {
        conversationId: conversation4.id,
        senderNannyId: nannyCarlaId,
        body: "Olá Ana! Que bom que você me encontrou. Sim, sou terapeuta ocupacional com pós em educação especial e tenho 10 anos de experiência com crianças no espectro autista. Cada criança é única e eu adoraria saber mais sobre o Rafael.",
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
      },
      {
        conversationId: conversation4.id,
        senderFamilyId: familyMendesId,
        body: "O Rafael é um menino muito inteligente e carinhoso. Ele precisa de rotina estruturada - qualquer mudança brusca o deixa ansioso. Adora quebra-cabeças e livros, mas tem dificuldade com interações sociais e algumas questões sensoriais.",
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      },
      {
        conversationId: conversation4.id,
        senderNannyId: nannyCarlaId,
        body: "Entendo perfeitamente. Trabalho muito com antecipação e rotinas visuais - ajuda demais na previsibilidade que eles precisam. Sobre as questões sensoriais, você sabe quais são os principais triggers dele? Som alto, texturas específicas?",
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
      },
      {
        conversationId: conversation4.id,
        senderFamilyId: familyMendesId,
        body: "Exatamente! Sons altos e ambientes muito cheios de gente. Em casa é mais tranquilo porque controlamos o ambiente. Ele também faz acompanhamento com TO e fono duas vezes por semana.",
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        conversationId: conversation4.id,
        senderNannyId: nannyCarlaId,
        body: "Ótimo que ele já tem esse acompanhamento! Posso trabalhar em conjunto com os profissionais dele para manter a consistência das intervenções. Uso muito jogos de tabuleiro e atividades estruturadas que ele provavelmente vai adorar!",
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
      },
      {
        conversationId: conversation4.id,
        senderFamilyId: familyMendesId,
        body: "Isso seria incrível! Precisamos de alguém das 12h às 18h, quando ele volta da escola. Oferecemos R$ 4.500 a R$ 5.500, CLT com plano de saúde. Sua experiência é exatamente o que procuramos.",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        conversationId: conversation4.id,
        senderNannyId: nannyCarlaId,
        body: "Os valores e benefícios estão ótimos! Gostaria muito de conhecer o Rafael antes. Seria possível marcar uma visita? Gosto de observar a rotina da criança no ambiente familiar antes de começar.",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000),
      },
      {
        conversationId: conversation4.id,
        senderFamilyId: familyMendesId,
        body: "Claro! Que tal sábado pela manhã? É quando ele está mais tranquilo e podemos conversar com calma enquanto você o conhece.",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  console.log("✅ Conversas e mensagens criadas");

  console.log("🎉 Seed concluído com sucesso!");
  console.log("");
  console.log("📄 Resumo:");
  console.log(`- ${nannies.length} babás criadas`);
  console.log(`- ${families.length} famílias criadas`);
  console.log(`- ${children.length} filhos criados`);
  console.log(`- ${jobs.length} vagas criadas`);
  console.log(`- ${conversations.length} conversas criadas`);
  console.log(`- ${reviews.length} avaliações criadas`);
  console.log(`- 5 notificações criadas`);
  console.log(`- 2 logs de moderação criados`);
  console.log(`- 6 planos criados`);
  console.log(`- 4 conversas de chat criadas`);
  console.log(`- 33 mensagens de chat criadas`);
  console.log("");
  console.log("👤 Usuários de teste:");
  console.log("");
  console.log("BABÁS:");
  console.log("- maria.silva@email.com (Plano Premium Mensal)");
  console.log("- ana.oliveira@email.com (Plano Premium Anual)");
  console.log("- juliana.costa@email.com (Plano Premium Mensal)");
  console.log("- carla.mendes@email.com (Plano Premium Anual)");
  console.log("- fernanda.lima@email.com (Plano Premium Mensal)");
  console.log("- baba6@email.com até baba20@email.com (Plano Básico)");
  console.log("");
  console.log("FAMÍLIAS:");
  console.log("- joao.silva@email.com (Plano Familiar Mensal)");
  console.log("- maria.oliveira@email.com (Plano Familiar Trimestral)");
  console.log("- pedro.costa@email.com (Plano Familiar Mensal)");
  console.log("- ana.mendes@email.com (Plano Gratuito)");
  console.log("- carlos.lima@email.com (Plano Gratuito)");
  console.log("");
  console.log("ADMIN:");
  console.log("- admin@cuidly.com (use autenticação via Supabase Auth)");
}

main()
  .catch((e) => {
    console.error("❌ Erro ao executar seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
