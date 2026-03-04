# 29. Authentication Error Handling and Caching Strategy

Date: 2026-03-04

## Status

Accepted

## Context

We encountered an issue where users were receiving `401 Unauthorized` errors when attempting to upload documents or fetch history, despite appearing to be logged in on the frontend. Investigation revealed that the browser was likely caching the `GET /api/auth/me` response, leading the frontend context to believe the session was valid when the underlying cookie had actually expired or was missing (e.g., waiting for the server to wake up).

Additionally, the frontend handled API errors generically, often masking the specific `401` status code, which prevented specific recovery actions (like auto-logout).

## Decision

We have decided to implement a strict "No-Store" caching policy for authentication checks and a robust client-side error handling strategy for `401` responses.

### 1. Cache-Control Headers
We explicitly disable caching for all authentication-sensitive endpoints (`/me`, `/history`, `/analyze`).
*   **Header**: `Cache-Control: no-store, no-cache, must-revalidate, proxy-revalidate`
*   **Rationale**: This forces the browser to validate the session with the backend on every request/page load, ensuring the frontend state matches the backend session state.

### 2. Client-Side 401 Handling
We implemented a dedicated `ApiError` class in the frontend to capture HTTP status codes.
*   **Interceptor**: API wrapper functions (`uploadTender`, `fetchHistory`) now catch non-2xx responses and throw `ApiError`.
*   **Auto-Logout**: Critical components (like `Dashboard.tsx`) specifically catch `ApiError` with status `401` and trigger an immediate `handleLogout()`.
*   **Rationale**: This prevents the application from entering a "zombie" state where the UI shows a logged-in user but API calls fail. Redirecting to login allows the user to re-authenticate and restore a valid session.

### 3. Cookie Path
We explicitly set the cookie `path` to `/` in the backend `AuthController`.
*   **Rationale**: Ensures the authentication cookie is sent for all routes, preventing issues where a cookie might be scoped too narrowly (e.g., set on `/api/auth` but not sent for `/api/tenders`).

## Consequences

### Positive
*   **Reliability**: Authentication state is now strictly synchronized between frontend and backend.
*   **UX Recovery**: Users are immediately guided to fix their session (login) rather than facing confusing errors.
*   **Security**: Prevents stale sensitive data from hanging around in browser caches.

### Negative
*   **Performance**: Slight increase in network traffic as auth checks are never cached (though these are small JSON payloads).
*   **Strictness**: Users may be logged out more aggressively if their session genuinely expires, rather than seeing a cached "logged in" view. This is considered a feature, not a bug.
