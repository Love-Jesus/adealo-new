#!/bin/bash

# Deploy Widget Adapter Redirect Functions
# This script deploys the widget adapter redirect functions to Firebase Functions

echo "Deploying Widget Adapter Redirect Functions to Firebase Functions..."

# Ensure we're in the project directory
cd "$(dirname "$0")"

# Deploy only the widget adapter redirect functions to Firebase Functions
echo "Deploying widget adapter redirect functions..."
firebase deploy --only functions:intercomStyleWidgetAdapter,functions:widgetScript

echo "Deployment complete!"
echo "Widget adapter redirect functions are now available at:"
echo "- https://us-central1-adealo-ce238.web.app/intercom-style-widget-adapter.js"
echo "- https://us-central1-adealo-ce238.web.app/widget.js"
echo ""
echo "These functions redirect to the actual scripts on Firebase Hosting:"
echo "- https://adealo-ce238.web.app/intercom-style-widget-adapter.js"
echo "- https://adealo-ce238.web.app/widget.js"
