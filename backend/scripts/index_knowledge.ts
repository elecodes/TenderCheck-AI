// backend/scripts/index_knowledge.ts
import 'dotenv/config'; 
import fs from 'fs';
import path from 'path';
import { LocalEmbeddingService } from '../src/infrastructure/services/LocalEmbeddingService.js';
import { glob } from 'glob';

// Interface for our JSON knowledge base
interface KnowledgeItem {
    id: string;
    text: string;
    article: string;
    source: string;
    embedding: number[];
}

// Configuration
const KNOWLEDGE_BASE_ROOT = path.resolve('../knowledge_base'); // Scan this
const OUTPUT_FILE = path.resolve('src/data/legal_knowledge.json');

async function main() {
  console.log("🚀 Starting Local Knowledge Indexing (JSON Mode)...");

  // 1. Initialize Local Service
  const embeddingService = LocalEmbeddingService.getInstance();

  // 2. Find Markdown Files
  // We'll look for .md files in knowledge_base
  const pattern = `${KNOWLEDGE_BASE_ROOT}/**/*.md`;
  const files = await glob(pattern);

  if (files.length === 0) {
      console.warn(`⚠️  No markdown files found in ${KNOWLEDGE_BASE_ROOT}`);
      return;
  }

  console.log(`Found ${files.length} documents to index.`);
  console.log(`Output: ${OUTPUT_FILE}`);

  const knowledgeBase: KnowledgeItem[] = [];

  // 3. Process Files
  for (const filePath of files) {
      const fileName = path.basename(filePath);
      console.log(`Processing: ${fileName}`);
      
      const content = fs.readFileSync(filePath, 'utf-8');
      
      // Simple Chunking Strategy: Split by "## " (H2 headers) or just grab paragraphs?
      // For legal docs, H2/H3 often denotes articles.
      const rawChunks = content.split(/^## /gm);

      for (const [index, chunk] of rawChunks.entries()) {
          const trimmed = chunk.trim();
          if (trimmed.length < 50) continue; // Skip too short chunks

          // Re-add header marker if it was split
          const text = index === 0 ? trimmed : `## ${trimmed}`;
          
          // Heuristic to extract "Article X" or Title
          const titleLine = text.split('\n')[0].replace(/^#+\s*/, '');
          
          console.log(`   - Generating embedding for chunk "${titleLine.substring(0, 30)}..."`);
          
          const [embedding] = await embeddingService.generateEmbeddings([text]);
          
          if (!embedding) continue;

          knowledgeBase.push({
              id: `${fileName}_${index}`,
              text: text,
              article: titleLine,
              source: fileName,
              embedding: embedding
          });
      }
  }

  // 4. Save to JSON
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(knowledgeBase, null, 2));
  console.log(`\n🎉 Indexing Complete! Saved ${knowledgeBase.length} items to ${OUTPUT_FILE}`);
}

main().catch(console.error);
