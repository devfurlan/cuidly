/**
 * Analytics Tracking API
 * POST /api/analytics/track
 *
 * Tracks profile views and action clicks
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { headers } from 'next/headers';

interface TrackingData {
  nannyId: number;
  actionType: 'VIEW' | 'HIRE_CLICK' | 'CONTACT_CLICK' | 'SHARE' | 'FAVORITE';
  sessionId?: string;
}

// Helper function to get IP from request
async function getClientIp(): Promise<string | null> {
  const headersList = await headers();

  // Try different header names used by various proxies
  const forwardedFor = headersList.get('x-forwarded-for');
  const realIp = headersList.get('x-real-ip');
  const cfConnectingIp = headersList.get('cf-connecting-ip');

  if (forwardedFor) {
    // x-forwarded-for may contain multiple IPs, get the first one
    return forwardedFor.split(',')[0].trim();
  }

  if (realIp) {
    return realIp;
  }

  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  return null;
}

// Helper function to detect device type from user agent
function getDeviceType(userAgent: string): string {
  const ua = userAgent.toLowerCase();

  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }

  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile';
  }

  return 'desktop';
}

// Helper function to detect browser from user agent
function getBrowser(userAgent: string): string {
  const ua = userAgent.toLowerCase();

  if (ua.includes('edg')) return 'Edge';
  if (ua.includes('chrome')) return 'Chrome';
  if (ua.includes('safari')) return 'Safari';
  if (ua.includes('firefox')) return 'Firefox';
  if (ua.includes('opera') || ua.includes('opr')) return 'Opera';

  return 'Unknown';
}

// Helper function to get location from IP (usando ipapi.co)
async function getLocationFromIp(ip: string): Promise<{
  city: string | null;
  state: string | null;
  country: string | null;
}> {
  try {
    // Using a free IP geolocation API
    const response = await fetch(`https://ipapi.co/${ip}/json/`, {
      headers: {
        'User-Agent': 'Cuidly-App/1.0',
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error('Falha ao buscar localização');
    }

    const data = await response.json();

    return {
      city: data.city || null,
      state: data.region_code || null,
      country: data.country_name || null,
    };
  } catch (error) {
    console.error('Error getting location from IP:', error);
    return {
      city: null,
      state: null,
      country: null,
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: TrackingData = await request.json();

    const { nannyId, actionType, sessionId } = body;

    // Validate required fields
    if (!nannyId || !actionType) {
      return NextResponse.json(
        { error: 'Campos obrigatorios ausentes: nannyId e actionType' },
        { status: 400 }
      );
    }

    // Validate actionType
    const validActionTypes = ['VIEW', 'HIRE_CLICK', 'CONTACT_CLICK', 'SHARE', 'FAVORITE'];
    if (!validActionTypes.includes(actionType)) {
      return NextResponse.json(
        { error: 'Tipo de acao invalido' },
        { status: 400 }
      );
    }

    // Verify nanny exists
    const nanny = await prisma.nanny.findUnique({
      where: { id: nannyId },
    });

    if (!nanny) {
      return NextResponse.json(
        { error: 'Nanny not found' },
        { status: 404 }
      );
    }

    // Get visitor information
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || 'Unknown';
    const referrer = headersList.get('referer') || null;
    const visitorIp = await getClientIp();

    // Get device and browser info
    const deviceType = getDeviceType(userAgent);
    const browser = getBrowser(userAgent);

    // Get location from IP (only if IP is available and not local)
    let location: { city: string | null; state: string | null; country: string | null } = {
      city: null,
      state: null,
      country: null
    };
    if (visitorIp && !visitorIp.startsWith('127.') && !visitorIp.startsWith('192.168.')) {
      location = await getLocationFromIp(visitorIp);
    }

    // Create analytics record
    const analytics = await prisma.profileAnalytics.create({
      data: {
        nannyId: nannyId,
        actionType: actionType,
        visitorIp: visitorIp,
        visitorCity: location.city,
        visitorState: location.state,
        visitorCountry: location.country,
        userAgent: userAgent,
        deviceType: deviceType,
        browser,
        referrer,
        sessionId: sessionId || null,
      },
    });

    return NextResponse.json({
      success: true,
      analyticsId: analytics.id,
    });
  } catch (error) {
    console.error('Error tracking analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
