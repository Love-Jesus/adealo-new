#!/bin/bash

echo "Starting Firebase Functions deployment fix..."

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

echo "Deployment fix complete! Functions should now be deployed as Gen 1 without CPU settings."
