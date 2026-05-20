// ============================================================
// ENTERPRISE SESSION MANAGEMENT - Centralized Session Config
// DO NOT hardcode timeout values elsewhere in the codebase.
// All timeouts are driven from this single source of truth.
// ============================================================

import type { Environment, SessionConfig } from '@/types';

const configs: Record<Environment, SessionConfig> = {
  development: {
    idleWarningMs: 30_000,       // 30s — fast feedback during dev
    idleTimeoutMs: 60_000,       // 60s total idle before logout
    accessTokenExpiryMs: 60_000,
    refreshTokenExpiryMs: 300_000,
    refreshExpiryWarningMs: 240_000,
    environment: 'development',
  },
  qa: {
    idleWarningMs: 60_000,
    idleTimeoutMs: 120_000,
    accessTokenExpiryMs: 300_000,
    refreshTokenExpiryMs: 600_000,
    refreshExpiryWarningMs: 540_000,
    environment: 'qa',
  },
  staging: {
    idleWarningMs: 180_000,       // 3 min
    idleTimeoutMs: 300_000,       // 5 min
    accessTokenExpiryMs: 900_000,
    refreshTokenExpiryMs: 1_800_000,
    refreshExpiryWarningMs: 1_740_000,
    environment: 'staging',
  },
  production: {
    idleWarningMs: 600_000,       // 10 min
    idleTimeoutMs: 900_000,       // 15 min
    accessTokenExpiryMs: 3_600_000,
    refreshTokenExpiryMs: 86_400_000,
    refreshExpiryWarningMs: 86_100_000,
    environment: 'production',
  },
};

const resolveEnv = (): Environment => {
  const env = import.meta.env.VITE_APP_ENV as Environment | undefined;
  if (env && env in configs) return env;
  return import.meta.env.PROD ? 'production' : 'development';
};

export const SESSION_CONFIG: SessionConfig = configs[resolveEnv()];

export const getConfig = (): SessionConfig => SESSION_CONFIG;
