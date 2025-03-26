#!/bin/bash

# Run Intercom-Style Widget Test
# This script creates a simple test environment for the Intercom-style widget

# Set colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Setting up Intercom-style widget test environment...${NC}"

# Create test HTML file if it doesn't exist
TEST_HTML="public/intercom-style-test.html"

if [ ! -f "$TEST_HTML" ]; then
    echo -e "${YELLOW}Creating test HTML file...${NC}"
    
    # Create the test HTML file
    cat > "$TEST_HTML" << EOL
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Intercom-Style Widget Test</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      margin: 0;
      padding: 20px;
      color: #333;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    h1 {
      color: #6366f1;
      margin-bottom: 20px;
    }
    p {
      margin-bottom: 20px;
    }
    .card {
      background-color: #f9fafb;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }
    .info {
      background-color: #f0f9ff;
      border-left: 4px solid #6366f1;
      padding: 15px;
      margin-bottom: 20px;
    }
    code {
      background-color: #f1f5f9;
      padding: 2px 4px;
      border-radius: 4px;
      font-family: monospace;
    }
    .widget-id-form {
      margin-bottom: 20px;
    }
    .widget-id-form input {
      padding: 8px 12px;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      font-size: 14px;
      width: 300px;
    }
    .widget-id-form button {
      padding: 8px 16px;
      background-color: #6366f1;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      margin-left: 8px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Intercom-Style Widget Test</h1>
    
    <div class="info">
      <p>This page demonstrates the Intercom-style chat widget.</p>
      <p>Enter a widget ID below to test a specific configuration, or leave it blank to use the default test widget.</p>
    </div>
    
    <div class="widget-id-form">
      <input type="text" id="widgetIdInput" placeholder="Enter Widget ID (optional)">
      <button onclick="loadWidget()">Load Widget</button>
    </div>
    
    <div class="card">
      <h2>About Adealo</h2>
      <p>Adealo is a powerful prospecting tool that helps businesses find and connect with potential customers.</p>
      <p>Our platform provides advanced features for lead generation, customer engagement, and sales acceleration.</p>
    </div>
    
    <div class="card">
      <h2>Key Features</h2>
      <ul>
        <li>Intelligent lead discovery</li>
        <li>Automated outreach campaigns</li>
        <li>Advanced analytics and reporting</li>
        <li>CRM integration</li>
        <li>Team collaboration tools</li>
      </ul>
    </div>
    
    <p>Click on the chat widget in the bottom-right corner to test the different features.</p>
  </div>
  
  <script>
    // Function to load the widget with the specified ID
    function loadWidget() {
      // Remove any existing widget scripts
      const existingScripts = document.querySelectorAll('script[src*="intercom-style-widget"]');
      existingScripts.forEach(script => script.remove());
      
      // Remove any existing widget containers
      const existingContainers = document.getElementById('adealo-widget-container');
      if (existingContainers) {
        existingContainers.remove();
      }
      
      // Get the widget ID from the input field
      const widgetId = document.getElementById('widgetIdInput').value.trim();
      
      // Create the widget config script
      const configScript = document.createElement('script');
      configScript.textContent = \`
        window.widgetConfig = {
          id: '\${widgetId || "test-widget-id"}'
        };
      \`;
      document.head.appendChild(configScript);
      
      // Create the widget script
      const widgetScript = document.createElement('script');
      widgetScript.src = './intercom-style-widget-adapter.js';
      widgetScript.setAttribute('data-widget-id', widgetId || 'test-widget-id');
      document.head.appendChild(widgetScript);
      
      // Update the info box
      const infoBox = document.querySelector('.info');
      infoBox.innerHTML = \`
        <p><strong>Widget ID:</strong> <code>\${widgetId || "test-widget-id"}</code></p>
        <p>The widget has been loaded. Click on the chat icon in the bottom-right corner to test it.</p>
      \`;
    }
    
    // Load the widget on page load
    window.onload = loadWidget;
  </script>
</body>
</html>
EOL

    echo -e "${GREEN}Test HTML file created at: $TEST_HTML${NC}"
else
    echo -e "${GREEN}Test HTML file already exists at: $TEST_HTML${NC}"
fi

# Check if the widget files exist
if [ ! -f "public/intercom-style-widget.js" ] || [ ! -f "public/intercom-style-widget-adapter.js" ]; then
    echo -e "${RED}Error: Widget files not found in the public directory.${NC}"
    echo -e "${YELLOW}Make sure the following files exist:${NC}"
    echo -e "${YELLOW}- public/intercom-style-widget.js${NC}"
    echo -e "${YELLOW}- public/intercom-style-widget-adapter.js${NC}"
    exit 1
fi

# Determine the best way to open the test file
if command -v python3 &> /dev/null; then
    echo -e "${YELLOW}Starting a local server using Python...${NC}"
    echo -e "${GREEN}Test page will be available at: http://localhost:8000/public/intercom-style-test.html${NC}"
    echo -e "${YELLOW}Press Ctrl+C to stop the server when done.${NC}"
    
    # Start a simple HTTP server
    cd "$(dirname "$0")" # Change to the script's directory
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    echo -e "${YELLOW}Starting a local server using Python...${NC}"
    echo -e "${GREEN}Test page will be available at: http://localhost:8000/public/intercom-style-test.html${NC}"
    echo -e "${YELLOW}Press Ctrl+C to stop the server when done.${NC}"
    
    # Start a simple HTTP server
    cd "$(dirname "$0")" # Change to the script's directory
    python -m SimpleHTTPServer 8000
elif command -v npx &> /dev/null; then
    echo -e "${YELLOW}Starting a local server using npx serve...${NC}"
    echo -e "${GREEN}Test page will be available at: http://localhost:3000/public/intercom-style-test.html${NC}"
    echo -e "${YELLOW}Press Ctrl+C to stop the server when done.${NC}"
    
    # Start a server using npx serve
    npx serve .
elif command -v open &> /dev/null; then
    echo -e "${YELLOW}Opening the test file directly...${NC}"
    echo -e "${YELLOW}Note: Some features may not work correctly when opened directly from the file system.${NC}"
    
    # Open the file directly
    open "$TEST_HTML"
elif command -v xdg-open &> /dev/null; then
    echo -e "${YELLOW}Opening the test file directly...${NC}"
    echo -e "${YELLOW}Note: Some features may not work correctly when opened directly from the file system.${NC}"
    
    # Open the file directly
    xdg-open "$TEST_HTML"
else
    echo -e "${YELLOW}Please open the test file manually:${NC}"
    echo -e "${GREEN}$PWD/$TEST_HTML${NC}"
fi

exit 0
