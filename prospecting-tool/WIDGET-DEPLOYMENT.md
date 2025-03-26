# Widget Deployment Guide

This guide provides instructions on how to deploy the widget-related Firebase functions and use the widget embed code in your application.

## Firebase Functions Deployment

There are currently some issues with deploying the Firebase functions due to version conflicts and Google Cloud Functions generation compatibility. Here are the options to resolve this:

### Option 1: Use the Example Widget Code

The application now includes an "Example Code" tab in the widget embed dialog. This provides a standalone JavaScript widget that works without requiring the Firebase functions to be deployed. This is the recommended approach for now.

To use the example widget code:

1. Create a widget in the application
2. Set the widget to "Active" status
3. Click on "Get Embed Code" in the widget actions menu
4. If the Firebase function fails, the dialog will automatically switch to the "Example Code" tab
5. Copy the example code and paste it into your website's HTML just before the closing `</body>` tag
6. Update the `calendlyUrl` in the code with your actual Calendly URL

### Option 2: Update Firebase Functions Configuration

If you want to deploy the Firebase functions, you'll need to resolve the version conflicts:

1. Update the `firebase.json` file to specify Gen 1 for all functions:
   ```json
   "functions": [
     {
       "predeploy": [
         "npm --prefix \"$RESOURCE_DIR\" run build"
       ],
       "source": "functions",
       "codebase": "default",
       "gen": 1
     }
   ]
   ```

2. Update the `functions/package.json` file to use Node.js 18:
   ```json
   "engines": {
     "node": "18"
   }
   ```

3. Use the `deploy-widget-only.sh` script to deploy only the widget-related functions:
   ```bash
   chmod +x deploy-widget-only.sh
   ./deploy-widget-only.sh
   ```

## Troubleshooting

If you encounter issues with the Firebase functions deployment:

1. Check the Firebase console for error messages
2. Verify that your Firebase project is properly configured
3. Make sure you have the correct permissions to deploy functions
4. Try using the example widget code as a fallback solution

## Future Improvements

For a more robust solution, consider:

1. Upgrading to Firebase Functions v6+ and resolving all dependency conflicts
2. Migrating to Google Cloud Functions Gen 2
3. Implementing a more comprehensive error handling strategy
4. Adding more widget types and customization options

## Support

If you need further assistance, please contact the development team or refer to the Firebase documentation:
- [Firebase Functions Documentation](https://firebase.google.com/docs/functions)
- [Google Cloud Functions Documentation](https://cloud.google.com/functions/docs)
