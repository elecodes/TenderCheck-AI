# ADR 010: Frontend Localization and Security Hardening

## Status
Accepted

## Context
The application targets the Spanish public procurement market ("Licitaciones Públicas"), requiring a fully localized interface. Additionally, security best practices (OWASP) dictate preventing User Enumeration attacks, and accessibility standards (WCAG 2.1 AA) require usable forms for all users.

## Decision
1.  **Full Spanish Localization**: All user-facing text (Landing Page, Auth Forms, Dashboard) has been translated to Spanish to align with the target audience.
    *   Terms: "Pliegos" (Tenders), "Ofertas" (Proposals), "Cumplimiento" (Compliance).
2.  **Security Hardening (Anti-Enumeration)**:
    *   **Registration**: Generic error message ("No se pudo crear la cuenta") instead of specific "User already exists".
    *   **Login**: Generic error message ("Credenciales inválidas") for all authentication failures.
3.  **Accessibility Improvements**:
    *   **Auto-focus**: Enabled on primary inputs to reduce friction.
    *   **Font Size**: Minimum 16px to prevent iOS zoom.
    *   **Focus Rings**: Enhanced visibility (`ring-2`, `emerald-400`) for keyboard navigation.

## Consequences
*   **Positives**:
    *   Improved user experience for Spanish-speaking officials.
    *   Reduced attack surface (no user enumeration).
    *   Compliance with accessibility standards.
*   **Negatives**:
    *   Debugging user issues might be slightly harder without specific error messages (mitigated by server-side logging).
