#!/bin/bash

# This script deploys the chat widget functions to Firebase

# Change to the project directory
cd "$(dirname "$0")"

# Build the functions
echo "Building functions..."
cd functions
npm run build
cd ..

# Deploy the widget functions
echo "Deploying widget functions..."
firebase deploy --only functions:getWidgetScriptHttp,functions:trackWidgetInteractionHttp

echo ""
echo "Deployment complete!"
echo ""
echo "You can now test the chat widget at:"
echo "https://adealo-ce238.web.app/cors-test-chat-widget.html"
echo ""
echo "Or with your local development server using:"
echo "./run-local-chat-widget-test.sh"
echo ""
echo "Make sure to use the widget ID: aTHwvPFrdIziL0DEYUOr"
