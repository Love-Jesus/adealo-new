#!/bin/bash

# Run Create Intercom Widget Config Script
# This script runs the create-intercom-widget-config.js script and deploys the widget files to Firebase hosting

# Set colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting Intercom-style widget configuration process...${NC}"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed. Please install Node.js and try again.${NC}"
    exit 1
fi

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo -e "${YELLOW}Warning: Firebase CLI is not installed. Deployment steps will be skipped.${NC}"
    SKIP_DEPLOY=true
else
    SKIP_DEPLOY=false
fi

# Create the widget configuration in Firestore
echo -e "${YELLOW}Creating widget configuration in Firestore...${NC}"

# Try to use the CommonJS version first
if [ -f "create-intercom-widget-config.cjs" ]; then
    echo -e "${YELLOW}Using CommonJS version of the script...${NC}"
    node create-intercom-widget-config.cjs
else
    # Fall back to the ES module version
    echo -e "${YELLOW}Using ES module version of the script...${NC}"
    node create-intercom-widget-config.js
fi

# Check if the script executed successfully
if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Failed to create widget configuration. Check the error messages above.${NC}"
    exit 1
fi

echo -e "${GREEN}Widget configuration created successfully!${NC}"

# Check if the widget ID file was created
if [ ! -f "intercom-widget-id.txt" ]; then
    echo -e "${RED}Error: Widget ID file not found. The configuration script may have failed.${NC}"
    exit 1
fi

# Read the widget ID from the file
WIDGET_ID=$(cat intercom-widget-id.txt)
echo -e "${GREEN}Widget ID: ${WIDGET_ID}${NC}"

# Deploy the widget files to Firebase hosting if Firebase CLI is installed
if [ "$SKIP_DEPLOY" = false ]; then
    echo -e "${YELLOW}Deploying widget files to Firebase hosting...${NC}"
    
    # Deploy only the necessary files
    firebase deploy --only hosting:adealo-ce238 --public=public
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}Error: Failed to deploy widget files. Check the error messages above.${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}Widget files deployed successfully!${NC}"
    
    # Print the URL to test the widget
    echo -e "${GREEN}You can test the widget at: https://adealo-ce238.web.app/intercom-widget-test.html${NC}"
else
    echo -e "${YELLOW}Skipping deployment steps. To deploy manually, run:${NC}"
    echo -e "${YELLOW}firebase deploy --only hosting:adealo-ce238 --public=public${NC}"
    echo -e "${YELLOW}You can test the widget locally by opening:${NC}"
    echo -e "${YELLOW}./public/intercom-widget-test.html${NC}"
fi

echo -e "${GREEN}Process completed successfully!${NC}"
echo -e "${YELLOW}To use this widget on your website, add the following code:${NC}"
echo -e "${YELLOW}<script>window.widgetConfig = { id: '${WIDGET_ID}' };</script>${NC}"
echo -e "${YELLOW}<script src=\"https://us-central1-adealo-ce238.web.app/intercom-style-widget-adapter.js\" data-widget-id=\"${WIDGET_ID}\"></script>${NC}"

exit 0
