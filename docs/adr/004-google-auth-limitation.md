# ADR 004: Google Auth Limitation in Production

## Status
Accepted

## Date
2026-02-01

## Context
The project implements dual authentication methods: Email/Password (custom) and Google OAuth (via `@react-oauth/google`). 
The application is deployed on Render's free tier, using a shared subdomain (`.onrender.com`).
Google's security policies for OAuth 2.0 (specifically Cross-Origin-Opener-Policy or COOP) require strict origin matching and often block popup/redirect flows on shared subdomains unless a verified custom domain (e.g., `www.myapp.com`) is used.
This restriction causes the Google Sign-In popup to fail with a "Policy Blocked" error in the production environment, despite working perfectly in the development environment (`localhost`).

## Decision
For the scope of this Master's Thesis (TFM), we will:
1.  **Keep Google Auth code in the codebase** to demonstrate technical proficiency and correct implementation.
2.  **Acknowledge the limitation** in production as an infrastructure constraint (lack of custom domain funding/scope).
3.  **Use Email/Password** as the primary, fully supported authentication method for the live demo.
4.  **Provide Proof of Work** (Video/Screenshots) showing Google Auth functioning in the local environment.

## Consequences
- **Positive:** Reduces debugging time on infrastructure issues outside the project's core scope (AI analysis logic). ensuring the defense focuses on the working features.
- **Negative:** Users cannot use Google Sign-In on the live deployment.
- **Mitigation:** The login page clearly offers Email/Password Registration, which is fully functional.

## Proof of Implementation
Video evidence of the working Google Auth flow in the local environment has been recorded and archived.
