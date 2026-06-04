# ADR 038: Hybrid Deployment — Vercel (Frontend) + Render (Backend)

**Status:** Accepted  
**Date:** 2026-04-15

## Context
After evaluating a full migration to Vercel, we decided to keep the backend on Render due to its simplicity for Node.js server deployment and the additional configuration required for Vercel serverless functions.

## Decision
Maintain a hybrid architecture:
- **Frontend**: Vercel (Global CDN) — https://tendercheckai.elecodes.online/
- **Backend**: Render (Web Service) — https://tendercheck-backend.onrender.com

## Consequences
- **Pros:**
  - Frontend benefits from Vercel's CDN and instant cold starts
  - Backend remains a simple Node.js process (no serverless adaptation needed)
  - Custom domain on frontend (elecodes.online)

- **Cons:**
  - Two platforms to manage
  - Render backend has cold start delay on free tier
  - CORS requires `ALLOWED_ORIGINS` pointing to Vercel domain
  - Environment variables must be set in **both** platforms

## Critical Configuration
### Vercel (Frontend)
- `VITE_API_BASE_URL`: `https://tendercheck-backend.onrender.com`
- `VITE_GOOGLE_CLIENT_ID`: Google OAuth Client ID

### Render (Backend)
- `TURSO_DB_URL`: `https://...turso.io`
- `TURSO_AUTH_TOKEN`: Turso token
- `GOOGLE_GENAI_API_KEY`: Gemini API key
- `ALLOWED_ORIGINS`: Vercel domains
- `JWT_SECRET`: JWT signing secret

## References
- ADR 016 (original Render pivot)
- ADR 036 (Vercel frontend)