import { Router } from "express";
import rateLimit from "express-rate-limit";
import { AuthController } from "../controllers/AuthController.js";
import { AuthService } from "../../application/services/AuthService.js";
import { SqliteUserRepository } from "../../infrastructure/repositories/SqliteUserRepository.js";

const router = Router();

// Singleton instances (for now, simplistic Dependency Injection)
// Note: In a real app with multiple instances, these should be managed by a DI container or exported/instantiated in server.ts
// For the InMemoryRepository to persist across requests in this Node process, we must instantiate it once.
export const userRepository = new SqliteUserRepository();
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
