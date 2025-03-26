#!/bin/bash

# This script starts a simple HTTP server to serve the simple-id-tester.html file.

echo "Starting HTTP server for testing the widget ID..."

# Change to the project root directory
cd "$(dirname "$0")"

# Start a simple HTTP server on port 8000
if command -v python3 &>/dev/null; then
  python3 -m http.server 8000
elif command -v python &>/dev/null; then
  python -m SimpleHTTPServer 8000
else
  echo "Error: Python is not installed. Please install Python to run this script."
  exit 1
fi

# Note: This will start a simple HTTP server on port 8000
# You can access the test page at http://localhost:8000/public/simple-id-tester.html
