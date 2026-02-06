import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createFreeSubscription } from '@/services/subscription/subscription-service';

/**
 * POST /api/auth/signup
 *
 * Creates a Nanny or Family record after Supabase Auth signup.
 * This API does NOT require authentication because it's called
 * immediately after signup, before the session is fully established.
 *
 * We validate by checking that the authId is a valid UUID and
 * that no record exists with this authId yet.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { authId, email, type, name, emailVerified } = body;

    // Validate required fields
    if (!authId || !email || !type) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: authId, email, type' },
        { status: 400 }
      );
    }

    // Validate type
    if (type !== 'FAMILY' && type !== 'NANNY') {
      return NextResponse.json(
        { error: 'Tipo inválido. Deve ser FAMILY ou NANNY' },
        { status: 400 }
      );
    }

    // Validate authId format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(authId)) {
      return NextResponse.json(
        { error: 'authId inválido' },
        { status: 400 }
      );
    }

    // Dissociate any DELETED records from the other type
    // (e.g., was a Nanny, deleted, now re-registering as Family)
    if (type === 'NANNY') {
      const deletedFamily = await prisma.family.findUnique({ where: { authId } });
      if (deletedFamily?.status === 'DELETED') {
        await prisma.family.update({ where: { id: deletedFamily.id }, data: { authId: null } });
      }
    } else {
      const deletedNanny = await prisma.nanny.findUnique({ where: { authId } });
      if (deletedNanny?.status === 'DELETED') {
        await prisma.nanny.update({ where: { id: deletedNanny.id }, data: { authId: null } });
      }
    }

    // Check if already exists
    if (type === 'NANNY') {
      const existingNanny = await prisma.nanny.findUnique({
        where: { authId },
      });
      if (existingNanny) {
        if (existingNanny.status === 'DELETED') {
          // Dissociate deleted record to allow re-registration
          await prisma.nanny.update({ where: { id: existingNanny.id }, data: { authId: null } });
        } else {
          return NextResponse.json(
            { message: 'Usuário já existe', id: existingNanny.id, type: 'nanny' },
            { status: 200 }
          );
        }
      }
    } else {
      const existingFamily = await prisma.family.findUnique({
        where: { authId },
      });
      if (existingFamily) {
        if (existingFamily.status === 'DELETED') {
          // Dissociate deleted record to allow re-registration
          await prisma.family.update({ where: { id: existingFamily.id }, data: { authId: null } });
        } else {
          return NextResponse.json(
            { message: 'Usuário já existe', id: existingFamily.id, type: 'family' },
            { status: 200 }
          );
        }
      }
    }

    // Create the record
    if (type === 'NANNY') {
      const nanny = await prisma.nanny.create({
        data: {
          authId,
          emailAddress: email,
          name: name || null,
          status: 'PENDING',
          emailVerified: !!emailVerified,
        },
      });

      // Create free subscription
      await createFreeSubscription({ nannyId: nanny.id });

      return NextResponse.json({
        message: 'Babá criada com sucesso',
        id: nanny.id,
        type: 'nanny',
      });
    } else {
      const family = await prisma.family.create({
        data: {
          authId,
          emailAddress: email,
          name: name || 'Família',
          status: 'PENDING',
          emailVerified: !!emailVerified,
        },
      });

      // Create free subscription
      await createFreeSubscription({ familyId: family.id });

      return NextResponse.json({
        message: 'Família criada com sucesso',
        id: family.id,
        type: 'family',
      });
    }
  } catch (error) {
    console.error('Error in /api/auth/signup:', error);
    return NextResponse.json(
      { error: 'Erro interno ao criar usuário' },
      { status: 500 }
    );
  }
}
