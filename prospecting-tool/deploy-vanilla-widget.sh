#!/bin/bash

# Deploy Vanilla Widget
# This script deploys the vanilla JavaScript widget to Firebase

echo "Deploying vanilla JavaScript widget to Firebase..."

# Change to the project directory
cd "$(dirname "$0")"

# Deploy the widget configuration functions
echo "Deploying widget configuration functions..."
firebase deploy --only functions:getWidgetConfig,functions:getWidgetConfigHttp,functions:trackWidgetInteractionHttp,functions:widget

# Deploy the widget script and loader script
echo "Deploying widget script and loader script..."
firebase deploy --only hosting:public/widget.js,hosting:public/widget-loader.js

echo "Deployment complete!"
echo "The widget is now available at:"
echo "  - Widget Script: https://adealo-ce238.web.app/widget.js"
echo "  - Widget Loader Script: https://adealo-ce238.web.app/widget-loader.js"
echo "  - Widget Configuration API: https://us-central1-adealo-ce238.cloudfunctions.net/getWidgetConfigHttp"
echo ""
echo "To test the widget, run:"
echo "  ./run-test-widget.sh"
echo "  ./run-enhanced-widget-test.sh"
