/**
 * Nanny Analytics API
 * GET /api/analytics/nanny/[nannyId]
 *
 * Returns analytics data for a specific nanny
 * Requer autenticação - babá só pode acessar suas próprias analytics
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';

type ProfileActionType = 'VIEW' | 'HIRE_CLICK' | 'CONTACT_CLICK' | 'SHARE' | 'FAVORITE';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ nannyId: string }> }
) {
  try {
    // Verificar autenticação
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { nannyId: nannyIdStr } = await params;
    const nannyId = parseInt(nannyIdStr);

    if (isNaN(nannyId)) {
      return NextResponse.json(
        { error: 'ID da baba invalido' },
        { status: 400 }
      );
    }

    // Verificar se o usuário é dono do perfil
    // Nota: Removemos a verificação de ADMIN pois não existe mais a role ADMIN no novo sistema
    if (currentUser.type !== 'nanny' || currentUser.nanny.id !== nannyId) {
      return NextResponse.json(
        { error: 'Acesso negado - você só pode acessar suas próprias analytics' },
        { status: 403 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const actionType = searchParams.get('actionType');

    // Build where clause
    const where: {
      nannyId: number;
      createdAt?: { gte?: Date; lte?: Date };
      actionType?: ProfileActionType;
    } = {
      nannyId: nannyId,
    };

    // Add date filters if provided
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    // Add action type filter if provided
    const validActionTypes: ProfileActionType[] = ['VIEW', 'HIRE_CLICK', 'CONTACT_CLICK', 'SHARE', 'FAVORITE'];
    if (actionType && validActionTypes.includes(actionType as ProfileActionType)) {
      where.actionType = actionType as ProfileActionType;
    }

    // Get total counts by action type
     
    const totalsByActionType = await (prisma.profileAnalytics.groupBy as any)({
      by: ['actionType'],
      where,
      _count: {
        id: true,
      },
    });

    // Get counts by date (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyStats = await prisma.$queryRaw<
      Array<{ date: Date; action_type: string; count: bigint }>
    >`
      SELECT
        DATE(created_at) as date,
        action_type,
        COUNT(*) as count
      FROM profile_analytics
      WHERE nanny_id = ${nannyId}
        AND created_at >= ${thirtyDaysAgo}
      GROUP BY DATE(created_at), action_type
      ORDER BY date DESC
    `;

    // Get top locations (cities)
     
    const topCities = await (prisma.profileAnalytics.groupBy as any)({
      by: ['visitorCity', 'visitorState'],
      where: {
        ...where,
        visitorCity: { not: null },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 10,
    });

    // Get device type distribution
     
    const deviceTypes = await (prisma.profileAnalytics.groupBy as any)({
      by: ['deviceType'],
      where: {
        ...where,
        deviceType: { not: null },
      },
      _count: {
        id: true,
      },
    });

    // Get browser distribution
     
    const browsers = await (prisma.profileAnalytics.groupBy as any)({
      by: ['browser'],
      where: {
        ...where,
        browser: { not: null },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 5,
    });

    // Get recent activity (last 20 events)
    const recentActivity = await prisma.profileAnalytics.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
      select: {
        id: true,
        actionType: true,
        visitorCity: true,
        visitorState: true,
        deviceType: true,
        browser: true,
        createdAt: true,
      },
    });

    // Calculate conversion rate (hire clicks / views)
    const views = totalsByActionType.find((t: { actionType: string; _count: { id: number } }) => t.actionType === 'VIEW')?._count.id || 0;
    const hireClicks =
      totalsByActionType.find((t: { actionType: string; _count: { id: number } }) => t.actionType === 'HIRE_CLICK')?._count.id || 0;
    const favorites =
      totalsByActionType.find((t: { actionType: string; _count: { id: number } }) => t.actionType === 'FAVORITE')?._count.id || 0;

    const conversionRate = views > 0 ? (hireClicks / views) * 100 : 0;

    // Format response
    const analytics = {
      summary: {
        totalViews: views,
        totalHireClicks: hireClicks,
        totalFavorites: favorites,
        totalShares:
          totalsByActionType.find((t: { actionType: string; _count: { id: number } }) => t.actionType === 'SHARE')?._count.id || 0,
        conversionRate: conversionRate.toFixed(2),
      },
      dailyStats: dailyStats.map((stat: { date: Date; action_type: string; count: bigint }) => ({
        date: stat.date.toISOString().split('T')[0],
        actionType: stat.action_type,
        count: Number(stat.count),
      })),
      topCities: topCities.map((city: { visitorCity: string | null; visitorState: string | null; _count: { id: number } }) => ({
        city: city.visitorCity,
        state: city.visitorState,
        count: city._count.id,
      })),
      deviceTypes: deviceTypes.map((device: { deviceType: string | null; _count: { id: number } }) => ({
        type: device.deviceType,
        count: device._count.id,
      })),
      browsers: browsers.map((browser: { browser: string | null; _count: { id: number } }) => ({
        name: browser.browser,
        count: browser._count.id,
      })),
      recentActivity,
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error fetching nanny analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
