#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Adealo Chat Widget Real-time Testing ===${NC}"
echo -e "${YELLOW}This script will set up a real-time chat widget test environment.${NC}"
echo

# Check if Firebase emulator is running
echo -e "${BLUE}Checking if Firebase emulator is running...${NC}"
if lsof -i :8080 > /dev/null; then
  echo -e "${GREEN}Firebase emulator is already running.${NC}"
else
  echo -e "${YELLOW}Firebase emulator is not running. Starting it...${NC}"
  echo -e "${YELLOW}Starting Firebase emulators in a new terminal window...${NC}"
  
  # Start Firebase emulators in a new terminal window
  if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    osascript -e 'tell app "Terminal" to do script "cd \"'$PWD'\" && firebase emulators:start"'
  else
    # Linux or other Unix-like systems
    x-terminal-emulator -e "cd \"$PWD\" && firebase emulators:start" &
  fi
  
  echo -e "${YELLOW}Waiting for Firebase emulators to start...${NC}"
  sleep 10
fi

# Check if development server is running
echo -e "${BLUE}Checking if development server is running...${NC}"
if lsof -i :5173 > /dev/null; then
  echo -e "${GREEN}Development server is already running.${NC}"
else
  echo -e "${YELLOW}Development server is not running. Starting it...${NC}"
  echo -e "${YELLOW}Starting development server in a new terminal window...${NC}"
  
  # Start development server in a new terminal window
  if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    osascript -e 'tell app "Terminal" to do script "cd \"'$PWD'\" && npm run dev"'
  else
    # Linux or other Unix-like systems
    x-terminal-emulator -e "cd \"$PWD\" && npm run dev" &
  fi
  
  echo -e "${YELLOW}Waiting for development server to start...${NC}"
  sleep 10
fi

# Open the test page in the default browser
echo -e "${BLUE}Opening real chat test page in browser...${NC}"
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  open "http://localhost:5173/public/real-chat-test.html"
else
  # Linux or other Unix-like systems
  xdg-open "http://localhost:5173/public/real-chat-test.html"
fi

# Also open the admin dashboard in a new browser tab
echo -e "${BLUE}Opening admin dashboard in a new browser tab...${NC}"
sleep 2
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  open "http://localhost:5173/chat"
else
  # Linux or other Unix-like systems
  xdg-open "http://localhost:5173/chat"
fi

echo
echo -e "${GREEN}=== Test Environment Setup Complete ===${NC}"
echo -e "${YELLOW}Instructions:${NC}"
echo -e "1. In the test page, click 'Initialize Chat' to create a new conversation"
echo -e "2. Send messages through the chat widget"
echo -e "3. Open http://localhost:5173/chat in another browser window to see the admin view"
echo -e "4. Messages sent from the widget should appear in the admin dashboard"
echo
echo -e "${BLUE}To stop the servers when done:${NC}"
echo -e "Run: ${YELLOW}./prospecting-tool/stop-dev-servers.sh${NC}"
