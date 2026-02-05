import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import { TursoDatabase } from "../infrastructure/database/TursoDatabase.js";
import cookieParser from "cookie-parser";

// Initialize Database Schema (Async)
// This will connect to Turso and ensure tables exist
(async () => {
  try {
    await TursoDatabase.initializeSchema();
  } catch (e) {
    console.error("Failed to initialize database schema:", e);
    // We might want to exit here if DB is critical
  }
})();

// Environment variable validation can be improved later with a dedicated config,
// strictly using process.env here as per the "Secure Defaults" directive.

// 1. Trust Proxy (Required for Render/Cloudflare)
// Moved after app init below

const app = express();
app.set("trust proxy", 1); // Trust first proxy

// 2. Security Middleware (Redundant Header Control)
app.use(cookieParser());

app.use((_req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "unsafe-none");
  res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  res.setHeader("Referrer-Policy", "no-referrer-when-downgrade");
  next();
});

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'",
          "https://accounts.google.com",
          "https://apis.google.com",
          "https://content-compute.google.com",
          "https://ssl.gstatic.com",
          "https://www.gstatic.com",
        ], // Needed for Vite/React and Google Auth
        connectSrc: [
          "'self'",
          "https://accounts.google.com",
          "https://www.googleapis.com",
          "https://identitytoolkit.googleapis.com",
          "https://*.googleapis.com",
          "https://tendercheck-backend.onrender.com",
          "https://*.sentry.io",
        ],
        imgSrc: [
          "'self'",
          "data:",
          "blob:",
          "https://lh3.googleusercontent.com",
          "https://*.googleusercontent.com",
          "https://*.google.com",
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://fonts.googleapis.com",
          "https://www.gstatic.com",
          "https://*.googleapis.com",
        ],
        fontSrc: ["'self'", "data:", "https://fonts.gstatic.com"],
        frameAncestors: ["'self'"], // Reverted from Hugging Face domains
        frameSrc: [
          "'self'",
          "https://accounts.google.com",
          "https://content-compute.google.com",
          "https://*.google.com",
        ],
      },
    },
    referrerPolicy: { policy: "no-referrer-when-downgrade" },
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    frameguard: { action: "sameorigin" },
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
const corsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void,
  ) => {
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.indexOf(origin) !== -1 ||
      process.env.NODE_ENV !== "production" ||
      origin.includes("localhost") ||
      origin.includes("127.0.0.1")
    ) {
      callback(null, true);
    } else {
      console.warn(
        `[CORS] Blocked origin: ${origin}. Allowed: ${allowedOrigins.join(", ")}`,
      );
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.options("/*splat", cors(corsOptions)); // Enable Pre-Flight for all routes using Express 5 syntax

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

// Serve Frontend Static Files (Production/Docker) - DISABLED FOR RENDER BLUEPRINT
// The frontend is deployed as a separate Static Site service in Render.
// We only serve API routes here.

// 404 Handler for unknown API routes
app.use((req, res, next) => {
  res.status(404).json({ error: "Not Found" });
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
  console.log(`🚀 [Server] Initializing...`);
  console.log(`📡 [Server] Target Port: ${PORT}`);
  console.log(`🌍 [Server] Node Env: ${process.env.NODE_ENV}`);
  console.log(`🔐 [Server] JWT_SECRET present: ${!!process.env.JWT_SECRET}`);
  
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ [Server] Ready and listening on port ${PORT}`);
  });
}
