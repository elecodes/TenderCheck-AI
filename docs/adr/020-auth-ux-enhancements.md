# 20. Auth UX Enhancements (Remember Me & Interstitial) 🔐

Date: 2026-01-31

## Status

Accepted

## Context

While the application had functional authentication, the user experience was friction-heavy. Users had to re-enter credentials every time they closed the tab (session-only storage default), and there was no visual indication of a valid session when returning to the login page (it just showed an empty form or redirected abruptly). Additionally, the "Forgot Password" flow was disconnected.

## Decision

We have implemented a set of UX refinements to align with "Enterprise" expectations for authentication:

### 1. Dual-Storage Strategy (Remember Me)
We modified `AuthContext` to support both `localStorage` and `sessionStorage`.
- **Default**: `sessionStorage` (Session persistence only).
- **Remember Me**: `localStorage` (Long-term persistence).
- **Implementation**: The `login()` method now accepts a `rememberMe` boolean. `AuthContext` initialization logic checks `localStorage` first, then `sessionStorage`.

### 2. "Welcome Back" Interstitial
Instead of confusingly redirecting authenticated users or showing them an empty login form, we introduced a **"Welcome Back"** state in `LoginForm`.
- **UI**: Displays the user's name/email and offers two explicit choices:
  1.  **Continue to Dashboard** (Primary Action)
  2.  **Switch User** (Secondary Action - triggers Logout)
- **Benefit**: Reduces friction for returning users while maintaining clarity and security.

### 3. Forgot Password Integration
- Added a dedicated `/forgot-password` route and form.
- Linked prominently from the Login screen.
- Currently mocks the email sending (backend endpoint returns success) to complete the UX loop.

## Consequences

### 4. HttpOnly Cookies (Security Hardening) 🛡️
We migrated from `localStorage` to **HttpOnly Cookies** for token storage.
- **Why**: Prevents XSS attacks. Even if JS is compromised, the attacker cannot read the `httpOnly` cookie.
- **Implementation**: 
    - Backend: Uses `cookie-parser`. `AuthController` sets an `httpOnly; secure; sameSite` cookie.
    - Frontend: `credentials: 'include'` in all `fetch` requests.
    - **Persistence**: "Remember Me" toggles the cookie's `Max-Age`. Checked = 30 days; Unchecked = Session Cookie.

## Consequences

### Positive
- **Security**: Significantly reduces XSS impact on auth tokens.
- **UX**: "Remember Me" works seamlessly without exposing tokens.
- **User Clarity**: "Welcome Back" flow remains consistent.

### Negative
- **Dev Complexity**: Requires handling Cross-Origin credentials (CORS) carefully.
- **Testing**: E2E tests need to handle cookies rather than just setting localStorage.

## alternatives Considered

### HttpOnly Cookies (The Gold Standard)
Instead of storing tokens in `localStorage` (accessible by JS), the backend would set a `secure; httpOnly` cookie.
- **Pros**: Immune to XSS token theft.
- **Cons**: Requires CSRF protection (Double Submit Cookie or SameSite settings) and backend state changes.
- **Decision**: For Phase 9, we chose `localStorage` for simplicity and statelessness, but acknowledge Cookies as the next security hardening step.
