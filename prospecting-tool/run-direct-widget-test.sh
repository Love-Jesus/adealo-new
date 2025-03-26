#!/bin/bash

# This script runs a test for the direct widget URL implementation

echo "Starting direct widget URL test..."

# Serve the files locally using Python's HTTP server
echo "Starting local server..."
cd prospecting-tool/public
python3 -m http.server 8000 &
SERVER_PID=$!

# Wait for server to start
sleep 2

# Open the test page in the default browser
echo "Opening test page in browser..."
open http://localhost:8000/direct-widget-test.html

echo "Test page opened. Press Enter to stop the server when done testing."
read

# Kill the server
echo "Stopping server..."
kill $SERVER_PID

echo "Test completed."
