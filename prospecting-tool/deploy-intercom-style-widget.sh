#!/bin/bash

# Deploy Intercom-Style Widget
# This script deploys the Intercom-style widget files to Firebase hosting

# Set colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting Intercom-style widget deployment...${NC}"

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo -e "${RED}Error: Firebase CLI is not installed. Please install Firebase CLI and try again.${NC}"
    echo -e "${YELLOW}You can install Firebase CLI with: npm install -g firebase-tools${NC}"
    exit 1
fi

# Make the script files executable
echo -e "${YELLOW}Making script files executable...${NC}"
chmod +x run-create-intercom-widget-config.sh

# Copy the widget files to the public directory
echo -e "${YELLOW}Copying widget files to public directory...${NC}"

# Ensure the public directory exists
mkdir -p public

# Copy the widget files
cp public/intercom-style-widget.js public/intercom-style-widget-adapter.js public/

# Check if the files were copied successfully
if [ ! -f "public/intercom-style-widget.js" ] || [ ! -f "public/intercom-style-widget-adapter.js" ]; then
    echo -e "${RED}Error: Failed to copy widget files to public directory.${NC}"
    exit 1
fi

echo -e "${GREEN}Widget files copied successfully!${NC}"

# Deploy to Firebase hosting
echo -e "${YELLOW}Deploying to Firebase hosting...${NC}"
firebase deploy --only hosting:adealo-ce238 --public=public

# Check if the deployment was successful
if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Failed to deploy to Firebase hosting. Check the error messages above.${NC}"
    exit 1
fi

echo -e "${GREEN}Deployment completed successfully!${NC}"
echo -e "${YELLOW}The widget files are now available at:${NC}"
echo -e "${GREEN}https://adealo-ce238.web.app/intercom-style-widget.js${NC}"
echo -e "${GREEN}https://adealo-ce238.web.app/intercom-style-widget-adapter.js${NC}"

# Provide instructions for using the widget
echo -e "${YELLOW}To use this widget on your website, run the configuration script:${NC}"
echo -e "${GREEN}./run-create-intercom-widget-config.sh${NC}"
echo -e "${YELLOW}This will create a widget configuration in Firestore and provide you with the widget ID.${NC}"

exit 0
