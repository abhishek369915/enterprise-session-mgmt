// ============================================================
// SESSION MANAGER SERVICE (Host-Controlled)
// The single authority for session lifecycle in MFE architecture.
// MFEs must NOT own their own session timers.
// ============================================================

import type { LogoutReason } from '@/types';
import { idleService } from './IdleService';
import { tabSync } from './TabSyncService';
import { TokenManager } from './TokenManager';
import { AuthService } from './AuthService';
import { SESSION_CONFIG } from '@/config/session.config';
import { logger } from '@/utils/logger';

type SessionCallbacks = {
  onIdleWarning: () => void;
  onLogout: (reason: LogoutReason) => void;
  onTokenRefreshed: () => void;
  onActivityReset: () => void;
};

// Guard against duplicate logouts
let isLoggingOut = false;

// Proactive token refresh timer
let tokenRefreshTimer: ReturnType<typeof setTimeout> | null = null;

class SessionManager {
  private callbacks: SessionCallbacks | null = null;

  // ── Lifecycle ────────────────────────────────────────────

  start(callbacks: SessionCallbacks): void {
    this.callbacks = callbacks;
    isLoggingOut = false;

    // Start cross-tab sync
    tabSync.init();
    tabSync.onMessage(payload => {
      if (payload.event === 'LOGOUT') {
        logger.warn('TAB_SYNC', `Received LOGOUT from another tab: ${payload.reason}`);
        this._executeLogout(payload.reason ?? 'sessionExpired', false);
      }
      if (payload.event === 'TOKEN_REFRESHED' && payload.tokens) {
        callbacks.onTokenRefreshed();
      }
    });

    // Start idle detection
    idleService.start({
      onWarning: () => callbacks.onIdleWarning(),
      onLogout: () => this.logout('idle'),
      onActivity: () => callbacks.onActivityReset(),
    });

    // Schedule proactive token refresh
    this._scheduleTokenRefresh();

    logger.info('SESSION_MANAGER', 'Session manager started');
  }

  stop(): void {
    idleService.stop();
    tabSync.destroy();
    if (tokenRefreshTimer) clearTimeout(tokenRefreshTimer);
    this.callbacks = null;
    logger.info('SESSION_MANAGER', 'Session manager stopped');
  }

  // ── Public API ───────────────────────────────────────────

  /** Called when user clicks "Stay Logged In" */
  extendSession(): void {
    idleService.resetActivity();
    tabSync.broadcast('SESSION_EXTENDED');
    logger.info('USER_ACTIVE', 'Session extended by user');
  }

  /** Idempotent logout — safe to call multiple times */
  logout(reason: LogoutReason = 'manualLogout'): void {
    if (isLoggingOut) return;
    this._executeLogout(reason, true);
  }

  getIdleSeconds(): number {
    return idleService.getIdleSeconds();
  }

  // ── Private ──────────────────────────────────────────────

  private _executeLogout(reason: LogoutReason, broadcast: boolean): void {
    if (isLoggingOut) return;
    isLoggingOut = true;

    logger.warn('LOGOUT', `Executing logout — reason: ${reason}`);

    idleService.stop();
    if (tokenRefreshTimer) clearTimeout(tokenRefreshTimer);

    if (broadcast) {
      tabSync.broadcast('LOGOUT', { reason });
    }

    AuthService.logout();

    setTimeout(() => {
      this.callbacks?.onLogout(reason);
    }, 100);
  }

  private _scheduleTokenRefresh(): void {
    const tokens = TokenManager.getTokens();
    if (!tokens) return;

    const msUntilExpiry = tokens.accessTokenExpiry - Date.now();
    // Refresh at 80% of expiry window
    const refreshAt = msUntilExpiry * 0.8;

    if (refreshAt <= 0) {
      this._doRefresh();
      return;
    }

    tokenRefreshTimer = setTimeout(() => this._doRefresh(), refreshAt);
  }

  private async _doRefresh(): Promise<void> {
    if (TokenManager.isRefreshTokenExpired()) {
      logger.warn('LOGOUT', 'Refresh token expired during scheduled refresh');
      this.logout('tokenExpired');
      return;
    }

    const result = await TokenManager.refreshWithLock();
    if (result) {
      tabSync.broadcast('TOKEN_REFRESHED', { tokens: result });
      this.callbacks?.onTokenRefreshed();
      this._scheduleTokenRefresh(); // reschedule after successful refresh
    } else {
      logger.error('REFRESH_FAILED', 'Token refresh failed — logging out');
      this.logout('tokenExpired');
    }
  }
}

export const sessionManager = new SessionManager();
