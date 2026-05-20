// ============================================================
// useSession HOOK
// Ties the session store to services. Components only call
// this — they never touch services directly.
// ============================================================

import { useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessionStore } from '@/store/sessionStore';
import { sessionManager } from '@/services/SessionManager';
import { TokenManager } from '@/services/TokenManager';
import { SESSION_CONFIG } from '@/config/session.config';
import type { LogoutReason } from '@/types';
import { logger } from '@/utils/logger';

export function useSession() {
  const store = useSessionStore();
  const navigate = useNavigate();
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCountdown = useCallback(() => {
    const remaining = Math.floor(
      (SESSION_CONFIG.idleTimeoutMs - SESSION_CONFIG.idleWarningMs) / 1000
    );
    store.setCountdown(remaining);

    if (countdownRef.current) clearInterval(countdownRef.current);

    countdownRef.current = setInterval(() => {
      store.setCountdown(
        useSessionStore.getState().countdownSeconds - 1
      );
    }, 1000);
  }, [store]);

  const stopCountdown = useCallback(() => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  }, []);

  const handleLogout = useCallback((reason: LogoutReason) => {
    stopCountdown();
    store.setShowWarning(false);
    store.setStatus('logged_out');
    store.setLogoutReason(reason);
    store.reset();
    navigate(`/login?reason=${reason}`, { replace: true });
  }, [navigate, store, stopCountdown]);

  const startSession = useCallback(() => {
    const user = TokenManager.getUser();
    const tokens = TokenManager.getTokens();
    if (!user || !tokens) return;

    store.setUser(user);
    store.setTokens(tokens);
    store.setStatus('active');
    store.setLastActivity(Date.now());

    sessionManager.start({
      onIdleWarning: () => {
        logger.warn('IDLE_WARNING', 'Idle warning triggered');
        store.setStatus('idle_warning');
        store.setShowWarning(true);
        startCountdown();
      },
      onLogout: (reason) => handleLogout(reason),
      onTokenRefreshed: () => {
        const newTokens = TokenManager.getTokens();
        if (newTokens) store.setTokens(newTokens);
      },
      onActivityReset: () => {
        store.setLastActivity(Date.now());
        if (store.showWarning) {
          store.setShowWarning(false);
          store.setStatus('active');
          stopCountdown();
        }
      },
    });
  }, [store, handleLogout, startCountdown, stopCountdown]);

  const extendSession = useCallback(() => {
    sessionManager.extendSession();
    store.setShowWarning(false);
    store.setStatus('active');
    stopCountdown();
    logger.info('USER_ACTIVE', 'User clicked Stay Logged In');
  }, [store, stopCountdown]);

  const logout = useCallback((reason: LogoutReason = 'manualLogout') => {
    sessionManager.logout(reason);
    handleLogout(reason);
  }, [handleLogout]);

  useEffect(() => {
    return () => stopCountdown();
  }, [stopCountdown]);

  return {
    user: store.user,
    tokens: store.tokens,
    status: store.status,
    showWarning: store.showWarning,
    countdownSeconds: store.countdownSeconds,
    startSession,
    extendSession,
    logout,
  };
}
