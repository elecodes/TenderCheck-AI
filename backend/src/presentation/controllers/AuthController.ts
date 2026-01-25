import type { Request, Response } from 'express';
import { AuthService } from '../../application/services/AuthService.js';
import { z } from 'zod';

export class AuthController {
  constructor(private authService: AuthService) {}

  register = async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        name: z.string().min(2),
        email: z.string().email(),
        password: z.string().min(6),
        company: z.string().optional(),
      });

      const { name, email, password, company } = schema.parse(req.body);

      const user = await this.authService.register(name, email, password, company);
      res.status(201).json({ 
        message: 'User registered successfully',
        user: { id: user.id, email: user.email, name: user.name } 
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Validation Error', details: error.errors });
      } else {
        res.status(400).json({ error: error.message });
      }
    }
  };

  login = async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        email: z.string().email(),
        password: z.string(),
      });

      const { email, password } = schema.parse(req.body);

      const { token, user } = await this.authService.login(email, password);
      res.json({ 
        token, 
        user: { id: user.id, email: user.email, name: user.name, company: user.company } 
      });
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  };
}
