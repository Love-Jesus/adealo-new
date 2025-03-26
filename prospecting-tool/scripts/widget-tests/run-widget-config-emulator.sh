#!/bin/bash

# This script starts the Firebase Functions emulator for testing the widget configuration system.

echo "Starting Firebase Functions emulator..."

# Change to the project root directory
cd "$(dirname "$0")"

# Start the Firebase Functions emulator
firebase emulators:start --only functions

# Note: This will start the Firebase Functions emulator on port 5001
# You can access the emulator UI at http://localhost:4000
