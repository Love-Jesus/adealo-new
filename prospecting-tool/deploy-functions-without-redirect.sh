#!/bin/bash

# Deploy functions without the intercomStyleWidgetAdapter redirect
echo "Deploying functions without the redirect..."
cd prospecting-tool/functions
npm run build
firebase deploy --only functions --project adealo-ce238

echo "Functions deployment completed."
