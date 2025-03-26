#!/bin/bash

# This script runs a local test of the chat widget

# Change to the project directory
cd "$(dirname "$0")"

# Start the Firebase Functions emulator in the background
echo "Starting Firebase Functions emulator..."
firebase emulators:start --only functions &
FIREBASE_EMULATOR_PID=$!

# Wait for the Firebase emulator to start
echo "Waiting for Firebase emulator to start..."
sleep 10

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
  open http://localhost:5173/public/local-test-chat-widget.html
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
  # Linux
  xdg-open http://localhost:5173/public/local-test-chat-widget.html
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" || "$OSTYPE" == "win32" ]]; then
  # Windows
  start http://localhost:5173/public/local-test-chat-widget.html
else
  echo "Could not open browser automatically. Please open this URL manually:"
  echo "http://localhost:5173/public/local-test-chat-widget.html"
fi

echo ""
echo "Local chat widget test is running."
echo "Press Ctrl+C to stop the development server when you're done."

# Wait for user to press Ctrl+C
trap "kill $DEV_SERVER_PID $FIREBASE_EMULATOR_PID; echo 'Development server and Firebase emulator stopped.'; exit 0" INT
echo "Press Ctrl+C to stop the servers when you're done."
echo "Files in the public directory are served at the root path."
echo "Instead of /public/local-test-chat-widget.html use /local-test-chat-widget.html."

# Keep the script running
wait $DEV_SERVER_PID
