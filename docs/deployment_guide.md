# 🚀 Deployment Guide: Render + Turso + Gemini

## 1. Overview
This project uses a **Cloud-Native Architecture**:
*   **Frontend**: React (Vite) -> Deployed as **Static Site** on Render.
*   **Backend**: Node.js (Express) -> Deployed as **Web Service** on Render.
*   **Database**: **Turso** (LibSQL) -> Serverless SQLite.
*   **AI**: **Google Genkit** -> Gemini 2.5 Flash.

## 2. Prerequisites
*   [Render Account](https://render.com) (Free Tier is sufficient).
*   [Turso Account](https://turso.tech) (CLI installed).
*   [Google AI Studio Key](https://aistudio.google.com).

## 3. Deployment Steps (The "Blueprint" Way)
The easiest way to deploy is using the `render.yaml` Blueprint.

1.  **Push your code** to GitHub.
2.  **Go to Render Dashboard** -> Blueprints -> New Blueprint Instance.
3.  **Connect your Repo**.
4.  **env details**: Render will ask for these variables.

### Environment Variables
| Variable | Description | Example |
| :--- | :--- | :--- |
| `TURSO_DB_URL` | Turso Database Connection URL | `libsql://tendercheck-ai-ely.turso.io` |
| `TURSO_AUTH_TOKEN` | Turso Auth Token | `ey...` |
| `GOOGLE_GENAI_API_KEY` | Gemini API Key | `AIza...` |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth Client ID | `123...apps.googleusercontent.com` |
| `VITE_API_BASE_URL` | Backend URL (Important for Auth) | `https://tendercheck-backend.onrender.com` |
| `SENTRY_DSN` | (Optional) Sentry DSN | `https://...@sentry.io/...` |

## 4. Manual Deployment (Alternative)
If you prefer manual setup:

### Backend (Web Service)
*   **Build Command**: `cd backend && npm install && npm run build`
*   **Start Command**: `cd backend && npm start`
*   **Env Vars**: Add the variables above.

### Frontend (Static Site)
*   **Build Command**: `cd frontend && npm install && npm run build`
*   **Publish Directory**: `frontend/dist`
*   **Env Vars**: `VITE_GOOGLE_CLIENT_ID` needs to be set *during build*.

## 5. Render Free Tier & Lifecycle ⏳

**How it works:**
*   **Spin Down**: Your Backend (Web Service) will **"go to sleep"** after 15 minutes of inactivity to save resources.
*   **Spin Up**: The next time you (or a user) opens the URL, it will take **~50 seconds** to wake up. This is normal.
*   **750 Hours**: The Free Tier gives you 750 hours/month (enough for 24/7 if you only have one service, or plenty for testing).
*   **Database**: Turso is serverless and does *not* sleep (always fast).

## 6. Troubleshooting
If the backend fails to start, check the "Logs" tab in Render.
*   **"Table not found"**: Ensure `SqliteDatabase.initializeSchema()` ran correctly (it should run automatically on startup).
*   **"404 Models"**: If the AI fails, check that the `GOOGLE_GENAI_API_KEY` is correct and has access to `gemini-2.5-flash`.
*   **"Google Auth Error: redirect_uri_mismatch"**:
    1.  Go to [Google Cloud Console > Credentials](https://console.cloud.google.com/apis/credentials).
    2.  Edit your OAuth 2.0 Client ID.
    3.  Under **Authorized JavaScript origins**, ADD your Render URL (e.g., `https://tendercheck-frontend.onrender.com`).
    4.  Under **Authorized redirect URIs**, ADD the same URL (just in case).
    5.  **Wait 5 minutes** (Google takes time to propagate changes).

**Enjoy your scalable, cloud-native AI app!** 🚀
