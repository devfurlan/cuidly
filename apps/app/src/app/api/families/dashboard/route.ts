import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { getFirstName } from '@/utils/slug';

/**
 * GET /api/families/dashboard - Get family dashboard summary
 */
export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    if (currentUser.type !== 'family') {
      return NextResponse.json(
        { error: 'Usuário não é uma família' },
        { status: 400 }
      );
    }

    const familyId = currentUser.family.id;

    // Get counts in parallel
    const [
      activeJobsCount,
      pendingApplicationsCount,
      favoritesCount,
      activeJobs,
      pendingApplications,
    ] = await Promise.all([
      // Count active jobs
      prisma.job.count({
        where: {
          familyId,
          status: 'ACTIVE',
          deletedAt: null,
        },
      }),

      // Count pending applications across all family jobs
      prisma.jobApplication.count({
        where: {
          job: {
            familyId,
            deletedAt: null,
          },
          status: 'PENDING',
        },
      }),

      // Count favorites
      prisma.favorite.count({
        where: {
          familyId,
        },
      }),

      // Get active jobs with application count
      prisma.job.findMany({
        where: {
          familyId,
          status: 'ACTIVE',
          deletedAt: null,
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          title: true,
          jobType: true,
          status: true,
          createdAt: true,
          startDate: true,
          _count: {
            select: { applications: true },
          },
        },
      }),

      // Get pending applications with nanny info
      prisma.jobApplication.findMany({
        where: {
          job: {
            familyId,
            deletedAt: null,
          },
          status: 'PENDING',
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          createdAt: true,
          matchScore: true,
          message: true,
          job: {
            select: {
              id: true,
              title: true,
            },
          },
          nanny: {
            select: {
              id: true,
              name: true,
              photoUrl: true,
              experienceYears: true,
              address: {
                select: {
                  city: true,
                  state: true,
                },
              },
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      summary: {
        activeJobs: activeJobsCount,
        pendingApplications: pendingApplicationsCount,
        favorites: favoritesCount,
      },
      recentJobs: activeJobs.map((job) => ({
        id: job.id,
        title: job.title,
        jobType: job.jobType,
        status: job.status,
        createdAt: job.createdAt,
        startDate: job.startDate,
        applicationsCount: job._count.applications,
      })),
      recentApplications: pendingApplications.map((app) => ({
        id: app.id,
        createdAt: app.createdAt,
        matchScore: app.matchScore ? Number(app.matchScore) : null,
        message: app.message,
        jobId: app.job.id,
        jobTitle: app.job.title,
        nanny: {
          id: app.nanny.id,
          name: app.nanny.name ? getFirstName(app.nanny.name) : '',
          photoUrl: app.nanny.photoUrl,
          experienceYears: app.nanny.experienceYears,
          city: app.nanny.address?.city,
          state: app.nanny.address?.state,
        },
      })),
    });
  } catch (error) {
    console.error('Error fetching family dashboard:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
