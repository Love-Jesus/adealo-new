#!/bin/bash

# Deploy Adealo Widget Script
# This script deploys the widget files to Firebase Hosting

echo "Deploying Adealo Widget to Firebase Hosting..."

# Ensure we're in the project directory
cd "$(dirname "$0")"

# Check if widget files exist in public directory
if [ -f "public/widget.js" ]; then
  echo "Widget file exists in public directory"
else
  echo "Error: widget.js not found in public directory"
  exit 1
fi

# Deploy widget files to Firebase Hosting
echo "Deploying widget files to Firebase Hosting..."
firebase deploy --only hosting:adealo-ce238 --public public

echo "Deployment complete!"
echo "Widget is now available at: https://adealo-ce238.web.app/widget.js"
echo "Test page is available at: https://adealo-ce238.web.app/widget-test.html"

echo ""
echo "To use the widget, add the following script tag to your HTML:"
echo "<script src=\"https://adealo-ce238.web.app/widget.js\" data-widget-id=\"YOUR_WIDGET_ID\"></script>"
echo ""
echo "Or use the configuration object:"
echo "<script>"
echo "  window.widgetConfig = {"
echo "    id: \"YOUR_WIDGET_ID\","
echo "    design: { /* your design options */ },"
echo "    content: { /* your content options */ }"
echo "  };"
echo "</script>"
echo "<script src=\"https://adealo-ce238.web.app/widget.js\"></script>"
