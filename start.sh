#!/bin/bash
set -e

# Start Ollama in background
echo "Starting Ollama..."
ollama serve &

# Wait for Ollama to be ready (optional check, or just sleep)
echo "Waiting 5s for Ollama to initialize..."
sleep 5

# Start Backend
echo "Starting Backend Application..."
cd backend
# Explicitly set PORT to ensure it matches EXPOSE
export PORT=7860
npm start
