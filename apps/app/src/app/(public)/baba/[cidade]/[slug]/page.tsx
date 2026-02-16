/**
 * Public Nanny Profile Page (Server Component)
 * Route: /baba/[cidade]/[slug]
 *
 * Optimized with:
 * - Server-side rendering for SEO
 * - ISR (Incremental Static Regeneration) with 5 min revalidation
 * - Client components only for interactive parts
 */

import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import {
  PiBaby,
  PiBriefcase,
  PiCertificate,
  PiCheck,
  PiCheckCircle,
  PiClock,
  PiCurrencyDollar,
  PiFileText,
  PiHeart,
  PiMapPin,
  PiShieldCheck,
  PiStar,
  PiStarFill,
  PiUser,
} from 'react-icons/pi';

import { SealBadge } from '@/components/seals';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/shadcn/accordion';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/shadcn/avatar';
import { Badge } from '@/components/ui/shadcn/badge';
import { Card } from '@/components/ui/shadcn/card';
import {
  getAcceptsHolidayWorkLabel,
  getActivityLabel,
  getAgeRangeLabel,
  getCareMethodologyLabel,
  getCertificationLabel,
  getComfortWithPetsLabel,
  getContractRegimeLabel,
  getHourlyRateRangeLabel,
  getLanguageLabel,
  getMaxChildrenCareLabel,
  getMaxTravelDistanceLabel,
  getNannyTypeLabel,
  getParentPresenceLabel,
  getSpecialNeedsLabel,
  getStrengthLabel,
} from '@/helpers/label-getters';
import { sanitizeHtml } from '@/lib/sanitize-html';
import { type NannySeal } from '@/lib/seals';
import { publicPhotoUrl } from '@/lib/supabase-files';
import {
  ATTENDANCE_MODES,
  AVAILABILITY_SCHEDULES,
  SERVICE_TYPES,
} from '@/schemas/nanny-registration';

import prisma from '@/lib/prisma';

import { getNannyBySlug, generateCitySlug } from './_lib/get-nanny';
import {
  ContactSection,
  FinalCtaSection,
  MatchScoreSection,
  PremiumCtaCard,
  ProfileAnalytics,
  ProfileHeader,
  RelatedNanniesSection,
} from './_components';

// ISR: Revalidate every 5 minutes
export const revalidate = 300;

// Allow dynamic params for profiles not pre-rendered
export const dynamicParams = true;

/**
 * Pre-render the most recently active nanny profiles at build time
 * This improves initial load time for frequently visited profiles
 */
export async function generateStaticParams() {
  try {
    // Get the 50 most recently updated nanny profiles (proxy for activity)
    const activeNannies = await prisma.nanny.findMany({
      where: {
        status: 'ACTIVE',
        isProfilePublic: true,
        deletedAt: null,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 50,
      select: {
        slug: true,
        address: {
          select: {
            city: true,
          },
        },
      },
    });

    return activeNannies
      .filter((nanny) => nanny.address?.city)
      .map((nanny) => ({
        cidade: generateCitySlug(nanny.address!.city),
        slug: nanny.slug,
      }));
  } catch (error) {
    console.error('Error generating static params for nanny profiles:', error);
    return [];
  }
}

// ============= HELPERS =============

function getExperienceLabel(years: number | null): string {
  if (years === null) return '';
  if (years === 0) return 'Menos de 1 ano';
  if (years === 1) return '1 ano';
  return `${years} anos`;
}

function formatLastActive(date: Date | null): string {
  if (!date) return '';

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 5) return 'Online agora';
  if (diffMins < 60) return `Ativo há ${diffMins} minutos`;
  if (diffHours < 24)
    return `Ativo há ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
  if (diffDays === 1) return 'Ativo ontem';
  if (diffDays < 7) return `Ativo há ${diffDays} dias`;
  if (diffDays < 30)
    return `Ativo há ${Math.floor(diffDays / 7)} semana${Math.floor(diffDays / 7) > 1 ? 's' : ''}`;

  return `Ativo em ${date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}`;
}

function getLabelFromValue(
  value: string,
  options: readonly { value: string; label: string }[],
): string {
  const option = options.find((opt) => opt.value === value);
  return option ? option.label : value;
}

function getLanguageLevelLabel(level: string): string {
  const labels: Record<string, string> = {
    NATIVE: 'Nativo',
    FLUENT: 'Fluente',
    INTERMEDIATE: 'Intermediário',
    BASIC: 'Básico',
  };
  return labels[level] || level;
}

function getSpecialtyLabel(value: string): string {
  const specialNeedsTranslated = getSpecialNeedsLabel(value);
  if (specialNeedsTranslated !== value) {
    return specialNeedsTranslated;
  }
  return value;
}

// ============= FAQ DATA =============

const PROFILE_FAQS = [
  {
    question: 'Como entro em contato com esta babá?',
    answer:
      'Clique no botão "Contratar" para iniciar uma conversa via WhatsApp. Você pode tirar dúvidas, agendar entrevistas e negociar valores diretamente.',
  },
  {
    question: 'As informações da babá são verificadas?',
    answer:
      'Sim. Todas as babás passam por validação de documentos. Babás com plano Pro têm verificação completa, incluindo checagem de antecedentes.',
  },
  {
    question: 'Posso ver avaliações de outras famílias?',
    answer:
      'Sim! Crie sua conta para ter acesso a avaliações, match score personalizado e mais informações detalhadas.',
  },
  {
    question: 'Como funciona o pagamento?',
    answer:
      'O pagamento é negociado diretamente entre você e a babá. A Cuidly não processa pagamentos - você combina forma de pagamento, valor e frequência diretamente com a profissional.',
  },
  {
    question: 'Quais os benefícios de criar uma conta?',
    answer:
      'Com uma conta você tem acesso a perfis completos, avaliações de outras famílias, match score personalizado, pode criar vagas de emprego e salvar babás favoritas.',
  },
];

// ============= SUB-COMPONENTS =============

function ProfileFooter() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="mb-4 bg-gradient-to-r from-fuchsia-400 to-blue-400 bg-clip-text text-2xl font-bold text-transparent">
              Cuidly
            </h3>
            <p className="text-sm leading-relaxed text-gray-400">
              A plataforma mais segura e confiável para encontrar babás
              verificadas em todo o Brasil.
            </p>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-white">Para Você</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/#familias"
                  className="transition-colors hover:text-fuchsia-400"
                >
                  Famílias
                </Link>
              </li>
              <li>
                <Link
                  href="/para-babas"
                  className="transition-colors hover:text-fuchsia-400"
                >
                  Para Babás
                </Link>
              </li>
              <li>
                <Link
                  href="/#como-funciona"
                  className="transition-colors hover:text-fuchsia-400"
                >
                  Como Funciona
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-white">Empresa</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/#quem-somos"
                  className="transition-colors hover:text-fuchsia-400"
                >
                  Quem Somos
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="transition-colors hover:text-fuchsia-400"
                >
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-white">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/termos/termos-de-uso"
                  className="transition-colors hover:text-fuchsia-400"
                >
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link
                  href="/termos/politica-de-privacidade"
                  className="transition-colors hover:text-fuchsia-400"
                >
                  Privacidade
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <p className="text-center text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Cuidly Tecnologia Ltda · CNPJ 63.813.138/0001-20
          </p>
        </div>
      </div>
    </footer>
  );
}

function ProfileFAQSection({ nannyName }: { nannyName: string }) {
  return (
    <section className="bg-white px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Perguntas Frequentes
          </h2>
          <p className="mt-3 text-gray-600">
            Dúvidas sobre como contratar {nannyName}
          </p>
        </div>

        <Accordion type="single" collapsible defaultValue="item-0">
          {PROFILE_FAQS.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent className="text-base text-gray-600">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

function TrustSignalsCard() {
  return (
    <Card className="border-0 bg-gray-50 shadow-md">
      <div className="p-6">
        <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
          <PiShieldCheck className="text-green-600" />
          Por que usar a Cuidly?
        </h3>
        <ul className="space-y-3 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <PiCheck className="mt-0.5 size-4 shrink-0 text-green-600" />
            Babás verificadas com checagem de documentos
          </li>
          <li className="flex items-start gap-2">
            <PiCheck className="mt-0.5 size-4 shrink-0 text-green-600" />
            Avaliações reais de outras famílias
          </li>
          <li className="flex items-start gap-2">
            <PiCheck className="mt-0.5 size-4 shrink-0 text-green-600" />
            Contato direto sem intermediários
          </li>
          <li className="flex items-start gap-2">
            <PiCheck className="mt-0.5 size-4 shrink-0 text-green-600" />
            Suporte dedicado para famílias
          </li>
        </ul>
      </div>
    </Card>
  );
}

// ============= MAIN PAGE COMPONENT =============

export default async function PublicNannyProfilePage({
  params,
}: {
  params: Promise<{ cidade: string; slug: string }>;
}) {
  const { cidade, slug } = await params;

  // Fetch nanny data server-side
  const nanny = await getNannyBySlug(slug);

  // Handle 404
  if (!nanny) {
    notFound();
  }

  // Redirect to correct city URL if needed
  if (nanny.address?.city) {
    const correctCitySlug = generateCitySlug(nanny.address.city);
    if (cidade !== correctCitySlug) {
      redirect(`/baba/${correctCitySlug}/${nanny.slug}`);
    }
  }

  // Get document counts
  const certificatesCount = nanny.documents.filter(
    (doc) => doc.type === 'CERTIFICATE',
  ).length;
  const referenceLettersCount = nanny.documents.filter(
    (doc) => doc.type === 'REFERENCE_LETTER',
  ).length;

  return (
    <div className="min-h-screen bg-white">
      {/* Client-side analytics tracking */}
      <ProfileAnalytics nannyId={nanny.id} />

      {/* Header (Client Component for auth state) */}
      <ProfileHeader />

      {/* Main Content */}
      <main>
        {/* Profile Section */}
        <section className="bg-white px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {/* Left Column - Main Profile */}
              <div className="space-y-6 lg:col-span-2">
                {/* Profile Header Card */}
                <Card className="overflow-hidden border-0 bg-white shadow-md">
                  <div className="p-6 sm:p-8">
                    <div className="flex flex-col items-start gap-6 sm:flex-row">
                      {/* Avatar */}
                      <div className="relative mx-auto sm:mx-0">
                        <Avatar className="size-48 border-4 border-fuchsia-100 shadow-lg sm:size-56">
                          <AvatarImage
                            src={
                              nanny.photoUrl
                                ? publicPhotoUrl(nanny.photoUrl, 280, 280)
                                : undefined
                            }
                            alt={nanny.firstName || 'Babá'}
                          />
                          <AvatarFallback className="bg-gradient-to-br from-fuchsia-400 to-purple-500 text-5xl text-white">
                            {(nanny.firstName || 'B').charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {nanny.seal && (
                          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 transform">
                            <SealBadge seal={nanny.seal as NannySeal} />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 text-center sm:text-left">
                        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                          {nanny.firstName}, {nanny.age}
                        </h1>

                        {nanny.address && (
                          <div className="mt-2 flex items-center justify-center gap-1.5 text-gray-600 sm:justify-start">
                            <PiMapPin size={18} className="text-fuchsia-500" />
                            <span className="text-base">
                              {nanny.address.neighborhood &&
                                `${nanny.address.neighborhood}, `}
                              {nanny.address.city}, {nanny.address.state}
                            </span>
                          </div>
                        )}

                        {/* Last Active */}
                        {nanny.lastActiveAt && (
                          <div className="mt-2 flex items-center justify-center gap-1.5 text-gray-500 sm:justify-start">
                            <PiClock size={16} className="text-gray-400" />
                            <span className="text-sm">
                              {formatLastActive(nanny.lastActiveAt)}
                            </span>
                          </div>
                        )}

                        <div className="mt-4 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
                          {nanny.experienceYears !== null && (
                            <div className="flex items-center gap-1.5 rounded-full bg-fuchsia-50 px-3 py-1.5 text-sm font-medium text-fuchsia-700">
                              <PiBriefcase size={16} />
                              {getExperienceLabel(nanny.experienceYears)} de
                              exp.
                            </div>
                          )}
                          {nanny.hourlyRate && (
                            <div className="flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-sm font-medium text-green-700">
                              <PiCurrencyDollar size={16} />
                              R$ {nanny.hourlyRate}/hora
                            </div>
                          )}
                        </div>

                        {/* Trust Badges */}
                        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                          {(certificatesCount > 0 ||
                            (nanny.verifications?.hasCertificates ?? 0) > 0) && (
                            <Badge variant="info">
                              <PiCertificate className="size-3.5" />
                              {certificatesCount ||
                                nanny.verifications?.hasCertificates}{' '}
                              Certificado
                              {(certificatesCount ||
                                nanny.verifications?.hasCertificates ||
                                0) > 1
                                ? 's'
                                : ''}
                            </Badge>
                          )}
                          {(referenceLettersCount > 0 ||
                            (nanny.referencesCount ?? 0) > 0) && (
                            <Badge variant="purple">
                              <PiFileText className="size-3.5" />
                              {referenceLettersCount || nanny.referencesCount}{' '}
                              Referência
                              {(referenceLettersCount ||
                                nanny.referencesCount ||
                                0) > 1
                                ? 's'
                                : ''}
                            </Badge>
                          )}
                          {nanny.hasSpecialNeedsExperience && (
                            <Badge variant="pink">
                              <PiHeart className="size-3.5" />
                              Nec. Especiais
                            </Badge>
                          )}
                        </div>

                        {/* Reviews summary */}
                        {nanny.reviews && nanny.reviews.total > 0 && (
                          <div className="mt-4 flex items-center justify-center gap-2 sm:justify-start">
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <PiStarFill
                                  key={star}
                                  className={`h-4 w-4 ${
                                    star <= (nanny.reviews?.average ?? 0)
                                      ? 'text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm font-medium text-gray-700">
                              {nanny.reviews.average?.toFixed(1)} (
                              {nanny.reviews.total} avaliações)
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bio */}
                    {nanny.aboutMe && (
                      <div className="mt-6 border-t pt-6">
                        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900">
                          <PiUser className="text-fuchsia-500" />
                          Sobre mim
                        </h2>
                        <div
                          className="prose prose-sm max-w-none leading-relaxed text-gray-700"
                          dangerouslySetInnerHTML={{
                            __html: sanitizeHtml(nanny.aboutMe),
                          }}
                        />
                      </div>
                    )}
                  </div>
                </Card>

                {/* Verifications & Security */}
                {nanny.verifications &&
                  (nanny.verifications.emailVerified ||
                    nanny.verifications.documentValidated ||
                    nanny.verifications.personalDataValidated ||
                    nanny.verifications.criminalBackgroundValidated ||
                    (nanny.referencesCount ?? 0) > 0) && (
                    <Card className="border-0 shadow-md">
                      <div className="p-6">
                        <div className="mb-4 flex items-center justify-between">
                          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                            <PiShieldCheck className="text-green-500" />
                            Verificações
                          </h2>
                          {nanny.seal && (
                            <SealBadge seal={nanny.seal as NannySeal} />
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {nanny.verifications.emailVerified && (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-700">
                              <PiCheckCircle className="size-4" />
                              E-mail verificado
                            </span>
                          )}
                          {nanny.verifications.documentValidated && (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-700">
                              <PiCheckCircle className="size-4" />
                              Documento validado
                            </span>
                          )}
                          {nanny.verifications.personalDataValidated && (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-700">
                              <PiCheckCircle className="size-4" />
                              Dados pessoais validados
                            </span>
                          )}
                          {nanny.verifications.criminalBackgroundValidated && (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-700">
                              <PiCheckCircle className="size-4" />
                              Antecedentes verificados
                            </span>
                          )}
                          {(nanny.referencesCount ?? 0) > 0 && (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-700">
                              <PiCheckCircle className="size-4" />
                              {nanny.referencesCount} referência
                              {(nanny.referencesCount ?? 0) > 1 ? 's' : ''}{' '}
                              verificada
                              {(nanny.referencesCount ?? 0) > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    </Card>
                  )}

                {/* Availability Schedule */}
                {nanny.availability && nanny.availability.length > 0 && (
                  <Card className="border-0 shadow-md">
                    <div className="p-6">
                      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                        <PiClock className="text-fuchsia-500" />
                        Disponibilidade
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        {nanny.availability.map((scheduleValue, idx) => (
                          <span
                            key={`${scheduleValue}-${idx}`}
                            className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-700"
                          >
                            <PiCheck size={16} className="mr-1.5" />
                            {getLabelFromValue(
                              scheduleValue,
                              AVAILABILITY_SCHEDULES,
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Card>
                )}

                {/* Specialties */}
                {nanny.specialties.length > 0 && (
                  <Card className="border-0 shadow-md">
                    <div className="p-6">
                      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                        <PiHeart className="text-fuchsia-500" />
                        Especialidades
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        {nanny.specialties.map((specialty, idx) => (
                          <span
                            key={`${specialty}-${idx}`}
                            className="inline-flex items-center rounded-full border border-fuchsia-200 bg-fuchsia-50 px-4 py-2 text-sm font-medium text-fuchsia-700"
                          >
                            {getSpecialtyLabel(specialty)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Card>
                )}

                {/* Special Needs Experience */}
                {nanny.hasSpecialNeedsExperience && (
                  <Card className="border-0 shadow-md">
                    <div className="p-6">
                      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                        <PiHeart className="text-pink-500" />
                        Experiência com Necessidades Especiais
                      </h2>
                      {nanny.specialNeedsExperienceDescription && (
                        <p className="mb-4 text-gray-700">
                          {nanny.specialNeedsExperienceDescription}
                        </p>
                      )}
                      {nanny.specialNeedsSpecialties &&
                        nanny.specialNeedsSpecialties.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {nanny.specialNeedsSpecialties.map(
                              (specialty, idx) => (
                                <span
                                  key={`${specialty}-${idx}`}
                                  className="inline-flex items-center rounded-full border border-pink-200 bg-pink-50 px-4 py-2 text-sm font-medium text-pink-700"
                                >
                                  {getSpecialNeedsLabel(specialty)}
                                </span>
                              ),
                            )}
                          </div>
                        )}
                    </div>
                  </Card>
                )}

                {/* Child Age Experiences */}
                {nanny.childAgeExperiences &&
                  nanny.childAgeExperiences.length > 0 && (
                    <Card className="border-0 shadow-md">
                      <div className="p-6">
                        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                          <PiBaby className="text-purple-500" />
                          Experiência com faixas etárias
                        </h2>
                        <div className="flex flex-wrap gap-2">
                          {nanny.childAgeExperiences.map((expValue, idx) => (
                            <span
                              key={`${expValue}-${idx}`}
                              className="inline-flex items-center rounded-full border border-purple-200 bg-purple-50 px-4 py-2 text-sm font-medium text-purple-700"
                            >
                              {getAgeRangeLabel(expValue)}
                            </span>
                          ))}
                        </div>
                      </div>
                    </Card>
                  )}

                {/* Service Details */}
                {(nanny.serviceTypes.length > 0 ||
                  nanny.attendanceModes.length > 0) && (
                  <Card className="border-0 shadow-md">
                    <div className="p-6">
                      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                        <PiBriefcase className="text-blue-500" />
                        Serviços oferecidos
                      </h2>
                      <div className="grid gap-6 sm:grid-cols-2">
                        {nanny.serviceTypes.length > 0 && (
                          <div>
                            <p className="mb-3 text-sm font-medium text-gray-700">
                              Tipos de atendimento:
                            </p>
                            <div className="space-y-2">
                              {nanny.serviceTypes.map((typeValue, idx) => (
                                <div
                                  key={`${typeValue}-${idx}`}
                                  className="flex items-center gap-2"
                                >
                                  <PiCheckCircle
                                    size={18}
                                    className="shrink-0 text-green-600"
                                  />
                                  <span className="text-sm text-gray-700">
                                    {getLabelFromValue(typeValue, SERVICE_TYPES)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {nanny.attendanceModes.length > 0 && (
                          <div>
                            <p className="mb-3 text-sm font-medium text-gray-700">
                              Modalidades de atendimento:
                            </p>
                            <div className="space-y-2">
                              {nanny.attendanceModes.map((modeValue, idx) => (
                                <div
                                  key={`${modeValue}-${idx}`}
                                  className="flex items-center gap-2"
                                >
                                  <PiCheckCircle
                                    size={18}
                                    className="shrink-0 text-green-600"
                                  />
                                  <span className="text-sm text-gray-700">
                                    {getLabelFromValue(
                                      modeValue,
                                      ATTENDANCE_MODES,
                                    )}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                )}

                {/* Work Conditions */}
                {((nanny.nannyTypes && nanny.nannyTypes.length > 0) ||
                  (nanny.contractRegimes && nanny.contractRegimes.length > 0) ||
                  nanny.hourlyRateRange ||
                  nanny.acceptsHolidayWork ||
                  nanny.maxChildrenCare ||
                  nanny.maxTravelDistance) && (
                  <Card className="border-0 shadow-md">
                    <div className="p-6">
                      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                        <PiBriefcase className="text-purple-500" />
                        Condições de trabalho
                      </h2>
                      <div className="grid gap-4 sm:grid-cols-2">
                        {nanny.nannyTypes && nanny.nannyTypes.length > 0 && (
                          <div>
                            <p className="mb-2 text-sm font-medium text-gray-700">
                              Tipo de babá
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {nanny.nannyTypes.map((type, idx) => (
                                <span
                                  key={`${type}-${idx}`}
                                  className="inline-flex items-center rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-sm font-medium text-purple-700"
                                >
                                  {getNannyTypeLabel(type)}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {nanny.contractRegimes &&
                          nanny.contractRegimes.length > 0 && (
                            <div>
                              <p className="mb-2 text-sm font-medium text-gray-700">
                                Regime de contratação
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {nanny.contractRegimes.map((regime, idx) => (
                                  <span
                                    key={`${regime}-${idx}`}
                                    className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700"
                                  >
                                    {getContractRegimeLabel(regime)}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        {nanny.hourlyRateRange && (
                          <div>
                            <p className="mb-2 text-sm font-medium text-gray-700">
                              Faixa de valor/hora
                            </p>
                            <p className="text-gray-600">
                              {getHourlyRateRangeLabel(nanny.hourlyRateRange)}
                            </p>
                          </div>
                        )}
                        {nanny.maxChildrenCare && (
                          <div>
                            <p className="mb-2 text-sm font-medium text-gray-700">
                              Máximo de crianças
                            </p>
                            <p className="text-gray-600">
                              {getMaxChildrenCareLabel(nanny.maxChildrenCare)}
                            </p>
                          </div>
                        )}
                        {nanny.maxTravelDistance && (
                          <div>
                            <p className="mb-2 text-sm font-medium text-gray-700">
                              Raio de deslocamento
                            </p>
                            <p className="text-gray-600">
                              {getMaxTravelDistanceLabel(nanny.maxTravelDistance)}
                            </p>
                          </div>
                        )}
                        {nanny.acceptsHolidayWork && (
                          <div>
                            <p className="mb-2 text-sm font-medium text-gray-700">
                              Trabalha em feriados
                            </p>
                            <p className="text-gray-600">
                              {getAcceptsHolidayWorkLabel(nanny.acceptsHolidayWork)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                )}

                {/* Certifications */}
                {nanny.certifications && nanny.certifications.length > 0 && (
                  <Card className="border-0 shadow-md">
                    <div className="p-6">
                      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                        <PiCertificate className="text-blue-500" />
                        Certificações
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        {nanny.certifications.map((cert, idx) => (
                          <span
                            key={`${cert}-${idx}`}
                            className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700"
                          >
                            {getCertificationLabel(cert)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Card>
                )}

                {/* Languages */}
                {nanny.languages && nanny.languages.length > 0 && (
                  <Card className="border-0 shadow-md">
                    <div className="p-6">
                      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                        <PiUser className="text-indigo-500" />
                        Idiomas
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        {nanny.languages.map((lang, idx) => {
                          const isStringFormat = typeof lang === 'string';
                          const languageCode = isStringFormat
                            ? lang
                            : lang.language;
                          const level = isStringFormat ? null : lang.level;
                          return (
                            <span
                              key={`${languageCode}-${idx}`}
                              className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700"
                            >
                              {getLanguageLabel(languageCode)}
                              {level ? ` - ${getLanguageLevelLabel(level)}` : ''}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </Card>
                )}

                {/* Strengths */}
                {nanny.strengths && nanny.strengths.length > 0 && (
                  <Card className="border-0 shadow-md">
                    <div className="p-6">
                      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                        <PiHeart className="text-fuchsia-500" />
                        Pontos fortes
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        {nanny.strengths.map((strength, idx) => (
                          <span
                            key={`${strength}-${idx}`}
                            className="inline-flex items-center rounded-full border border-fuchsia-200 bg-fuchsia-50 px-4 py-2 text-sm font-medium text-fuchsia-700"
                          >
                            {getStrengthLabel(strength)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Card>
                )}

                {/* Accepted Activities */}
                {nanny.acceptedActivities &&
                  nanny.acceptedActivities.length > 0 && (
                    <Card className="border-0 shadow-md">
                      <div className="p-6">
                        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                          <PiCheckCircle className="text-green-500" />
                          Atividades que aceita realizar
                        </h2>
                        <div className="flex flex-wrap gap-2">
                          {nanny.acceptedActivities.map((activity, idx) => (
                            <span
                              key={`${activity}-${idx}`}
                              className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-700"
                            >
                              {getActivityLabel(activity)}
                            </span>
                          ))}
                        </div>
                      </div>
                    </Card>
                  )}

                {/* Preferences */}
                {(nanny.careMethodology ||
                  nanny.comfortableWithPets ||
                  nanny.parentPresencePreference ||
                  nanny.isSmoker !== undefined ||
                  nanny.hasCnh !== undefined) && (
                  <Card className="border-0 shadow-md">
                    <div className="p-6">
                      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                        <PiUser className="text-gray-500" />
                        Preferências e estilo de trabalho
                      </h2>
                      <div className="space-y-4">
                        {nanny.careMethodology && (
                          <div>
                            <p className="text-sm font-medium text-gray-700">
                              Metodologia de cuidado:
                            </p>
                            <p className="mt-1 text-gray-600">
                              {getCareMethodologyLabel(nanny.careMethodology)}
                            </p>
                          </div>
                        )}
                        {nanny.hasCnh !== undefined && nanny.hasCnh !== null && (
                          <div>
                            <p className="text-sm font-medium text-gray-700">
                              Possui CNH:
                            </p>
                            <p className="mt-1 text-gray-600">
                              {nanny.hasCnh ? 'Sim' : 'Não'}
                            </p>
                          </div>
                        )}
                        {nanny.isSmoker !== undefined && nanny.isSmoker !== null && (
                          <div>
                            <p className="text-sm font-medium text-gray-700">
                              Fumante:
                            </p>
                            <p className="mt-1 text-gray-600">
                              {nanny.isSmoker ? 'Sim' : 'Não'}
                            </p>
                          </div>
                        )}
                        {nanny.comfortableWithPets && (
                          <div>
                            <p className="text-sm font-medium text-gray-700">
                              Conforto com pets:
                            </p>
                            <p className="mt-1 text-gray-600">
                              {getComfortWithPetsLabel(nanny.comfortableWithPets)}
                            </p>
                          </div>
                        )}
                        {nanny.parentPresencePreference && (
                          <div>
                            <p className="text-sm font-medium text-gray-700">
                              Preferência sobre presença dos pais:
                            </p>
                            <p className="mt-1 text-gray-600">
                              {getParentPresenceLabel(
                                nanny.parentPresencePreference,
                              )}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                )}

                {/* Reviews Section */}
                {nanny.reviews && nanny.reviews.items.length > 0 && (
                  <Card className="border-0 shadow-md">
                    <div className="p-6">
                      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                        <PiStar className="text-yellow-500" />
                        Avaliações de Famílias
                      </h2>
                      <div className="space-y-4">
                        {nanny.reviews.items.map((review) => (
                          <div
                            key={review.id}
                            className="border-b border-gray-100 pb-4 last:border-0"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-gray-900">
                                {review.familyName}
                              </span>
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <PiStarFill
                                    key={star}
                                    className={`h-4 w-4 ${
                                      star <= review.rating
                                        ? 'text-yellow-400'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            {review.comment && (
                              <p className="mt-2 text-sm text-gray-600">
                                {review.comment}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                      {nanny.reviews.total > 3 && (
                        <p className="mt-4 text-center text-sm text-gray-500">
                          Cadastre-se para ver todas as {nanny.reviews.total}{' '}
                          avaliações
                        </p>
                      )}
                    </div>
                  </Card>
                )}

                {/* Mobile Match Score (Client Component) */}
                <MatchScoreSection
                  nannyId={nanny.id}
                  nannySlug={nanny.slug}
                  nannyUserId={nanny.userId}
                  variant="mobile"
                />

                {/* Mobile CTA (Client Component) */}
                <ContactSection
                  nannyId={nanny.id}
                  nannyUserId={nanny.userId}
                  nannyFirstName={nanny.firstName}
                  nannySlug={nanny.slug}
                  cidade={cidade}
                  variant="mobile"
                />
              </div>

              {/* Right Column - Sidebar (Desktop) */}
              <div className="hidden space-y-6 lg:block">
                {/* CTA Card - Sticky */}
                <div className="sticky top-24 space-y-6">
                  {/* Contact CTA (Client Component) */}
                  <ContactSection
                    nannyId={nanny.id}
                    nannyUserId={nanny.userId}
                    nannyFirstName={nanny.firstName}
                    nannySlug={nanny.slug}
                    cidade={cidade}
                    variant="desktop"
                  />

                  {/* Match Score Card (Client Component) */}
                  <MatchScoreSection
                    nannyId={nanny.id}
                    nannySlug={nanny.slug}
                    nannyUserId={nanny.userId}
                    variant="desktop"
                  />

                  {/* Premium CTA Card (Client Component - only for non-auth) */}
                  <PremiumCtaCard />

                  {/* Trust Signals Card (Server Component) */}
                  <TrustSignalsCard />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Related Nannies Section (Client Component) */}
        <RelatedNanniesSection
          currentNannyId={nanny.id}
          city={nanny.address?.city || null}
        />

        {/* FAQ Section */}
        <ProfileFAQSection nannyName={nanny.firstName || 'Babá'} />

        {/* Final CTA Section (Client Component) */}
        <FinalCtaSection />
      </main>

      {/* Footer */}
      <ProfileFooter />
    </div>
  );
}
