#!/bin/bash

# Navigate to the functions directory
cd functions

# Install dependencies with legacy peer deps to avoid version conflicts
npm install --legacy-peer-deps

# Build the functions
npm run build

# Deploy only the widget-related functions
firebase deploy --only functions:getWidgetScript,functions:trackWidgetInteraction

echo "Widget functions deployed successfully!"
echo "Note: If you see any warnings about deprecated Node.js versions, you can ignore them for now."
echo "The widget functions should now be available for use."
