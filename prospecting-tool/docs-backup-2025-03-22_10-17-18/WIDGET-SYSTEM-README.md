# Adealo Widget System

This document provides an overview of the Adealo Widget System, its architecture, and how to use it.

## Overview

The Adealo Widget System allows you to embed interactive widgets on websites to capture leads and schedule appointments through Calendly. The system consists of several components:

1. **Widget Embed Code**: A small JavaScript snippet that loads the widget on a website
2. **Widget Loader**: A JavaScript file that loads the widget configuration from Firebase
3. **Widget Script Generator**: A Firebase Function that generates the widget script based on configuration
4. **Widget Interaction Tracker**: A Firebase Function that tracks widget interactions and leads
5. **Widget Configuration**: Stored in Firestore database

## Architecture

```
┌─────────────┐     ┌───────────────┐     ┌─────────────────────┐
│ Website     │     │ Firebase      │     │ Firebase Functions  │
│ with Widget │────▶│ Hosting       │────▶│ - getWidgetScript   │
│ Embed Code  │     │ - loader.js   │     │ - trackInteraction  │
└─────────────┘     └───────────────┘     └─────────────────────┘
                                                     │
                                                     ▼
                                          ┌─────────────────────┐
                                          │ Firestore Database  │
                                          │ - Widget Config     │
                                          │ - Interaction Stats │
                                          │ - Lead Data         │
                                          └─────────────────────┘
```

## Widget Embed Code

To add a widget to a website, use the following embed code:

```html
<!-- Adealo Widget -->
<script>
  (function(w,d,s,o,f,js,fjs){
    w['AdealoWidget']=o;w[o]=w[o]||function(){(w[o].q=w[o].q||[]).push(arguments)};
    w[o].l=1*new Date();js=d.createElement(s);fjs=d.getElementsByTagName(s)[0];
    js.async=1;js.src=f;fjs.parentNode.insertBefore(js,fjs);
  })(window,document,'script','adealo','https://adealo-ce238.web.app/loader.js');
  adealo('init', 'YOUR_WIDGET_ID');
</script>
<!-- End Adealo Widget -->
```

Replace `YOUR_WIDGET_ID` with the ID of the widget you want to display.

## Deployment

The widget system is deployed to Firebase Hosting and Functions. Use the provided deployment script:

```bash
./deploy-widget.sh
```

This script will:
1. Build the Firebase Functions
2. Deploy the hosting files and functions
3. Display the widget embed code

## Testing

### Firebase Hosting Testing

After deploying to Firebase, you can test your widget at:

```
https://adealo-ce238.web.app/test-widget.html
```

This page allows you to enter your widget ID and test the widget functionality.

### Local Development Testing

For local development, use:

```
http://localhost:5173/local-widget-embed.html
```

This provides embed code that points to your local development server.

## Widget Configuration

Widgets are configured in the Firestore database in the `widgets` collection. Each widget document contains:

- **status**: The widget status (active, inactive, draft)
- **design**: Visual design settings (colors, position, etc.)
- **content**: Text content and messaging
- **behavior**: How the widget behaves (trigger type, timing, etc.)
- **integration**: Integration settings (Calendly URL, lead data collection)
- **stats**: Usage statistics (views, interactions, leads)

## Custom Domain

For production use, it's recommended to set up a custom domain (e.g., `widget.adealo.com`). See the [Custom Domain Setup Guide](./WIDGET-CUSTOM-DOMAIN.md) for instructions.

## Files

- `/public/loader.js`: The widget loader script
- `/public/index.html`: Landing page for the widget hosting
- `/public/test-widget.html`: Test page for the widget
- `/public/local-widget-embed.html`: Local development embed code
- `/functions/src/widget-embed.ts`: Firebase Functions for the widget system
- `/deploy-widget.sh`: Deployment script
- `/WIDGET-CUSTOM-DOMAIN.md`: Guide for setting up a custom domain

## Troubleshooting

### Widget Not Loading

- Check that the widget ID is correct
- Verify that the widget is set to "active" in the database
- Check browser console for any JavaScript errors
- Ensure the Firebase functions are deployed correctly

### CORS Issues

If you encounter CORS errors when testing locally, you may need to update the CORS configuration in your Firebase functions.

### Function Errors

If the widget functions are not working correctly, check the Firebase Functions logs in the Firebase Console.

## Next Steps

1. **Custom Domain**: Set up a custom domain for production use
2. **Analytics Integration**: Add more detailed analytics tracking
3. **A/B Testing**: Implement A/B testing for widget designs
4. **Additional Integrations**: Add integrations with other CRM systems
