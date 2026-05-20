import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthService } from '@/services/AuthService';
import { useSession } from '@/hooks/useSession';
import { logger } from '@/utils/logger';

const LOGOUT_MESSAGES: Record<string, string> = {
  idle: 'Your session expired due to inactivity.',
  sessionExpired: 'Your session has expired. Please log in again.',
  tokenExpired: 'Your authentication token expired.',
  manualLogout: 'You have been logged out.',
  unauthorized: 'You were logged out due to an unauthorized action.',
};

export function LoginPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { startSession } = useSession();

  const [email, setEmail] = useState('abhi@dedov.com');
  const [password, setPassword] = useState('abhi123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const reason = params.get('reason') ?? '';
  const logoutMsg = reason ? LOGOUT_MESSAGES[reason] : '';

  useEffect(() => {
    if (AuthService.isAuthenticated()) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await AuthService.login(email, password);
      startSession();
      logger.info('AUTH', `User logged in: ${email}`);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f9fafb',
      padding: '1rem',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '380px',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontWeight: 700, fontSize: '1.25rem', color: '#111', marginBottom: '0.25rem' }}>
            Enterprise Session Manager
          </div>
          <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
            Sign in to continue
          </div>
        </div>

        {logoutMsg && (
          <div style={{
            padding: '0.75rem 1rem',
            background: '#fffbeb',
            border: '1px solid #fcd34d',
            borderRadius: '6px',
            marginBottom: '1rem',
            fontSize: '0.85rem',
            color: '#92400e',
          }}>
            {logoutMsg}
          </div>
        )}

        <div style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '1.5rem',
        }}>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 500, marginBottom: '0.375rem', color: '#374151' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 500, marginBottom: '0.375rem', color: '#374151' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {error && (
              <div style={{
                padding: '0.5rem 0.75rem',
                background: '#fef2f2',
                border: '1px solid #fca5a5',
                borderRadius: '6px',
                marginBottom: '1rem',
                fontSize: '0.825rem',
                color: '#dc2626',
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.625rem',
                background: loading ? '#93c5fd' : '#2563eb',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div style={{ marginTop: '1rem', fontSize: '0.775rem', color: '#9ca3af', borderTop: '1px solid #f3f4f6', paddingTop: '0.75rem' }}>
            <div style={{ fontWeight: 500, marginBottom: '0.25rem', color: '#6b7280' }}>Demo accounts:</div>
            <div>abhi@dedov.com / abhi123</div>
            <div>user@dedov.com / user123</div>
          </div>
        </div>
      </div>
    </div>
  );
}
