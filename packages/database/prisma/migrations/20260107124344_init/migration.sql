-- CreateEnum
CREATE TYPE "CommonStatus" AS ENUM ('PENDING', 'ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY');

-- CreateEnum
CREATE TYPE "MaritalStatus" AS ENUM ('SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED', 'SEPARATED', 'COMMON_LAW');

-- CreateEnum
CREATE TYPE "RelationshipType" AS ENUM ('PARENT', 'GRANDPARENT', 'UNCLE_AUNT', 'GUARDIAN', 'OTHER');

-- CreateEnum
CREATE TYPE "PixType" AS ENUM ('CNPJ', 'CPF', 'EMAIL', 'PHONE', 'EVP');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('RG', 'CPF', 'CNH', 'CERTIFICATE', 'CRIMINAL_RECORD', 'PROOF_OF_ADDRESS', 'REFERENCE_LETTER');

-- CreateEnum
CREATE TYPE "CertificateType" AS ENUM ('GRADUATION', 'TECHNICAL', 'SPECIALIZATION', 'FIRST_AID', 'CHILD_CARE', 'OTHER');

-- CreateEnum
CREATE TYPE "AdminPermission" AS ENUM ('NANNIES', 'FAMILIES', 'CHILDREN', 'SUBSCRIPTIONS', 'ADMIN_USERS', 'REVIEWS', 'COUPONS', 'JOBS', 'VALIDATIONS', 'CHAT_MODERATION', 'REPORTS');

-- CreateEnum
CREATE TYPE "ProfileActionType" AS ENUM ('VIEW', 'HIRE_CLICK', 'CONTACT_CLICK', 'SHARE', 'FAVORITE');

-- CreateEnum
CREATE TYPE "ProfileViewType" AS ENUM ('ANONYMOUS', 'LOGGED_IN_FREE', 'LOGGED_IN_PAID');

-- CreateEnum
CREATE TYPE "ModerationAction" AS ENUM ('APPROVED', 'HIDDEN', 'DELETED', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('REVIEW_PUBLISHED', 'REVIEW_REMINDER', 'REVIEW_RESPONSE', 'REVIEW_MODERATED');

-- CreateEnum
CREATE TYPE "PlanType" AS ENUM ('FAMILY', 'NANNY');

-- CreateEnum
CREATE TYPE "BillingCycle" AS ENUM ('MONTHLY', 'QUARTERLY', 'YEARLY', 'ONE_TIME');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'CANCELED', 'PAST_DUE', 'TRIALING', 'INCOMPLETE', 'EXPIRED');

-- CreateEnum
CREATE TYPE "BoostSource" AS ENUM ('PURCHASED', 'PLAN_INCLUDED');

-- CreateEnum
CREATE TYPE "BoostType" AS ENUM ('NANNY_PROFILE', 'JOB');

-- CreateEnum
CREATE TYPE "MaxTravelDistance" AS ENUM ('UP_TO_5KM', 'UP_TO_10KM', 'UP_TO_15KM', 'UP_TO_20KM', 'UP_TO_30KM', 'ENTIRE_CITY');

-- CreateEnum
CREATE TYPE "ComfortWithPets" AS ENUM ('YES_ANY', 'ONLY_SOME', 'NO');

-- CreateEnum
CREATE TYPE "ParentPresencePreference" AS ENUM ('PRESENT', 'ABSENT', 'NO_PREFERENCE');

-- CreateEnum
CREATE TYPE "SchedulePreference" AS ENUM ('FIXED', 'FLEXIBLE', 'NO_PREFERENCE');

-- CreateEnum
CREATE TYPE "AcceptsOvernight" AS ENUM ('YES', 'OCCASIONALLY', 'NO');

-- CreateEnum
CREATE TYPE "AcceptsHolidayWork" AS ENUM ('YES', 'NO', 'SOMETIMES');

-- CreateEnum
CREATE TYPE "AllowsMultipleJobs" AS ENUM ('YES', 'NO', 'DEPENDS');

-- CreateEnum
CREATE TYPE "HousingType" AS ENUM ('HOUSE', 'APARTMENT_NO_ELEVATOR', 'APARTMENT_WITH_ELEVATOR', 'CONDOMINIUM');

-- CreateEnum
CREATE TYPE "ParentPresence" AS ENUM ('ALWAYS', 'SOMETIMES', 'RARELY', 'NEVER');

-- CreateEnum
CREATE TYPE "GenderPreference" AS ENUM ('FEMALE', 'MALE', 'NO_PREFERENCE');

-- CreateEnum
CREATE TYPE "AgePreference" AS ENUM ('AGE_18_25', 'AGE_26_35', 'AGE_36_50', 'AGE_50_PLUS', 'NO_PREFERENCE');

-- CreateEnum
CREATE TYPE "JobType" AS ENUM ('FIXED', 'SUBSTITUTE', 'OCCASIONAL');

-- CreateEnum
CREATE TYPE "RequiresOvernight" AS ENUM ('NO', 'SOMETIMES', 'FREQUENTLY');

-- CreateEnum
CREATE TYPE "ContractType" AS ENUM ('CLT', 'DAILY_WORKER', 'MEI', 'TO_BE_DISCUSSED');

-- CreateEnum
CREATE TYPE "JobPaymentType" AS ENUM ('MONTHLY', 'HOURLY', 'DAILY');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('ACTIVE', 'PAUSED', 'CLOSED');

-- CreateEnum
CREATE TYPE "JobApplicationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "SubscriptionPlan" AS ENUM ('FAMILY_FREE', 'FAMILY_PLUS', 'NANNY_FREE', 'NANNY_PRO');

-- CreateEnum
CREATE TYPE "BillingInterval" AS ENUM ('MONTH', 'QUARTER', 'YEAR');

-- CreateEnum
CREATE TYPE "PaymentGateway" AS ENUM ('ASAAS', 'STRIPE', 'MERCADO_PAGO', 'PAGSEGURO', 'PAYPAL', 'MANUAL');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'CONFIRMED', 'PAID', 'FAILED', 'CANCELED', 'REFUNDED', 'PARTIALLY_REFUNDED', 'OVERDUE', 'CHARGEBACK', 'AWAITING_RISK_ANALYSIS');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('SUBSCRIPTION', 'ONE_TIME', 'REFUND', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CREDIT_CARD', 'DEBIT_CARD', 'PIX', 'BOLETO', 'BANK_TRANSFER', 'PAYPAL', 'WALLET', 'MANUAL');

-- CreateEnum
CREATE TYPE "ValidationLevel" AS ENUM ('BASIC', 'PREMIUM');

-- CreateEnum
CREATE TYPE "ValidationStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "DocumentUploadType" AS ENUM ('DOCUMENT_FRONT', 'DOCUMENT_BACK', 'SELFIE');

-- CreateEnum
CREATE TYPE "ReviewType" AS ENUM ('NANNY_TO_FAMILY', 'FAMILY_TO_NANNY');

-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'FIXED');

-- CreateEnum
CREATE TYPE "CouponApplicableTo" AS ENUM ('ALL', 'FAMILIES', 'NANNIES', 'SPECIFIC_PLAN');

-- CreateEnum
CREATE TYPE "FamilyNannyType" AS ENUM ('FOLGUISTA', 'DIARISTA', 'MENSALISTA');

-- CreateEnum
CREATE TYPE "FamilyContractRegime" AS ENUM ('AUTONOMA', 'PJ', 'CLT');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'REVIEWED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "ReportTargetType" AS ENUM ('NANNY', 'JOB');

-- CreateEnum
CREATE TYPE "ReportAction" AS ENUM ('DISMISSED', 'SUSPENDED', 'DELETED');

-- CreateTable
CREATE TABLE "admin_users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "photo_url" TEXT,
    "is_super_admin" BOOLEAN NOT NULL DEFAULT false,
    "permissions" "AdminPermission"[] DEFAULT ARRAY[]::"AdminPermission"[],
    "notify_failed_payments" BOOLEAN NOT NULL DEFAULT false,
    "status" "CommonStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nannies" (
    "id" SERIAL NOT NULL,
    "auth_id" UUID,
    "name" TEXT,
    "slug" TEXT,
    "birth_date" DATE,
    "cpf" TEXT,
    "cpf_hash" TEXT,
    "phone_number" TEXT,
    "email_address" TEXT,
    "address_id" INTEGER,
    "gender" "Gender",
    "photo_url" TEXT,
    "is_smoker" BOOLEAN NOT NULL DEFAULT false,
    "marital_status" "MaritalStatus",
    "has_children" BOOLEAN,
    "has_cnh" BOOLEAN,
    "pix_key" TEXT,
    "pix_type" "PixType",
    "status" "CommonStatus" NOT NULL DEFAULT 'PENDING',
    "experience_years" INTEGER,
    "min_child_age" INTEGER,
    "max_child_age" INTEGER,
    "hourly_rate" DECIMAL(10,2),
    "daily_rate" DECIMAL(10,2),
    "monthly_rate" DECIMAL(10,2),
    "mini_bio" TEXT,
    "about_me" TEXT,
    "availability_json" JSONB,
    "specialties_json" JSONB,
    "skills_json" JSONB,
    "service_types_json" JSONB,
    "attendance_modes_json" JSONB,
    "max_travel_distance" "MaxTravelDistance",
    "age_ranges_experience" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "has_special_needs_experience" BOOLEAN NOT NULL DEFAULT false,
    "special_needs_experience_description" TEXT,
    "special_needs_specialties" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "certifications" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "languages" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "child_type_preference" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "strengths" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "care_methodology" TEXT,
    "has_vehicle" BOOLEAN NOT NULL DEFAULT false,
    "comfortable_with_pets" "ComfortWithPets",
    "pets_description" TEXT,
    "accepted_activities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "environment_preference" TEXT,
    "parent_presence_preference" "ParentPresencePreference",
    "max_children_care" INTEGER,
    "has_references" BOOLEAN NOT NULL DEFAULT false,
    "references_verified" BOOLEAN NOT NULL DEFAULT false,
    "accepts_holiday_work" "AcceptsHolidayWork",
    "hourly_rate_reference" DECIMAL(10,2),
    "nanny_types" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "contract_regimes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "hourly_rate_range" TEXT,
    "activities_not_accepted" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "birth_city" TEXT,
    "birth_state" CHAR(2),
    "mother_name" TEXT,
    "cpf_validated" BOOLEAN NOT NULL DEFAULT false,
    "cpf_validation_date" TIMESTAMP(3),
    "cpf_validation_message" TEXT,
    "criminal_background_validated" BOOLEAN NOT NULL DEFAULT false,
    "criminal_background_validation_date" TIMESTAMP(3),
    "criminal_background_validation_message" TEXT,
    "personal_data_validated" BOOLEAN NOT NULL DEFAULT false,
    "personal_data_validated_at" TIMESTAMP(3),
    "personal_data_validated_by" TEXT,
    "terms_accepted" BOOLEAN,
    "terms_accepted_at" TIMESTAMP(3),
    "terms_accepted_ip" TEXT,
    "welcome_modal_shown" BOOLEAN NOT NULL DEFAULT false,
    "welcome_modal_shown_at" TIMESTAMP(3),
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "email_verification_code" TEXT,
    "email_verification_token" TEXT,
    "email_verification_sent" TIMESTAMP(3),
    "email_verified_at" TIMESTAMP(3),
    "onboarding_completed" BOOLEAN NOT NULL DEFAULT false,
    "onboarding_completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "is_profile_public" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "nannies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "references" (
    "id" SERIAL NOT NULL,
    "nanny_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "references_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nanny_availabilities" (
    "id" SERIAL NOT NULL,
    "nanny_id" INTEGER NOT NULL,
    "job_types" "JobType"[] DEFAULT ARRAY[]::"JobType"[],
    "schedule" JSONB NOT NULL,
    "schedule_preference" "SchedulePreference",
    "accepts_overnight" "AcceptsOvernight",
    "available_from" TIMESTAMP(3) NOT NULL,
    "monthly_rate" DECIMAL(10,2),
    "hourly_rate" DECIMAL(10,2),
    "daily_rate" DECIMAL(10,2),
    "open_to_negotiation" BOOLEAN NOT NULL DEFAULT false,
    "preferred_contract_types" "ContractType"[] DEFAULT ARRAY[]::"ContractType"[],
    "allows_multiple_jobs" "AllowsMultipleJobs",
    "last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "nanny_availabilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "children" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "birth_date" DATE,
    "gender" "Gender",
    "status" "CommonStatus" NOT NULL DEFAULT 'ACTIVE',
    "expected_birth_date" DATE,
    "unborn" BOOLEAN NOT NULL DEFAULT false,
    "care_priorities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "allergies" TEXT,
    "special_needs" TEXT,
    "notes" TEXT,
    "has_special_needs" BOOLEAN NOT NULL DEFAULT false,
    "special_needs_description" TEXT,
    "special_needs_types" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "routine" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "children_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "families" (
    "id" SERIAL NOT NULL,
    "auth_id" UUID,
    "address_id" INTEGER,
    "name" TEXT NOT NULL,
    "cpf" TEXT,
    "cpf_hash" TEXT,
    "birth_date" DATE,
    "gender" "Gender",
    "phone_number" TEXT,
    "email_address" TEXT,
    "photo_url" TEXT,
    "number_of_children" INTEGER,
    "status" "CommonStatus" NOT NULL DEFAULT 'ACTIVE',
    "housing_type" "HousingType",
    "has_pets" BOOLEAN NOT NULL DEFAULT false,
    "pet_types" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "pets_description" TEXT,
    "parent_presence" "ParentPresence",
    "values_in_nanny" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "care_methodology" TEXT,
    "languages" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "house_rules" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "domestic_help_expected" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "nanny_gender_preference" "GenderPreference",
    "nanny_age_preference" "AgePreference",
    "nanny_type" "FamilyNannyType",
    "contract_regime" "FamilyContractRegime",
    "family_presentation" TEXT,
    "job_description" TEXT,
    "job_photos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "needed_days" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "needed_shifts" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "requires_non_smoker" BOOLEAN NOT NULL DEFAULT false,
    "requires_driver_license" BOOLEAN NOT NULL DEFAULT false,
    "hourly_rate_range" TEXT,
    "terms_accepted" BOOLEAN,
    "terms_accepted_at" TIMESTAMP(3),
    "terms_accepted_ip" TEXT,
    "welcome_modal_shown" BOOLEAN NOT NULL DEFAULT false,
    "welcome_modal_shown_at" TIMESTAMP(3),
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "email_verification_code" TEXT,
    "email_verification_token" TEXT,
    "email_verification_sent" TIMESTAMP(3),
    "email_verified_at" TIMESTAMP(3),
    "onboarding_completed" BOOLEAN NOT NULL DEFAULT false,
    "onboarding_completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "families_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "children_families" (
    "child_id" INTEGER NOT NULL,
    "family_id" INTEGER NOT NULL,
    "relationshipType" "RelationshipType",
    "is_main" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "children_families_pkey" PRIMARY KEY ("child_id","family_id")
);

-- CreateTable
CREATE TABLE "jobs" (
    "id" SERIAL NOT NULL,
    "family_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "job_type" "JobType" NOT NULL,
    "schedule" JSONB NOT NULL,
    "requires_overnight" "RequiresOvernight" NOT NULL,
    "contract_type" "ContractType" NOT NULL,
    "benefits" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "payment_type" "JobPaymentType" NOT NULL,
    "budget_min" DECIMAL(10,2) NOT NULL,
    "budget_max" DECIMAL(10,2) NOT NULL,
    "children_ids" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "mandatory_requirements" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "photos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "allows_multiple_jobs" BOOLEAN NOT NULL DEFAULT true,
    "start_date" TIMESTAMP(3) NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_applications" (
    "id" SERIAL NOT NULL,
    "job_id" INTEGER NOT NULL,
    "nanny_id" INTEGER NOT NULL,
    "status" "JobApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "match_score" DECIMAL(5,2),
    "message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "job_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "addresses" (
    "id" SERIAL NOT NULL,
    "zip_code" CHAR(8) NOT NULL,
    "street_name" TEXT NOT NULL,
    "number" TEXT,
    "complement" TEXT,
    "neighborhood" TEXT,
    "city" TEXT NOT NULL,
    "state" CHAR(2) NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'Brazil',
    "status" "CommonStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" SERIAL NOT NULL,
    "nanny_id" INTEGER,
    "family_id" INTEGER,
    "document_type" "DocumentType",
    "identifier" TEXT NOT NULL,
    "file_url" TEXT,
    "text_ocr" TEXT,
    "institution_name" TEXT,
    "certificate_type" "CertificateType",
    "issued_by" TEXT,
    "state_issued" TEXT,
    "issue_date" DATE,
    "expiration_date" DATE,
    "validation_status" TEXT,
    "status" "CommonStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plans" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" "PlanType" NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "billing_cycle" "BillingCycle" NOT NULL,
    "features" JSONB NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "boosts" (
    "id" SERIAL NOT NULL,
    "nanny_id" INTEGER,
    "job_id" INTEGER,
    "type" "BoostType" NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "source" "BoostSource" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "boosts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favorites" (
    "id" SERIAL NOT NULL,
    "family_id" INTEGER NOT NULL,
    "nanny_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile_analytics" (
    "id" SERIAL NOT NULL,
    "nanny_id" INTEGER NOT NULL,
    "action_type" "ProfileActionType" NOT NULL,
    "visitor_ip" TEXT,
    "visitor_city" TEXT,
    "visitor_state" CHAR(2),
    "visitor_country" TEXT,
    "user_agent" TEXT,
    "device_type" TEXT,
    "browser" TEXT,
    "referrer" TEXT,
    "session_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profile_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bio_cache" (
    "id" SERIAL NOT NULL,
    "cache_key" TEXT NOT NULL,
    "biography" TEXT NOT NULL,
    "sentiment_score" DOUBLE PRECISION,
    "professionalism" INTEGER,
    "warmth" INTEGER,
    "confidence" INTEGER,
    "clarity" INTEGER,
    "concerns" JSONB,
    "suggestions" JSONB,
    "passes_validation" BOOLEAN NOT NULL DEFAULT true,
    "usage_count" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bio_cache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_profile_views" (
    "id" SERIAL NOT NULL,
    "visitor_id" TEXT,
    "visitor_nanny_id" INTEGER,
    "visitor_family_id" INTEGER,
    "nanny_id" INTEGER NOT NULL,
    "viewer_type" "ProfileViewType" NOT NULL DEFAULT 'ANONYMOUS',
    "has_paid_plan" BOOLEAN NOT NULL DEFAULT false,
    "viewed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_profile_views_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "nanny_id" INTEGER,
    "family_id" INTEGER,
    "plan" "SubscriptionPlan" NOT NULL,
    "billing_interval" "BillingInterval",
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "current_period_start" TIMESTAMP(3) NOT NULL,
    "current_period_end" TIMESTAMP(3) NOT NULL,
    "cancel_at_period_end" BOOLEAN NOT NULL DEFAULT false,
    "canceled_at" TIMESTAMP(3),
    "payment_gateway" "PaymentGateway" NOT NULL DEFAULT 'ASAAS',
    "external_customer_id" TEXT,
    "external_subscription_id" TEXT,
    "applied_coupon_id" TEXT,
    "discount_amount" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "nanny_id" INTEGER,
    "family_id" INTEGER,
    "subscription_id" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'BRL',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "type" "PaymentType" NOT NULL,
    "description" TEXT,
    "payment_gateway" "PaymentGateway" NOT NULL,
    "external_payment_id" TEXT,
    "external_invoice_url" TEXT,
    "payment_method" "PaymentMethod",
    "paid_at" TIMESTAMP(3),
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coupons" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "discount_type" "DiscountType" NOT NULL,
    "discount_value" DOUBLE PRECISION NOT NULL,
    "max_discount" DOUBLE PRECISION,
    "min_purchase_amount" DOUBLE PRECISION,
    "usage_limit" INTEGER,
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "applicable_to" "CouponApplicableTo" NOT NULL DEFAULT 'ALL',
    "applicable_plan_ids" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by_id" UUID,

    CONSTRAINT "coupons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coupon_usages" (
    "id" TEXT NOT NULL,
    "coupon_id" TEXT NOT NULL,
    "nanny_id" INTEGER,
    "family_id" INTEGER,
    "subscription_id" TEXT,
    "discount_amount" DOUBLE PRECISION NOT NULL,
    "used_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coupon_usages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" SERIAL NOT NULL,
    "table" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "record_id" TEXT NOT NULL,
    "data" JSONB,
    "admin_user_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" TEXT NOT NULL,
    "job_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_message_id" TEXT,
    "last_message_at" TIMESTAMP(3),
    "last_message_preview" VARCHAR(100),

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "participants" (
    "id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "nanny_id" INTEGER,
    "family_id" INTEGER,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_read_at" TIMESTAMP(3),
    "last_read_message_id" TEXT,

    CONSTRAINT "participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "sender_nanny_id" INTEGER,
    "sender_family_id" INTEGER,
    "body" TEXT NOT NULL,
    "seq" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" UUID,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" SERIAL NOT NULL,
    "family_id" INTEGER NOT NULL,
    "nanny_id" INTEGER NOT NULL,
    "type" "ReviewType" NOT NULL,
    "punctuality" INTEGER,
    "care" INTEGER,
    "communication" INTEGER,
    "reliability" INTEGER,
    "respect" INTEGER,
    "environment" INTEGER,
    "payment" INTEGER,
    "overall_rating" DOUBLE PRECISION NOT NULL,
    "comment" TEXT,
    "response" TEXT,
    "responded_at" TIMESTAMP(3),
    "job_id" INTEGER,
    "conversation_id" TEXT,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "published_at" TIMESTAMP(3),
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "is_reported" BOOLEAN NOT NULL DEFAULT false,
    "moderated_at" TIMESTAMP(3),
    "moderated_by" TEXT,
    "moderation_note" TEXT,
    "photos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "nanny_id" INTEGER,
    "family_id" INTEGER,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMP(3),
    "review_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "moderation_logs" (
    "id" TEXT NOT NULL,
    "moderator_id" UUID NOT NULL,
    "review_id" INTEGER,
    "action" "ModerationAction" NOT NULL,
    "reason" TEXT,
    "review_snapshot" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "moderation_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" SERIAL NOT NULL,
    "target_type" "ReportTargetType" NOT NULL,
    "target_nanny_id" INTEGER,
    "target_job_id" INTEGER,
    "reason" TEXT NOT NULL,
    "reporter_nanny_id" INTEGER,
    "reporter_family_id" INTEGER,
    "reporter_ip" TEXT,
    "reporter_user_agent" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "action" "ReportAction",
    "action_taken_at" TIMESTAMP(3),
    "action_taken_by_id" UUID,
    "action_note" TEXT,
    "target_snapshot" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "validation_requests" (
    "id" TEXT NOT NULL,
    "nanny_id" INTEGER NOT NULL,
    "cpf" TEXT NOT NULL,
    "cpf_hash" TEXT,
    "rg" TEXT,
    "rg_issuing_state" CHAR(2),
    "name" TEXT NOT NULL,
    "mother_name" TEXT,
    "father_name" TEXT,
    "birth_date" DATE,
    "bigid_result" JSONB,
    "facematch_score" DOUBLE PRECISION,
    "liveness_score" DOUBLE PRECISION,
    "bigid_valid" BOOLEAN NOT NULL DEFAULT false,
    "level" "ValidationLevel" NOT NULL DEFAULT 'BASIC',
    "status" "ValidationStatus" NOT NULL DEFAULT 'PENDING',
    "basic_data_result" JSONB,
    "civil_record_result" JSONB,
    "federal_record_result" JSONB,
    "background_check_result" JSONB,
    "report_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "validation_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_uploads" (
    "id" TEXT NOT NULL,
    "nanny_id" INTEGER NOT NULL,
    "type" "DocumentUploadType" NOT NULL,
    "url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_uploads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "validation_consent_logs" (
    "id" TEXT NOT NULL,
    "nanny_id" INTEGER NOT NULL,
    "validation_type" TEXT NOT NULL,
    "ip_address" TEXT,
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "validation_consent_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_configs" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'string',
    "label" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_email_key" ON "admin_users"("email");

-- CreateIndex
CREATE INDEX "admin_users_email_idx" ON "admin_users"("email");

-- CreateIndex
CREATE INDEX "admin_users_status_idx" ON "admin_users"("status");

-- CreateIndex
CREATE UNIQUE INDEX "nannies_auth_id_key" ON "nannies"("auth_id");

-- CreateIndex
CREATE UNIQUE INDEX "nannies_slug_key" ON "nannies"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "nannies_email_verification_token_key" ON "nannies"("email_verification_token");

-- CreateIndex
CREATE INDEX "nannies_auth_id_idx" ON "nannies"("auth_id");

-- CreateIndex
CREATE INDEX "nannies_status_idx" ON "nannies"("status");

-- CreateIndex
CREATE INDEX "nannies_created_at_idx" ON "nannies"("created_at");

-- CreateIndex
CREATE INDEX "nannies_address_id_idx" ON "nannies"("address_id");

-- CreateIndex
CREATE INDEX "nannies_status_created_at_idx" ON "nannies"("status", "created_at");

-- CreateIndex
CREATE INDEX "nannies_cpf_validated_idx" ON "nannies"("cpf_validated");

-- CreateIndex
CREATE INDEX "nannies_personal_data_validated_idx" ON "nannies"("personal_data_validated");

-- CreateIndex
CREATE INDEX "references_nanny_id_idx" ON "references"("nanny_id");

-- CreateIndex
CREATE UNIQUE INDEX "nanny_availabilities_nanny_id_key" ON "nanny_availabilities"("nanny_id");

-- CreateIndex
CREATE UNIQUE INDEX "families_auth_id_key" ON "families"("auth_id");

-- CreateIndex
CREATE UNIQUE INDEX "families_email_verification_token_key" ON "families"("email_verification_token");

-- CreateIndex
CREATE INDEX "families_auth_id_idx" ON "families"("auth_id");

-- CreateIndex
CREATE INDEX "families_status_idx" ON "families"("status");

-- CreateIndex
CREATE INDEX "families_created_at_idx" ON "families"("created_at");

-- CreateIndex
CREATE INDEX "families_address_id_idx" ON "families"("address_id");

-- CreateIndex
CREATE INDEX "jobs_family_id_idx" ON "jobs"("family_id");

-- CreateIndex
CREATE INDEX "jobs_status_idx" ON "jobs"("status");

-- CreateIndex
CREATE INDEX "jobs_created_at_idx" ON "jobs"("created_at");

-- CreateIndex
CREATE INDEX "jobs_status_created_at_idx" ON "jobs"("status", "created_at");

-- CreateIndex
CREATE INDEX "job_applications_job_id_idx" ON "job_applications"("job_id");

-- CreateIndex
CREATE INDEX "job_applications_nanny_id_idx" ON "job_applications"("nanny_id");

-- CreateIndex
CREATE INDEX "job_applications_status_idx" ON "job_applications"("status");

-- CreateIndex
CREATE UNIQUE INDEX "job_applications_job_id_nanny_id_key" ON "job_applications"("job_id", "nanny_id");

-- CreateIndex
CREATE INDEX "boosts_nanny_id_idx" ON "boosts"("nanny_id");

-- CreateIndex
CREATE INDEX "boosts_job_id_idx" ON "boosts"("job_id");

-- CreateIndex
CREATE INDEX "boosts_is_active_end_date_idx" ON "boosts"("is_active", "end_date");

-- CreateIndex
CREATE INDEX "boosts_type_is_active_end_date_idx" ON "boosts"("type", "is_active", "end_date");

-- CreateIndex
CREATE INDEX "favorites_family_id_idx" ON "favorites"("family_id");

-- CreateIndex
CREATE INDEX "favorites_nanny_id_idx" ON "favorites"("nanny_id");

-- CreateIndex
CREATE UNIQUE INDEX "favorites_family_id_nanny_id_key" ON "favorites"("family_id", "nanny_id");

-- CreateIndex
CREATE INDEX "profile_analytics_nanny_id_idx" ON "profile_analytics"("nanny_id");

-- CreateIndex
CREATE INDEX "profile_analytics_action_type_idx" ON "profile_analytics"("action_type");

-- CreateIndex
CREATE INDEX "profile_analytics_created_at_idx" ON "profile_analytics"("created_at");

-- CreateIndex
CREATE INDEX "profile_analytics_nanny_id_action_type_idx" ON "profile_analytics"("nanny_id", "action_type");

-- CreateIndex
CREATE INDEX "profile_analytics_nanny_id_created_at_idx" ON "profile_analytics"("nanny_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "bio_cache_cache_key_key" ON "bio_cache"("cache_key");

-- CreateIndex
CREATE INDEX "bio_cache_cache_key_idx" ON "bio_cache"("cache_key");

-- CreateIndex
CREATE INDEX "bio_cache_expires_at_idx" ON "bio_cache"("expires_at");

-- CreateIndex
CREATE INDEX "user_profile_views_visitor_nanny_id_idx" ON "user_profile_views"("visitor_nanny_id");

-- CreateIndex
CREATE INDEX "user_profile_views_visitor_family_id_idx" ON "user_profile_views"("visitor_family_id");

-- CreateIndex
CREATE INDEX "user_profile_views_visitor_id_idx" ON "user_profile_views"("visitor_id");

-- CreateIndex
CREATE INDEX "user_profile_views_nanny_id_idx" ON "user_profile_views"("nanny_id");

-- CreateIndex
CREATE INDEX "user_profile_views_viewed_at_idx" ON "user_profile_views"("viewed_at");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_nanny_id_key" ON "subscriptions"("nanny_id");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_family_id_key" ON "subscriptions"("family_id");

-- CreateIndex
CREATE INDEX "subscriptions_nanny_id_idx" ON "subscriptions"("nanny_id");

-- CreateIndex
CREATE INDEX "subscriptions_family_id_idx" ON "subscriptions"("family_id");

-- CreateIndex
CREATE INDEX "subscriptions_status_idx" ON "subscriptions"("status");

-- CreateIndex
CREATE INDEX "subscriptions_external_subscription_id_idx" ON "subscriptions"("external_subscription_id");

-- CreateIndex
CREATE INDEX "payments_nanny_id_idx" ON "payments"("nanny_id");

-- CreateIndex
CREATE INDEX "payments_family_id_idx" ON "payments"("family_id");

-- CreateIndex
CREATE INDEX "payments_subscription_id_idx" ON "payments"("subscription_id");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE INDEX "payments_external_payment_id_idx" ON "payments"("external_payment_id");

-- CreateIndex
CREATE UNIQUE INDEX "coupons_code_key" ON "coupons"("code");

-- CreateIndex
CREATE INDEX "coupons_code_idx" ON "coupons"("code");

-- CreateIndex
CREATE INDEX "coupons_is_active_start_date_end_date_idx" ON "coupons"("is_active", "start_date", "end_date");

-- CreateIndex
CREATE INDEX "coupon_usages_coupon_id_idx" ON "coupon_usages"("coupon_id");

-- CreateIndex
CREATE INDEX "coupon_usages_nanny_id_idx" ON "coupon_usages"("nanny_id");

-- CreateIndex
CREATE INDEX "coupon_usages_family_id_idx" ON "coupon_usages"("family_id");

-- CreateIndex
CREATE INDEX "audit_logs_admin_user_id_idx" ON "audit_logs"("admin_user_id");

-- CreateIndex
CREATE INDEX "audit_logs_table_idx" ON "audit_logs"("table");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- CreateIndex
CREATE INDEX "audit_logs_table_record_id_idx" ON "audit_logs"("table", "record_id");

-- CreateIndex
CREATE INDEX "audit_logs_admin_user_id_created_at_idx" ON "audit_logs"("admin_user_id", "created_at");

-- CreateIndex
CREATE INDEX "conversations_job_id_idx" ON "conversations"("job_id");

-- CreateIndex
CREATE INDEX "conversations_last_message_at_idx" ON "conversations"("last_message_at" DESC);

-- CreateIndex
CREATE INDEX "participants_conversation_id_idx" ON "participants"("conversation_id");

-- CreateIndex
CREATE INDEX "participants_nanny_id_idx" ON "participants"("nanny_id");

-- CreateIndex
CREATE INDEX "participants_family_id_idx" ON "participants"("family_id");

-- CreateIndex
CREATE INDEX "participants_conversation_id_last_read_at_idx" ON "participants"("conversation_id", "last_read_at");

-- CreateIndex
CREATE UNIQUE INDEX "participants_nanny_id_conversation_id_key" ON "participants"("nanny_id", "conversation_id");

-- CreateIndex
CREATE UNIQUE INDEX "participants_family_id_conversation_id_key" ON "participants"("family_id", "conversation_id");

-- CreateIndex
CREATE INDEX "messages_conversation_id_seq_idx" ON "messages"("conversation_id", "seq");

-- CreateIndex
CREATE INDEX "messages_conversation_id_idx" ON "messages"("conversation_id");

-- CreateIndex
CREATE INDEX "messages_sender_nanny_id_idx" ON "messages"("sender_nanny_id");

-- CreateIndex
CREATE INDEX "messages_sender_family_id_idx" ON "messages"("sender_family_id");

-- CreateIndex
CREATE INDEX "messages_created_at_idx" ON "messages"("created_at");

-- CreateIndex
CREATE INDEX "reviews_family_id_idx" ON "reviews"("family_id");

-- CreateIndex
CREATE INDEX "reviews_nanny_id_idx" ON "reviews"("nanny_id");

-- CreateIndex
CREATE INDEX "reviews_type_idx" ON "reviews"("type");

-- CreateIndex
CREATE INDEX "reviews_is_published_idx" ON "reviews"("is_published");

-- CreateIndex
CREATE INDEX "reviews_overall_rating_idx" ON "reviews"("overall_rating");

-- CreateIndex
CREATE INDEX "reviews_created_at_idx" ON "reviews"("created_at");

-- CreateIndex
CREATE INDEX "reviews_is_published_created_at_idx" ON "reviews"("is_published", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_family_id_nanny_id_type_job_id_key" ON "reviews"("family_id", "nanny_id", "type", "job_id");

-- CreateIndex
CREATE INDEX "notifications_nanny_id_idx" ON "notifications"("nanny_id");

-- CreateIndex
CREATE INDEX "notifications_family_id_idx" ON "notifications"("family_id");

-- CreateIndex
CREATE INDEX "notifications_is_read_idx" ON "notifications"("is_read");

-- CreateIndex
CREATE INDEX "notifications_created_at_idx" ON "notifications"("created_at");

-- CreateIndex
CREATE INDEX "moderation_logs_moderator_id_idx" ON "moderation_logs"("moderator_id");

-- CreateIndex
CREATE INDEX "moderation_logs_review_id_idx" ON "moderation_logs"("review_id");

-- CreateIndex
CREATE INDEX "moderation_logs_action_idx" ON "moderation_logs"("action");

-- CreateIndex
CREATE INDEX "moderation_logs_created_at_idx" ON "moderation_logs"("created_at");

-- CreateIndex
CREATE INDEX "reports_target_type_status_idx" ON "reports"("target_type", "status");

-- CreateIndex
CREATE INDEX "reports_target_nanny_id_idx" ON "reports"("target_nanny_id");

-- CreateIndex
CREATE INDEX "reports_target_job_id_idx" ON "reports"("target_job_id");

-- CreateIndex
CREATE INDEX "reports_status_idx" ON "reports"("status");

-- CreateIndex
CREATE INDEX "reports_created_at_idx" ON "reports"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "validation_requests_nanny_id_key" ON "validation_requests"("nanny_id");

-- CreateIndex
CREATE INDEX "validation_requests_status_idx" ON "validation_requests"("status");

-- CreateIndex
CREATE INDEX "validation_requests_level_idx" ON "validation_requests"("level");

-- CreateIndex
CREATE INDEX "document_uploads_nanny_id_idx" ON "document_uploads"("nanny_id");

-- CreateIndex
CREATE INDEX "validation_consent_logs_nanny_id_idx" ON "validation_consent_logs"("nanny_id");

-- CreateIndex
CREATE INDEX "validation_consent_logs_requested_at_idx" ON "validation_consent_logs"("requested_at");

-- CreateIndex
CREATE UNIQUE INDEX "system_configs_key_key" ON "system_configs"("key");

-- AddForeignKey
ALTER TABLE "nannies" ADD CONSTRAINT "nannies_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "addresses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "references" ADD CONSTRAINT "references_nanny_id_fkey" FOREIGN KEY ("nanny_id") REFERENCES "nannies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nanny_availabilities" ADD CONSTRAINT "nanny_availabilities_nanny_id_fkey" FOREIGN KEY ("nanny_id") REFERENCES "nannies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "families" ADD CONSTRAINT "families_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "addresses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "children_families" ADD CONSTRAINT "children_families_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "children"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "children_families" ADD CONSTRAINT "children_families_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "families"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "families"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_nanny_id_fkey" FOREIGN KEY ("nanny_id") REFERENCES "nannies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "families"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_nanny_id_fkey" FOREIGN KEY ("nanny_id") REFERENCES "nannies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boosts" ADD CONSTRAINT "boosts_nanny_id_fkey" FOREIGN KEY ("nanny_id") REFERENCES "nannies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boosts" ADD CONSTRAINT "boosts_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "families"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_nanny_id_fkey" FOREIGN KEY ("nanny_id") REFERENCES "nannies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_analytics" ADD CONSTRAINT "profile_analytics_nanny_id_fkey" FOREIGN KEY ("nanny_id") REFERENCES "nannies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_profile_views" ADD CONSTRAINT "user_profile_views_nanny_id_fkey" FOREIGN KEY ("nanny_id") REFERENCES "nannies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_nanny_id_fkey" FOREIGN KEY ("nanny_id") REFERENCES "nannies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "families"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_applied_coupon_id_fkey" FOREIGN KEY ("applied_coupon_id") REFERENCES "coupons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_nanny_id_fkey" FOREIGN KEY ("nanny_id") REFERENCES "nannies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "families"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupons" ADD CONSTRAINT "coupons_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupon_usages" ADD CONSTRAINT "coupon_usages_coupon_id_fkey" FOREIGN KEY ("coupon_id") REFERENCES "coupons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupon_usages" ADD CONSTRAINT "coupon_usages_nanny_id_fkey" FOREIGN KEY ("nanny_id") REFERENCES "nannies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupon_usages" ADD CONSTRAINT "coupon_usages_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "families"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupon_usages" ADD CONSTRAINT "coupon_usages_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_admin_user_id_fkey" FOREIGN KEY ("admin_user_id") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participants" ADD CONSTRAINT "participants_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participants" ADD CONSTRAINT "participants_nanny_id_fkey" FOREIGN KEY ("nanny_id") REFERENCES "nannies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participants" ADD CONSTRAINT "participants_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "families"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_nanny_id_fkey" FOREIGN KEY ("sender_nanny_id") REFERENCES "nannies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_family_id_fkey" FOREIGN KEY ("sender_family_id") REFERENCES "families"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "families"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_nanny_id_fkey" FOREIGN KEY ("nanny_id") REFERENCES "nannies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_nanny_id_fkey" FOREIGN KEY ("nanny_id") REFERENCES "nannies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "families"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moderation_logs" ADD CONSTRAINT "moderation_logs_moderator_id_fkey" FOREIGN KEY ("moderator_id") REFERENCES "admin_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moderation_logs" ADD CONSTRAINT "moderation_logs_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "reviews"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_target_nanny_id_fkey" FOREIGN KEY ("target_nanny_id") REFERENCES "nannies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_target_job_id_fkey" FOREIGN KEY ("target_job_id") REFERENCES "jobs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_reporter_nanny_id_fkey" FOREIGN KEY ("reporter_nanny_id") REFERENCES "nannies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_reporter_family_id_fkey" FOREIGN KEY ("reporter_family_id") REFERENCES "families"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_action_taken_by_id_fkey" FOREIGN KEY ("action_taken_by_id") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "validation_requests" ADD CONSTRAINT "validation_requests_nanny_id_fkey" FOREIGN KEY ("nanny_id") REFERENCES "nannies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_uploads" ADD CONSTRAINT "document_uploads_nanny_id_fkey" FOREIGN KEY ("nanny_id") REFERENCES "nannies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "validation_consent_logs" ADD CONSTRAINT "validation_consent_logs_nanny_id_fkey" FOREIGN KEY ("nanny_id") REFERENCES "nannies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
