#!/bin/bash

# This script deploys the widget test HTML file to Firebase Hosting.

echo "Deploying widget test HTML file to Firebase Hosting..."

# Change to the project root directory
cd "$(dirname "$0")"

# Create a temporary directory for the hosting files
mkdir -p temp-hosting

# Copy the test HTML file to the temporary directory
cp public/test-production-widget.html temp-hosting/index.html

# Copy the widget loader script to the temporary directory
cp public/widget-loader.js temp-hosting/widget-loader.js

# Create a firebase.json file for hosting
cat > temp-hosting/firebase.json << EOL
{
  "hosting": {
    "public": ".",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ]
  }
}
EOL

# Deploy to Firebase Hosting
echo "Deploying to Firebase Hosting..."
cd temp-hosting
firebase deploy --only hosting

# Clean up
cd ..
rm -rf temp-hosting

echo "Deployment complete!"
echo "You can access the widget test page at https://adealo-ce238.web.app"
