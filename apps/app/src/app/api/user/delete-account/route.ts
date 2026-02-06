import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import prisma from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';

/**
 * DELETE /api/user/delete-account
 * Soft deletes the user account by setting status to DELETED.
 * Also signs out the user from Supabase.
 */
export async function DELETE() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    if (currentUser.type === 'nanny') {
      // Soft delete nanny - set status to DELETED
      await prisma.nanny.update({
        where: { id: currentUser.nanny.id },
        data: {
          status: 'DELETED',
          // Clear sensitive data
          emailAddress: null,
          phoneNumber: '',
          cpf: null,
          cpfHash: null,
          photoUrl: null,
          // Keep name for historical records but anonymize
          name: `Usuario Excluido #${currentUser.nanny.id}`,
        },
      });

      // Cancel any active subscription
      if (currentUser.nanny.subscription) {
        await prisma.subscription.update({
          where: { id: currentUser.nanny.subscription.id },
          data: {
            status: 'CANCELED',
            canceledAt: new Date(),
          },
        });
      }
    } else if (currentUser.type === 'family') {
      // Soft delete family - set status to DELETED
      await prisma.family.update({
        where: { id: currentUser.family.id },
        data: {
          status: 'DELETED',
          // Clear sensitive data
          emailAddress: null,
          phoneNumber: '',
          cpf: null,
          cpfHash: null,
          photoUrl: null,
          // Keep name for historical records but anonymize
          name: `Familia Excluida #${currentUser.family.id}`,
        },
      });

      // Cancel any active subscription
      if (currentUser.family.subscription) {
        await prisma.subscription.update({
          where: { id: currentUser.family.subscription.id },
          data: {
            status: 'CANCELED',
            canceledAt: new Date(),
          },
        });
      }

      // Close any open jobs
      await prisma.job.updateMany({
        where: {
          familyId: currentUser.family.id,
          status: { in: ['OPEN', 'PAUSED'] },
        },
        data: {
          status: 'CLOSED',
        },
      });
    }

    // Sign out from Supabase (optional - user will be redirected anyway)
    await supabase.auth.signOut();

    return NextResponse.json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting user account:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
