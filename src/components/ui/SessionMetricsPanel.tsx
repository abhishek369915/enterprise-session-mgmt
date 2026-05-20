import { useSessionMetrics } from '@/hooks/useSessionMetrics';

function formatSec(s: number): string {
  if (s <= 0) return '0s';
  const m = Math.floor(s / 60);
  const sec = s % 60;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
}

interface CardProps {
  label: string;
  value: string;
  badge?: string;
  badgeColor?: string;
}

function MetricCard({ label, value, badge, badgeColor = '#16a34a' }: CardProps) {
  return (
    <div style={{
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '1rem 1.25rem',
      background: '#fff',
      minWidth: '0',
    }}>
      <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.375rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </div>
      <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111', marginBottom: badge ? '0.375rem' : 0 }}>
        {value}
      </div>
      {badge && (
        <span style={{
          fontSize: '0.7rem',
          fontWeight: 600,
          background: badgeColor + '20',
          color: badgeColor,
          padding: '2px 8px',
          borderRadius: '999px',
        }}>
          {badge}
        </span>
      )}
    </div>
  );
}

export function SessionMetricsPanel() {
  const m = useSessionMetrics();

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
      gap: '1rem',
      marginBottom: '1.5rem',
    }}>
      <MetricCard
        label="Access Token"
        value={formatSec(m.accessTokenSecondsLeft)}
        badge={m.isAccessExpired ? 'EXPIRED' : 'VALID'}
        badgeColor={m.isAccessExpired ? '#dc2626' : '#16a34a'}
      />
      <MetricCard
        label="Refresh Token"
        value={formatSec(m.refreshTokenSecondsLeft)}
        badge={m.isRefreshExpired ? 'EXPIRED' : 'VALID'}
        badgeColor={m.isRefreshExpired ? '#dc2626' : '#16a34a'}
      />
      <MetricCard
        label="Idle Time"
        value={formatSec(m.idleSeconds)}
      />
      <MetricCard
        label="Session Age"
        value={formatSec(m.sessionAgeSeconds)}
      />
    </div>
  );
}
