import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SERVER_PATH = path.join(__dirname, 'build/index.js');

console.log(`\n🤖 **TenderCheck Knowledge Base Client**`);
console.log(`📍 Server Path: ${SERVER_PATH}`);
console.log("---------------------------------------------------");
console.log("Type your question below (or 'exit' to quit).");
console.log("Example: 'What is the policy on 100% coverage?'");
console.log("---------------------------------------------------\n");

const server = spawn('node', [SERVER_PATH], {
  stdio: ['pipe', 'pipe', 'inherit']
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let buffer = '';
let pendingId = 0;

// Handle Server Responses
server.stdout.on('data', (data) => {
  const chunk = data.toString();
  buffer += chunk;
  
  const lines = buffer.split('\n');
  buffer = lines.pop() || '';

  for (const line of lines) {
    if (!line.trim()) continue;
    try {
      const msg = JSON.parse(line);
      
      // Simplify Output for User
      if (msg.result && msg.result.content) {
        console.log("\n🧠 **Answer from Core**:");
        msg.result.content.forEach((c) => console.log(c.text));
        console.log("\n---------------------------------------------------");
        process.stdout.write("❓ Ask (or 'exit'): ");
      } else if (msg.error) {
        console.error("\n❌ Error:", msg.error.message);
        process.stdout.write("❓ Ask (or 'exit'): ");
      }
      
    } catch (e) {
      // Ignore partial JSON parse errors
    }
  }
});

// Send Initialize Request immediately
const initReq = {
  jsonrpc: "2.0",
  id: 0,
  method: "initialize",
  params: {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "manual-client", version: "1.0" }
  }
};
server.stdin.write(JSON.stringify(initReq) + '\n');
// We don't wait for init response visually, just start prompting
process.stdout.write("❓ Ask (or 'exit'): ");

rl.on('line', (input) => {
  if (input.trim().toLowerCase() === 'exit') {
    server.kill();
    process.exit(0);
  }

  pendingId++;
  const request = {
    jsonrpc: "2.0",
    id: pendingId,
    method: "tools/call",
    params: {
      name: "consult_standards",
      arguments: {
        query: input.trim(),
        limit: 3
      }
    }
  };
  server.stdin.write(JSON.stringify(request) + '\n');
});
