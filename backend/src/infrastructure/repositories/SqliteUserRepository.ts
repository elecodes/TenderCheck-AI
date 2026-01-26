import type { UserRepository } from "../../domain/repositories/UserRepository.js";
import type { User } from "../../domain/entities/User.js";
import { SqliteDatabase } from "../database/SqliteDatabase.js";
import Database from "better-sqlite3";

export class SqliteUserRepository implements UserRepository {
  private db: Database.Database;

  constructor() {
    this.db = SqliteDatabase.getInstance();
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = this.db
      .prepare("SELECT * FROM users WHERE email = ?")
      .get(email) as any;

    if (!row) return null;

    return {
      id: row.id,
      email: row.email,
      passwordHash: row.password_hash,
      name: row.name,
      company: row.company || undefined,
      createdAt: row.created_at ? new Date(row.created_at) : new Date(),
    } as User;
  }

  async findById(id: string): Promise<User | null> {
    const row = this.db
      .prepare("SELECT * FROM users WHERE id = ?")
      .get(id) as any;

    if (!row) return null;

    return {
      id: row.id,
      email: row.email,
      passwordHash: row.password_hash,
      name: row.name,
      company: row.company || undefined,
      createdAt: row.created_at ? new Date(row.created_at) : new Date(),
    } as User;
  }

  async save(user: User): Promise<void> {
    this.db
      .prepare(
        "INSERT INTO users (id, email, password_hash, name, company, created_at) VALUES (?, ?, ?, ?, ?, ?)",
      )
      .run(
        user.id,
        user.email,
        user.passwordHash,
        user.name,
        user.company || null,
        user.createdAt
          ? user.createdAt.toISOString()
          : new Date().toISOString(),
      );
  }
}
