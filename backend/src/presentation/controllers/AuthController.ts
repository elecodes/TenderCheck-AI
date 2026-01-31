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

      this.setCookie(res, token);

      res.status(HTTP_STATUS.CREATED).json({
        message: "User registered successfully",
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
        rememberMe: z.boolean().optional(),
      });

      const { email, password, rememberMe } = schema.parse(req.body);

      const { token, user } = await this.authService.login(email, password);

      this.setCookie(res, token, rememberMe);

      res.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          company: user.company,
        },
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        next(AppError.badRequest("Invalid email or password format"));
      } else {
        next(error);
      }
    }
  };

  logout = async (req: Request, res: Response) => {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
    res.json({ message: "Logged out successfully" });
  };

  getMe = async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    res.json({ user: req.user });
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

      this.setCookie(res, token, true); // Assume implicit Remember Me for Google

      res.json({
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

  private setCookie(res: Response, token: string, rememberMe: boolean = false) {
    const options: any = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // HTTPS in prod
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    };

    if (rememberMe) {
      options.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
    }

    res.cookie("token", token, options);
  }
}
