#!/bin/bash

echo "Fixing package-lock.json sync issues..."

# Navigate to functions directory
cd functions

# Run npm install to update package-lock.json
echo "Running npm install to update package-lock.json..."
npm install

echo "Package-lock.json has been updated."
echo "You can now run the deployment script again."
