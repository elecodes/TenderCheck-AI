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
| `GOOGLE_API_KEY` | Standard Google AI Key | `AIza...` |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth Client ID | `123...apps.googleusercontent.com` |
| `VITE_API_BASE_URL` | Backend URL (Important for Auth) | `https://tendercheck-backend.onrender.com` |
| `JWT_SECRET` | Secret for verifying tokens | `any_long_random_string` |
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

## 6. Gemini API Pricing & Tiers 🤖💰

This project is compatible with the **Google AI Studio Free Tier**. However, your specific cost will depend on your project's configuration:

### 1. Free Tier (Zero Cost)
- **Conditions**: Your Google Cloud project **must not** have a billing account attached.
- **Limits**: Lower rate limits (e.g., 15 requests per minute).
- **Data Policy**: Google may use your data to improve their models.

### 2. Pay-as-you-go Tier (Paid)
- **Condition**: If you link a **Credit Card / Billing Account** to your Google Cloud Project, it automatically switches to the paid tier.
- **Costs**: You are charged per 1M characters (input/output). This is what causes the €0.35 charges seen in reports.
- **Data Policy**: Your data is **private** and not used for model training.

> [!WARNING]
> If you see charges in your Google Cloud report (like "Gemini API Output Tokens"), it means your project is in the **Pay-as-you-go** tier. To avoid this, ensure no billing account is linked to your `gen-lang-client-...` project in the [GCP Billing Console](https://console.cloud.google.com/billing).

---

## 7. Troubleshooting
If the backend fails to start, check the "Logs" tab in Render.
*   **"Table not found"**: Ensure `SqliteDatabase.initializeSchema()` ran correctly (it should run automatically on startup).
*   **CORS Errors**:
    *   Verify `ALLOWED_ORIGINS` in Render environment matches your frontend URL (e.g., `https://your-app.onrender.com` or `https://tendercheck.elecodes.online`).
    *   **Allowed Headers**: If seeing CORS errors on "Hard Reload", ensure backend allows `Cache-Control`, `Pragma`, and `Expires`.
*   **"Google Auth Error: redirect_uri_mismatch"**:
    1.  Go to [Google Cloud Console > Credentials](https://console.cloud.google.com/apis/credentials).
    2.  Edit your OAuth 2.0 Client ID.
    3.  Under **Authorized JavaScript origins**, ADD your Vercel URL (e.g., `https://tendercheckai.elecodes.online`).
    4.  Under **Authorized redirect URIs**, ADD the same URL (just in case).
    5.  **Wait 5 minutes** (Google takes time to propagate changes).

**Enjoy your scalable, cloud-native AI app!** 🚀

---

## 8. Deployment to Vercel (Frontend & Custom Domains) 🚀

If you want better performance and custom subdomains (like `tendercheck.elecodes.online`), Vercel is the recommended choice for the frontend.

### Steps:
1.  **Import to Vercel**: Connect your GitHub repository.
2.  **Project Configuration**:
    - **Framework Preset**: `Vite` (automatically detected).
    - **Root Directory**: `frontend/`
    - **Build Command**: `npm run build`
    - **Output Directory**: `dist`
3.  **Environment Variables**:
    - `VITE_GOOGLE_CLIENT_ID`: Your Client ID from Google Cloud Console.
    - `VITE_ENABLE_GOOGLE_AUTH`: Set to `true` to enable the Google login button.
    - `VITE_API_BASE_URL`: The URL of your **Backend on Render** (e.g., `https://tendercheck-backend.onrender.com`).
4.  **Custom Domain**:
    - Go to **Settings > Domains** and add your subdomain (e.g., `tendercheckai.elecodes.online`).
    - Follow Vercel's instructions to add a **CNAME** record in your DNS provider (Namecheap, etc.):
        - **Type**: `CNAME`
        - **Name**: `tendercheckai`
        - **Value**: `cname.vercel-dns.com`

### Google Cloud Console (OAuth)
- Go to [Google Cloud Console > Credentials](https://console.cloud.google.com/apis/credentials).
- Edit your OAuth 2.0 Client ID.
- **Authorized JavaScript origins**: Add `https://tendercheckai.elecodes.online` and `https://tender-check-ai.vercel.app`.
- **Authorized redirect URIs**: Add `https://tendercheckai.elecodes.online` and `https://tender-check-ai.vercel.app`.
- **Wait 5 minutes** for propagation.

### Backend CORS Settings
- Go to your **Render Backend** settings.
- Add `https://tendercheckai.elecodes.online` and `https://tender-check-ai.vercel.app` to the `ALLOWED_ORIGINS` environment variable (comma-separated).
- If you don't do this, login and API calls will fail.

### SPA Routing
El archivo `frontend/vercel.json` incluido en esta rama maneja los *rewrites* automáticamente para que las rutas de React funcionen al recargar la página.
