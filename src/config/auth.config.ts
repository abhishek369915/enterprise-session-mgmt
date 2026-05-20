// ============================================================
// AUTH0 / SAML PLACEHOLDER CONFIGURATION
// Replace values with real credentials from your IdP.
// ============================================================

export const AUTH0_CONFIG = {
  domain: import.meta.env.VITE_AUTH0_DOMAIN ?? 'YOUR_AUTH0_DOMAIN',
  clientId: import.meta.env.VITE_AUTH0_CLIENT_ID ?? 'YOUR_CLIENT_ID',
  audience: import.meta.env.VITE_AUTH0_AUDIENCE ?? 'YOUR_API_AUDIENCE',
  redirectUri: window.location.origin + '/callback',
  scope: 'openid profile email offline_access',
};

export const SAML_CONFIG = {
  entryPoint: import.meta.env.VITE_SAML_ENTRY_POINT ?? 'https://idp.example.com/sso',
  issuer: import.meta.env.VITE_SAML_ISSUER ?? 'enterprise-session-mgmt',
  callbackUrl: window.location.origin + '/saml/callback',
};

export const TOKEN_STORAGE_KEYS = {
  ACCESS_TOKEN: 'ent_access_token',
  REFRESH_TOKEN: 'ent_refresh_token',
  ACCESS_EXPIRY: 'ent_access_expiry',
  REFRESH_EXPIRY: 'ent_refresh_expiry',
  USER: 'ent_user',
  SESSION_START: 'ent_session_start',
};
