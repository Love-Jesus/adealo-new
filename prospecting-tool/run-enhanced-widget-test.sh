#!/bin/bash

# Run Enhanced Widget Test
# This script starts a local server to test the enhanced widget

echo "Starting enhanced widget test server..."

# Change to the project directory
cd "$(dirname "$0")"

# Start a local server in the public directory
cd public
python3 -m http.server 8080 &
SERVER_PID=$!

# Open the enhanced widget test page in the default browser
sleep 1
open http://localhost:8080/enhanced-widget-test.html

# Wait for user to press Ctrl+C
echo "Press Ctrl+C to stop the server"
trap "kill $SERVER_PID; echo 'Server stopped'; exit 0" INT
while true; do
  sleep 1
done
