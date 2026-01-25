import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import type { User } from '../../domain/entities/User';
import type { UserRepository } from '../../domain/repositories/UserRepository.js';
import { v4 as uuidv4 } from 'uuid';

export class AuthService {
  constructor(private userRepository: UserRepository) {}

  async register(name: string, email: string, password: string, company?: string): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser: User = {
      id: uuidv4(),
      name,
      email,
      passwordHash,
      company,
      createdAt: new Date(),
    };

    await this.userRepository.save(newUser);
    return newUser;
  }

  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'super_secret_jwt_key', {
      expiresIn: '1d',
    });

    return { token, user };
  }
}
