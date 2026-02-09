import { createClient, type Client } from "@libsql/client";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * TursoDatabase - Singleton wrapper for Turso (LibSQL)
 */
export class TursoDatabase {
  private static instance: Client | null = null;

  static getInstance(): Client {
    if (!TursoDatabase.instance) {
      const url = process.env.TURSO_DB_URL;
      const authToken = process.env.TURSO_AUTH_TOKEN;

      if (!url) {
        throw new Error(
          "🚨 TURSO_DB_URL is missing. Please check your .env file.",
        );
      }

      // Allow empty token for local dev (file:) but enforce for remote
      if (url.startsWith("libsql://") && !authToken) {
        throw new Error("🚨 TURSO_AUTH_TOKEN is required for remote Turso DB.");
      }

      console.log(
        `🔌 Connecting to Turso at: ${url.replace(authToken || "", "***")}`,
      );

      TursoDatabase.instance = createClient({
        url,
        ...(authToken ? { authToken } : {}),
      } as any);
    }
    return TursoDatabase.instance;
  }

  static async initializeSchema(): Promise<void> {
    const db = TursoDatabase.getInstance();
    const schemaPath = join(__dirname, "schema.sql");

    try {
      const schema = readFileSync(schemaPath, "utf-8");

      const statements = schema
        .split(";")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      for (const statement of statements) {
        await db.execute(statement);
      }

      console.log("✅ Turso schema initialized successfully");

      // Migration: Add embedding column
      try {
        await db.execute("ALTER TABLE requirements ADD COLUMN embedding BLOB");
        console.log("✅ Added embedding column to requirements table");
      } catch (e: any) {
        // Silently ignore if column already exists
      }

      // Seeding: Industry Presets
      try {
        const count = await db.execute(
          "SELECT count(*) as count FROM industry_presets",
        );
        if (count.rows[0]?.count === 0) {
          console.log("🌱 Seeding industry presets...");
          const presets = [
            {
              id: "tech",
              name: "Digital Services",
              positives: JSON.stringify([
                "software",
                "digital",
                "plataforma",
                "app",
                "sistema",
                "informático",
                "tecnológico",
                "licencias",
                "cloud",
                "seguridad",
                "system",
                "technology",
                "data",
                "service",
                "platform",
              ]),
              negatives: JSON.stringify([
                "limpieza",
                "obra",
                "construcción",
                "mantenimiento vial",
                "jardinería",
                "seguridad física",
              ]),
            },
            {
              id: "construction",
              name: "Construction",
              positives: JSON.stringify([
                "obra",
                "construcción",
                "edificación",
                "reforma",
                "vivienda",
                "infraestructura",
                "pavimentación",
                "albañilería",
                "fontanería",
              ]),
              negatives: JSON.stringify([
                "software",
                "app",
                "cloud",
                "licencias software",
              ]),
            },
          ];

          for (const p of presets) {
            await db.execute({
              sql: "INSERT INTO industry_presets (id, name, positive_keywords, negative_keywords) VALUES (?, ?, ?, ?)",
              args: [p.id, p.name, p.positives, p.negatives],
            });
          }
          console.log("✅ Industry presets seeded successfully");
        }
      } catch (e: any) {
        console.error("❌ Failed to seed industry presets:", e.message);
      }
    } catch (error) {
      console.error("❌ Schema initialization failed:", error);
      throw error;
    }
  }

  static close(): void {
    // if (TursoDatabase.instance) {
    //   TursoDatabase.instance.close();
    // }
  }
}
