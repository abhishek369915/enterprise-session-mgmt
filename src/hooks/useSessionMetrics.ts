// ============================================================
// useSessionMetrics HOOK
// Provides live token expiry and idle stats for the dashboard.
// Uses setInterval internally — NOT React state per activity.
// ============================================================

import { useState, useEffect } from 'react';
import { TokenManager } from '@/services/TokenManager';
import { idleService } from '@/services/IdleService';
import { AuthService } from '@/services/AuthService';
import { useSessionStore } from '@/store/sessionStore';

interface SessionMetrics {
  accessTokenSecondsLeft: number;
  refreshTokenSecondsLeft: number;
  idleSeconds: number;
  sessionAgeSeconds: number;
  isAccessExpired: boolean;
  isRefreshExpired: boolean;
}

export function useSessionMetrics(pollMs = 1000): SessionMetrics {
  const status = useSessionStore(s => s.status);
  const [metrics, setMetrics] = useState<SessionMetrics>(() => snapshot());

  useEffect(() => {
    if (status === 'logged_out') return;
    const id = setInterval(() => setMetrics(snapshot()), pollMs);
    return () => clearInterval(id);
  }, [status, pollMs]);

  return metrics;
}

function snapshot(): SessionMetrics {
  return {
    accessTokenSecondsLeft: TokenManager.accessTokenSecondsRemaining(),
    refreshTokenSecondsLeft: TokenManager.refreshTokenSecondsRemaining(),
    idleSeconds: idleService.getIdleSeconds(),
    sessionAgeSeconds: AuthService.getSessionAge(),
    isAccessExpired: TokenManager.isAccessTokenExpired(),
    isRefreshExpired: TokenManager.isRefreshTokenExpired(),
  };
}
