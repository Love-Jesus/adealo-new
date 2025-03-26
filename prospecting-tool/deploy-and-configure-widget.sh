#!/bin/bash

# deploy-and-configure-widget.sh
# This script deploys the Multi Widget to Firebase hosting and creates a new configuration in Firestore.

echo "===== MULTI WIDGET DEPLOYMENT AND CONFIGURATION ====="
echo "This script will:"
echo "1. Deploy your widget code to Firebase hosting"
echo "2. Create a new widget configuration in Firestore"
echo "3. Provide you with the new widget ID and test URL"

# Change to the project root directory
cd "$(dirname "$0")"

# Step 1: Deploy to Firebase Hosting
echo -e "\n===== STEP 1: DEPLOYING TO FIREBASE HOSTING ====="

# Create a temporary directory for the hosting files
mkdir -p temp-hosting

# Copy the widget files to the temporary directory
cp public/multi-widget.js "temp-hosting/multi-widget.js"
cp public/multi-widget-adapter.js "temp-hosting/multi-widget-adapter.js"
cp public/widget-loader.js "temp-hosting/widget-loader.js"
cp public/test-widget.html "temp-hosting/test-widget.html"
cp public/multi-widget-test.html "temp-hosting/multi-widget-test.html"

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

# Return to project root
cd ..

# Step 2: Create a new widget configuration
echo -e "\n===== STEP 2: CREATING NEW WIDGET CONFIGURATION ====="
echo "Creating Multi Widget configuration in Firestore..."

# Run the configuration script
node create-multi-widget-config.js

# Get the widget ID from the file
WIDGET_ID=$(cat multi-widget-id.txt)

# Step 3: Display test information
echo -e "\n===== STEP 3: TEST INFORMATION ====="
echo "Deployment and configuration complete!"
echo "Widget ID: $WIDGET_ID"
echo "Test URL: https://adealo-ce238.web.app/multi-widget-test.html"
echo "To test, open the URL and enter your widget ID: $WIDGET_ID"

# Clean up
rm -rf temp-hosting

# Optional: Open the test page in the browser
read -p "Would you like to open the test page in your browser? (y/n): " OPEN_BROWSER
if [[ $OPEN_BROWSER == "y" || $OPEN_BROWSER == "Y" ]]; then
  if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    open "https://adealo-ce238.web.app/multi-widget-test.html"
  elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    xdg-open "https://adealo-ce238.web.app/multi-widget-test.html"
  elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    # Windows
    start "https://adealo-ce238.web.app/multi-widget-test.html"
  else
    echo "Could not open browser automatically. Please open the URL manually."
  fi
fi

echo "Done!"
