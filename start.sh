#!/bin/bash

# Start Ollama in background, redirecting output to prevent blocking
echo "Starting Ollama (Silenced)..."
ollama serve > /dev/null 2>&1 &

# Wait for Ollama to initialize
echo "Waiting 5s for Ollama..."
sleep 5

# Start Backend
echo "Starting Backend Application..."
cd backend
export PORT=7860
# Use exec to replace shell with node process
exec npm start
