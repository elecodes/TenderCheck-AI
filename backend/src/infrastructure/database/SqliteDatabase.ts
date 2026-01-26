import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class SqliteDatabase {
  private static instance: Database.Database;

  public static getInstance(): Database.Database {
    if (!SqliteDatabase.instance) {
      const dbPath = path.join(process.cwd(), "database.sqlite");
      SqliteDatabase.instance = new Database(dbPath);

      // Configure for performance
      SqliteDatabase.instance.pragma("journal_mode = WAL");
      SqliteDatabase.instance.pragma("foreign_keys = ON");

      SqliteDatabase.initializeSchema();
    }
    return SqliteDatabase.instance;
  }

  private static initializeSchema() {
    const schemaPath = path.join(__dirname, "schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf-8");

    // Split by semicolons and execute each statement
    // Note: better_sqlite3 can execute multiple statements via exec()
    SqliteDatabase.instance.exec(schema);
    console.log("✅ Database schema initialized successfully");
  }

  public static close() {
    if (SqliteDatabase.instance) {
      SqliteDatabase.instance.close();
      console.log("💤 Database connection closed");
    }
  }
}
