// ============================================================
// IDLE DETECTION ENGINE
// Tracks user activity using refs/closures — NO React state
// re-renders on every event. Minimal event surface.
// ============================================================

import { SESSION_CONFIG } from '@/config/session.config';
import { logger } from '@/utils/logger';

// Only these events reset the idle timer (avoid mousemove)
const ACTIVITY_EVENTS: (keyof WindowEventMap)[] = ['click', 'keydown'];

type IdleCallback = () => void;

class IdleService {
  private warningTimer: ReturnType<typeof setTimeout> | null = null;
  private logoutTimer: ReturnType<typeof setTimeout> | null = null;
  private onWarning: IdleCallback | null = null;
  private onLogout: IdleCallback | null = null;
  private onActivity: IdleCallback | null = null;
  private running = false;
  private lastActivity = Date.now();

  // Visibility / focus handlers for sleep/resume
  private _onVisible = () => {
    if (document.visibilityState === 'visible') {
      this._validateResume();
    }
  };

  private _onFocus = () => this._validateResume();

  start(options: {
    onWarning: IdleCallback;
    onLogout: IdleCallback;
    onActivity?: IdleCallback;
  }): void {
    if (this.running) return;
    this.running = true;
    this.lastActivity = Date.now();
    this.onWarning = options.onWarning;
    this.onLogout = options.onLogout;
    this.onActivity = options.onActivity ?? null;

    ACTIVITY_EVENTS.forEach(e => window.addEventListener(e, this._onUserActivity, true));
    document.addEventListener('visibilitychange', this._onVisible);
    window.addEventListener('focus', this._onFocus);

    this._scheduleWarning();
    logger.info('USER_ACTIVE', 'Idle detection engine started');
  }

  stop(): void {
    this.running = false;
    this._clearTimers();
    ACTIVITY_EVENTS.forEach(e => window.removeEventListener(e, this._onUserActivity, true));
    document.removeEventListener('visibilitychange', this._onVisible);
    window.removeEventListener('focus', this._onFocus);
    logger.info('IDLE_SERVICE', 'Idle detection engine stopped');
  }

  // Called externally when user clicks "Stay Logged In"
  resetActivity(): void {
    this.lastActivity = Date.now();
    this._clearTimers();
    this._scheduleWarning();
    logger.info('USER_ACTIVE', 'Activity reset — timers restarted');
  }

  getLastActivity(): number {
    return this.lastActivity;
  }

  getIdleSeconds(): number {
    return Math.floor((Date.now() - this.lastActivity) / 1000);
  }

  // ── Private ──────────────────────────────────────────────

  private _onUserActivity = (): void => {
    if (!this.running) return;
    this.lastActivity = Date.now();
    this._clearTimers();
    this._scheduleWarning();
    this.onActivity?.();
  };

  private _scheduleWarning(): void {
    this.warningTimer = setTimeout(() => {
      logger.warn('IDLE_WARNING', `User idle for ${SESSION_CONFIG.idleWarningMs}ms — showing warning`);
      this.onWarning?.();
      this._scheduleLogout();
    }, SESSION_CONFIG.idleWarningMs);
  }

  private _scheduleLogout(): void {
    const remaining = SESSION_CONFIG.idleTimeoutMs - SESSION_CONFIG.idleWarningMs;
    this.logoutTimer = setTimeout(() => {
      logger.warn('LOGOUT', 'Idle timeout reached — executing logout');
      this.onLogout?.();
    }, remaining);
  }

  private _clearTimers(): void {
    if (this.warningTimer) clearTimeout(this.warningTimer);
    if (this.logoutTimer) clearTimeout(this.logoutTimer);
    this.warningTimer = null;
    this.logoutTimer = null;
  }

  // Validate session when user returns from sleep/tab switch
  private _validateResume(): void {
    const idleMs = Date.now() - this.lastActivity;
    logger.info('IDLE_SERVICE', `Session resume — idle for ${Math.round(idleMs / 1000)}s`);

    if (idleMs >= SESSION_CONFIG.idleTimeoutMs) {
      logger.warn('LOGOUT', 'Session expired during sleep/suspension');
      this._clearTimers();
      this.onLogout?.();
    } else if (idleMs >= SESSION_CONFIG.idleWarningMs) {
      this._clearTimers();
      this._scheduleLogout();
      this.onWarning?.();
    }
  }
}

export const idleService = new IdleService();
