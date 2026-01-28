import { Router } from "express";
import rateLimit from "express-rate-limit";
import { AuthController } from "../controllers/AuthController.js";
import { AuthService } from "../../application/services/AuthService.js";
import { TursoUserRepository } from "../../infrastructure/repositories/TursoUserRepository.js";
import { AppError } from "../../domain/errors/AppError.js";
import type { Request, Response, NextFunction } from "express";

const router = Router();

// DI Configuration (Simple Manual Injection)
// In a larger app, use a DI container like Inversify
// export const userRepository = new InMemoryUserRepository();
export const userRepository = new TursoUserRepository();
const authService = new AuthService(userRepository);
const authController = new AuthController(authService);

import {
  RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_MAX_ATTEMPTS,
} from "../../config/constants.js";

const loginLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: RATE_LIMIT_MAX_ATTEMPTS,
  message: {
    error: "Too many login attempts, please try again after 15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/register", authController.register);
router.post("/login", loginLimiter, authController.login);
router.post("/google", loginLimiter, authController.googleLogin);
router.post("/reset-password-request", authController.requestPasswordReset);

export default router;
