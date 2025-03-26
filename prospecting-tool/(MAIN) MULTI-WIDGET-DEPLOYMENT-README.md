# Multi Widget Deployment and Configuration

This document explains how to deploy and configure the Multi Widget system.

## Understanding the Multi Widget System

The Multi Widget system consists of two main components:

1. **Widget Code**: The JavaScript files that implement the widget functionality
   - `multi-widget.js`: The main widget implementation
   - `multi-widget-adapter.js`: Adapter for loading the widget
   - `widget-loader.js`: Loader script for embedding the widget

2. **Widget Configuration**: The configuration stored in Firestore that defines the widget's appearance and behavior
   - Each widget configuration has a unique ID
   - The widget code uses this ID to fetch the configuration from Firestore

## Important Note About Widget Updates

When you make changes to the widget code, you need to:

1. Deploy the updated code to Firebase hosting
2. Create a new widget configuration in Firestore
3. Use the new widget ID to test the widget

This is because the widget configuration is tied to a specific version of the widget code. If you update the widget code but use an old widget ID, you may see unexpected behavior.

## Using the Combined Deployment Script

We've created a single script that handles both deployment and configuration:

```bash
./deploy-and-configure-widget.sh
```

This script will:

1. Deploy your widget code to Firebase hosting
2. Create a new widget configuration in Firestore
3. Provide you with the new widget ID and test URL
4. Optionally open the test page in your browser

## Manual Deployment and Configuration

If you prefer to deploy and configure the widget manually, you can use the following scripts:

1. Deploy the widget code:
   ```bash
   ./deploy-multi-widget.sh
   ```

2. Create a new widget configuration:
   ```bash
   ./run-create-multi-widget-config.sh
   ```

## Testing the Widget

To test the widget:

1. Open the test page: https://adealo-ce238.web.app/multi-widget-test.html
2. Enter your widget ID in the input field
3. Click "Load Widget" to see the widget in action

## Troubleshooting

If you're not seeing your changes reflected in the widget:

1. Make sure you're using the correct widget ID (the one created after your code changes)
2. Try clearing your browser cache or using incognito mode
3. Check the browser console for any errors
4. Verify that the deployment was successful
