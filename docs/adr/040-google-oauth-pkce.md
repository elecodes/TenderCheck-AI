# ADR 040: Google OAuth PKCE Migration

* Status: accepted
* Deciders: Elena (Lead Developer), Antigravity (AI Assistant)
* Date: 2026-06-12

## Context and Problem Statement

Google OAuth was integrated using the **Implicit Grant** flow (`response_type=token`), which returns the access token in the URL fragment (`#access_token=...`). While functional, this exposes the token in the browser's address bar, creating a security concern:

- The token remains visible in browser history
- Browser extensions with URL access could intercept it
- The implicit flow is deprecated by OAuth 2.1 Security Best Current Practice (BCP 195)
- The Implicit Grant does not support refresh tokens, limiting session longevity

The application already uses JWT tokens for its own auth — the Google access token was only used for the initial sign-in, not for subsequent API calls. However, its exposure in the URL was an unnecessary attack surface.

## Decision Drivers

*   **Security**: Eliminate access token exposure in the browser URL.
*   **Best Practices**: Align with OAuth 2.1 recommendations and PKCE (Proof Key for Code Exchange) standard.
*   **Backwards Compatibility**: Existing users should not be affected; the old endpoint can coexist during migration.

## Considered Options

*   **Option 1: Backend-Only Callback**: The backend handles the entire OAuth dance — frontend redirects to a backend endpoint, backend exchanges the code, returns a JWT.
    *   *Result*: Cleanest security (no token in frontend at all), but requires adding a backend redirect route and updating Google Cloud Console with a server-side redirect URI.
*   **Option 2: Frontend PKCE (Chosen)**: Frontend generates a `code_verifier` + `code_challenge`, redirects with `response_type=code` + `code_challenge_method=S256`, then sends the authorization code and verifier to the backend for exchange.
    *   *Result*: Eliminates token from URL (only a short-lived, single-use `?code=` appears as a query param). No Google Cloud Console config change needed — redirect_uri stays the frontend URL. Matches existing frontend/backend data flow.

## Decision Outcome

Chosen option: **Option 2: Frontend PKCE**.

The frontend handles PKCE challenge generation and the backend performs the server-side code exchange. This eliminates access token exposure while keeping the redirect_uri pointing at the frontend (no Google Cloud Console changes required).

### Positive Consequences

*   **No access token in URL**: Only `?code=` (short-lived, single-use authorization code) appears briefly as a query param.
*   **No Google Cloud Console change**: redirect_uri stays the frontend URL.
*   **Supports refresh tokens**: The Authorization Code flow can return a refresh token, enabling longer sessions.
*   **OAuth 2.1 compliant**: Aligns with current security best practices.

### Negative Consequences

*   **Authorization code briefly visible**: The `?code=` param is visible in the URL during callback, but codes are single-use and expire in ~5 minutes.
*   **Increased complexity**: Requires crypto (SHA-256) for challenge generation, sessionStorage for state + verifier, and a new backend endpoint for code exchange.
*   **Server-side exchange required**: Backend needs `GOOGLE_CLIENT_SECRET` (set via environment variable in Render dashboard).

## Implementation Details

- `GoogleLoginButton.tsx`: Generates PKCE `code_verifier` (crypto.getRandomValues, 32 bytes, base64url) and `code_challenge` (SHA-256 via crypto.subtle). Stores verifier in sessionStorage. Includes `state` parameter (random 16 bytes, base64url) for CSRF protection.
- `AuthContext.tsx`: Reads `?code` from URL query params on callback, verifies `state` matches sessionStorage, calls `POST /api/auth/google/callback` with code + verifier. Cleans up state and verifier from sessionStorage after success/failure.
- `auth.service.ts`: Added `googleCallback(code, codeVerifier)`; removed `loginWithGoogle`.
- `AuthService.ts` (backend): Added `loginWithGoogleCode()` — exchanges authorization code at `https://oauth2.googleapis.com/token`, validates the returned ID token (JWT from Google), finds or creates the user, returns app JWT.
- `AuthController.ts`: Added `googleCallback` handler with Zod validation.
- `AuthRoutes.ts`: Added `POST /api/auth/google/callback`.
- Old endpoint `POST /api/auth/google` (implicit flow) kept for backwards compatibility during migration.

## Supersedes

This ADR supersedes the implicit grant implementation described in [ADR 018](./018-auth-strategy-pivot.md). The core decision (redirect over popup) remains valid; only the OAuth flow itself is upgraded from Implicit Grant to Authorization Code + PKCE.
