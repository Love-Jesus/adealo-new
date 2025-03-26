#!/bin/bash

# Run Adealo Widget Test
# This script opens the Adealo Widget test page in the default browser

echo "Opening Adealo Widget test page in the default browser..."

# Ensure we're in the project directory
cd "$(dirname "$0")"

# Check if the test page exists
if [ -f "public/adealo-widget-test.html" ]; then
  echo "Test page found."
else
  echo "Error: Test page not found at public/adealo-widget-test.html"
  exit 1
fi

# Open the test page in the default browser
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  open "public/adealo-widget-test.html"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
  # Linux
  xdg-open "public/adealo-widget-test.html"
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" || "$OSTYPE" == "win32" ]]; then
  # Windows
  start "public/adealo-widget-test.html"
else
  echo "Unsupported operating system. Please open the test page manually at:"
  echo "$(pwd)/public/adealo-widget-test.html"
  exit 1
fi

echo "Test page opened. The widget should appear in the bottom right corner."
echo "You can also view the deployed test page at: https://adealo-ce238.web.app/adealo-widget-test.html"
