import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { SALT_ROUNDS, JWT_SECRET_FALLBACK } from "../../config/constants.js";
import type { User } from "../../domain/entities/User.js";
import type { UserRepository } from "../../domain/repositories/UserRepository.js";
import { v4 as uuidv4 } from "uuid";

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
    const googleResponse = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    if (!googleResponse.ok) {
      throw new Error("Invalid Google Token");
    }

    const googleUser = (await googleResponse.json()) as any;

    if (!googleUser.email) {
      throw new Error("Google account must have an email");
    }

    // 2. Find or Create User
    const normalizedEmail = googleUser.email.toLowerCase();
    let user = await this.userRepository.findByEmail(normalizedEmail);

    if (!user) {
      user = {
        id: uuidv4(),
        email: normalizedEmail,
        name: googleUser.name || "Google User",
        // Set unguessable password for Google-only accounts
        passwordHash: await bcrypt.hash(uuidv4(), SALT_ROUNDS),
        createdAt: new Date(),
      };
      await this.userRepository.save(user);
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
