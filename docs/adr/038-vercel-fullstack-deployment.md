# ADR 038: Full Stack Vercel Deployment

**Status:** Accepted  
**Date:** 2026-04-15

## Context
The application was initially deployed with frontend on Vercel and backend on Render. This caused:
- Cold start delays on Render backend
- Two separate deployment platforms to manage
- Complexity in orchestration

## Decision
Migrate the entire stack (frontend + backend) to Vercel.

## Consequences
- **Pros:**
  - Single deployment platform
  - Faster cold starts
  - Unified domain: https://tendercheckai.elecodes.online/
  - Simpler CI/CD

- **Cons:**
  - Need to configure Vercel for API routes (`VERCEL_PREPATH`)
  - May need to adjust build configuration

## References
- ADR 016 (original Render pivot)
- ADR 036 (Vercel frontend)