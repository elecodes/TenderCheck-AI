# ADR 011: Cloud Authentication Strategy (Google OAuth)

## Status
Accepted
Date: 2026-01-27

## Context
As the application moves towards cloud deployment (Phase 4) and targets enterprise/public sector users, we need a robust, secure, and user-friendly authentication mechanism. The previous custom JWT implementation was sufficient for local dev but lacked features like "Forgot Password" (securely) and single-sign-on (SSO).

## Decision
We decided to integrate **Google Sign-In** (OIDC) alongside the custom JWT auth, adhering to the standard hybrid verification flow.

1.  **Frontend**: Use `@react-oauth/google` to obtain an `access_token` (Implicit/Token flow).
2.  **Backend**: Verify the token using Google's UserInfo API (`https://www.googleapis.com/oauth2/v3/userinfo`) instead of a heavy library, keeping dependencies minimal.
3.  **Account Linking**: Accounts are linked by email. If a user signs in with Google and an account acts with that email, they are logged in. If not, a new account is provisioned automatically with a random password hash.

## Consequences
- **Security**: Relies on Google's security for initial authentication. Backend still issues its own JWT for session management.
- **UX**: One-click login.
- **Privacy**: We only request `email` and `profile` scopes.
- **Mocking**: "Forgot Password" is implemented as a mock (logging token to console) for the TFM MVP to avoid SMTP complexity.
