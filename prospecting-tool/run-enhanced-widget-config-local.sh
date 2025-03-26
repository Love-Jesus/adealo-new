#!/bin/bash

# Run Enhanced Widget Config (Local Emulator)
# This script runs the create-enhanced-widget-config-local.cjs script to create an enhanced widget configuration in the local Firebase emulator.

echo "Creating enhanced widget configuration in local emulator..."
echo "Make sure your Firebase emulator is running with: firebase emulators:start"

# Change to the project directory
cd "$(dirname "$0")"

# Run the script
node create-enhanced-widget-config-local.cjs $1

echo "Done!"
