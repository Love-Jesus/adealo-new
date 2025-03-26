#!/bin/bash

echo "Starting comprehensive Firebase Functions upgrade..."

# Navigate to functions directory
cd functions

# Update dependencies
echo "Updating Firebase Functions SDK and Admin SDK..."
npm install firebase-functions@latest firebase-admin@latest --save --legacy-peer-deps

# Build the functions
echo "Building functions..."
npm run build

# Return to project root
cd ..

# Ensure firebase.json is set to Gen 2
echo "Checking firebase.json configuration..."
if grep -q '"gen": 1' firebase.json; then
  echo "Updating firebase.json to use Gen 2..."
  sed -i '' 's/"gen": 1/"gen": 2/g' firebase.json
fi

# Migrate Claude functions to Gen 2 using gcloud CLI
echo "Migrating Claude functions to Gen 2..."

# Check if user is logged in to gcloud
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q "@"; then
  echo "Please login to gcloud CLI:"
  gcloud auth login
fi

# Set project
PROJECT_ID=$(grep -o '"default": "[^"]*' .firebaserc | cut -d'"' -f4)
echo "Setting gcloud project to $PROJECT_ID..."
gcloud config set project $PROJECT_ID

# Migrate the Claude functions to Gen 2
echo "Migrating processClaudeMessage function to Gen 2..."
gcloud functions deploy processClaudeMessage \
  --gen2 \
  --runtime=nodejs20 \
  --region=us-central1 \
  --trigger-http

echo "Migrating updateClaudeApiKey function to Gen 2..."
gcloud functions deploy updateClaudeApiKey \
  --gen2 \
  --runtime=nodejs20 \
  --region=us-central1 \
  --trigger-http

# Deploy all functions with Firebase
echo "Deploying all functions with Firebase..."
firebase deploy --only functions

echo "Upgrade complete! All functions should now be running on Gen 2 with the latest SDK."
