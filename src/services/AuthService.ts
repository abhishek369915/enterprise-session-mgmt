// ============================================================
// AUTH SERVICE
// Mocked authentication. Swap _mockLogin for real Auth0/SAML.
// ============================================================

import { SESSION_CONFIG } from '@/config/session.config';
import { TOKEN_STORAGE_KEYS } from '@/config/auth.config';
import type { TokenPair, User } from '@/types';
import { TokenManager } from './TokenManager';
import { logger } from '@/utils/logger';

const MOCK_USERS: Record<string, { password: string; user: User }> = {
  'abhi@dedov.com': {
    password: 'abhi123',
    user: { id: 'u-001', name: 'Admin User', email: 'abhi@dedov.com', role: 'Administrator' },
  },
  'user@dedov.com': {
    password: 'user123',
    user: { id: 'u-002', name: 'Jane Smith', email: 'user@dedov.com', role: 'Analyst' },
  },
};

export const AuthService = {
  async login(email: string, password: string): Promise<{ user: User; tokens: TokenPair }> {
    // ── Placeholder: replace with Auth0 or SAML redirect ──
    await new Promise(r => setTimeout(r, 600)); // simulate network

    const match = MOCK_USERS[email.toLowerCase()];
    if (!match || match.password !== password) {
      throw new Error('Invalid credentials');
    }

    const now = Date.now();
    const tokens: TokenPair = {
      accessToken: `mock_access_${Date.now()}`,
      refreshToken: `mock_refresh_${Date.now()}`,
      accessTokenExpiry: now + SESSION_CONFIG.accessTokenExpiryMs,
      refreshTokenExpiry: now + SESSION_CONFIG.refreshTokenExpiryMs,
    };

    TokenManager.saveTokens(tokens);
    TokenManager.saveUser(match.user);
    localStorage.setItem(TOKEN_STORAGE_KEYS.SESSION_START, String(now));

    logger.info('AUTH', `Login successful: ${email}`);
    return { user: match.user, tokens };
  },

  logout(): void {
    TokenManager.clearTokens();
    logger.info('LOGOUT', 'Auth service cleared all tokens and storage');
  },

  isAuthenticated(): boolean {
    const tokens = TokenManager.getTokens();
    if (!tokens) return false;
    // Allow slightly expired access token if refresh is still valid
    return !TokenManager.isRefreshTokenExpired();
  },

  getSessionAge(): number {
    const start = Number(localStorage.getItem(TOKEN_STORAGE_KEYS.SESSION_START));
    if (!start) return 0;
    return Math.floor((Date.now() - start) / 1000);
  },
};
