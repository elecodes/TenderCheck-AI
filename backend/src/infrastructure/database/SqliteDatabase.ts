import Database from "better-sqlite3";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { TursoDatabase } from "./TursoDatabase.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

type Stmt = { sql: string; args?: unknown[] };

type ExecuteResult = {
  rows?: unknown[];
  lastInsertRowid?: number | bigint;
  changes?: number;
};

type BetterDatabase = InstanceType<typeof Database>;

interface DbAdapter {
  raw: BetterDatabase;
  exec(sql: string): Promise<void>;
  close(): void;
  execute(
    input: string | { sql: string; args?: unknown[] },
    maybeArgs?: unknown[],
  ): Promise<ExecuteResult>;
  batch(stmts: Stmt[], _mode?: string): Promise<void>;
}

/**
 * SqliteDatabase - Singleton wrapper for better-sqlite3
 * Used for local/integration tests and local deployments.
 */
export class SqliteDatabase {
  // Expose the adapter type instead of `any`
  private static instance: DbAdapter | null = null;

  /**
   * Returns an adapter object compatible with the Turso client used across the codebase.
   */
  static getInstance(): DbAdapter {
    const tursoUrl = process.env.TURSO_DB_URL;
    const needsTurso =
      typeof tursoUrl === "string" && tursoUrl.startsWith("file:");

    // If an instance exists but its underlying client type doesn't match the requested mode,
    // close and reset it so we recreate the correct adapter.
    if (SqliteDatabase.instance) {
      const currentHasPrepare =
        typeof (SqliteDatabase.instance.raw as any)?.prepare === "function";
      if (needsTurso && currentHasPrepare) {
        // current is better-sqlite3 but TURSO wants file: -> recreate to use Turso client
        try {
          SqliteDatabase.instance.close();
        } catch (_) {
          // ignore
        }
        SqliteDatabase.instance = null;
      } else if (!needsTurso && !currentHasPrepare) {
        // current is Turso client but we want local better-sqlite3 -> recreate
        try {
          SqliteDatabase.instance.close();
        } catch (_) {
          // ignore
        }
        SqliteDatabase.instance = null;
      }
    }

    if (!SqliteDatabase.instance) {
      const tursoUrl = process.env.TURSO_DB_URL;
      if (tursoUrl && tursoUrl.startsWith("file:")) {
        const client = TursoDatabase.getInstance();
        // Ensure foreign keys are enabled on the libsql/sqlite instance used by the client
        // Note: do not await here; initialization should be driven by initializeSchema()
        (client as any).execute({ sql: "PRAGMA foreign_keys = ON;" });
        const adapter: DbAdapter = {
          raw: client as unknown as BetterDatabase,
          async exec(sql: string) {
            await (client as any).execute({ sql });
          },
          close() {
            // libsql client doesn't need explicit close here
          },
          async execute(
            input: string | { sql: string; args?: unknown[] },
            maybeArgs?: unknown[],
          ): Promise<ExecuteResult> {
            const sql = typeof input === "string" ? input : input.sql;
            let args: unknown[] = [];
            if (Array.isArray(maybeArgs)) args = maybeArgs;
            else if (
              typeof input === "object" &&
              Array.isArray((input as any).args)
            )
              args = (input as any).args;

            if (!sql) throw new Error("No SQL provided to execute");

            const isSelect = /^\s*SELECT\b/i.test(sql);

            const result = await (client as any).execute({ sql, args });

            if (isSelect) return { rows: result.rows };

            return {
              lastInsertRowid: (result as any).lastInsertRowid,
              changes: (result as any).changes,
            };
          },
          async batch(stmts: Stmt[], _mode?: string): Promise<void> {
            await (client as any).batch(stmts, "write");
          },
        };

        SqliteDatabase.instance = adapter;

        // Do not initialize schema here synchronously. initializeSchema() will be called by tests/startup.
        console.log("✅ Using Turso client adapter for file: URL", tursoUrl);
      } else {
        const dbPath: string =
          process.env.DATABASE_PATH ||
          join(__dirname, "../../../database.sqlite");

        const rawDb: BetterDatabase = new Database(dbPath);
        // Enable WAL mode for better concurrency
        rawDb.pragma("journal_mode = WAL");
        // Enable foreign keys enforcement
        rawDb.pragma("foreign_keys = ON");

        const adapter: DbAdapter = {
          raw: rawDb,

          async exec(sql: string) {
            rawDb.exec(sql);
          },

          close() {
            rawDb.close();
          },

          async execute(
            input: string | { sql: string; args?: unknown[] },
            maybeArgs?: unknown[],
          ): Promise<ExecuteResult> {
            const sql = typeof input === "string" ? input : input.sql;
            let args: unknown[] = [];
            if (Array.isArray(maybeArgs)) args = maybeArgs;
            else if (
              typeof input === "object" &&
              Array.isArray((input as any).args)
            )
              args = (input as any).args;

            if (!sql) throw new Error("No SQL provided to execute");

            const isSelect = /^\s*SELECT\b/i.test(sql);

            if (isSelect) {
              const rows = rawDb.prepare(sql).all(...(args as any[]));
              return { rows };
            }

            const info = rawDb.prepare(sql).run(...(args as any[]));
            return {
              lastInsertRowid: info.lastInsertRowid,
              changes: info.changes,
            };
          },

          async batch(stmts: Stmt[], _mode?: string): Promise<void> {
            rawDb.exec("BEGIN");
            try {
              for (const s of stmts) {
                const sql = s.sql;
                const args = Array.isArray(s.args) ? s.args : [];
                rawDb.prepare(sql).run(...(args as any[]));
              }
              rawDb.exec("COMMIT");
            } catch (err) {
              rawDb.exec("ROLLBACK");
              throw err;
            }
          },
        };

        SqliteDatabase.instance = adapter;

        // Do not initialize schema here synchronously. initializeSchema() will be called by tests/startup.
        console.log("✅ Using local better-sqlite3 adapter at", dbPath);
      }
    }
    return SqliteDatabase.instance!;
  }

  static async initializeSchema(db?: DbAdapter): Promise<void> {
    const database = db ?? SqliteDatabase.getInstance();
    const schemaPath = join(__dirname, "schema.sql");
    const schema = readFileSync(schemaPath, "utf-8");

    // Execute schema (creates tables if not exist)
    await database.exec(schema);

    // Migration: add embedding column if missing
    try {
      await database.exec(
        `ALTER TABLE requirements ADD COLUMN embedding BLOB;`,
      );
      console.log("✅ Added embedding column to requirements table");
    } catch (error) {
      const err = error as Error | undefined;
      if (
        !err?.message?.includes("duplicate column") &&
        !err?.message?.includes("already exists")
      ) {
        console.error("Schema migration error:", err);
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
