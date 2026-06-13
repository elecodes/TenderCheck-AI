import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { SALT_ROUNDS, JWT_SECRET_FALLBACK } from "../../config/constants.js";
import type { User } from "../../domain/entities/User.js";
import type { UserRepository } from "../../domain/repositories/UserRepository.js";
import { v4 as uuidv4 } from "uuid";
import { AppError } from "../../domain/errors/AppError.js";

export class AuthService {
  constructor(private userRepository: UserRepository) {}

  async register(
    name: string,
    email: string,
    password: string,
    company?: string,
  ): Promise<User> {
    const normalizedEmail = email.toLowerCase();
    const existingUser = await this.userRepository.findByEmail(normalizedEmail);
    if (existingUser) {
      throw new Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const newUser = {
      id: uuidv4(),
      name,
      email: normalizedEmail,
      passwordHash: hashedPassword,
      company: company || undefined,
      createdAt: new Date(),
    } as User;

    await this.userRepository.save(newUser);
    return newUser;
  }

  async login(
    email: string,
    password: string,
  ): Promise<{ token: string; user: User }> {
    const normalizedEmail = email.toLowerCase();
    const user = await this.userRepository.findByEmail(normalizedEmail);
    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || JWT_SECRET_FALLBACK,
      {
        expiresIn: "1d",
      },
    );

    return { token, user };
  }

  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      // Security: Do not reveal user does not exist (Timing attack mitigation is strictly next level, but at least don't throw)
      return;
    }

    // MOCK EMAIL SERVICE
    const resetToken = uuidv4();
    console.log(
      `[MOCK EMAIL] Password reset requested for ${email}. Token: ${resetToken}`,
    );
    console.log(
      `[MOCK EMAIL] Link: http://localhost:5173/reset-password?token=${resetToken}`,
    );

    // In a real app, save token to DB and send email
  }

  async loginWithGoogleCode(
    code: string,
    codeVerifier: string,
  ): Promise<{ token: string; user: User }> {
    const clientId = (
      process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID
    )?.trim();
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();

    if (!clientId || !clientSecret) {
      throw new AppError("Google OAuth not configured", 500);
    }

    // 1. Exchange authorization code for tokens
    const isLocal = process.env.NODE_ENV !== "production";
    const redirectUri = isLocal
      ? "http://localhost:3000"
      : "https://tendercheckai.elecodes.online";

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
        code_verifier: codeVerifier,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("❌ [AuthService] Google Token Exchange Error:", errorText);
      throw new AppError("Failed to exchange authorization code", 401);
    }

    const tokenData = (await tokenResponse.json()) as any;
    console.log("✅ [AuthService] Google token exchange successful");

    // 2. Extract user info from ID token (JWT from Google)
    let googleUser: any;
    if (tokenData.id_token) {
      const payloadBase64 = tokenData.id_token.split(".")[1];
      const payloadJson = Buffer.from(payloadBase64, "base64").toString(
        "utf-8",
      );
      googleUser = JSON.parse(payloadJson);
    } else {
      // Fallback: use access token to fetch userinfo
      const userInfoResponse = await fetch(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        { headers: { Authorization: `Bearer ${tokenData.access_token}` } },
      );
      if (!userInfoResponse.ok) {
        throw new AppError("Failed to get user info from Google", 401);
      }
      googleUser = await userInfoResponse.json();
    }

    console.log(
      "✅ [AuthService] Google User Info received for:",
      googleUser.email,
    );

    if (!googleUser.email) {
      throw new AppError("Google account must have an email", 400);
    }

    // 3. Find or Create User
    const user = await this.findOrCreateGoogleUser(googleUser);

    // 4. Issue Token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || JWT_SECRET_FALLBACK,
      { expiresIn: "1d" },
    );

    return { token, user };
  }

  // Shared helper for both loginWithGoogle and loginWithGoogleCode
  private async findOrCreateGoogleUser(googleUser: any): Promise<User> {
    const normalizedEmail = googleUser.email.toLowerCase();
    let user = await this.userRepository.findByEmail(normalizedEmail);

    if (!user) {
      console.log(
        "👤 [AuthService] Creating new Google user:",
        normalizedEmail,
      );
      user = {
        id: uuidv4(),
        email: normalizedEmail,
        name: googleUser.name || "Google User",
        passwordHash: await bcrypt.hash(uuidv4(), SALT_ROUNDS),
        createdAt: new Date(),
      };
      try {
        await this.userRepository.save(user);
      } catch (dbError: any) {
        console.error("💥 [AuthService] User Save Error:", dbError);
        throw new AppError(`Failed to save user: ${dbError.message}`, 500);
      }
    }

    return user;
  }
}
