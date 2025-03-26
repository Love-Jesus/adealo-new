#!/bin/bash

# Deploy only the widget functions with CORS support
echo "Deploying widget functions with CORS support..."
# We're already in the prospecting-tool directory when running from the project root
firebase deploy --only functions:getWidgetScript,functions:getWidgetScriptHttp,functions:trackWidgetInteraction,functions:trackWidgetInteractionHttp

echo "Widget functions deployed successfully!"
echo "You can now test the widget with the following URLs:"
echo "- HTTP endpoint: https://us-central1-adealo-ce238.cloudfunctions.net/getWidgetScriptHttp?widgetId=WnwIUWLRHxM09A6EYJPY"
echo "- Callable function: https://us-central1-adealo-ce238.cloudfunctions.net/getWidgetScript"
echo "- HTTP tracking endpoint: https://us-central1-adealo-ce238.cloudfunctions.net/trackWidgetInteractionHttp"
echo "- Callable tracking function: https://us-central1-adealo-ce238.cloudfunctions.net/trackWidgetInteraction"
