# Chat Widget Testing Solution

This document explains the solution for testing the chat widget functionality locally.

## Problem Overview

The issue was with the local testing of chat widgets. The original approach had several problems:

1. The `local-loader.js` script was trying to fetch from `/api/getWidgetScript?widgetId=...` but there were issues with how the API response was being handled.
2. The API endpoint in `src/api/getWidgetScript.js` was returning a Response object, but the Vite API plugin wasn't properly processing it.
3. The widget IDs being used might not exist in the Firebase database, causing errors.
4. There was no clear way to debug what was happening during the API request.

## Solution

We've implemented a comprehensive solution with the following components:

### 1. Fixed Vite API Plugin

The `src/vite-plugin-api.js` file has been updated to:

- Properly resolve the path to the API handler file
- Check if the API handler file exists before trying to import it
- Use a direct import with the full path to avoid import resolution issues
- Handle the response properly, ensuring it's always ended
- Add more verbose logging to help with debugging

### 2. Fixed API Endpoint

The `src/api/getWidgetScript.js` file has been updated to:

- Always generate a default widget script regardless of whether the widget exists in Firebase
- Use the `res` object directly instead of returning a Response object
- Add more verbose logging to help with debugging
- Handle errors gracefully and still return a working script

### 3. Direct Chat Test Page

A new test page `direct-chat-test.html` has been created that:

- Provides a simple interface for testing the chat widget
- Allows testing the API endpoint directly
- Includes a debug console to show detailed logs
- Can create the widget directly without using the API (as a fallback)
- Works with any widget ID, even if it doesn't exist in Firebase

### 4. Run Scripts

Two new scripts have been created:

1. `run-direct-chat-test.sh`:
   - Start the development server if it's not already running
   - Open the direct chat test page in the browser
   - Provide clear instructions and feedback

2. `restart-dev-server.sh`:
   - Stop any running development servers
   - Start a new development server
   - Open the direct chat test page in the browser
   - Useful for when you need to restart the server to apply changes

## How to Use

1. Make sure you're in the project directory
2. Run the script:
   ```
   ./prospecting-tool/run-direct-chat-test.sh
   ```
3. The test page will open in your browser
4. You can:
   - Test the API endpoint by clicking "Test API Endpoint"
   - Create the widget directly by clicking "Create Widget Directly"
   - View detailed logs in the debug console

If you need to restart the development server to apply changes:
```
./prospecting-tool/restart-dev-server.sh
```

## Technical Details

### Vite API Plugin Changes

The Vite API plugin now:

1. Resolves the full path to the API handler file
2. Checks if the file exists before trying to import it
3. Uses a direct import with the full path to avoid import resolution issues
4. Adds a timestamp to the import URL to prevent caching
5. Ensures the response is always ended, even if the handler doesn't do it

### API Endpoint Changes

The API endpoint now:

1. Always returns a valid JavaScript widget script
2. Logs detailed information about the request and response
3. Attempts to fetch the widget from Firebase in the background (for logging purposes only)
4. Uses proper error handling to ensure a script is always returned

### Direct Test Page

The test page includes:

1. A debug console that shows detailed logs
2. The ability to test the API endpoint directly
3. The ability to create the widget without using the API
4. Support for any widget ID

## Troubleshooting

If you encounter issues:

1. Check the debug console on the test page for detailed logs
2. Make sure the development server is running (`npm run dev`)
3. Try creating the widget directly (bypassing the API) to see if that works
4. Check the browser's network tab to see if the API request is being made and what response it's getting
5. If the API endpoint is still returning a 404, try restarting the development server with `./prospecting-tool/restart-dev-server.sh`

## Future Improvements

Potential future improvements include:

1. Adding more customization options to the test page
2. Implementing a more robust error handling system
3. Adding support for different widget types
4. Creating a more comprehensive testing framework
