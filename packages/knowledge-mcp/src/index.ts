import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ListToolsRequestSchema, CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import * as lancedb from 'vectordb';
import path from 'path';
import { getEmbeddingsModel } from './embeddings.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Constants
const DB_URI = path.join(__dirname, '../data/lancedb');
const SERVER_NAME = "TenderCheck-Knowledge-Base";
const SERVER_VERSION = "1.0.0";

async function main() {
  console.error("🧠 Starting Professional Knowledge MCP Server...");

  // 1. Initialize Server
  // 1. Initialize Server
  const server = new Server({
    name: SERVER_NAME,
    version: SERVER_VERSION
  }, {
    capabilities: {
      tools: {}
    }
  });

  // 2. Connect to Vector DB
  const db = await lancedb.connect(DB_URI);
  let table: lancedb.Table;
  
  try {
    table = await db.openTable("standards");
  } catch (e) {
    console.error("⚠️  Table 'standards' not found. Did you run 'npm run ingest'?");
    process.exit(1);
  }

  // 3. Initialize Embeddings
  const embeddings = await getEmbeddingsModel();

  // 4. Define Tools (using setRequestHandler)

  // List available tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: "consult_standards",
          description: "Semantically search the project standards and code policies (Security, Testing, UX).",
          inputSchema: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "The question or topic to search for (e.g. 'What is the policy on 100% coverage?')"
              },
              limit: {
                type: "number",
                description: "Number of results to return",
                default: 3
              }
            },
            required: ["query"]
          }
        }
      ]
    };
  });

  // Handle tool execution
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name === "consult_standards") {
      const query = String(request.params.arguments?.query || "");
      const limit = Number(request.params.arguments?.limit || 3);

      console.error(`🔍 Searching for: "${query}"`); // Log to stderr

      try {
        const vector = await embeddings.embedQuery(query);
        const results = await table.search(vector).limit(limit).execute();
        
        const formatted = results.map((r: any) => `
### Source: ${r.source}
> ${r.text}
        `.trim()).join("\n\n---\n\n");

        if (results.length === 0) {
            return {
                content: [{ type: "text", text: "No relevant standards found for this query." }]
            };
        }

        return {
          content: [{ 
            type: "text", 
            text: `Found ${results.length} relevant standards:\n\n${formatted}` 
          }]
        };
      } catch (err) {
        return {
            content: [{ type: "text", text: `Error searching standards: ${(err as Error).message}` }],
            isError: true
        };
      }
    }

    throw new Error("Tool not found");
  });

  // 5. Start Transport
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("✅ MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal Error:", error);
  process.exit(1);
});
