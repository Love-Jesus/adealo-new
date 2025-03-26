#!/bin/bash

# Run Enhanced Widget Config
# This script runs the create-enhanced-widget-config.cjs script to create an enhanced widget configuration in Firestore.

echo "Creating enhanced widget configuration..."

# Change to the project directory
cd "$(dirname "$0")"

# Run the script
node create-enhanced-widget-config.cjs $1

echo "Done!"
