#!/bin/bash

# Run Test Intercom Widget
# This script deploys the test HTML file to Firebase hosting and opens it in a browser

# Set colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting Intercom-style widget production test...${NC}"

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo -e "${RED}Error: Firebase CLI is not installed. Please install Firebase CLI and try again.${NC}"
    echo -e "${YELLOW}You can install Firebase CLI with: npm install -g firebase-tools${NC}"
    
    # Try to open the test file locally instead
    echo -e "${YELLOW}Trying to open the test file locally instead...${NC}"
    
    if [ ! -f "public/intercom-style-production-test.html" ]; then
        echo -e "${RED}Error: Test file not found at public/intercom-style-production-test.html${NC}"
        exit 1
    fi
    
    # Try to open the file with the default browser
    if command -v open &> /dev/null; then
        open "public/intercom-style-production-test.html"
    elif command -v xdg-open &> /dev/null; then
        xdg-open "public/intercom-style-production-test.html"
    else
        echo -e "${YELLOW}Please open the test file manually:${NC}"
        echo -e "${GREEN}$PWD/public/intercom-style-production-test.html${NC}"
    fi
    
    exit 0
fi

# Check if the test file exists
if [ ! -f "public/intercom-style-production-test.html" ]; then
    echo -e "${RED}Error: Test file not found at public/intercom-style-production-test.html${NC}"
    exit 1
fi

# Check if the widget files exist
if [ ! -f "public/intercom-style-widget.js" ] || [ ! -f "public/intercom-style-widget-adapter.js" ]; then
    echo -e "${RED}Error: Widget files not found in the public directory.${NC}"
    echo -e "${YELLOW}Make sure the following files exist:${NC}"
    echo -e "${YELLOW}- public/intercom-style-widget.js${NC}"
    echo -e "${YELLOW}- public/intercom-style-widget-adapter.js${NC}"
    exit 1
fi

# Deploy to Firebase hosting
echo -e "${YELLOW}Deploying test files to Firebase hosting...${NC}"
firebase deploy --only hosting:adealo-ce238 --public=public

# Check if the deployment was successful
if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Failed to deploy to Firebase hosting. Check the error messages above.${NC}"
    exit 1
fi

echo -e "${GREEN}Deployment completed successfully!${NC}"

# Get the widget ID from the file if it exists
WIDGET_ID=""
if [ -f "intercom-widget-id.txt" ]; then
    WIDGET_ID=$(cat intercom-widget-id.txt)
    echo -e "${GREEN}Found widget ID: ${WIDGET_ID}${NC}"
fi

# Construct the URL
TEST_URL="https://adealo-ce238.web.app/intercom-style-production-test.html"
if [ ! -z "$WIDGET_ID" ]; then
    TEST_URL="${TEST_URL}?widgetId=${WIDGET_ID}"
fi

echo -e "${GREEN}Test page is available at: ${TEST_URL}${NC}"

# Try to open the URL in a browser
if command -v open &> /dev/null; then
    echo -e "${YELLOW}Opening test page in browser...${NC}"
    open "$TEST_URL"
elif command -v xdg-open &> /dev/null; then
    echo -e "${YELLOW}Opening test page in browser...${NC}"
    xdg-open "$TEST_URL"
else
    echo -e "${YELLOW}Please open the test page manually:${NC}"
    echo -e "${GREEN}${TEST_URL}${NC}"
fi

echo -e "${GREEN}Test setup completed successfully!${NC}"
echo -e "${YELLOW}If you don't have a widget ID yet, you can create one by running:${NC}"
echo -e "${GREEN}./run-create-intercom-widget-config.sh${NC}"

exit 0
