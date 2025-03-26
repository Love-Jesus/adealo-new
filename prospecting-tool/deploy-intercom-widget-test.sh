#!/bin/bash

# This script deploys the intercom-widget-test.html file to Firebase Hosting.

echo "Deploying intercom-widget-test.html file to Firebase Hosting..."

# Change to the project root directory
cd "$(dirname "$0")"

# Create a temporary directory for the hosting files
mkdir -p temp-hosting

# Copy the intercom widget test HTML file to the temporary directory
cp public/intercom-widget-test.html temp-hosting/intercom-widget-test.html

# Copy the widget adapter script to the temporary directory
cp public/intercom-style-widget-adapter.js temp-hosting/intercom-style-widget-adapter.js

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
firebase deploy --only hosting --project adealo-ce238

# Clean up
cd ..
rm -rf temp-hosting

echo "Deployment complete!"
echo "You can access the intercom widget test page at https://adealo-ce238.web.app/intercom-widget-test.html"
