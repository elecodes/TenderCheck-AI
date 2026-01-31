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

### Positive
- **Reduced Friction**: Users don't need to re-type passwords daily.
- **Clarity**: The "Switch User" option solves the "how do I logout if I can't even get in?" edge case.
- **Security**: Explicit autocomplete attributes (`username`, `current-password`) help password managers work correctly.

### Negative
- **Complexity**: `AuthContext` initialization logic is slightly more complex (checking two sources).
- **Security Risk**: `localStorage` is vulnerable to XSS (cross-site scripting), though we mitigate this with strict Content Security Policy (CSP) and input sanitization.
