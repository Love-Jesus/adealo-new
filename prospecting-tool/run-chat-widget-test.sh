#!/bin/bash

# This script runs the test page with the local development server
# to test the chat widget functionality

# Change to the project directory
cd "$(dirname "$0")"

# Start the development server in the background
echo "Starting development server..."
npm run dev &
DEV_SERVER_PID=$!

# Wait for the server to start
echo "Waiting for server to start..."
sleep 5

# Open the test page in the default browser
echo "Opening test page..."
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  open http://localhost:5173/test-chat-widget.html
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
  # Linux
  xdg-open http://localhost:5173/test-chat-widget.html
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
  # Windows
  start http://localhost:5173/test-chat-widget.html
else
  echo "Please open http://localhost:5173/test-chat-widget.html in your browser"
fi

# Wait for user to press Ctrl+C
echo ""
echo "Press Ctrl+C to stop the server and exit"
trap "kill $DEV_SERVER_PID; exit" INT
wait
