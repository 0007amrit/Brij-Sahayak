#!/usr/bin/env bash

# BrajSahayak One-Click Runner
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cleanup() {
  echo ""
  echo "Stopping BrajSahayak..."
  kill $(jobs -p) 2>/dev/null
  exit 0
}
trap cleanup SIGINT SIGTERM EXIT

echo "Starting Backend (Port 5001)..."
(cd "$DIR/backend" && npx tsx src/server.ts) &

echo "Starting Frontend (Port 5173)..."
(cd "$DIR/frontend" && npx vite --port 5173 --host) &

sleep 2
open "http://localhost:5173" 2>/dev/null || true

echo "Website is open at http://localhost:5173"
echo "Press Ctrl+C to stop."
wait
