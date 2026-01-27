import Database from "better-sqlite3";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * SqliteDatabase - Singleton wrapper for better-sqlite3
 *
 * Manages database connection and schema initialization.
 * Supports vector embeddings for semantic search.
 */
export class SqliteDatabase {
  private static instance: Database.Database | null = null;

  static getInstance(): Database.Database {
    if (!SqliteDatabase.instance) {
      const dbPath =
        process.env.DATABASE_PATH ||
        join(__dirname, "../../../database.sqlite");
      SqliteDatabase.instance = new Database(dbPath);

      // Enable WAL mode for better concurrency
      SqliteDatabase.instance.pragma("journal_mode = WAL");

      // Initialize schema
      SqliteDatabase.initializeSchema(SqliteDatabase.instance);

      console.log("✅ Database schema initialized successfully");
    }
    return SqliteDatabase.instance;
  }

  private static initializeSchema(db: Database.Database): void {
    const schemaPath = join(__dirname, "schema.sql");
    const schema = readFileSync(schemaPath, "utf-8");

    // Execute schema (creates tables if not exist)
    db.exec(schema);

    // Add embedding column if it doesn't exist (migration)
    try {
      db.exec(`
        ALTER TABLE requirements ADD COLUMN embedding BLOB;
      `);
      console.log("✅ Added embedding column to requirements table");
    } catch (error: any) {
      // Column already exists, ignore
      if (!error.message.includes("duplicate column name")) {
        console.error("Schema migration error:", error);
      }
    }
  }

  static close(): void {
    if (SqliteDatabase.instance) {
      SqliteDatabase.instance.close();
      SqliteDatabase.instance = null;
    }
  }
}
