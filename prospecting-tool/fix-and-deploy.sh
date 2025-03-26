#!/bin/bash

echo "Starting comprehensive fix and deployment..."

# Step 1: Fix package-lock.json sync issues
echo "Step 1: Fixing package-lock.json sync issues..."
cd functions

echo "Running npm install to update package-lock.json..."
npm install

echo "Package-lock.json has been updated."

# Step 2: Build the functions
echo "Step 2: Building functions..."
npm run build

# Return to project root
cd ..

# Step 3: Deploy the functions with Gen 1 configuration
echo "Step 3: Deploying functions with Gen 1 configuration..."
echo "Note: When prompted about deleting functions, select 'y' to proceed with deletion."
firebase deploy --only functions

echo "Deployment complete! Functions have been deployed without Claude functions."
echo "Note: The Claude AI chat functionality is temporarily disabled."
echo "To restore Claude functions later, run: ./restore-claude-functions.sh"
