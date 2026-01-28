import type { UserRepository } from "../../domain/repositories/UserRepository.js";
import type { User } from "../../domain/entities/User.js";
import { SqliteDatabase } from "../database/SqliteDatabase.js";
import type { Client } from "@libsql/client";

export class SqliteUserRepository implements UserRepository {
  private db: Client;

  constructor() {
    this.db = SqliteDatabase.getInstance();
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.db.execute({
      sql: "SELECT * FROM users WHERE email = ?",
      args: [email],
    });

    const row = result.rows[0] as any;

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
    const result = await this.db.execute({
      sql: "SELECT * FROM users WHERE id = ?",
      args: [id],
    });

    const row = result.rows[0] as any;

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
    await this.db.execute({
      sql: "INSERT INTO users (id, email, password_hash, name, company, created_at) VALUES (?, ?, ?, ?, ?, ?)",
      args: [
        user.id,
        user.email,
        user.passwordHash,
        user.name,
        user.company || null,
        user.createdAt
          ? user.createdAt.toISOString()
          : new Date().toISOString(),
      ],
    });
  }
}
