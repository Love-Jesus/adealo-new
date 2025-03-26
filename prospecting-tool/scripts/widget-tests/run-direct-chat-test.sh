#!/bin/bash

# Run the direct chat test
# This script starts the development server if it's not already running
# and opens the direct chat test page in the browser

# Set the base directory to the current directory
BASE_DIR="$(pwd)"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting direct chat test...${NC}"

# Check if the development server is already running
if ! curl -s http://localhost:5173 > /dev/null; then
  echo -e "${YELLOW}Development server is not running. Starting it now...${NC}"
  cd "$BASE_DIR"
  npm run dev &
  
  # Wait for the server to start
  echo -e "${YELLOW}Waiting for development server to start...${NC}"
  while ! curl -s http://localhost:5173 > /dev/null; do
    sleep 1
  done
  echo -e "${GREEN}Development server started successfully!${NC}"
else
  echo -e "${GREEN}Development server is already running.${NC}"
fi

# Open the direct chat test page
echo -e "${YELLOW}Opening direct chat test page...${NC}"
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  open http://localhost:5173/direct-chat-test.html
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
  # Linux
  xdg-open http://localhost:5173/direct-chat-test.html
else
  # Windows or other
  echo -e "${YELLOW}Please open this URL in your browser:${NC}"
  echo -e "${GREEN}http://localhost:5173/direct-chat-test.html${NC}"
fi

echo -e "${GREEN}Direct chat test started!${NC}"
echo -e "${YELLOW}You can test the API endpoint by clicking 'Test API Endpoint' on the test page.${NC}"
echo -e "${YELLOW}If the API endpoint doesn't work, you can create the widget directly by clicking 'Create Widget Directly'.${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop the development server when you're done.${NC}"
