import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';

/**
 * GET /api/reviews/eligible - List users that the current user can review
 * Based on conversation history within the last 14 days
 */
export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Get conversations from last 14 days
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const reviewType = currentUser.type === 'family' ? 'FAMILY_TO_NANNY' : 'NANNY_TO_FAMILY';

    // Find conversations where the user is a participant
    const participantWhere = currentUser.type === 'family'
      ? { familyId: currentUser.family.id }
      : { nannyId: currentUser.nanny.id };

    const participations = await prisma.participant.findMany({
      where: {
        ...participantWhere,
        conversation: {
          createdAt: { gte: fourteenDaysAgo },
        },
      },
      include: {
        conversation: {
          include: {
            participants: {
              where: currentUser.type === 'family'
                ? { familyId: null } // Get non-family participants (nannies)
                : { nannyId: null }, // Get non-nanny participants (families)
            },
          },
        },
      },
    });

    // Filter out already reviewed
    const eligible: Array<{
      conversation: { id: string; createdAt: Date };
      user: { id: number; name: string | null; photoUrl?: string | null };
      daysRemaining: number;
      reviewType: string;
    }> = [];

    for (const participation of participations) {
      const conversation = participation.conversation;
      const otherParticipant = conversation.participants[0];

      if (!otherParticipant) continue;

      // Get the target user based on the review type
      let targetId: number | null = null;
      let targetUser: { id: number; name: string | null; photoUrl?: string | null } | null = null;

      if (currentUser.type === 'family') {
        // Family reviewing nanny - get nanny by nannyId from participant
        if (otherParticipant.nannyId) {
          const nanny = await prisma.nanny.findUnique({
            where: { id: otherParticipant.nannyId },
            select: { id: true, name: true, photoUrl: true },
          });
          if (nanny) {
            targetId = nanny.id;
            targetUser = {
              id: nanny.id,
              name: nanny.name,
              photoUrl: nanny.photoUrl,
            };
          }
        }
      } else {
        // Nanny reviewing family - get family by familyId from participant
        if (otherParticipant.familyId) {
          const family = await prisma.family.findUnique({
            where: { id: otherParticipant.familyId },
            select: { id: true, name: true, photoUrl: true },
          });
          if (family) {
            targetId = family.id;
            targetUser = {
              id: family.id,
              name: family.name,
              photoUrl: family.photoUrl,
            };
          }
        }
      }

      if (!targetId || !targetUser) continue;

      // Check if already reviewed
      const reviewWhereClause: Record<string, unknown> = { type: reviewType };
      if (currentUser.type === 'family') {
        reviewWhereClause.familyId = currentUser.family.id;
        reviewWhereClause.nannyId = targetId;
      } else {
        reviewWhereClause.familyId = targetId;
        reviewWhereClause.nannyId = currentUser.nanny.id;
      }

      const existingReview = await prisma.review.findFirst({
        where: reviewWhereClause,
      });

      if (!existingReview) {
        const daysRemaining = 14 - Math.floor(
          (Date.now() - new Date(conversation.createdAt).getTime()) / (1000 * 60 * 60 * 24)
        );

        eligible.push({
          conversation: {
            id: conversation.id,
            createdAt: conversation.createdAt,
          },
          user: targetUser,
          daysRemaining,
          reviewType,
        });
      }
    }

    // Sort by days remaining (most urgent first)
    eligible.sort((a, b) => a.daysRemaining - b.daysRemaining);

    return NextResponse.json({ eligible });
  } catch (error) {
    console.error('Error fetching eligible users:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
