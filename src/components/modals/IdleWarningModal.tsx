// ============================================================
// IDLE WARNING MODAL
// Accessible, animated modal. Simple styling.
// ============================================================

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  show: boolean;
  countdownSeconds: number;
  onStay: () => void;
  onLogout: () => void;
}

export function IdleWarningModal({ show, countdownSeconds, onStay, onLogout }: Props) {
  const stayBtnRef = useRef<HTMLButtonElement>(null);

  // Auto-focus for accessibility
  useEffect(() => {
    if (show) stayBtnRef.current?.focus();
  }, [show]);

  // Keyboard: Escape = logout, Enter on focused button handled natively
  useEffect(() => {
    if (!show) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onLogout();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [show, onLogout]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="idle-title"
          aria-describedby="idle-desc"
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)',
            padding: '1rem',
          }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '2rem',
              maxWidth: '420px',
              width: '100%',
              boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
            }}
          >
            {/* Countdown circle */}
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                border: '3px solid #dc2626',
                fontSize: '1.75rem',
                fontWeight: 700,
                color: '#dc2626',
              }}>
                {countdownSeconds}
              </div>
            </div>

            <h2 id="idle-title" style={{ margin: '0 0 0.5rem', fontSize: '1.125rem', fontWeight: 600, color: '#111' }}>
              Session About to Expire
            </h2>
            <p id="idle-desc" style={{ margin: '0 0 1.5rem', color: '#6b7280', fontSize: '0.9rem', lineHeight: 1.5 }}>
              You have been inactive. Your session will expire in{' '}
              <strong>{countdownSeconds} second{countdownSeconds !== 1 ? 's' : ''}</strong>.
              Click "Stay Logged In" to continue.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                ref={stayBtnRef}
                onClick={onStay}
                style={{
                  flex: 1,
                  padding: '0.625rem 1rem',
                  background: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                }}
              >
                Stay Logged In
              </button>
              <button
                onClick={onLogout}
                style={{
                  flex: 1,
                  padding: '0.625rem 1rem',
                  background: '#fff',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                }}
              >
                Logout Now
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
