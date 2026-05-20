// ============================================================
// SESSION STORE (Zustand)
// UI state only — session logic lives in services.
// ============================================================

import { create } from 'zustand';
import type { SessionState, User, TokenPair, LogoutReason } from '@/types';

interface SessionStore extends SessionState {
  showWarning: boolean;
  countdownSeconds: number;

  // Actions
  setUser: (user: User | null) => void;
  setTokens: (tokens: TokenPair | null) => void;
  setStatus: (status: SessionState['status']) => void;
  setShowWarning: (show: boolean) => void;
  setCountdown: (seconds: number) => void;
  setLastActivity: (ts: number) => void;
  setLogoutReason: (reason: LogoutReason) => void;
  reset: () => void;
}

const initialState: Omit<SessionStore, keyof { setUser: any; setTokens: any; setStatus: any; setShowWarning: any; setCountdown: any; setLastActivity: any; setLogoutReason: any; reset: any }> = {
  user: null,
  tokens: null,
  status: 'logged_out',
  lastActivityAt: 0,
  loginAt: 0,
  logoutReason: undefined,
  showWarning: false,
  countdownSeconds: 0,
};

export const useSessionStore = create<SessionStore>((set) => ({
  ...initialState,

  setUser: (user) => set({ user }),
  setTokens: (tokens) => set({ tokens }),
  setStatus: (status) => set({ status }),
  setShowWarning: (showWarning) => set({ showWarning }),
  setCountdown: (countdownSeconds) => set({ countdownSeconds }),
  setLastActivity: (lastActivityAt) => set({ lastActivityAt }),
  setLogoutReason: (logoutReason) => set({ logoutReason }),
  reset: () => set({ ...initialState }),
}));
