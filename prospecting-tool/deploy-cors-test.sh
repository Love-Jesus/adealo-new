#!/bin/bash

# Deploy the CORS test page to Firebase hosting
echo "Deploying CORS test page to Firebase hosting..."
cd prospecting-tool

# Deploy only the CORS test page
firebase deploy --only hosting:adealo-ce238 --public public

echo "CORS test page deployed successfully!"
echo "You can now test the widget with the following URL:"
echo "- https://adealo-ce238.web.app/cors-test-widget.html"
