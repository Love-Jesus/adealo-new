#!/bin/bash

# Update Widget Functions
# This script updates the Firebase Functions to ensure they fully support the enhanced widget configuration

echo "Updating widget functions to support enhanced widget configuration..."

# Change to the project directory
cd "$(dirname "$0")"

# Deploy the widget configuration functions
echo "Deploying widget configuration functions..."
firebase deploy --only functions:getWidgetConfig,functions:getWidgetConfigHttp,functions:trackWidgetInteractionHttp,functions:widget

echo "Widget functions updated successfully!"
echo "The widget functions now fully support the enhanced widget configuration."
echo ""
echo "To test the widget, run:"
echo "  ./run-enhanced-widget-test.sh"
