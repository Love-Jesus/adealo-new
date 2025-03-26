#!/bin/bash

# This script runs the create-widget-config-direct.js script to create a widget configuration in Firestore.

echo "Creating widget configuration in Firestore (direct method)..."

# Change to the project root directory
cd "$(dirname "$0")"

# Run the create-widget-config-direct.js script
node create-widget-config-direct.js

echo "Widget configuration creation attempt completed."
echo "You can now test the widget with the ID: pjxZqkQ9fAZaqIoOOJJx"
