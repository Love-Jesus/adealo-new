#!/bin/bash

# This script runs a test of the user's widget code with the local loader.js

# Change to the project directory
cd "$(dirname "$0")"

# Start the development server in the background
echo "Starting development server..."
npm run dev &
DEV_SERVER_PID=$!

# Wait for the server to start
echo "Waiting for development server to start..."
sleep 5

# Open the test page in the default browser
echo "Opening test page in browser..."
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  open http://localhost:5173/public/test-user-widget-local.html
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
  # Linux
  xdg-open http://localhost:5173/public/test-user-widget-local.html
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" || "$OSTYPE" == "win32" ]]; then
  # Windows
  start http://localhost:5173/public/test-user-widget-local.html
else
  echo "Could not open browser automatically. Please open this URL manually:"
  echo "http://localhost:5173/public/test-user-widget-local.html"
fi

echo ""
echo "User widget local test is running."
echo "Press Ctrl+C to stop the development server when you're done."

# Wait for user to press Ctrl+C
trap "kill $DEV_SERVER_PID; echo 'Development server stopped.'; exit 0" INT
wait $DEV_SERVER_PID
