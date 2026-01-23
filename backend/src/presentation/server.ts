import express from "express";
import helmet from "helmet";
import cors from "cors";
import { z } from "zod";

// Environment variable validation can be improved later with a dedicated config,
// strictly using process.env here as per the "Secure Defaults" directive.

const app = express();

// 2. Secure Defaults: Always include Helmet.js
app.use(helmet());

// 3. Observability: Sentry
import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [nodeProfilingIntegration()],
  tracesSampleRate: 1.0, // Adjust for production
  profilesSampleRate: 1.0,
});

// app.use(Sentry.Handlers.requestHandler());
// app.use(Sentry.Handlers.tracingHandler());

// Secure Header Logic (Custom overrides if needed, Helmet covers most OWASP recommendations via CSP/HSTS etc)
// For example, strictly unrelated to Helmet but good practice:
app.disable("x-powered-by");

// CORS configuration - strict defaults or dev mode
// "Zero-Trust" for origins - allow specific or none by default
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.indexOf(origin) !== -1 ||
        process.env.NODE_ENV !== "production"
      ) {
        // In dev, we might be more permissive, but for "Secure Defaults" we should be careful.
        // For now, allowing localhost in dev is implicit if NODE_ENV is not production.
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Body parsing with limits to prevent DoS
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Health Check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// Centralized Error Handler
import { globalErrorHandler } from "../infrastructure/middleware/errorHandler.js";
import { tenderRouter } from "./routes/TenderRoutes.js";

app.use("/api/tenders", tenderRouter);
app.use(globalErrorHandler);

export { app };

if (import.meta.url === `file://${process.argv[1]}`) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
