import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import { SqliteDatabase } from "../infrastructure/database/SqliteDatabase.js";

// Initialize Database Schema (Async)
// This will connect to Turso and ensure tables exist
(async () => {
  try {
    await SqliteDatabase.initializeSchema();
  } catch (e) {
    console.error("Failed to initialize database schema:", e);
    // We might want to exit here if DB is critical
  }
})();

// Environment variable validation can be improved later with a dedicated config,
// strictly using process.env here as per the "Secure Defaults" directive.

const app = express();

// 2. Security Middleware (Relaxed for Hugging Face Spaces Iframe)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Needed for Vite/React
        connectSrc: ["'self'", "https://huggingface.co", "https://*.hf.space"],
        imgSrc: ["'self'", "data:", "blob:"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "data:", "https://fonts.gstatic.com"],
        frameAncestors: ["'self'", "https://huggingface.co"], // Allow embedding in HF
      },
    },
    crossOriginEmbedderPolicy: false,
    frameguard: false, // Disable X-Frame-Options to allow iframe embedding
  }),
);

// 3. Observability: Sentry
import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [nodeProfilingIntegration()],
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
});

// Secure Header Logic
app.disable("x-powered-by");

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.indexOf(origin) !== -1 ||
        process.env.NODE_ENV !== "production"
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Body parsing
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Health Check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// Centralized Error Handler
import { globalErrorHandler } from "../infrastructure/middleware/errorHandler.js";
import { tenderRouter } from "./routes/TenderRoutes.js";
import authRouter from "./routes/AuthRoutes.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Core API Routes
app.use("/api/tenders", tenderRouter);
app.use("/api/auth", authRouter);

// Serve Frontend Static Files (Production/Docker)
// In Docker: /app/backend/dist/presentation/server.js -> ../../../frontend/dist
const frontendPath = join(__dirname, "../../../frontend/dist");
app.use(express.static(frontendPath));

// SPA Fallback: Send index.html for any unknown non-API route
app.get(/.*/, (req, res, next) => {
  if (req.path.startsWith("/api")) {
    return next();
  }
  res.sendFile(join(frontendPath, "index.html"));
});

// Sentry: Manual Capture Middleware before global handler
app.use(
  (
    err: unknown,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    Sentry.captureException(err);
    next(err);
  },
);

app.use(globalErrorHandler);

export { app };

import { DEFAULT_PORT } from "../config/constants.js";

if (import.meta.url === `file://${process.argv[1]}`) {
  const PORT = parseInt(process.env.PORT || DEFAULT_PORT.toString());
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}
