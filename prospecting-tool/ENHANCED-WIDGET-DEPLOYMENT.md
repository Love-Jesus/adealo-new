# Enhanced Widget Deployment Guide

This guide explains how to deploy and test the enhanced widget system.

## Overview

The enhanced widget system provides a more customizable and feature-rich widget experience with:

- Gradient colors
- Custom shadows
- Animation effects
- Multiple launcher shapes
- Pulse animation
- Media (image/video) support
- Advanced theming options

## Deployment Process

### 1. Deploy the Enhanced Widget

To deploy the enhanced widget configuration functions and test page to Firebase:

```bash
./deploy-enhanced-widget.sh
```

This script:
- Deploys the widget configuration functions to Firebase
- Deploys the enhanced widget test page to Firebase hosting
- Sets up proper CORS headers for cross-domain access

After deployment, you can access the test page at: https://adealo-ce238.web.app

### 2. Create an Enhanced Widget Configuration

To create a new enhanced widget configuration in the production environment:

```bash
./run-enhanced-widget-config.sh
```

This will generate a widget ID that you can use in the test page.

For local testing with the Firebase emulator:

```bash
./run-enhanced-widget-config-local.sh
```

### 3. Test the Enhanced Widget

You can test the enhanced widget in two ways:

1. **Production Test Page**: Visit https://adealo-ce238.web.app and enter your widget ID
2. **Local Test Page**: Run `./run-enhanced-widget-test.sh` and enter your widget ID

## Test Page Features

The enhanced widget test page includes:

- A form to enter a widget ID
- A console panel for logging and debugging
- Network request monitoring
- Error tracking
- Log export functionality

### Console Panel

The console panel provides:

- Color-coded log levels (info, success, warning, error)
- Timestamps for all logs
- Network request tracking
- Collapsible details for network responses
- Ability to save logs to a file
- Toggle to hide/show the console

## Troubleshooting

### Widget Not Loading

If the widget doesn't load:

1. Check the console panel for errors
2. Verify the widget ID is correct
3. Ensure the widget configuration exists in Firestore
4. Check network requests for any API errors

### Deployment Failures

If deployment fails:

1. Check that you have the correct Firebase permissions
2. Ensure the Firebase CLI is properly configured
3. Verify that the functions build successfully
4. Check for any error messages in the deployment output

## File Structure

- `deploy-enhanced-widget.sh`: Deploys the enhanced widget to Firebase
- `create-enhanced-widget-config.cjs`: Creates a widget configuration in production
- `create-enhanced-widget-config-local.cjs`: Creates a widget configuration in the local emulator
- `run-enhanced-widget-config.sh`: Runs the production configuration script
- `run-enhanced-widget-config-local.sh`: Runs the local emulator configuration script
- `run-enhanced-widget-test.sh`: Starts a local server to test the widget
- `public/enhanced-widget-test-production.html`: The production test page with console panel
- `public/enhanced-widget-test.html`: The local test page

## Best Practices

1. Always test new widget configurations locally before deploying to production
2. Use the console panel to debug any issues
3. Save logs when reporting problems
4. Create a new widget configuration for each major design change
5. Document widget IDs and their configurations for future reference
