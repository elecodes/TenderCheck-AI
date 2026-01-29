# ADR 014: Authentication Strategy Pivot (Popup vs Redirect)

* Status: accepted
* Deciders: Elena (Lead Developer), Antigravity (AI Assistant)
* Date: 2026-01-29

## Context and Problem Statement

Integrating Google Authentication (OIDC) into the React Frontend hosted on Render presented a critical conflict with browser security policies.
The application requires a secure environment, but Google's "Popup" sign-in flow (`ux_mode: 'popup'`) relies on `window.opener` communication.
Modern browsers, enforcing `Cross-Origin-Opener-Policy (COOP)`, were blocking this communication (`window.closed` error), treating the popup as untrusted verification.
Despite relaxing headers to `unsafe-none` and `same-origin-allow-popups`, the issue persisted in the production environment (deployment v1.0.5 - v1.0.9).

## Decision Drivers

*   **Reliability**: Authentication must work 100% of the time for all users, regardless of browser privacy settings.
*   **Security Standards**: We should not disable core security features (COOP/COEP) just to make a popup work.
*   **User Experience**: While popups are "smoother", a broken popup is a blocker. A redirect is robust.

## Considered Options

*   **Option 1: Relax COOP Headers (Tried)**: Attempted to set `Cross-Origin-Opener-Policy: unsafe-none`.
    *   *Result*: Failed. Google's SDK still detected isolation issues or the header propagation was inconsistent on the CDN.
*   **Option 2: Proxy Auth**: Route auth through the backend exclusively.
    *   *Result*: Too complex for the current timeline.
*   **Option 3: Redirect Mode (`ux_mode: 'redirect'`)**: Use full-page navigation to Google and back.

## Decision Outcome

Chosen option: **Option 3: Redirect Mode**.

We switched the `@react-oauth/google` configuration to `ux_mode: 'redirect'`.
Instead of opening a child window, the entire app redirects to `accounts.google.com`.
Upon return, the application parses the `access_token` from the URL hash (Implicit Flow).

### Positive Consequences

*   **Bypasses COOP/COEP**: Full page navigation is not subject to Opener Policy restrictions in the same way.
*   **Universal Compatibility**: Works on mobile browsers and aggressive privacy extensions where popups are often blocked.
*   **Simplified Troubleshooting**: Removes "race conditions" between window checks.

### Negative Consequences

*   **State Loss**: The React app reloads completely upon return, requiring session restoration (handled by `AuthContext`).
*   **UX Friction**: Slightly more disruptive than a popup, but acceptable for a login action.

## Implementation Details
- `GoogleLoginButton.tsx`: Added logic to check `window.location.hash` for `access_token` on mount.
- `main.tsx`: Version bumped to v1.1.0 to track this release.
