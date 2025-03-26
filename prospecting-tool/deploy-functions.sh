#!/bin/bash

# Navigate to the functions directory
cd functions

# Install dependencies
npm install

# Build the functions
npm run build

# Deploy the functions
firebase deploy --only functions

echo "Firebase functions deployed successfully!"
