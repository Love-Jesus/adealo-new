# Widget Configuration System

This document explains the widget configuration system, which allows you to store widget configurations on your server and load them dynamically when the widget initializes.

## Overview

The widget configuration system consists of the following components:

1. **Firebase Functions**: Server-side functions that serve widget configurations and track widget interactions.
2. **Firestore Database**: Stores widget configurations.
3. **Widget Loader Script**: Client-side script that loads the widget configuration from the server and initializes the widget.
4. **Widget Component**: Custom element that renders the widget with the loaded configuration.

## Benefits

The server-side configuration approach offers several benefits:

1. **Security**: The configuration is stored on your server, not in the customer's HTML.
2. **Scalability**: You can update the configuration for all customers without requiring them to change their embed code.
3. **Privacy**: Sensitive data (e.g., customerId) is not exposed in the HTML.
4. **Dynamic Updates**: You can update the configuration in real-time (e.g., change colors, enable/disable features).

## Components

### Firebase Functions

The widget configuration system uses the following Firebase Functions:

- `getWidgetConfig`: Callable function to get widget configuration.
- `getWidgetConfigHttp`: HTTP function to get widget configuration.
- `trackWidgetInteractionHttp`: HTTP function to track widget interactions.
- `widget`: HTTP function to serve the widget HTML page.

These functions are defined in `functions/src/widget-config.ts`.

### Firestore Database

Widget configurations are stored in the `widgets` collection in Firestore. Each document in the collection represents a widget configuration and is identified by a unique widget ID.

### Widget Loader Script

The widget loader script (`public/widget-loader.js`) is responsible for:

1. Extracting the widget ID from the script URL.
2. Fetching the widget configuration from the server using the widget ID.
3. Caching the configuration in localStorage for future use.
4. Rendering the widget with the configuration.

### Widget Component

The widget component is a custom element (`<chat-widget>`) that renders the widget with the loaded configuration. It is defined in the widget loader script.

## Configuration Structure

The widget configuration has the following structure:

```typescript
interface WidgetConfig {
  base: {
    widgetId: string;
    teamId: string;
    name: string;
    status: 'active' | 'inactive';
    createdAt: Date;
    updatedAt: Date;
  };
  design: {
    colors: {
      primary: string;
      secondary: string;
      text: string;
      background: string;
    };
    position: 'bottom-right' | 'bottom-left';
    theme: 'light' | 'dark';
    borderRadius: number;
    fontFamily?: string;
  };
  features: {
    chat: {
      enabled: boolean;
      greeting: string;
      teamName: string;
      agentName: string;
      agentAvatar?: string;
    };
    bookDemo: {
      enabled: boolean;
      calendlyUrl: string;
      title: string;
      description: string;
    };
    callMe: {
      enabled: boolean;
      mode: 'single' | 'team';
      responseType: 'asap' | 'fixed';
      responseTime: number;
      qualificationEnabled: boolean;
      qualificationOptions: Array<{
        id: string;
        label: string;
        description: string;
        icon: string;
      }>;
      team: {
        members: Array<{
          id: string;
          name: string;
          role: string;
          avatar: string;
        }>;
        displayMode: 'grid' | 'list';
      };
      messages: {
        title: string;
        description: string;
        asapMessage: string;
        fixedTimeMessage: string;
        qualificationPrompt: string;
      };
    };
  };
  content: {
    greeting: string;
    tagline: string;
    labels: {
      chat: string;
      bookDemo: string;
      callMe: string;
    };
  };
  stats: {
    views: number;
    interactions: number;
    leads: number;
    lastUpdated: Date;
  };
  chatConfig: {
    offlineMessage: string;
    inputPlaceholder: string;
    useAI: boolean;
    aiWelcomeMessage?: string;
    aiModel?: string;
    teamName?: string;
    responseTime?: string;
    showAgentNames: boolean;
    showAgentAvatars: boolean;
    requiredVisitorFields: string[];
    fileAttachmentsEnabled: boolean;
    maxFileSize?: number;
    allowedFileTypes?: string[];
  };
  type: "MultiWidget";
}
```

## Embed Code

The embed code for the widget is a simple script tag and a custom element:

```html
<script src="https://cdn.yoursaas.com/widget.js?widgetId=YOUR_WIDGET_ID"></script>
<chat-widget></chat-widget>
```

Replace `YOUR_WIDGET_ID` with the ID of the widget configuration in Firestore.

## Development and Testing

### Local Development

For local development, you can use the following tools:

1. `run-widget-config-emulator.sh`: Starts the Firebase Functions emulator.
2. `create-test-widget-config.js`: Creates a test widget configuration in Firestore.
3. `run-test-widget-config.sh`: Starts a local server to serve the test widget configuration page.

### Testing

To test the widget configuration system:

1. Run the Firebase Functions emulator:
   ```
   ./run-widget-config-emulator.sh
   ```

2. Create a test widget configuration:
   ```
   node create-test-widget-config.js
   ```

3. Start the test server:
   ```
   ./run-test-widget-config.sh
   ```

4. Open http://localhost:8000/public/test-widget-config.html in your browser.

### Deployment

To deploy the widget configuration functions to Firebase:

```
./deploy-widget-config-functions.sh
```

## Troubleshooting

### Widget Not Loading

If the widget is not loading, check the following:

1. Make sure the widget ID in the embed code is correct.
2. Check the browser console for errors.
3. Verify that the widget configuration exists in Firestore.
4. Ensure that the Firebase Functions are deployed and running.

### Internal Server Error

If you see an "Internal server error" message, check the following:

1. Verify that the widget configuration exists in Firestore.
2. Check the Firebase Functions logs for errors.
3. Ensure that the Firebase Functions have the necessary permissions to access Firestore.

## Conclusion

The widget configuration system provides a secure, scalable, and flexible way to manage widget configurations. By storing the configuration on the server and loading it dynamically, you can update the widget for all customers without requiring them to change their embed code.
