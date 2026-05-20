// ============================================================
// ENTERPRISE SESSION MANAGEMENT - Type Definitions
// ============================================================

export type Environment = 'development' | 'qa' | 'staging' | 'production';

export type LogoutReason =
  | 'idle'
  | 'sessionExpired'
  | 'manualLogout'
  | 'unauthorized'
  | 'tokenExpired';

export type SessionStatus =
  | 'active'
  | 'idle_warning'
  | 'expired'
  | 'logged_out';

export type TabSyncEvent =
  | 'LOGOUT'
  | 'TOKEN_REFRESHED'
  | 'SESSION_EXTENDED'
  | 'ACTIVITY';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiry: number;   // timestamp ms
  refreshTokenExpiry: number;  // timestamp ms
}

export interface SessionState {
  user: User | null;
  tokens: TokenPair | null;
  status: SessionStatus;
  lastActivityAt: number;
  loginAt: number;
  logoutReason?: LogoutReason;
}

export interface SessionConfig {
  idleWarningMs: number;
  idleTimeoutMs: number;
  accessTokenExpiryMs: number;
  refreshTokenExpiryMs: number;
  refreshExpiryWarningMs: number;
  environment: Environment;
}

export interface SessionEvent {
  id: string;
  timestamp: number;
  type: string;
  message: string;
  level: 'info' | 'warn' | 'error';
}

export interface BroadcastPayload {
  event: TabSyncEvent;
  reason?: LogoutReason;
  tokens?: Partial<TokenPair>;
  timestamp: number;
}
