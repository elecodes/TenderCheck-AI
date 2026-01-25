import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../../domain/errors/AppError.js";
import { JWT_SECRET_FALLBACK } from "../../config/constants.js";

// Extend Express Request to include user
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role?: string;
      };
    }
  }
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next(new AppError("No authorization token provided", 401));
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return next(new AppError("Token error: invalid format", 401));
  }

  const token = parts[1];

  try {
    const secret: string = process.env.JWT_SECRET || JWT_SECRET_FALLBACK;

    const decoded = jwt.verify(
      token as string,
      secret as string,
    ) as unknown as {
      userId: string;
      email: string;
      role?: string;
    };

    req.user = decoded;
    next();
  } catch (error) {
    console.error("JWT Verification failed:", (error as Error).message);
    return next(new AppError("Invalid or expired token", 401));
  }
};
