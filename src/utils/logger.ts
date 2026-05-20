// ============================================================
// ENTERPRISE LOGGER
// Structured, leveled logging. Silent in production.
// ============================================================

import type { SessionEvent } from '@/types';
import { SESSION_CONFIG } from '@/config/session.config';

type LogLevel = 'info' | 'warn' | 'error';

const isDev = SESSION_CONFIG.environment === 'development' ||
              SESSION_CONFIG.environment === 'qa';

let eventLog: SessionEvent[] = [];
let listeners: Array<(events: SessionEvent[]) => void> = [];

const notify = () => listeners.forEach(fn => fn([...eventLog]));

const createEvent = (type: string, message: string, level: LogLevel): SessionEvent => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  timestamp: Date.now(),
  type,
  message,
  level,
});

export const logger = {
  info: (type: string, message: string) => {
    const event = createEvent(type, message, 'info');
    eventLog = [event, ...eventLog].slice(0, 100);
    if (isDev) console.log(`[${type}]`, message);
    notify();
  },
  warn: (type: string, message: string) => {
    const event = createEvent(type, message, 'warn');
    eventLog = [event, ...eventLog].slice(0, 100);
    if (isDev) console.warn(`[${type}]`, message);
    notify();
  },
  error: (type: string, message: string) => {
    const event = createEvent(type, message, 'error');
    eventLog = [event, ...eventLog].slice(0, 100);
    console.error(`[${type}]`, message); // always log errors
    notify();
  },

  // Subscribe to log changes (for UI panels)
  subscribe: (fn: (events: SessionEvent[]) => void) => {
    listeners.push(fn);
    fn([...eventLog]);
    return () => { listeners = listeners.filter(l => l !== fn); };
  },

  getAll: () => [...eventLog],
  clear: () => { eventLog = []; notify(); },
};
