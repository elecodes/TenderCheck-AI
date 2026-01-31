import type { Request, Response, NextFunction } from "express";
import { AuthService } from "../../application/services/AuthService.js";
import { z } from "zod";
import { HTTP_STATUS, PASSWORD_MIN_LENGTH } from "../../config/constants.js";
import { AppError } from "../../domain/errors/AppError.js";

export class AuthController {
  constructor(private authService: AuthService) {}

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = z.object({
        name: z.string().min(2),
        email: z.string().email(),
        password: z
          .string()
          .min(PASSWORD_MIN_LENGTH, "Password must be at least 8 characters")
          .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
          .regex(/[0-9]/, "Password must contain at least one number")
          .regex(
            /[^a-zA-Z0-9]/,
            "Password must contain at least one special character",
          ),
        company: z.string().optional(),
      });

      const { name, email, password, company } = schema.parse(req.body);

      const user = await this.authService.register(
        name,
        email,
        password,
        company,
      );

      // Generate token for auto-login after registration
      const { token } = await this.authService.login(email, password);

      res.status(HTTP_STATUS.CREATED).json({
        message: "User registered successfully",
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          company: user.company,
        },
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        next(
          AppError.badRequest(
            `Validation Error: ${error.errors.map((e) => e.message).join(", ")}`,
          ),
        );
      } else {
        next(error);
      }
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = z.object({
        email: z.string().email(),
        password: z.string(),
      });

      const { email, password } = schema.parse(req.body);

      const { token, user } = await this.authService.login(email, password);
      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          company: user.company,
        },
      });
    } catch (error: any) {
      // AuthService throws specific errors usually, but if Zod fails:
      if (error instanceof z.ZodError) {
        next(AppError.badRequest("Invalid email or password format"));
      } else {
        next(error);
      }
    }
  };

  requestPasswordReset = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const schema = z.object({ email: z.string().email() });
      const { email } = schema.parse(req.body);

      await this.authService.requestPasswordReset(email);

      // Always return success to prevent user enumeration
      res
        .status(HTTP_STATUS.OK)
        .json({ message: "If email exists, instructions have been sent." });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        next(AppError.badRequest("Invalid email format"));
      } else {
        next(error);
      }
    }
  };

  googleLogin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = z.object({ token: z.string() });
      const { token: accessToken } = schema.parse(req.body);

      const { token, user } =
        await this.authService.loginWithGoogle(accessToken);

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          company: user.company,
        },
      });
    } catch (error: any) {
      next(error);
    }
  };
}
