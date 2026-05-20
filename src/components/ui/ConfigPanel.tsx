import { SESSION_CONFIG } from '@/config/session.config';

function formatMs(ms: number): string {
  if (ms < 60_000) return `${ms / 1000}s`;
  return `${Math.round(ms / 60_000)}m`;
}

export function ConfigPanel() {
  const cfg = SESSION_CONFIG;

  return (
    <div style={{
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      background: '#fff',
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '0.75rem 1rem',
        borderBottom: '1px solid #e5e7eb',
        background: '#f9fafb',
      }}>
        <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#374151' }}>
          Active Configuration — <code style={{ fontSize: '0.8rem', color: '#6b7280' }}>{cfg.environment}</code>
        </span>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem' }}>
        <tbody>
          {[
            ['Idle Warning After', formatMs(cfg.idleWarningMs)],
            ['Auto Logout After', formatMs(cfg.idleTimeoutMs)],
            ['Access Token Expiry', formatMs(cfg.accessTokenExpiryMs)],
            ['Refresh Token Expiry', formatMs(cfg.refreshTokenExpiryMs)],
            ['Refresh Warning At', formatMs(cfg.refreshExpiryWarningMs)],
          ].map(([label, val]) => (
            <tr key={label} style={{ borderBottom: '1px solid #f3f4f6' }}>
              <td style={{ padding: '0.5rem 1rem', color: '#6b7280' }}>{label}</td>
              <td style={{ padding: '0.5rem 1rem', fontWeight: 600, color: '#111', fontFamily: 'monospace' }}>{val}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
