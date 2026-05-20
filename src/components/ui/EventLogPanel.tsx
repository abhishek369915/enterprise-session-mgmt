import { useEventLog } from '@/hooks/useEventLog';
import { logger } from '@/utils/logger';
import type { SessionEvent } from '@/types';

function levelColor(level: SessionEvent['level']): string {
  return level === 'error' ? '#dc2626' : level === 'warn' ? '#d97706' : '#2563eb';
}

function levelBg(level: SessionEvent['level']): string {
  return level === 'error' ? '#fef2f2' : level === 'warn' ? '#fffbeb' : '#eff6ff';
}

export function EventLogPanel() {
  const events = useEventLog();

  return (
    <div style={{
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      background: '#fff',
      overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.75rem 1rem',
        borderBottom: '1px solid #e5e7eb',
        background: '#f9fafb',
      }}>
        <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#374151' }}>
          Session Event Log
        </span>
        <button
          onClick={() => logger.clear()}
          style={{
            fontSize: '0.75rem', color: '#6b7280', background: 'none',
            border: 'none', cursor: 'pointer', padding: '2px 8px',
            borderRadius: '4px',
          }}
        >
          Clear
        </button>
      </div>

      <div style={{ maxHeight: '280px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '0.775rem' }}>
        {events.length === 0 && (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>
            No events yet. Login to start a session.
          </div>
        )}
        {events.map(ev => (
          <div key={ev.id} style={{
            display: 'flex',
            gap: '0.75rem',
            alignItems: 'flex-start',
            padding: '0.5rem 1rem',
            borderBottom: '1px solid #f3f4f6',
          }}>
            <span style={{
              fontSize: '0.65rem',
              fontWeight: 700,
              padding: '2px 6px',
              borderRadius: '4px',
              background: levelBg(ev.level),
              color: levelColor(ev.level),
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}>
              {ev.type}
            </span>
            <span style={{ color: '#374151', flex: 1 }}>{ev.message}</span>
            <span style={{ color: '#9ca3af', whiteSpace: 'nowrap', flexShrink: 0 }}>
              {new Date(ev.timestamp).toLocaleTimeString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
