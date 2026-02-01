#!/bin/bash
set -e

# Debug: Verifying Frontend Build Existence
echo "--- Checking Frontend Build ---"
if [ -d "frontend/dist" ]; then
  echo "Frontend build found at frontend/dist"
  ls -F frontend/dist
else
  echo "ERROR: frontend/dist NOT FOUND!"
  # We don't exit here to allow backend to start and show logs, but this is critical info
fi

# Start Ollama in background, fully detached
echo "--- Starting Ollama ---"
nohup ollama serve > /dev/null 2>&1 &
echo "Ollama started in background."

# Wait for Ollama
echo "Waiting 5s for initialization..."
sleep 5

# Start Backend
echo "--- Starting Backend ---"
cd backend
export PORT=3000
# Use exec to ensure signals are passed to Node.js
exec npm start
