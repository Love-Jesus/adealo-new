#!/bin/bash

# This script runs a local server to test the Multi Widget.

echo "Starting local server for Multi Widget testing..."

# Change to the project root directory
cd "$(dirname "$0")"

# Create a temporary directory for the test files
mkdir -p temp-test

# Copy the widget files to the temporary directory
cp public/multi-widget.js temp-test/multi-widget.js
cp public/multi-widget-adapter.js temp-test/multi-widget-adapter.js
cp public/widget-loader.js temp-test/widget-loader.js
cp public/multi-widget-test.html temp-test/index.html

# Change to the temporary directory
cd temp-test

# Start a local server
if command -v python3 &> /dev/null; then
    echo "Starting server with Python 3..."
    python3 -m http.server 8080
elif command -v python &> /dev/null; then
    echo "Starting server with Python..."
    python -m SimpleHTTPServer 8080
elif command -v npx &> /dev/null; then
    echo "Starting server with npx serve..."
    npx serve -l 8080
else
    echo "Error: Could not find Python or npx to start a local server."
    echo "Please install Python or Node.js to run this script."
    exit 1
fi

# Clean up
cd ..
rm -rf temp-test
