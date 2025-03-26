#!/bin/bash

# This script deploys the widget configuration functions to Firebase.

echo "Deploying widget configuration functions to Firebase..."

# Change to the project root directory
cd "$(dirname "$0")"

# Build the functions
echo "Building functions..."
cd functions
npm run build

# Deploy only the widget configuration functions
echo "Deploying widget configuration functions..."
firebase deploy --only functions:getWidgetConfig,functions:getWidgetConfigHttp,functions:trackWidgetInteractionHttp,functions:widget

echo "Widget configuration functions deployed successfully!"
