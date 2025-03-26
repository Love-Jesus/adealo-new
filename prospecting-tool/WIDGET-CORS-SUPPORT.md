# Widget CORS Support

This document explains the CORS (Cross-Origin Resource Sharing) support for the Adealo widget system and how to test and deploy widgets with proper CORS configuration.

## Overview

The widget system has been updated to support CORS, allowing the widget to be embedded on any website, including localhost development environments. The following changes have been made:

1. Added HTTP endpoints with CORS support for widget script loading and interaction tracking
2. Updated the CORS configuration to allow specific origins
3. Modified the widget script to use the HTTP endpoints with proper CORS headers
4. Created test pages for both production and local development environments

## CORS Configuration

The CORS configuration has been updated to allow the following origins:

- `https://adealo-ce238.web.app` - Firebase hosting domain
- `https://adealo.com` - Main domain
- `https://widget.adealo.com` - Widget subdomain
- `http://localhost:5173` - Local development server

If you need to add additional domains, update the `corsHandler` configuration in `functions/src/widget-embed.ts`.

## HTTP Endpoints

The following HTTP endpoints have been added with CORS support:

- `getWidgetScriptHttp` - For loading the widget script
- `trackWidgetInteractionHttp` - For tracking widget interactions

These endpoints are used by the widget script to load the widget and track interactions.

## Testing Locally

To test the widget locally, you can use the `test-local-widget.html` page. This page allows you to:

1. Test the widget with the local Firebase Functions emulator
2. Test the widget with the deployed Firebase Functions
3. Configure the local port for the Firebase Functions emulator

### Steps to Test Locally

1. Start the Firebase Functions emulator:

```bash
cd prospecting-tool
firebase emulators:start --only functions
```

2. Open the `test-local-widget.html` page in your browser:

```bash
open prospecting-tool/public/test-local-widget.html
```

3. Configure the widget ID and other settings as needed
4. Click "Load Widget" to load the widget

## Deploying the Widget Functions

To deploy the widget functions with CORS support, use the `deploy-widget-functions-cors.sh` script:

```bash
chmod +x deploy-widget-functions-cors.sh
./deploy-widget-functions-cors.sh
```

This script will deploy only the widget functions with CORS support, without affecting other functions.

## Widget Embed Code

The widget embed code has been updated to use the HTTP endpoints with CORS support. The updated embed code is:

```html
<!-- Adealo Widget -->
<script>
  (function(w,d,s,o,f,js,fjs){
    w['AdealoWidget']=o;w[o]=w[o]||function(){(w[o].q=w[o].q||[]).push(arguments)};
    w[o].l=1*new Date();js=d.createElement(s);fjs=d.getElementsByTagName(s)[0];
    js.async=1;js.src=f;fjs.parentNode.insertBefore(js,fjs);
  })(window,document,'script','adealo','https://widget.adealo.com/loader.js');
  adealo('init', 'YOUR_WIDGET_ID');
</script>
<!-- End Adealo Widget -->
```

Replace `YOUR_WIDGET_ID` with your actual widget ID.

## Using the Widget on localhost

To use the widget on a localhost development server, you need to:

1. Ensure the CORS configuration includes your localhost domain and port
2. Use the updated embed code with your widget ID
3. Deploy the widget functions with CORS support

The widget should now work correctly on your localhost development server.

## Troubleshooting

If you encounter CORS issues, check the following:

1. Ensure the origin is included in the CORS configuration
2. Check the browser console for CORS errors
3. Verify that the widget functions are deployed with the latest CORS configuration
4. Make sure the widget embed code is using the correct loader URL

If you're still having issues, try using the `test-local-widget.html` page to debug the widget loading and interaction tracking.
