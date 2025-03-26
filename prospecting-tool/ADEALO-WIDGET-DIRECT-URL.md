# Adealo Widget Direct URL Implementation

This document explains the implementation of the Adealo Widget using direct Firebase Hosting URLs instead of Cloud Functions URLs.

## Overview

The Adealo Widget is now implemented with a direct URL approach, which means:

1. The widget script is served directly from Firebase Hosting at `https://adealo-ce238.web.app/widget.js`
2. For backward compatibility, a Cloud Function redirect is available at `https://us-central1-adealo-ce238.web.app/widget.js`

This approach provides several benefits:
- Faster loading times (Firebase Hosting is optimized for static content)
- Reduced Cloud Function invocations (lower costs)
- Simpler implementation for customers

## Implementation Details

### Widget Script

The widget script (`widget.js`) is a self-contained JavaScript file that:
- Loads the widget UI
- Handles user interactions
- Communicates with the backend APIs
- Provides customization options

The script is designed to be easily embedded in any website with a single line of code.

### Deployment

The widget is deployed using two scripts:

1. `deploy-adealo-widget.sh` - Deploys the widget script to Firebase Hosting
2. `deploy-widget-adapter-redirect.sh` - Deploys the Cloud Function redirects for backward compatibility

### Backward Compatibility

To ensure backward compatibility with existing implementations, we've added a Cloud Function redirect:

```typescript
export const widgetScript = functions.https.onRequest((request, response) => {
  // Set CORS headers
  response.set('Access-Control-Allow-Origin', '*');
  response.set('Access-Control-Allow-Methods', 'GET');
  response.set('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    response.status(204).send('');
    return;
  }
  
  // Only allow GET requests
  if (request.method !== 'GET') {
    response.status(405).send('Method Not Allowed');
    return;
  }
  
  // Redirect to the actual script on Firebase Hosting
  response.redirect('https://adealo-ce238.web.app/widget.js');
});
```

This function redirects requests from `https://us-central1-adealo-ce238.web.app/widget.js` to `https://adealo-ce238.web.app/widget.js`.

## Integration

### Basic Integration

To integrate the widget into a website, add the following script tag to your HTML:

```html
<script src="https://adealo-ce238.web.app/widget.js" data-widget-id="YOUR_WIDGET_ID"></script>
```

Replace `YOUR_WIDGET_ID` with your actual widget ID.

### Advanced Integration with Configuration

For more advanced customization, you can use the configuration object:

```html
<script>
  window.widgetConfig = {
    id: "YOUR_WIDGET_ID",
    design: {
      position: "bottom-right",
      theme: "light",
      colors: {
        primary: "#4a6cf7"
      },
      launcher: {
        size: 60,
        shape: "circle",
        pulseAnimation: true
      }
    },
    content: {
      title: "Chat with Adealo",
      greeting: "Hello 👋",
      tagline: "How can we help you today?"
    }
  };
</script>
<script src="https://adealo-ce238.web.app/widget.js"></script>
```

## Testing

A test page is available at `https://adealo-ce238.web.app/widget-test.html` to verify the widget functionality.

You can also use the local test page at `public/widget-test.html` for development and testing.

## Troubleshooting

If you encounter issues with the widget, check the browser console for error messages. The widget includes detailed logging to help diagnose problems.

Common issues:
- Missing widget ID
- Network connectivity problems
- CORS issues (if accessing the widget from a restricted domain)

## Next Steps

- Implement widget configuration API
- Add analytics tracking
- Enhance customization options
- Improve performance
