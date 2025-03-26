#!/bin/bash

echo "Starting deployment without Claude functions..."

# Navigate to functions directory
cd functions

# Install dependencies with the correct versions
echo "Installing dependencies..."
npm install

# Build the functions
echo "Building functions..."
npm run build

# Return to project root
cd ..

# Deploy the functions with Gen 1 configuration
echo "Deploying functions with Gen 1 configuration..."
firebase deploy --only functions

echo "Deployment complete! Functions have been deployed without Claude functions."
echo "Note: The Claude AI chat functionality is temporarily disabled."
echo "To restore Claude functions, run: mv functions/src/index.ts.backup functions/src/index.ts"
