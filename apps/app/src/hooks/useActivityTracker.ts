'use client';

import { useEffect, useRef } from 'react';

const ACTIVITY_INTERVAL = 60 * 1000; // 1 minuto

/**
 * Hook para rastrear atividade do usuário
 * Atualiza lastActivityAt a cada minuto enquanto a página está ativa
 */
export function useActivityTracker() {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<number>(0);

  useEffect(() => {
    const updateActivity = async () => {
      const now = Date.now();

      // Evitar updates muito frequentes (mínimo 30 segundos entre updates)
      if (now - lastUpdateRef.current < 30000) {
        return;
      }

      try {
        await fetch('/api/user/activity', { method: 'POST' });
        lastUpdateRef.current = now;
      } catch (error) {
        console.error('Error updating activity:', error);
      }
    };

    // Atualizar imediatamente ao montar
    updateActivity();

    // Atualizar periodicamente
    intervalRef.current = setInterval(updateActivity, ACTIVITY_INTERVAL);

    // Atualizar quando a página fica visível novamente
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updateActivity();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
}
