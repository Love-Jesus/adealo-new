#!/bin/bash

# This script runs the create-multi-widget-config.js script to create a Multi Widget configuration in Firestore.

echo "Creating Multi Widget configuration in Firestore..."

# Change to the project root directory
cd "$(dirname "$0")"

# Run the script
node create-multi-widget-config.js

echo "Multi Widget configuration creation complete!"
echo "Check the output above for the widget ID and instructions on how to test the widget."
