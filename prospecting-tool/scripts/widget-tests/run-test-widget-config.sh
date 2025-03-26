#!/bin/bash

# This script starts a local server to serve the test widget configuration page.

echo "Starting local server for widget configuration test..."
echo "Open http://localhost:8000/public/test-widget-config.html in your browser"

# Change to the project root directory
cd "$(dirname "$0")"

# Start a simple HTTP server on port 8000
if command -v python3 &> /dev/null; then
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    python -m SimpleHTTPServer 8000
else
    echo "Error: Python is not installed. Please install Python to run this script."
    exit 1
fi
