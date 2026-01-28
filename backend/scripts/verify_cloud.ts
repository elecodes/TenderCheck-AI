import "dotenv/config";
import { SqliteDatabase } from "../src/infrastructure/database/SqliteDatabase.js";
import { GeminiGenkitService } from "../src/infrastructure/services/GeminiGenkitService.js";

async function verify() {
  console.log("🔍 Verifying Cloud Connectivity...");

  // 1. Check Turso
  try {
    console.log("👉 Checking Turso Connection...");
    const db = SqliteDatabase.getInstance();

    // Simple query
    const result = await db.execute("SELECT 1 as val");
    if (result.rows[0].val === 1) {
      console.log("✅ Turso Connection Successful!");
    } else {
      console.error("❌ Turso returned unexpected result.");
    }
  } catch (e) {
    console.error("❌ Turso Connection Failed:", e);
  }

  // 2. Check Gemini
  try {
    console.log("👉 Checking Gemini API...");
    const ai = new GeminiGenkitService();
    const result = await ai.analyzeTender(
      "This is a test tender for software development.",
      "test-id",
      "test-user",
    );

    if (result.requirements.length > 0) {
      console.log("✅ Gemini Analysis Successful!");
      console.log(
        `Debug: Generated ${result.requirements.length} requirements.`,
      );
    } else {
      console.warn("⚠️ Gemini returned empty results (but no crash).");
    }
  } catch (e) {
    console.error("❌ Gemini Connection Failed:", e);
  }
}

verify();
