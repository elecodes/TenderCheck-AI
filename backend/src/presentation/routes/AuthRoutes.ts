import { Router } from 'express';
import { AuthController } from '../controllers/AuthController.js';
import { AuthService } from '../../application/services/AuthService.js';
import { InMemoryUserRepository } from '../../infrastructure/repositories/InMemoryUserRepository.js';

const router = Router();

// Singleton instances (for now, simplistic Dependency Injection)
// Note: In a real app with multiple instances, these should be managed by a DI container or exported/instantiated in server.ts
// For the InMemoryRepository to persist across requests in this Node process, we must instantiate it once.
export const userRepository = new InMemoryUserRepository(); 
const authService = new AuthService(userRepository);
const authController = new AuthController(authService);

router.post('/register', authController.register);
router.post('/login', authController.login);

export default router;
