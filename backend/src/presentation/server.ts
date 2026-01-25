import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";

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

app.use("/api/tenders", tenderRouter);
app.use("/api/auth", authRouter);

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
  const PORT = process.env.PORT || DEFAULT_PORT;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
