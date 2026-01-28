import type { Request, Response } from "express";
import { AuthService } from "../../application/services/AuthService.js";
import { z } from "zod";
import { HTTP_STATUS, PASSWORD_MIN_LENGTH } from "../../config/constants.js";

export class AuthController {
  constructor(private authService: AuthService) {}

  register = async (req: Request, res: Response) => {
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
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json({ error: "Validation Error", details: (error as any).errors });
      } else {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json({ error: (error as Error).message });
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
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          company: user.company,
        },
      });
    } catch (error: any) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({ error: error.message });
    }
  };

  requestPasswordReset = async (req: Request, res: Response) => {
    try {
      const schema = z.object({ email: z.string().email() });
      const { email } = schema.parse(req.body);

      await this.authService.requestPasswordReset(email);

      // Always return success to prevent user enumeration
      res
        .status(HTTP_STATUS.OK)
        .json({ message: "If email exists, instructions have been sent." });
    } catch (error: any) {
      // Even validation errors can be generic depending on strictness, but usually format errors are ok to return
      res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Invalid request" });
    }
  };

  googleLogin = async (req: Request, res: Response) => {
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
      console.error("Google Login Error:", error);
      res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ error: "Google authentication failed", details: error.message });
    }
  };
}
