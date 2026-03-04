# 27. Auth Header Fallback Strategy

Date: 2026-03-04

## Status

Accepted

## Context

The application uses an HTTP-only cookie strategy for authentication to enhance security and prevent XSS attacks from easily stealing tokens. However, in certain cloud deployment environments (specifically Render) and cross-domain scenarios, strict browser cookie policies (SameSite, Secure) can prevent cookies from being reliably sent to the backend.

This resulted in a critical issue where validly logged-in users were not redirected to the dashboard because the frontend API calls failed to authenticate, despite the presence of a valid session.

## Decision

We have decided to implement a **Hybrid Authentication Strategy** in the frontend:

1.  **Primary Method**: Continue to use HTTP-only cookies for persistence and security.
2.  **Fallback Method**: Explicitly include the `Authorization: Bearer <token>` header in all API requests made by the frontend service.
3.  **Token Storage**: The `auth_token` is stored in `localStorage` upon successful login (in addition to the cookie being set). This token is retrieved and added to the headers of subsequent requests.

## Consequences

### Positive
*   **Reliability**: Authentication works reliably across different hosting environments and domain configurations (e.g., frontend on Netlify/Vercel, backend on Render).
*   **Resilience**: Users are not blocked from using the application if their browser or network environment strips cookies.
*   **Compatibility**: Aligns with standard JWT-based authentication patterns while keeping the security benefits of cookies where possible.

### Negative
*   **Redundancy**: The token is sent twice (in cookie and header) when cookies are working correctly.
*   **XSS Risk**: Storing the token in `localStorage` makes it accessible to JavaScript, theoretically increasing exposure to XSS attacks compared to *only* using HTTP-only cookies. However, this is a standard industry compromise for SPA architectures, and we verify XSS mitigation via other means (sanitization, CSP).

## Implementation

*   Modified `frontend/src/services/api.ts` to retrieve `auth_token` from `localStorage`.
*   Updated `getFetchOptions`, `uploadTender`, and `validateProposal` to include `Authorization: Bearer ${token}`.
