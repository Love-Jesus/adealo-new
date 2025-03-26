#!/bin/bash

echo "Reverting Firebase Functions upgrade..."

# Navigate to functions directory
cd functions

# Revert to previous versions
echo "Reverting to previous SDK versions..."
npm install firebase-functions@4.9.0 firebase-admin@12.7.0 --save

# Update Node.js version back to 18
echo "Reverting Node.js version to 18..."
sed -i '' 's/"node": "20"/"node": "18"/g' package.json

# Build the functions
echo "Building functions..."
npm run build

# Return to project root
cd ..

# Revert firebase.json to Gen 1 if needed
echo "Checking firebase.json configuration..."
if grep -q '"gen": 2' firebase.json; then
  echo "Reverting firebase.json to use Gen 1..."
  sed -i '' 's/"gen": 2/"gen": 1/g' firebase.json
fi

echo "Revert complete. You may need to redeploy your functions using:"
echo "firebase deploy --only functions"
