import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SERVER_PATH = path.join(__dirname, 'build/index.js');

console.log(`🤖 Spawning MCP Server: ${SERVER_PATH}`);
const server = spawn('node', [SERVER_PATH], {
  stdio: ['pipe', 'pipe', 'inherit'] // pipe stdin/stdout, inherit stderr for logs
});

let buffer = '';

server.stdout.on('data', (data) => {
  const chunk = data.toString();
  buffer += chunk;
  
  // Naive JSON-RPC parsing (splitting by newlines if multiple messages)
  const lines = buffer.split('\n');
  buffer = lines.pop() || ''; // Keep incomplete line

  for (const line of lines) {
    if (!line.trim()) continue;
    try {
      const msg = JSON.parse(line);
      console.log('📩 Received:', JSON.stringify(msg, null, 2));

      // 2. Once initialized, Call the Tool
      if (msg.id === 1) { 
          console.log('🚀 Sending Request: consult_standards("coverage requirement")');
          const request = {
            jsonrpc: "2.0",
            id: 2,
            method: "tools/call",
            params: {
              name: "consult_standards",
              arguments: {
                query: "What is the detailed code coverage policy?",
                limit: 1
              }
            }
          };
          server.stdin.write(JSON.stringify(request) + '\n');
      }
      
      // 3. Handle Result
      if (msg.id === 2) {
          console.log('✅ Result:', JSON.stringify(msg.result, null, 2));
          console.log('🎉 Test Passed!');
          server.kill();
          process.exit(0);
      }

    } catch (e) {
      console.error('⚠️ Parse Error:', e);
    }
  }
});

// 1. Send Initialize Request
const initReq = {
  jsonrpc: "2.0",
  id: 1,
  method: "initialize",
  params: {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "test-client", version: "1.0" }
  }
};

console.log('👋 Sending Initialize...');
server.stdin.write(JSON.stringify(initReq) + '\n');
