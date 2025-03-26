#!/bin/bash

# This script runs a simple test of the chat widget without using the Firebase emulator

# Change to the project directory
cd "$(dirname "$0")"

# First, stop any running servers
echo "Stopping any running servers..."
./stop-dev-servers.sh

# Wait a moment for servers to fully stop
sleep 2

# Copy the local-loader.js file to the public directory
echo "Copying local-loader.js to public directory..."
cp public/local-loader.js public/

# Start the development server in the background
echo "Starting development server..."
npm run dev &
DEV_SERVER_PID=$!

# Wait for the server to start
echo "Waiting for development server to start..."
sleep 5

# Open the test page in the default browser
echo "Opening simple chat test page in browser..."
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  open http://localhost:5173/simple-chat-test.html
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
  # Linux
  xdg-open http://localhost:5173/simple-chat-test.html
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" || "$OSTYPE" == "win32" ]]; then
  # Windows
  start http://localhost:5173/simple-chat-test.html
else
  echo "Could not open browser automatically. Please open this URL manually:"
  echo "http://localhost:5173/simple-chat-test.html"
fi

echo ""
echo "Simple chat widget test is running."
echo "Press Ctrl+C to stop the development server when you're done."

# Wait for user to press Ctrl+C
trap "kill $DEV_SERVER_PID; echo 'Development server stopped.'; exit 0" INT
wait $DEV_SERVER_PID
