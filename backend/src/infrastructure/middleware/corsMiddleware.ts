import cors from "cors";
import { type Request, type Response, type NextFunction } from "express";

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];

const corsOptions: cors.CorsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void,
  ) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Check if origin is allowed
    // In Dev: Allow localhost variants if needed, or strictly follow var
    if (
      allowedOrigins.indexOf(origin) !== -1 ||
      process.env.NODE_ENV !== "production"
    ) {
      if (process.env.NODE_ENV === "production" && allowedOrigins.indexOf(origin) === -1) {
         // Log warning for non-matching origin in production even if we allowed it via some fallback logic (logic below allows all currently)
         // Actually, strict logic above says: if NOT in list AND production -> FAIL.
         // That matches our requirement.
         // We can add a debug log here if needed.
      }
      callback(null, true);
    } else {
      console.warn(`[CORS] Blocked Origin: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true, // Required for cookies/sessions if used, and for standard Token exchange
};

export const corsMiddleware = cors(corsOptions);
