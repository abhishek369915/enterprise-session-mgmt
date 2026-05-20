// ============================================================
// TOKEN MANAGER SERVICE
// Handles storage, retrieval, expiry, and refresh locking.
// Single responsibility: token lifecycle only.
// ============================================================

import { TOKEN_STORAGE_KEYS } from '@/config/auth.config';
import { SESSION_CONFIG } from '@/config/session.config';
import type { TokenPair, User } from '@/types';
import { logger } from '@/utils/logger';

// Singleton refresh lock — prevents duplicate refresh races
let refreshPromise: Promise<TokenPair | null> | null = null;

export const TokenManager = {
  // ── Storage ──────────────────────────────────────────────

  saveTokens(tokens: TokenPair): void {
    localStorage.setItem(TOKEN_STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
    localStorage.setItem(TOKEN_STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
    localStorage.setItem(TOKEN_STORAGE_KEYS.ACCESS_EXPIRY, String(tokens.accessTokenExpiry));
    localStorage.setItem(TOKEN_STORAGE_KEYS.REFRESH_EXPIRY, String(tokens.refreshTokenExpiry));
  },

  getTokens(): TokenPair | null {
    const accessToken = localStorage.getItem(TOKEN_STORAGE_KEYS.ACCESS_TOKEN);
    const refreshToken = localStorage.getItem(TOKEN_STORAGE_KEYS.REFRESH_TOKEN);
    const accessTokenExpiry = Number(localStorage.getItem(TOKEN_STORAGE_KEYS.ACCESS_EXPIRY));
    const refreshTokenExpiry = Number(localStorage.getItem(TOKEN_STORAGE_KEYS.REFRESH_EXPIRY));

    if (!accessToken || !refreshToken) return null;
    return { accessToken, refreshToken, accessTokenExpiry, refreshTokenExpiry };
  },

  clearTokens(): void {
    Object.values(TOKEN_STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
    sessionStorage.clear();
  },

  saveUser(user: User): void {
    localStorage.setItem(TOKEN_STORAGE_KEYS.USER, JSON.stringify(user));
  },

  getUser(): User | null {
    try {
      const raw = localStorage.getItem(TOKEN_STORAGE_KEYS.USER);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  // ── Expiry Checks ────────────────────────────────────────

  isAccessTokenExpired(): boolean {
    const tokens = this.getTokens();
    if (!tokens) return true;
    return Date.now() >= tokens.accessTokenExpiry;
  },

  isRefreshTokenExpired(): boolean {
    const tokens = this.getTokens();
    if (!tokens) return true;
    return Date.now() >= tokens.refreshTokenExpiry;
  },

  accessTokenSecondsRemaining(): number {
    const tokens = this.getTokens();
    if (!tokens) return 0;
    return Math.max(0, Math.floor((tokens.accessTokenExpiry - Date.now()) / 1000));
  },

  refreshTokenSecondsRemaining(): number {
    const tokens = this.getTokens();
    if (!tokens) return 0;
    return Math.max(0, Math.floor((tokens.refreshTokenExpiry - Date.now()) / 1000));
  },

  // ── Refresh Locking ──────────────────────────────────────
  // Ensures only one refresh call happens across all concurrent callers.

  async refreshWithLock(): Promise<TokenPair | null> {
    if (refreshPromise) {
      logger.info('TOKEN_REFRESH', 'Waiting on existing refresh lock...');
      return refreshPromise;
    }

    logger.info('TOKEN_REFRESH', 'Acquiring refresh lock and calling mock refresh API');

    refreshPromise = this._mockRefreshCall().finally(() => {
      refreshPromise = null;
    });

    return refreshPromise;
  },

  // Mocked refresh — replace with real axios call to your token endpoint
  async _mockRefreshCall(): Promise<TokenPair | null> {
    const existing = this.getTokens();
    if (!existing || this.isRefreshTokenExpired()) {
      logger.error('REFRESH_FAILED', 'Refresh token missing or expired');
      return null;
    }

    await new Promise(r => setTimeout(r, 500)); // simulate network

    const now = Date.now();
    const newTokens: TokenPair = {
      accessToken: `mock_access_${Date.now()}`,
      refreshToken: existing.refreshToken, // sliding or rotate here
      accessTokenExpiry: now + SESSION_CONFIG.accessTokenExpiryMs,
      refreshTokenExpiry: existing.refreshTokenExpiry,
    };

    this.saveTokens(newTokens);
    logger.info('TOKEN_REFRESH', 'Access token refreshed successfully');
    return newTokens;
  },
};
