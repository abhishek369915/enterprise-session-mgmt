# Enterprise Idle Logout & Session Management

Production-grade session management POC built with React + Vite + TypeScript.

## Quick Start

```bash
npm install
npm run dev
```

Navigate to `http://localhost:5173` and log in with:
- `admin@corp.com` / `admin123`
- `user@corp.com` / `user123`

---

## Architecture

```
src/
├── app/                    # App entry / router
├── components/
│   ├── modals/             # IdleWarningModal
│   └── ui/                 # SessionMetricsPanel, EventLogPanel, ConfigPanel
├── config/
│   ├── session.config.ts   # ← All timeouts live here (per environment)
│   └── auth.config.ts      # Auth0 / SAML placeholders
├── hooks/
│   ├── useSession.ts       # Main hook — components use this
│   ├── useSessionMetrics.ts
│   └── useEventLog.ts
├── layouts/
│   └── DashboardLayout.tsx
├── pages/
│   ├── LoginPage.tsx
│   └── DashboardPage.tsx
├── routes/
│   └── ProtectedRoute.tsx
├── services/
│   ├── SessionManager.ts   # Host-controlled session orchestrator
│   ├── IdleService.ts      # Idle detection engine (refs only, no re-renders)
│   ├── TokenManager.ts     # Token storage + refresh locking
│   ├── TabSyncService.ts   # BroadcastChannel cross-tab sync
│   └── AuthService.ts      # Auth (mocked — replace with Auth0/SAML)
├── store/
│   └── sessionStore.ts     # Zustand store (UI state only)
├── types/
│   └── index.ts
└── utils/
    └── logger.ts           # Structured logger, subscribable, silent in prod
```

---

## Configuring Timeouts

Edit `src/config/session.config.ts` — never hardcode values elsewhere.

```ts
export const SESSION_CONFIG = {
  idleWarningMs: 30_000,   // Show warning after 30s idle (dev)
  idleTimeoutMs: 60_000,   // Auto-logout after 60s idle (dev)
  accessTokenExpiryMs: 120_000,
  refreshTokenExpiryMs: 300_000,
  refreshExpiryWarningMs: 240_000,
  environment: 'development',
};
```

Set `VITE_APP_ENV=production` in your `.env` to switch to production timeouts.

---

## Key Features

### Idle Detection
- Activity tracked via `click` + `keydown` only (no `mousemove`)
- Uses raw JS timers/refs — zero React re-renders on activity events
- Sleep/resume validation via `visibilitychange` + `focus`

### Token Refresh Locking
Prevents duplicate refresh calls across concurrent code paths:
```ts
if (!refreshPromise) {
  refreshPromise = refreshToken();
}
await refreshPromise;
```

### Cross-Tab Sync
Uses `BroadcastChannel` API with `localStorage` event fallback.
Logout in one tab → all tabs log out instantly.

### Logout Flow
1. Logout reason passed in URL: `/login?reason=idle`
2. All tokens cleared from `localStorage` + `sessionStorage`
3. All timers cancelled
4. Idempotent — safe to call multiple times

### Logout Reasons
| Reason | Trigger |
|--------|---------|
| `idle` | Inactivity timeout |
| `sessionExpired` | Cross-tab broadcast |
| `tokenExpired` | Refresh token expired |
| `manualLogout` | User clicked Logout |
| `unauthorized` | 401 from API |

---

## Integrating Real Auth

### Auth0
Replace `AuthService._mockLogin` with the Auth0 SDK:
```ts
import { Auth0Client } from '@auth0/auth0-spa-js';
const auth0 = new Auth0Client(AUTH0_CONFIG);
await auth0.loginWithRedirect();
```

### SAML
Redirect to your IdP entry point from `AuthService`:
```ts
window.location.href = SAML_CONFIG.entryPoint;
```

---

## MFE Integration

`SessionManager` is the host-owned singleton. MFEs must not create their own idle timers. Instead, subscribe to the `BroadcastChannel` for session events:

```ts
tabSync.onMessage(payload => {
  if (payload.event === 'LOGOUT') {
    // MFE clears its own local state
  }
});
```

---

## Environment Variables

```env
VITE_APP_ENV=development        # development | qa | staging | production
VITE_AUTH0_DOMAIN=              # Auth0 domain
VITE_AUTH0_CLIENT_ID=           # Auth0 client ID
VITE_AUTH0_AUDIENCE=            # Auth0 API audience
VITE_SAML_ENTRY_POINT=          # SAML IdP entry point
VITE_SAML_ISSUER=               # SAML issuer
```
