import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { phoneToE164 } from '@/helpers/validators';

interface ReferenceInput {
  name: string;
  phone: string;
  relationship: string;
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (currentUser.type !== 'nanny') {
      return NextResponse.json({ error: 'User is not a nanny' }, { status: 400 });
    }

    const body = await request.json();
    const { references } = body as { references: ReferenceInput[] };

    if (!references || !Array.isArray(references)) {
      return NextResponse.json({ error: 'References are required' }, { status: 400 });
    }

    // Delete existing references for this nanny
    await prisma.reference.deleteMany({
      where: { nannyId: currentUser.nanny.id },
    });

    // Create new references
    const createdReferences = await prisma.reference.createMany({
      data: references.map((ref) => ({
        nannyId: currentUser.nanny.id,
        name: ref.name,
        phone: phoneToE164(ref.phone), // Store in E.164 format (+55...)
        relationship: ref.relationship,
        verified: false,
      })),
    });

    // Update nanny to indicate they have references
    await prisma.nanny.update({
      where: { id: currentUser.nanny.id },
      data: { hasReferences: true },
    });

    return NextResponse.json({
      success: true,
      count: createdReferences.count,
    });
  } catch (error) {
    console.error('Error saving references:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
