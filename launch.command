#!/bin/bash

# Navigate to the directory where this script is located
cd "$(dirname "$0")"

# Ensure Homebrew's node/npm are available
export PATH="/opt/homebrew/bin:/opt/homebrew/sbin:$PATH"

echo "Killing any prior running instances on port 3000..."
lsof -ti:3000 | xargs kill -9 2>/dev/null

echo "Installing dependencies..."
npm install

echo "Starting Chronos – Calendar & Reminders..."

# Wait until the server responds, then open the browser
(until curl -s http://localhost:3000 > /dev/null 2>&1; do sleep 1; done && open http://localhost:3000) &

# Start the Next.js development server
npm run dev
