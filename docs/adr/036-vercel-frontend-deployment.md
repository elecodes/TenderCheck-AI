# ADR 036: Vercel Frontend Deployment

## Status
Accepted

## Context
We initially deployed the entire application (frontend and backend) on Render. However, to improve frontend performance, take advantage of Vercel's global CDN, and use a custom subdomain (`tendercheckai.elecodes.online`), we decided to move the frontend to Vercel while keeping the backend and database on Render/Turso. This also solves the "sleep" issue for the UI, as Vercel is always active, even if the backend needs a few seconds to wake up.

## Decision
Deploy the React frontend on Vercel using the following configuration:
1.  **SPA Routing**: Use `vercel.json` with a rewrite rule to redirect all non-file requests to `index.html`.
2.  **Environment Variables**: 
    - `VITE_API_BASE_URL`: Pointing to the Render backend (`https://tendercheck-backend.onrender.com`).
    - `VITE_GOOGLE_CLIENT_ID`: For OAuth.
    - `VITE_ENABLE_GOOGLE_AUTH`: A feature flag to control the visibility of the Google login button. This allows us to disable the button if the OAuth quota is exceeded or if maintenance is required without rebuilding the app.
3.  **Cross-Origin Configuration**: Update the Render backend's `ALLOWED_ORIGINS` to include:
    - `https://tendercheckai.elecodes.online`
    - `https://tender-check-ai.vercel.app`
4.  **Google OAuth**: Register the new Vercel URLs in the Google Cloud Console as authorized origins and redirect URIs.
5.  **DNS Configuration**: Set up a `CNAME` record for `tendercheckai` pointing to `cname.vercel-dns.com`.

## Consequences
- **Improved Performance**: Frontend assets are served via Vercel's Edge Network, ensuring instant initial load.
- **Better UX**: The UI is always available, providing immediate feedback even if the backend is currently scaling up.
- **Custom Branding**: Professional subdomain under `elecodes.online`.
- **Complexity**: We now manage two deployment platforms (Vercel for frontend, Render for backend).
- **Security**: CORS must be explicitly managed to allow communication between the two platforms.
- **Cost**: Both Vercel and Render have generous free tiers that fit our current needs.
