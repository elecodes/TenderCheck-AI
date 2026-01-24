import fs from 'node:fs/promises';
import path from 'node:path';
import { glob } from 'glob';
import * as lancedb from 'vectordb';
import { getEmbeddingsModel } from './embeddings.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_URI = path.join(__dirname, '../data/lancedb');
const STANDARDS_DIR = path.join(__dirname, '../../../docs/standards');

interface DocumentRecord {
  id: string;
  text: string;
  source: string;
  category: string;
  vector: number[];
  [key: string]: unknown;
}

async function ingest() {
  console.log("🚀 Starting Knowledge Ingestion...");
  
  // 1. Setup Database
  const db = await lancedb.connect(DB_URI);
  
  // 2. Get Strategy (Hybrid)
  const embeddings = await getEmbeddingsModel();

  // 3. Scan for Standards
  const pattern = path.join(STANDARDS_DIR, "**/*.md");
  const files = await glob(pattern);
  
  console.log(`Found ${files.length} standard documents to index.`);

  if (files.length === 0) {
    console.warn("⚠️ No standards found! Check path:", STANDARDS_DIR);
    return;
  }

  const records: DocumentRecord[] = [];

  for (const file of files) {
    const content = await fs.readFile(file, 'utf-8');
    const filename = path.basename(file);
    console.log(`Processing: ${filename}`);

    const chunks = content.split(/^## /m).filter(c => c.trim().length > 0);

    for (const [index, chunk] of chunks.entries()) {
      try {
        const vector = await embeddings.embedQuery(chunk);
        
        records.push({
          id: `${filename}-${index}`,
          text: chunk.startsWith("#") ? "## " + chunk : chunk,
          source: filename,
          category: 'standard',
          vector
        });
      } catch (err) {
        console.error(`Error embedding chunk in ${filename}:`, err);
      }
    }
  }

  // 4. Store in Table
  try {
    // Drop table if exists to full re-index
    await db.openTable("standards").then(t => db.dropTable("standards")).catch(() => {});
    
    // Create Table
    // Note: LanceDB auto-infers schema but needs at least one record to start properly or strict schema
    if (records.length > 0) {
        await db.createTable("standards", records);
        console.log(`✅ Successfully indexed ${records.length} chunks from ${files.length} files.`);
    } else {
        console.log("No records to index.");
    }
    
  } catch (error) {
    console.error("Failed to index:", error);
  }
}

ingest();
