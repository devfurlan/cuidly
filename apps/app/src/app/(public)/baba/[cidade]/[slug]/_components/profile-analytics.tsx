'use client';

import { useEffect, useState } from 'react';

interface ProfileAnalyticsProps {
  nannyId: number;
}

function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Client component that tracks profile views
 * This runs on the client to avoid blocking the server render
 */
export function ProfileAnalytics({ nannyId }: ProfileAnalyticsProps) {
  const [sessionId] = useState(() => generateSessionId());

  useEffect(() => {
    // Track profile view
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nannyId,
        actionType: 'VIEW',
        sessionId,
      }),
    }).catch((error) => {
      console.error('Error tracking profile view:', error);
    });
  }, [nannyId, sessionId]);

  // This component doesn't render anything
  return null;
}
