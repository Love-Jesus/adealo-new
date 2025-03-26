#!/bin/bash

# Deploy Enhanced Widget
# This script deploys the enhanced widget configuration functions and test page to Firebase.

echo "Deploying Enhanced Widget to Firebase..."

# Change to the project root directory
cd "$(dirname "$0")"

# Get the project ID from .firebaserc
PROJECT_ID=$(grep -o '"default": "[^"]*' .firebaserc | cut -d'"' -f4)
if [ -z "$PROJECT_ID" ]; then
  echo "Error: Could not find project ID in .firebaserc"
  exit 1
fi

echo "Using Firebase project: $PROJECT_ID"

# Step 1: Deploy the widget configuration functions
echo "Step 1: Deploying widget configuration functions..."
cd functions
npm run build || { echo "Function build failed"; exit 1; }
cd ..

echo "Deploying functions to Firebase..."
firebase deploy --project=$PROJECT_ID --only functions:getWidgetConfig,functions:getWidgetConfigHttp,functions:trackWidgetInteractionHttp,functions:widget || { 
  echo "Function deployment failed"; 
  exit 1; 
}

echo "Widget configuration functions deployed successfully!"

# Step 2: Deploy the enhanced widget test page to Firebase Hosting
echo "Step 2: Deploying enhanced widget test page..."

# Create a temporary directory for the hosting files
mkdir -p temp-hosting

# Copy the enhanced widget test page to the temporary directory
cp public/enhanced-widget-test-production.html temp-hosting/index.html

# Copy the widget loader script to the temporary directory
cp public/widget-loader.js temp-hosting/widget-loader.js

# Copy the widget script to the temporary directory
cp public/widget.js temp-hosting/widget.js

# Create a firebase.json file for hosting
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
        "source": "**",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=3600"
          },
          {
            "key": "Access-Control-Allow-Origin",
            "value": "*"
          }
        ]
      }
    ]
  }
}
EOL

# Copy the .firebaserc file to the temporary directory
cat > temp-hosting/.firebaserc << EOL
{
  "projects": {
    "default": "${PROJECT_ID}"
  }
}
EOL

# Deploy to Firebase Hosting
echo "Deploying to Firebase Hosting..."
cd temp-hosting
firebase deploy --project=$PROJECT_ID --only hosting || {
  echo "Hosting deployment failed";
  cd ..;
  rm -rf temp-hosting;
  exit 1;
}

# Clean up
cd ..
rm -rf temp-hosting

echo "Deployment complete!"
echo "You can access the enhanced widget test page at https://${PROJECT_ID}.web.app"
echo "To create a new enhanced widget configuration, run:"
echo "  ./run-enhanced-widget-config.sh"
echo "Then use the generated widget ID in the test page."
