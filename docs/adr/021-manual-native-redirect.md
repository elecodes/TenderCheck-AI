# 21. Manual Native Redirect for Google Auth 🚀

Date: 2026-02-04

## Status

Accepted

## Context

The previous Google Auth implementation using the `@react-oauth/google` library functioned correctly in local environments but failed in the Render production environment (`.onrender.com`). This failure was due to strict **Cross-Origin-Opener-Policy (COOP)** and **Cross-Origin-Embedder-Policy (COEP)** restrictions. 

On shared domains like `.onrender.com`, libraries that use nested iframes or popups for authentication often trigger COOP communication blocks, leading to the error `Cross-Origin-Opener-Policy policy would block the window.closed call`. Standard library-based "Redirect UX" modes also failed because they still relied on service workers or background communicators that were blocked by Render's infrastructure-level headers.

## Decision

We have decided to pivot to a **Manual Native Redirect** strategy for Google Authentication. 

### 1. Library Removal
We removed the `@react-oauth/google` dependency from the frontend. This reduces bundle size and eliminates invisible library logic that might interfere with URL hashes or cross-origin headers.

### 2. Manual OAuth Navigation
Instead of using a library hook, we manually construct the Google OAuth 2.0 URL (Implicit Flow) and perform a full-page navigation using `window.location.href`. This avoids the "Opener" relationship entirely, as the user is navigating away from the app and being redirected back naturally.

### 3. Global Hash Capture
Because Google redirects the user back to the application root (`/`), and the user might be landing on the Home page rather than the Login page, we moved the token-detection logic to the **global `AuthContext`**.
- The `AuthContext` now checks `window.location.hash` upon initialization.
- If a Google `access_token` is found, it immediately triggers the backend login and redirects the user to the `/dashboard`.

### 4. CSP Move to Meta Tag
Content Security Policy (CSP) headers in `render.yaml` were reaching character limits and causing browser parsing errors (blocking Google Fonts). We moved the primary CSP to a **`<meta>` tag in `index.html`** for more reliable delivery and easier maintenance of complex resource whitelists.

## Consequences

### Positive
- **Production Reliability**: Google Auth now works perfectly on the Render free tier and shared subdomains.
- **Zero Dependencies**: Reduced reliance on external identity libraries that may have opaque security configurations.
- **Improved Performance**: Moving CSP to the meta tag resolved intermittent font-blocking issues.

### Negative
- **Manual Maintenance**: Any changes to Google's OAuth scopes or client IDs must be updated in our manual URL constructor.
- **Security Posture**: We use `unsafe-none` for COOP/COEP headers to maximize compatibility with the redirect flow, though the app remains secured via HttpOnly cookies and strict CSP.

## alternatives Considered

### Using a Custom Domain
- **Pros**: Would allow standard library-based popups to work.
- **Cons**: Adds cost and complexity that the user explicitly wants to avoid for this prototype.

### Redirect Mode (Library-Based)
- **Pros**: Handles token refreshing and token storage.
- **Cons**: Still failed on Render due to library-specific redirect handlers being blocked by the environment's security posture.
