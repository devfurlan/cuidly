'use server';

import prisma from '@/lib/prisma';
import { FormJob, FormJobApplication } from '@/schemas/jobSchemas';
import { logAuditMany } from '@/utils/auditLog';

// ============================================
// JOB CRUD
// ============================================

export async function getJobs(filters?: {
  familyId?: number;
  status?: string;
  jobType?: string;
}) {
  const where: any = {
    deletedAt: null,
  };

  if (filters?.familyId) {
    where.familyId = filters.familyId;
  }

  if (filters?.status) {
    where.status = filters.status;
  }

  if (filters?.jobType) {
    where.jobType = filters.jobType;
  }

  const jobs = await prisma.job.findMany({
    where,
    include: {
      family: {
        select: {
          id: true,
          name: true,
          address: {
            select: { city: true, state: true },
          },
        },
      },
      applications: {
        select: { id: true, status: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return jobs.map((job) => ({
    ...job,
    applicationsCount: job.applications.length,
    pendingApplications: job.applications.filter(
      (a) => a.status === 'PENDING',
    ).length,
  }));
}

export async function getJobById(id: number) {
  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      family: {
        include: {
          address: true,
          children: {
            include: { child: true },
          },
        },
      },
      applications: {
        include: {
          nanny: {
            select: {
              id: true,
              name: true,
              slug: true,
              photoUrl: true,
              experienceYears: true,
              hourlyRate: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  return job;
}

export async function getJobsByFamilyId(familyId: number) {
  return await getJobs({ familyId });
}

export async function createJob(familyId: number, data: FormJob) {
  const jobData = {
    familyId,
    title: data.title,
    description: data.description || null,
    jobType: data.jobType,
    schedule: data.schedule || {},
    requiresOvernight: data.requiresOvernight,
    contractType: data.contractType,
    benefits: data.benefits || [],
    paymentType: data.paymentType,
    budgetMin: parseFloat(String(data.budgetMin)),
    budgetMax: parseFloat(String(data.budgetMax)),
    childrenIds: data.childrenIds || [],
    mandatoryRequirements: data.mandatoryRequirements || [],
    allowsMultipleJobs: data.allowsMultipleJobs ?? true,
    startDate: new Date(data.startDate),
    status: data.status || 'ACTIVE',
  };

  const result = await prisma.job.create({
    data: jobData,
  });

  await logAuditMany([
    {
      action: 'CREATE',
      table: 'jobs',
      recordId: result.id.toString(),
      data: jobData,
    },
  ]);

  return result;
}

export async function updateJob(id: number, data: FormJob) {
  const jobData = {
    title: data.title,
    description: data.description || null,
    jobType: data.jobType,
    schedule: data.schedule || {},
    requiresOvernight: data.requiresOvernight,
    contractType: data.contractType,
    benefits: data.benefits || [],
    paymentType: data.paymentType,
    budgetMin: parseFloat(String(data.budgetMin)),
    budgetMax: parseFloat(String(data.budgetMax)),
    childrenIds: data.childrenIds || [],
    mandatoryRequirements: data.mandatoryRequirements || [],
    allowsMultipleJobs: data.allowsMultipleJobs ?? true,
    startDate: new Date(data.startDate),
    status: data.status,
  };

  const result = await prisma.job.update({
    where: { id },
    data: jobData,
  });

  await logAuditMany([
    {
      action: 'UPDATE',
      table: 'jobs',
      recordId: id.toString(),
      data: jobData,
    },
  ]);

  return result;
}

export async function updateJobStatus(
  id: number,
  status: 'ACTIVE' | 'PAUSED' | 'CLOSED',
) {
  const result = await prisma.job.update({
    where: { id },
    data: { status },
  });

  await logAuditMany([
    {
      action: 'UPDATE',
      table: 'jobs',
      recordId: id.toString(),
      data: { status },
    },
  ]);

  return result;
}

export async function deleteJob(id: number) {
  await prisma.job.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });

  await logAuditMany([
    {
      action: 'DELETE',
      table: 'jobs',
      recordId: id.toString(),
      data: { deletedAt: new Date() },
    },
  ]);
}

// ============================================
// JOB APPLICATION CRUD
// ============================================

export async function getApplicationsByJobId(jobId: number) {
  return await prisma.jobApplication.findMany({
    where: { jobId },
    include: {
      nanny: {
        select: {
          id: true,
          name: true,
          slug: true,
          photoUrl: true,
          experienceYears: true,
          hourlyRate: true,
          address: {
            select: { city: true, state: true },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getApplicationsByNannyId(nannyId: number) {
  return await prisma.jobApplication.findMany({
    where: { nannyId },
    include: {
      job: {
        include: {
          family: {
            select: {
              id: true,
              name: true,
              address: {
                select: { city: true, state: true },
              },
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getApplicationById(id: number) {
  return await prisma.jobApplication.findUnique({
    where: { id },
    include: {
      job: {
        include: {
          family: {
            include: { address: true },
          },
        },
      },
      nanny: {
        include: { address: true },
      },
    },
  });
}

export async function createApplication(
  nannyId: number,
  data: FormJobApplication,
) {
  // Check if application already exists
  const existingApplication = await prisma.jobApplication.findUnique({
    where: {
      jobId_nannyId: {
        jobId: data.jobId,
        nannyId,
      },
    },
  });

  if (existingApplication) {
    throw new Error('Application already exists for this job');
  }

  const applicationData = {
    jobId: data.jobId,
    nannyId,
    status: 'PENDING' as const,
    message: data.message || null,
  };

  const result = await prisma.jobApplication.create({
    data: applicationData,
  });

  await logAuditMany([
    {
      action: 'CREATE',
      table: 'job_applications',
      recordId: result.id.toString(),
      data: applicationData,
    },
  ]);

  return result;
}

export async function updateApplicationStatus(
  id: number,
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN',
) {
  const result = await prisma.jobApplication.update({
    where: { id },
    data: { status },
  });

  await logAuditMany([
    {
      action: 'UPDATE',
      table: 'job_applications',
      recordId: id.toString(),
      data: { status },
    },
  ]);

  return result;
}

export async function updateApplicationMatchScore(
  id: number,
  matchScore: number,
) {
  const result = await prisma.jobApplication.update({
    where: { id },
    data: { matchScore },
  });

  await logAuditMany([
    {
      action: 'UPDATE',
      table: 'job_applications',
      recordId: id.toString(),
      data: { matchScore },
    },
  ]);

  return result;
}
