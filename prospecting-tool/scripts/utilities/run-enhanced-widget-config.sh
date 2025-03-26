#!/bin/bash

# This script runs the create-enhanced-widget-config.js script to create an enhanced widget configuration in the Firebase Emulator.

echo "Creating enhanced widget configuration in Firebase Emulator..."

# Change to the project root directory
cd "$(dirname "$0")"

# Check if the Firebase Emulator is running
if ! curl -s http://localhost:8080 > /dev/null; then
  echo "Error: Firebase Emulator is not running. Please start the emulator first."
  echo "Run: ./run-emulator-with-permissive-rules.sh"
  exit 1
fi

# Run the create-enhanced-widget-config.js script with the --experimental-modules flag
# The --experimental-modules flag is needed for older Node.js versions
# For newer Node.js versions, this flag is not needed
node --experimental-modules create-enhanced-widget-config.js

echo "Enhanced widget configuration created successfully!"
echo "You can now test the widget with the ID: pjxZqkQ9fAZaqIoOOJJx"
