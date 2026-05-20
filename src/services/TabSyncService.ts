// ============================================================
// TAB SYNC SERVICE
// Synchronizes session events across browser tabs via
// BroadcastChannel API (falls back to storage events).
// ============================================================

import type { BroadcastPayload, TabSyncEvent } from '@/types';
import { logger } from '@/utils/logger';

type TabSyncHandler = (payload: BroadcastPayload) => void;

const CHANNEL_NAME = 'enterprise_session_channel';

class TabSyncService {
  private channel: BroadcastChannel | null = null;
  private handlers: TabSyncHandler[] = [];
  private useStorage = false;

  init(): void {
    if (typeof BroadcastChannel !== 'undefined') {
      this.channel = new BroadcastChannel(CHANNEL_NAME);
      this.channel.onmessage = (e: MessageEvent<BroadcastPayload>) => {
        this._dispatch(e.data);
      };
      logger.info('TAB_SYNC', 'BroadcastChannel initialized');
    } else {
      // Fallback: storage events for older browsers
      this.useStorage = true;
      window.addEventListener('storage', this._onStorage);
      logger.warn('TAB_SYNC', 'Falling back to localStorage storage events');
    }
  }

  broadcast(event: TabSyncEvent, extra?: Partial<Omit<BroadcastPayload, 'event' | 'timestamp'>>): void {
    const payload: BroadcastPayload = { event, timestamp: Date.now(), ...extra };

    if (this.channel) {
      this.channel.postMessage(payload);
    } else if (this.useStorage) {
      localStorage.setItem(CHANNEL_NAME, JSON.stringify(payload));
      // Remove so next identical event still fires
      setTimeout(() => localStorage.removeItem(CHANNEL_NAME), 200);
    }

    logger.info('TAB_SYNC', `Broadcasted: ${event}`);
  }

  onMessage(handler: TabSyncHandler): () => void {
    this.handlers.push(handler);
    return () => { this.handlers = this.handlers.filter(h => h !== handler); };
  }

  destroy(): void {
    this.channel?.close();
    window.removeEventListener('storage', this._onStorage);
    this.handlers = [];
  }

  private _dispatch(payload: BroadcastPayload): void {
    this.handlers.forEach(h => h(payload));
  }

  private _onStorage = (e: StorageEvent): void => {
    if (e.key === CHANNEL_NAME && e.newValue) {
      try {
        const payload = JSON.parse(e.newValue) as BroadcastPayload;
        this._dispatch(payload);
      } catch {
        // malformed payload
      }
    }
  };
}

export const tabSync = new TabSyncService();
