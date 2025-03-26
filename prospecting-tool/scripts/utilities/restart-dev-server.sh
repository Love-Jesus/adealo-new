#!/bin/bash

# Restart the development server and test the API endpoint
# This script stops any running development servers and starts a new one

# Set the base directory to the current directory
BASE_DIR="$(pwd)"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Restarting development server...${NC}"

# Stop any running development servers
echo -e "${YELLOW}Stopping any running development servers...${NC}"
pkill -f "vite" || true
sleep 2

# Start the development server
echo -e "${YELLOW}Starting development server...${NC}"
cd "$BASE_DIR"
npm run dev &

# Wait for the server to start
echo -e "${YELLOW}Waiting for development server to start...${NC}"
while ! curl -s http://localhost:5173 > /dev/null; do
  sleep 1
done
echo -e "${GREEN}Development server started successfully!${NC}"

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

echo -e "${GREEN}Development server restarted and test page opened!${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop the development server when you're done.${NC}"
