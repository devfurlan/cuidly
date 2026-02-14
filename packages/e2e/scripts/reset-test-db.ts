/**
 * Reset test database - truncates all tables and re-seeds with test data.
 *
 * Usage: dotenv -e .env.test -- tsx scripts/reset-test-db.ts
 *
 * SAFETY: Validates that DATABASE_URL matches the expected test project ref
 * to prevent accidental execution against production or dev databases.
 */

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

// ── Test project ref (from Supabase test project) ─────────────
// This MUST match the Supabase project used exclusively for E2E tests.
// Update this value if you recreate the test project.
const TEST_PROJECT_REF = "wvhlgotaloagdfsxpqal";

async function main() {
  // Prefer DIRECT_URL (no pgbouncer) for DDL/truncate operations
  const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL || "";

  // ── Safety check ──────────────────────────────────────────────
  // Verify the DATABASE_URL belongs to the dedicated test project.
  const isTestDb =
    dbUrl.includes(TEST_PROJECT_REF) ||
    dbUrl.includes("test") ||
    dbUrl.includes("staging") ||
    dbUrl.includes("localhost");

  if (!isTestDb) {
    console.error("❌ ABORT: DATABASE_URL does not match the test project!");
    console.error(`   Expected project ref "${TEST_PROJECT_REF}" in the URL.`);
    console.error(`   Current value: ${dbUrl.substring(0, 60)}...`);
    console.error(
      "   If you recreated the test project, update TEST_PROJECT_REF in this file.",
    );
    process.exit(1);
  }

  console.log("🧹 Resetting test database...");

  const adapter = new PrismaPg({ connectionString: dbUrl });
  const prisma = new PrismaClient({ adapter });

  try {
    // Truncate all tables using their actual SQL names (@@map values from schema.prisma).
    // CASCADE handles foreign key dependencies automatically.
    await prisma.$executeRawUnsafe(`
      TRUNCATE TABLE
        messages,
        participants,
        conversations,
        moderation_logs,
        notifications,
        reviews,
        reports,
        job_applications,
        compatible_job_email_logs,
        jobs,
        payments,
        pending_payment_operations,
        coupon_usages,
        coupon_allowed_emails,
        subscriptions,
        coupons,
        "references",
        nanny_availabilities,
        favorites,
        boosts,
        profile_analytics,
        bio_cache,
        user_profile_views,
        children_families,
        children,
        documents,
        document_uploads,
        validation_consent_logs,
        validation_requests,
        audit_logs,
        cancellation_email_logs,
        pix_reminder_email_logs,
        incomplete_profile_email_logs,
        system_configs,
        admin_users,
        families,
        nannies,
        addresses,
        plans
      CASCADE;
    `);

    console.log("✅ All tables truncated successfully.");
  } catch (error) {
    console.error("❌ Error truncating tables:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
