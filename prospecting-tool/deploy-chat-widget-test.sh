#!/bin/bash

# This script deploys the chat widget test files to Firebase hosting
# and updates the necessary functions to support the chat widget

# Change to the project directory
cd "$(dirname "$0")"

# Build the project
echo "Building the project..."
npm run build

# Deploy the widget functions with CORS support
echo "Deploying widget functions with CORS support..."
firebase deploy --only functions:getWidgetScriptHttp,functions:trackWidgetInteractionHttp

# Deploy the public files
echo "Deploying public files..."
firebase deploy --only hosting

echo ""
echo "Deployment complete!"
echo ""
echo "You can now test the chat widget at:"
echo "https://adealo-ce238.web.app/cors-test-chat-widget.html"
echo ""
echo "Note: You'll need to create a Support Chat widget in the admin interface"
echo "and use its ID in the widget embed code to fully test the functionality."
echo ""
echo "To create a Support Chat widget:"
echo "1. Go to the Widgets page in the admin interface"
echo "2. Click 'Create Widget'"
echo "3. Select 'Support Chat' as the widget type"
echo "4. Configure the widget settings and save"
echo "5. Activate the widget"
echo "6. Get the widget ID from the embed code"
echo "7. Update the widget ID in the cors-test-chat-widget.html file"
echo ""
echo "The current widget ID in the test file is: 35hyPrUz5VVIQvYyelk5"
echo "Replace this with your actual widget ID if needed."
