#!/bin/bash

# This script starts a local HTTP server to serve the test-local-widget.html file
# and starts the Firebase Functions emulator for local testing

# Start the Firebase Functions emulator in the background
echo "Starting Firebase Functions emulator..."
cd prospecting-tool
firebase emulators:start --only functions &
FIREBASE_PID=$!

# Wait for the emulator to start
echo "Waiting for Firebase Functions emulator to start..."
sleep 5

# Start a simple HTTP server to serve the test-local-widget.html file
echo "Starting HTTP server for test-local-widget.html..."
cd public
python3 -m http.server 8000 &
HTTP_SERVER_PID=$!

# Open the test-local-widget.html file in the default browser
echo "Opening test-local-widget.html in the default browser..."
open http://localhost:8000/test-local-widget.html

# Wait for user to press Ctrl+C
echo ""
echo "Press Ctrl+C to stop the servers"
echo ""

# Function to clean up on exit
function cleanup {
  echo ""
  echo "Stopping servers..."
  kill $FIREBASE_PID
  kill $HTTP_SERVER_PID
  echo "Servers stopped"
  exit 0
}

# Set up trap to call cleanup function on Ctrl+C
trap cleanup SIGINT

# Wait for Ctrl+C
while true; do
  sleep 1
done
