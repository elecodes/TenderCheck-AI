# ADR 007: Security Hardening Strategy (Defense in Depth)

**Date**: 2026-01-25
**Status**: Accepted

## Context
As a system handling public tender documents ("Pliegos"), strict security is non-negotiable. Initial MVP implementation lacked robust protection against common vectors like brute-force attacks, malicious file uploads, and weak credentials.

## Decision
We have adopted a **Defense-in-Depth** strategy covering multiple layers:

1.  **Network/Transport Layer**:
    *   **Rate Limiting**: Implemented `express-rate-limit` on `/api/auth/login`. Policy: Max 3 attempts per 15 minutes to block brute-force.
    *   **Secure Headers**: Enforced via `Helmet.js` (CSP, HSTS).
    *   **CORS**: Strict allowed origins from `.env`.

2.  **Input Validation Layer**:
    *   **File Uploads**: Double validation for PDF ingestion.
        *   *Layer 1 (Multer)*: `fileFilter` rejects non-PDF MIME types immediately.
        *   *Layer 2 (Controller)*: `Zod` validates file structure and size (Max 50MB) before business logic execution.
    *   **Password Complexity**: Enforced Min 8 chars, 1 Uppercase, 1 Number, 1 Special Char via Zod Regex.

3.  **Observability & Compliance**:
    *   **Sentry**: Integrated for real-time error tracking (Backend + Frontend).
    *   **Snyk**: Added dependency vulnerability scanning (`npm run security:scan`).
    *   **Husky**: Pre-commit hooks enforce `lint` and `test` to prevent bad code from entering the repo.

## Consequences
### Positive
-   **OWASP Compliance**: Mitigates Top 10 risks (Broken Auth, Security Misconfig, Vulnerable Components).
-   **Resilience**: Service cannot be easily DoS'd via login flooding.
-   **Trust**: User data and uploaded documents are handled with rigor.

### Negative
-   **UX Friction**: Strong passwords and strict file types might annoy some legitimate users (mitigated via clear UI hints).
-   **Dev Friction**: Pre-commit hooks slow down the commit process slightly (trade-off for quality).
