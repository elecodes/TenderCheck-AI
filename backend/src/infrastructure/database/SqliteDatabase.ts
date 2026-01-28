import { createClient, type Client } from "@libsql/client";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * SqliteDatabase - Singleton wrapper for LibSQL/Turso Client
 */
export class SqliteDatabase {
  private static instance: Client | null = null;

  static getInstance(): Client {
    if (!SqliteDatabase.instance) {
      const url = process.env.DATABASE_PATH
        ? `file:${process.env.DATABASE_PATH}`
        : process.env.TURSO_DB_URL || "file:tender.db";

      const authToken = process.env.TURSO_AUTH_TOKEN;

      console.log(
        `🔌 Connecting to database at: ${url.replace(authToken || "", "***")}`,
      );

      SqliteDatabase.instance = createClient({
        url,
        authToken: authToken ? authToken : undefined,
      });
    }
    return SqliteDatabase.instance;
  }

  static async initializeSchema(): Promise<void> {
    const db = SqliteDatabase.getInstance();
    const schemaPath = join(__dirname, "schema.sql");

    try {
      // LibSQL doesn't support reading files directly via exec usually,
      // but we can read file and exec content.
      const schema = readFileSync(schemaPath, "utf-8");

      // Split by semicolon to execute multiple statements if needed,
      // but db.executeMultiple is better if available (LibSQL Client supports executeMultiple for newer versions)
      // Standard execute might only run one?
      // Safe bet: executeSchema helper.

      // Attempting to split roughly by ; followed by newline
      const statements = schema
        .split(";")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      for (const statement of statements) {
        await db.execute(statement);
      }

      console.log("✅ Database schema initialized successfully");

      // Migration: Add embedding column
      try {
        await db.execute("ALTER TABLE requirements ADD COLUMN embedding BLOB");
        console.log("✅ Added embedding column to requirements table");
      } catch (e: any) {
        // Ignore duplicate column error
        if (
          !e.message?.includes("duplicate column") &&
          !e.message?.includes("OperationalError")
        ) {
          // console.warn("Migration note:", e.message);
        }
      }
    } catch (error) {
      console.error("❌ Schema initialization failed:", error);
      throw error;
    }
  }

  static close(): void {
    // LibSQL client doesn't always need explicit close in serverless, but good practice
    // if (SqliteDatabase.instance) {
    //   SqliteDatabase.instance.close();
    // }
  }
}
