#!/bin/bash

# This script runs the create-emulator-widget-config.cjs script to create a widget configuration in the Firebase Emulator.

echo "Creating widget configuration in Firebase Emulator (CommonJS version)..."

# Change to the project root directory
cd "$(dirname "$0")"

# Check if the Firebase Emulator is running
if ! curl -s http://localhost:8080 > /dev/null; then
  echo "Error: Firebase Emulator is not running. Please start the emulator first."
  echo "Run: firebase emulators:start"
  exit 1
fi

# Run the create-emulator-widget-config.cjs script
node create-emulator-widget-config.cjs

echo "Widget configuration created successfully!"
echo "You can now test the widget with the ID: pjxZqkQ9fAZaqIoOOJJx"
