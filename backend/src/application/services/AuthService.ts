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

  async loginWithGoogle(
    accessToken: string,
  ): Promise<{ token: string; user: User }> {
    // 1. Get User Info from Google
    console.log('📡 [AuthService] Fetching Google user info...');
    let googleResponse;
    try {
      googleResponse = await fetch(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );
    } catch (fetchError: any) {
      console.error('💥 [AuthService] Google Fetch CRASH:', fetchError);
      throw new AppError(`Google API connection failed: ${fetchError.message}`, 502);
    }

    if (!googleResponse.ok) {
      const errorText = await googleResponse.text();
      console.error('❌ [AuthService] Google API Error:', errorText);
      throw new AppError("Invalid Google Token or Session Expired", 401);
    }

    const googleUser = (await googleResponse.json()) as any;
    console.log('✅ [AuthService] Google User Info received for:', googleUser.email);

    if (!googleUser.email) {
      throw new AppError("Google account must have an email", 400);
    }

    // 2. Find or Create User
    const normalizedEmail = googleUser.email.toLowerCase();
    let user = await this.userRepository.findByEmail(normalizedEmail);

    if (!user) {
      console.log('👤 [AuthService] Creating new Google user:', normalizedEmail);
      user = {
        id: uuidv4(),
        email: normalizedEmail,
        name: googleUser.name || "Google User",
        // Set unguessable password for Google-only accounts
        passwordHash: await bcrypt.hash(uuidv4(), SALT_ROUNDS),
        createdAt: new Date(),
      };
      try {
        await this.userRepository.save(user);
      } catch (dbError: any) {
        console.error('💥 [AuthService] User Save Error:', dbError);
        throw new AppError(`Failed to save user: ${dbError.message}`, 500);
      }
    }

    // 3. Issue Token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || JWT_SECRET_FALLBACK,
      { expiresIn: "1d" },
    );

    return { token, user };
  }
}
