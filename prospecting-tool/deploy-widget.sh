#!/bin/bash

# Adealo Widget Deployment Script
# This script deploys the widget system to Firebase hosting and functions

echo "===== Adealo Widget Deployment Script ====="
echo "This script will deploy the widget system to Firebase."
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "Firebase CLI is not installed. Please install it with:"
    echo "npm install -g firebase-tools"
    exit 1
fi

# Check if user is logged in to Firebase
firebase projects:list &> /dev/null
if [ $? -ne 0 ]; then
    echo "You are not logged in to Firebase. Please login with:"
    echo "firebase login"
    exit 1
fi

# Build functions
echo "Building Firebase Functions..."
cd functions
npm run build
if [ $? -ne 0 ]; then
    echo "Error building functions. Please check the error messages above."
    exit 1
fi
cd ..

# Deploy to Firebase
echo "Deploying to Firebase..."
firebase deploy --only hosting,functions:getWidgetScript,functions:trackWidgetInteraction

if [ $? -eq 0 ]; then
    echo ""
    echo "===== Deployment Successful! ====="
    echo ""
    echo "Your widget system is now deployed to Firebase."
    echo ""
    echo "Widget Embed Code:"
    echo "<!-- Adealo Widget -->"
    echo "<script>"
    echo "  (function(w,d,s,o,f,js,fjs){"
    echo "    w['AdealoWidget']=o;w[o]=w[o]||function(){(w[o].q=w[o].q||[]).push(arguments)};"
    echo "    w[o].l=1*new Date();js=d.createElement(s);fjs=d.getElementsByTagName(s)[0];"
    echo "    js.async=1;js.src=f;fjs.parentNode.insertBefore(js,fjs);"
    echo "  })(window,document,'script','adealo','https://adealo-ce238.web.app/loader.js');"
    echo "  adealo('init', 'YOUR_WIDGET_ID');"
    echo "</script>"
    echo "<!-- End Adealo Widget -->"
    echo ""
    echo "Test your widget at: https://adealo-ce238.web.app/test-widget.html"
    echo ""
else
    echo "Deployment failed. Please check the error messages above."
    exit 1
fi
