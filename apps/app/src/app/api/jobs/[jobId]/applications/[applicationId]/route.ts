import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import {
  notifyApplicationAccepted,
  notifyApplicationRejected,
} from '@/lib/notifications/job-notifications';

/**
 * PATCH /api/jobs/[jobId]/applications/[applicationId] - Update application status
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string; applicationId: string }> }
) {
  try {
    const { jobId, applicationId } = await params;
    const jobIdNum = parseInt(jobId, 10);
    const applicationIdNum = parseInt(applicationId, 10);

    if (isNaN(jobIdNum) || isNaN(applicationIdNum)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    // Authenticate user
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    if (currentUser.type !== 'family') {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
    }

    // Check job ownership
    const job = await prisma.job.findUnique({
      where: { id: jobIdNum },
      select: { familyId: true },
    });

    if (!job || job.familyId !== currentUser.family.id) {
      return NextResponse.json({ error: 'Vaga não encontrada' }, { status: 404 });
    }

    // Check application exists
    const application = await prisma.jobApplication.findUnique({
      where: { id: applicationIdNum },
      include: {
        nanny: {
          select: { name: true },
        },
      },
    });

    if (!application || application.jobId !== jobIdNum) {
      return NextResponse.json({ error: 'Candidatura não encontrada' }, { status: 404 });
    }

    const body = await request.json();
    const { status } = body;

    if (!['ACCEPTED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ error: 'Status inválido' }, { status: 400 });
    }

    // Update application status
    const updatedApplication = await prisma.jobApplication.update({
      where: { id: applicationIdNum },
      data: { status },
    });

    // Notify nanny about application status change
    if (status === 'ACCEPTED') {
      notifyApplicationAccepted(applicationIdNum).catch(console.error);
    } else if (status === 'REJECTED') {
      notifyApplicationRejected(applicationIdNum).catch(console.error);
    }

    return NextResponse.json({
      success: true,
      application: {
        id: updatedApplication.id,
        status: updatedApplication.status,
        nannyName: application.nanny.name,
      },
    });
  } catch (error) {
    console.error('Error updating application:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
