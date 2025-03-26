#!/bin/bash

# This script deploys the Multi Widget files to Firebase Hosting.

echo "Deploying Multi Widget files to Firebase Hosting..."

# Change to the project root directory
cd "$(dirname "$0")"

# Create a temporary directory for the hosting files
mkdir -p temp-hosting

# Copy the widget files to the temporary directory
cp public/multi-widget.js "temp-hosting/multi-widget.js"
cp public/multi-widget-adapter.js "temp-hosting/multi-widget-adapter.js"
cp public/widget-loader.js "temp-hosting/widget-loader.js"
cp public/test-widget.html "temp-hosting/test-widget.html"
cp public/multi-widget-test.html "temp-hosting/multi-widget-test.html"

echo "Copied widget files to temporary directory"

# Create a firebase.json file for hosting with cache control headers
cat > temp-hosting/firebase.json << EOL
{
  "hosting": {
    "public": ".",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "headers": [
      {
        "source": "**/*.js",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "no-cache, no-store, must-revalidate"
          }
        ]
      },
      {
        "source": "**/*.html",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "no-cache, no-store, must-revalidate"
          }
        ]
      }
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
echo "You can access the widget test pages at:"
echo "- https://adealo-ce238.web.app/test-widget.html (Generic test page)"
echo "- https://adealo-ce238.web.app/multi-widget-test.html (Multi Widget specific test page)"
