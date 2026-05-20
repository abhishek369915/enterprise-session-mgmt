import { useSession } from '@/hooks/useSession';
import { useSessionStore } from '@/store/sessionStore';
import { IdleWarningModal } from '@/components/modals/IdleWarningModal';
import { SessionMetricsPanel } from '@/components/ui/SessionMetricsPanel';
import { EventLogPanel } from '@/components/ui/EventLogPanel';
import { ConfigPanel } from '@/components/ui/ConfigPanel';

export function DashboardLayout() {
  const { user, showWarning, countdownSeconds, extendSession, logout } = useSession();
  const status = useSessionStore(s => s.status);

  const statusColor = status === 'active' ? '#16a34a' : status === 'idle_warning' ? '#d97706' : '#dc2626';

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      {/* Nav */}
      <header style={{
        background: '#fff',
        borderBottom: '1px solid #e5e7eb',
        padding: '0 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '56px',
      }}>
        <div style={{ fontWeight: 700, fontSize: '1rem', color: '#111' }}>
          Enterprise Session Manager
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            fontSize: '0.8rem', color: '#374151',
          }}>
            <span style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: statusColor, display: 'inline-block',
            }} />
            {status === 'active' ? 'Active' : status === 'idle_warning' ? 'Idle Warning' : 'Expired'}
          </span>

          {user && (
            <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>
              {user.name} — <span style={{ color: '#374151' }}>{user.role}</span>
            </span>
          )}

          <button
            onClick={() => logout('manualLogout')}
            style={{
              padding: '0.375rem 0.875rem',
              background: '#fff',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.825rem',
              color: '#374151',
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main content */}
      <main style={{ maxWidth: '960px', margin: '0 auto', padding: '1.5rem' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem', color: '#111' }}>
          Session Dashboard
        </h1>
        <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
          Live session state, token expiry, and event audit log.
        </p>

        <SessionMetricsPanel />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <ConfigPanel />

          <div style={{
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            background: '#fff',
            padding: '1rem 1.25rem',
          }}>
            <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.75rem', color: '#374151' }}>
              Quick Actions
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button
                onClick={extendSession}
                style={{
                  padding: '0.5rem 1rem', background: '#2563eb', color: '#fff',
                  border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem',
                  textAlign: 'left',
                }}
              >
                Extend Session (Reset Idle)
              </button>
              <button
                onClick={() => logout('manualLogout')}
                style={{
                  padding: '0.5rem 1rem', background: '#fff', color: '#374151',
                  border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem',
                  textAlign: 'left',
                }}
              >
                Manual Logout
              </button>
              <button
                onClick={() => logout('unauthorized')}
                style={{
                  padding: '0.5rem 1rem', background: '#fff', color: '#dc2626',
                  border: '1px solid #fca5a5', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem',
                  textAlign: 'left',
                }}
              >
                Simulate Unauthorized Logout
              </button>
            </div>
          </div>
        </div>

        <EventLogPanel />
      </main>

      {/* Idle warning modal */}
      <IdleWarningModal
        show={showWarning}
        countdownSeconds={countdownSeconds}
        onStay={extendSession}
        onLogout={() => logout('idle')}
      />
    </div>
  );
}
