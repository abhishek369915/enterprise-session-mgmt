import { useState, useEffect } from 'react';
import { logger } from '@/utils/logger';
import type { SessionEvent } from '@/types';

export function useEventLog(): SessionEvent[] {
  const [events, setEvents] = useState<SessionEvent[]>([]);

  useEffect(() => {
    const unsub = logger.subscribe(setEvents);
    return unsub;
  }, []);

  return events;
}
